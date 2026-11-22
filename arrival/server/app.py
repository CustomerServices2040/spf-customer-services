import os, time, secrets, hashlib, hmac, json, io
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from .core import Store, normalize_phone, password_hash, verify_password, oman
from .meta import Meta, DeliveryError

ROOT=Path(__file__).resolve().parents[1]

def create_app(db_path=None,demo=False,provider=None):
    path=db_path or os.getenv('ARRIVAL_DB','/tmp/busola-arrival/arrival.db')
    if Path(path).resolve().is_relative_to(ROOT):raise RuntimeError('Database must be outside the source and public directory')
    store=Store(path)
    if demo:
        with store.db() as db:
            if db.execute("SELECT 1 FROM participants WHERE source_key NOT LIKE 'demo:%' OR source_key IS NULL LIMIT 1").fetchone():raise RuntimeError('Demo mode only accepts synthetic demo datasets')
    meta=provider or Meta();app=FastAPI(docs_url=None,redoc_url=None,openapi_url=None)
    app.state.store=store;app.state.demo=demo
    secure=os.getenv('COOKIE_SECURE','true')!='false'
    secret=os.getenv('ARRIVAL_SECRET')
    if not secret:
        if not demo:raise RuntimeError('Set ARRIVAL_SECRET (32+ random characters)')
        secret=secrets.token_hex(32)
    if len(secret)<32:raise RuntimeError('ARRIVAL_SECRET must be at least 32 characters')
    def digest(value):return hmac.new(secret.encode(),value.encode(),hashlib.sha256).hexdigest()
    def gate_token():return digest('gate:arrival-v1')
    def gate_valid(token):return hmac.compare_digest(str(token),gate_token())
    @app.middleware('http')
    async def security(request,call_next):
        if request.method in ('POST','PUT','PATCH','DELETE'):
            origin=request.headers.get('origin')
            expected=os.getenv('PUBLIC_ORIGIN',str(request.base_url).rstrip('/'))
            if origin and origin!=expected:return JSONResponse({'detail':'مصدر الطلب غير معتمد'},403)
            length=int(request.headers.get('content-length','0'))
            if length>20000:return JSONResponse({'detail':'الطلب أكبر من الحد المسموح'},413)
        response=await call_next(request)
        response.headers.update({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"})
        return response
    @app.exception_handler(ValueError)
    async def value_error(request,exc):return JSONResponse({'detail':str(exc)},400)
    def throttle(req,key,limit=8,seconds=300):
        ip=req.client.host if req.client else 'local' # configure trusted reverse proxy, never arbitrary forwarded headers
        if store.limited(key+':'+digest(ip),limit,seconds):raise HTTPException(429,'محاولات متكررة. يرجى الانتظار قليلا ثم إعادة المحاولة')
    def auth(req,role=None,mutate=False):
        sid=req.cookies.get('arrival_session','')
        with store.db() as db:r=db.execute('SELECT s.*,u.role FROM sessions s JOIN users u ON s.username=u.username WHERE s.id=? AND s.expires>?',(digest(sid),time.time())).fetchone()
        if not r:raise HTTPException(401,'سجل دخولك بحساب المنظم')
        if role and r['role']!=role:raise HTTPException(403,'هذه العملية مخصصة للمنظم')
        if mutate and not hmac.compare_digest(req.headers.get('x-csrf-token',''),r['csrf']):raise HTTPException(403,'انتهت صلاحية الطلب، أعد تسجيل الدخول')
        return dict(r)
    def check_open(gate):
        if not store.is_open():raise HTTPException(409,'تسجيل الوصول مغلق حاليا. يرجى مراجعة فريق الاستقبال')
        if not demo and not gate_valid(gate):raise HTTPException(403,'يرجى مسح رمز الاستقبال الحالي لإتمام تسجيل الوصول')
    @app.get('/api/config')
    def config():return {'demo':demo,'open':store.is_open(),'whatsapp_enabled':False,'platform_only':True,'timezone':'Asia/Muscat'}
    @app.post('/api/challenge')
    async def challenge(req:Request):
        throttle(req,'challenge',120);b=await req.json();check_open(b.get('gate',''))
        phone=normalize_phone(b.get('phone'));throttle(req,'phone:'+digest(phone),3,300)
        matches=store.matching(phone)
        if len(matches)>1:raise HTTPException(409,'يتطلب هذا الرقم التحقق لدى فريق الاستقبال. لن يتم اختيار سجل تلقائيا')
        if not matches:raise HTTPException(404,'تعذر العثور على رقم الهاتف ضمن قائمة المدعوين. يرجى التأكد من الرقم المدخل وإعادة المحاولة، أو مراجعة فريق الاستقبال للمساعدة')
        ticket=secrets.token_urlsafe(32)
        with store.db(True) as db:
            db.execute('INSERT INTO tickets VALUES(?,?,?)',(digest(ticket),matches[0]['id'],time.time()+600))
        # Phone lookup is not identity verification: expose no personal card.
        return {'ticket':ticket,'participant':{},'platform_only':True}
    @app.post('/api/arrive')
    async def arrive(req:Request):
        throttle(req,'arrive',240);b=await req.json();check_open(b.get('gate',''))
        with store.db() as db:r=db.execute('SELECT * FROM tickets WHERE id=? AND expires>?',(digest(str(b.get('ticket',''))),time.time())).fetchone()
        if not r:raise HTTPException(401,'انتهت صلاحية التحقق. يرجى المحاولة مجددا')
        return store.arrive(r['participant_id'],'self','participant',False)
    @app.post('/api/login')
    async def login(req:Request):
        throttle(req,'login',5,300);b=await req.json();username=str(b.get('username',''))[:100]
        with store.db() as db:u=db.execute('SELECT * FROM users WHERE username=?',(username,)).fetchone()
        encoded=u['password'] if u else password_hash('dummy',salt='fixed-dummy-salt')
        valid=verify_password(str(b.get('password',''))[:512],encoded)
        if not u or not valid:raise HTTPException(401,'اسم المستخدم أو كلمة المرور غير صحيحة')
        sid=secrets.token_urlsafe(32);csrf=secrets.token_urlsafe(32)
        with store.db(True) as db:
            db.execute('DELETE FROM sessions WHERE expires<?',(time.time(),));db.execute('INSERT INTO sessions VALUES(?,?,?,?)',(digest(sid),username,csrf,time.time()+8*3600))
            store.audit(db,username,'login')
        response=JSONResponse({'csrf':csrf,'role':u['role']});response.set_cookie('arrival_session',sid,httponly=True,secure=secure,samesite='strict',max_age=28800,path='/')
        return response
    @app.get('/api/admin/session')
    def session(req:Request):
        a=auth(req);return {'csrf':a['csrf'],'role':a['role']}
    @app.post('/api/logout')
    def logout(req:Request):
        a=auth(req,mutate=True)
        with store.db(True) as db:db.execute('DELETE FROM sessions WHERE id=?',(a['id'],))
        r=JSONResponse({'ok':True});r.delete_cookie('arrival_session',path='/');return r
    @app.get('/api/admin/roster')
    def roster(req:Request):
        a=auth(req);rows=store.roster();return {'rows':rows,'open':store.is_open(),'role':a['role'],'updated_at':time.time(),'whatsapp_enabled':False,'platform_only':True}
    @app.post('/api/admin/open')
    async def open_registration(req:Request):
        a=auth(req,'organizer',True);b=await req.json();store.set_open(b.get('open') is True,a['username']);return {'open':store.is_open()}
    @app.post('/api/admin/participant')
    async def participant(req:Request):
        a=auth(req,'organizer',True);b=await req.json();pid=store.add(b,a['username'],b.get('id'),b.get('version'));return {'id':pid}
    @app.post('/api/admin/arrive')
    async def admin_arrive(req:Request):
        a=auth(req,mutate=True);b=await req.json()
        if b.get('verified') is not True:raise HTTPException(400,'تحقق من هوية المشارك قبل تسجيل وصوله')
        return store.arrive(b.get('id'),'reception',a['username'],False)
    @app.post('/api/admin/reset-arrival')
    async def reset_arrival(req:Request):
        a=auth(req,'organizer',True);b=await req.json()
        if b.get('reason')!='test_cleanup':raise HTTPException(400,'حدد سبب إلغاء تسجيل الوصول')
        with store.db(True) as db:
            db.execute('DELETE FROM outbox WHERE participant_id=?',(b.get('id'),))
            db.execute('DELETE FROM arrivals WHERE participant_id=?',(b.get('id'),))
            store.audit(db,a['username'],'test_arrival_reset',b.get('id'))
        return {'ok':True}
    @app.post('/api/admin/password')
    async def change_password(req:Request):
        a=auth(req,mutate=True);b=await req.json();pw=str(b.get('password',''))
        if not 12<=len(pw)<=256:raise HTTPException(400,'استخدم كلمة مرور من 12 إلى 256 حرفا')
        with store.db(True) as db:
            db.execute('UPDATE users SET password=? WHERE username=?',(password_hash(pw),a['username']))
            db.execute('DELETE FROM sessions WHERE username=? AND id<>?',(a['username'],a['id']))
            store.audit(db,a['username'],'password_changed')
        return {'ok':True}
    @app.post('/api/admin/retry')
    async def retry(req:Request):
        a=auth(req,'organizer',True);b=await req.json();store.retry(b.get('id'),a['username']);return {'ok':True}
    @app.get('/api/admin/qr')
    def qr(req:Request):
        auth(req);origin=os.getenv('PUBLIC_ORIGIN',str(req.base_url).rstrip('/'));return {'url':origin+'/?gate='+gate_token(),'expires_in':None,'open':store.is_open()}
    @app.get('/api/admin/qr.svg')
    def qr_svg(req:Request):
        auth(req)
        import qrcode, qrcode.image.svg
        origin=os.getenv('PUBLIC_ORIGIN',str(req.base_url).rstrip('/'))
        image=qrcode.make(origin+'/?gate='+gate_token(),image_factory=qrcode.image.svg.SvgPathImage,border=4,box_size=12,error_correction=qrcode.constants.ERROR_CORRECT_Q)
        stream=io.BytesIO();image.save(stream)
        return Response(stream.getvalue(),media_type='image/svg+xml')
    @app.get('/api/admin/export')
    def export(req:Request):
        auth(req);from openpyxl import Workbook
        w=Workbook();s=w.active;s.title='سجل الوصول';s.sheet_view.rightToLeft=True
        s.append(['الاسم','اللقب','التقسيم الإداري','المحافظة','الهاتف','حالة الوصول','وقت الوصول بتوقيت عمان','حالة الرسالة'])
        for r in store.roster():
            values=[r['name'],r['nickname'],r['division'],r['governorate'],r['phone'],'وصل' if r['arrived_at'] else 'لم يصل',r['arrived_at'] or '',r['message_status'] or '']
            s.append(values)
            for cell in s[s.max_row]:cell.data_type='s' # Never interpret user data as an Excel formula.
        s.freeze_panes='A2';s.auto_filter.ref=s.dimensions
        from openpyxl.styles import Font,PatternFill,Alignment
        for row in s:
            for cell in row:cell.font=Font(name='Arial',size=12);cell.alignment=Alignment(horizontal='right',vertical='center',wrap_text=True)
        for cell in s[1]:cell.fill=PatternFill('solid',fgColor='213E34');cell.font=Font(name='Arial',size=12,bold=True,color='FFFFFF')
        for col in 'ABCDEFGH':s.column_dimensions[col].width=28
        stream=io.BytesIO();w.save(stream)
        return Response(stream.getvalue(),media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',headers={'Content-Disposition':'attachment; filename="arrival.xlsx"'})
    @app.get('/api/meta/webhook')
    def webhook_verify(req:Request):
        token=os.getenv('META_VERIFY_TOKEN','')
        if token and req.query_params.get('hub.mode')=='subscribe' and hmac.compare_digest(req.query_params.get('hub.verify_token',''),token):return Response(req.query_params.get('hub.challenge',''),media_type='text/plain')
        raise HTTPException(403)
    @app.post('/api/meta/webhook')
    async def webhook(req:Request):
        body=await req.body();key=os.getenv('META_APP_SECRET','')
        expected='sha256='+hmac.new(key.encode(),body,hashlib.sha256).hexdigest()
        if not key or not hmac.compare_digest(req.headers.get('x-hub-signature-256',''),expected):raise HTTPException(403)
        payload=json.loads(body);rank={'pending':0,'processing':1,'uncertain':1,'accepted':2,'failed':2,'sent':3,'delivered':4,'read':5}
        with store.db(True) as db:
            for entry in payload.get('entry',[]):
                for change in entry.get('changes',[]):
                    v=change.get('value',{})
                    if v.get('metadata',{}).get('phone_number_id')!=os.getenv('META_PHONE_ID'):continue
                    for item in v.get('statuses',[]):
                        state=item.get('status');pid=item.get('id');oid=item.get('biz_opaque_callback_data')
                        row=db.execute('SELECT * FROM outbox WHERE provider_id=? OR (callback_token=? AND provider_id IS NULL)',(pid,oid)).fetchone()
                        if row and state in ('sent','delivered','read','failed') and rank[state]>=rank.get(row['status'],0):
                            db.execute('UPDATE outbox SET status=?,provider_id=?,updated_at=?,error=? WHERE id=?',(state,pid,time.time(),'provider_delivery_failed' if state=='failed' else '',row['id']))
        return {'ok':True}
    app.mount('/assets',StaticFiles(directory=ROOT/'web'),name='assets')
    @app.get('/')
    @app.get('/admin')
    def index():return FileResponse(ROOT/'web'/'index.html')
    return app
