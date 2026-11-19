import unittest,tempfile,os,json,hmac,hashlib,time,io
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
from fastapi.testclient import TestClient
from arrival.server.app import create_app
from arrival.server.core import Store,normalize_phone,password_hash
from arrival.server.meta import dispatch_one,DeliveryError

class FakeProvider:
 enabled=True
 def __init__(self,state=None):self.state=state;self.calls=0
 def send(self,*args,**kwargs):
  self.calls+=1
  if self.state:raise DeliveryError(self.state,'simulated')
  return 'wamid.test'

class ArrivalTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.env=patch.dict(os.environ,{'COOKIE_SECURE':'false','ARRIVAL_SECRET':'test-secret-'*6,'META_APP_SECRET':'webhook-test','META_PHONE_ID':'test-phone','WHATSAPP_ENABLED':'false'});self.env.start()
  self.app=create_app(self.temp.name+'/db.sqlite',demo=True);self.s=self.app.state.store;self.c=TestClient(self.app)
  self.pid=self.s.add({'name':'مشارك اختبار','nickname':'ضيفنا','division':'إدارة اختبار','phone':'99000001'});self.s.set_open(True,'test')
  with self.s.db(True) as db:
   db.execute('INSERT INTO users VALUES(?,?,?)',('test',password_hash('a-long-test-password'),'organizer'))
   db.execute('INSERT INTO users VALUES(?,?,?)',('desk',password_hash('a-long-test-password'),'reception'))
 def tearDown(self):self.c.close();self.env.stop();self.temp.cleanup()
 def login(self,name='test'):
  r=self.c.post('/api/login',json={'username':name,'password':'a-long-test-password'});self.assertEqual(r.status_code,200);self.c.headers['x-csrf-token']=r.json()['csrf']
 def ticket(self,phone='99000001'):
  r=self.c.post('/api/challenge',json={'phone':phone,'consent':True});self.assertEqual(r.status_code,200)
  return r.json()['ticket']
 def test_phone_normalization(self):
  for p in ['99000001','+968 99000001','0096899000001','٩٩٠٠٠٠٠١','۹۹۰۰۰۰۰۱']:self.assertEqual(normalize_phone(p),'+96899000001')
  for p in ['123','+97199000001','12345678','99000001abc']:
   with self.assertRaises(ValueError):normalize_phone(p)
 def test_success_and_duplicate(self):
  t=self.ticket();a=self.c.post('/api/arrive',json={'ticket':t,'consent':True}).json();b=self.c.post('/api/arrive',json={'ticket':t,'consent':True}).json()
  self.assertFalse(a['duplicate']);self.assertTrue(b['duplicate']);self.assertEqual(a['arrived_at'],b['arrived_at']);self.assertTrue(a['arrived_at'].endswith('+04:00'))
  with self.s.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM outbox').fetchone()[0],0)
 def test_concurrent_arrival_unique(self):
  with ThreadPoolExecutor(max_workers=8) as pool:r=list(pool.map(lambda _:self.s.arrive(self.pid,'reception','test',True),range(24)))
  self.assertEqual(sum(not x['duplicate'] for x in r),1)
  with self.s.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM outbox').fetchone()[0],1)
 def test_unknown_and_ambiguous(self):
  self.assertEqual(self.c.post('/api/challenge',json={'phone':'99000999','consent':True}).status_code,404)
  self.s.add({'name':'آخر','phone':'99000001'});self.assertEqual(self.c.post('/api/challenge',json={'phone':'99000001','consent':True}).status_code,409)
 def test_no_personal_data_in_phone_lookup(self):
  r=self.c.post('/api/challenge',json={'phone':'99000001','consent':True});self.assertNotIn('مشارك اختبار',r.text)
  self.assertEqual(self.c.post('/api/arrive',json={'ticket':'invented','consent':True}).status_code,401)
 def test_ticket_expiry(self):
  t=self.ticket()
  with self.s.db(True) as db:db.execute('UPDATE tickets SET expires=0')
  self.assertEqual(self.c.post('/api/arrive',json={'ticket':t}).status_code,401)
 def test_platform_only_never_contacts_provider(self):
  provider=FakeProvider();app=create_app(self.temp.name+'/other.sqlite',demo=True,provider=provider);st=app.state.store
  st.add({'name':'Private name','phone':'99000001'});st.set_open(True,'test')
  with TestClient(app) as c:
   r=c.post('/api/challenge',json={'phone':'99000001'})
   self.assertEqual(r.status_code,200);self.assertEqual(r.json()['participant'],{})
   self.assertEqual(c.post('/api/arrive',json={'ticket':r.json()['ticket'],'consent':True}).status_code,200)
  self.assertEqual(provider.calls,0)
  with st.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM outbox').fetchone()[0],0)
 def test_closed_and_expired_event(self):
  self.s.set_open(False,'test');self.assertEqual(self.c.post('/api/challenge',json={'phone':'99000001','consent':True}).status_code,409)
  self.s.set_open(True,'test')
  with self.s.db(True) as db:db.execute("UPDATE settings SET value='1' WHERE key='close_at'")
  self.assertFalse(self.s.is_open())
  with self.assertRaises(ValueError):self.s.arrive(self.pid,'self','test',True)
 def test_admin_auth_csrf_and_role(self):
  self.assertEqual(self.c.get('/api/admin/roster').status_code,401);self.assertEqual(self.c.get('/api/admin/export').status_code,401)
  self.login();self.c.headers.pop('x-csrf-token');self.assertEqual(self.c.post('/api/admin/open',json={'open':False}).status_code,403)
  self.login('desk');self.assertEqual(self.c.post('/api/admin/participant',json={'name':'new'}).status_code,403)
  self.assertEqual(self.c.post('/api/admin/arrive',json={'id':self.pid,'verified':True,'consent':False}).status_code,200)
 def test_no_consent_no_message(self):
  self.s.arrive(self.pid,'reception','test',False)
  with self.s.db() as db:self.assertEqual(db.execute('SELECT count(*) FROM outbox').fetchone()[0],0)
 def test_delivery_failure_does_not_change_arrival(self):
  self.s.arrive(self.pid,'reception','test',True);provider=FakeProvider('failed');dispatch_one(self.s,provider)
  row=self.s.roster()[0];self.assertTrue(row['arrived_at']);self.assertEqual(row['message_status'],'failed');self.s.retry(row['message_id'],'test');self.assertEqual(self.s.roster()[0]['message_status'],'pending')
 def test_uncertain_not_retried(self):
  self.s.arrive(self.pid,'reception','test',True);p=FakeProvider('uncertain');dispatch_one(self.s,p);dispatch_one(self.s,p);self.assertEqual(p.calls,1)
  with self.assertRaises(ValueError):self.s.retry(self.s.roster()[0]['message_id'],'test')
 def test_disabled_never_sends(self):
  self.s.arrive(self.pid,'reception','test',True);p=FakeProvider();p.enabled=False;self.assertFalse(dispatch_one(self.s,p));self.assertEqual(p.calls,0)
 def test_webhook_signature_order_and_race(self):
  self.s.arrive(self.pid,'reception','test',True);row=self.s.claim_message()
  body={'entry':[{'changes':[{'value':{'metadata':{'phone_number_id':'test-phone'},'statuses':[{'id':'wamid.test','status':'delivered','biz_opaque_callback_data':row['callback_token']}]}}]}]}
  raw=json.dumps(body).encode();url='/api/meta/webhook';self.assertEqual(self.c.post(url,content=raw).status_code,403)
  def post(data):
   raw=json.dumps(data).encode();sig='sha256='+hmac.new(b'webhook-test',raw,hashlib.sha256).hexdigest();return self.c.post(url,content=raw,headers={'x-hub-signature-256':sig})
  self.assertEqual(post(body).status_code,200);self.s.message_result(row['id'],'accepted','wamid.test');self.assertEqual(self.s.roster()[0]['message_status'],'delivered')
  body['entry'][0]['changes'][0]['value']['statuses'][0]['status']='sent';post(body);self.assertEqual(self.s.roster()[0]['message_status'],'delivered')
 def test_retry_changes_callback_identity(self):
  self.s.arrive(self.pid,'reception','test',True);first=self.s.claim_message();self.s.message_result(first['id'],'failed');self.s.retry(first['id'],'test');second=self.s.claim_message();self.assertNotEqual(first['callback_token'],second['callback_token'])
 def test_stale_processing_is_uncertain(self):
  self.s.arrive(self.pid,'reception','test',True);row=self.s.claim_message()
  with self.s.db(True) as db:db.execute('UPDATE outbox SET updated_at=?',(time.time()-200,))
  self.assertIsNone(self.s.claim_message());self.assertEqual(self.s.roster()[0]['message_status'],'uncertain')
 def test_export_safe_and_no_public_db(self):
  import openpyxl
  self.s.add({'name':'=HYPERLINK("bad")','division':'=1+1'});self.login();r=self.c.get('/api/admin/export');self.assertEqual(r.status_code,200)
  w=openpyxl.load_workbook(io.BytesIO(r.content));self.assertTrue(w.active.sheet_view.rightToLeft);self.assertTrue(all(c.data_type!='f' for row in w.active for c in row))
  self.assertEqual(self.c.get('/assets/../../server/core.py').status_code,404);self.assertEqual(self.c.get('/assets/arrival.db').status_code,404)
 def test_crud_conflict_and_phone_lock(self):
  self.login();p=self.s.roster()[0];p['name']='تعديل';r=self.c.post('/api/admin/participant',json=p);self.assertEqual(r.status_code,200)
  self.assertEqual(self.c.post('/api/admin/participant',json=p).status_code,400)
  self.s.arrive(self.pid,'reception','test',True);p=self.s.roster()[0];p['phone']='99000002';self.assertEqual(self.c.post('/api/admin/participant',json=p).status_code,400)
 def test_origin_rejected_and_rate_limit(self):
  self.assertEqual(self.c.post('/api/login',json={},headers={'Origin':'https://evil.example'}).status_code,403)
  for _ in range(5):self.c.post('/api/login',json={'username':'x','password':'wrong'})
  self.assertEqual(self.c.post('/api/login',json={}).status_code,429)
 def test_qr_svg_authorized_only(self):
  self.assertEqual(self.c.get('/api/admin/qr.svg').status_code,401);self.login();r=self.c.get('/api/admin/qr.svg');self.assertEqual(r.status_code,200);self.assertIn('<svg',r.text)
 def test_production_default_closed_without_demo_code(self):
  app=create_app(self.temp.name+'/prod.sqlite',demo=False);client=TestClient(app);self.assertFalse(client.get('/api/config').json()['demo']);self.assertFalse(client.get('/api/config').json()['open']);client.close()

if __name__=='__main__':unittest.main(verbosity=2)
