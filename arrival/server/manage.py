import argparse,os,getpass,json,time,hashlib
from .core import Store,password_hash,normalize_phone
from .meta import Meta,dispatch_one

def main():
 p=argparse.ArgumentParser();p.add_argument('--db',required=True);sub=p.add_subparsers(dest='cmd',required=True)
 u=sub.add_parser('user');u.add_argument('username');u.add_argument('--role',choices=['organizer','reception'],default='organizer')
 i=sub.add_parser('import');i.add_argument('xlsx');sub.add_parser('worker');sub.add_parser('demo')
 a=p.parse_args();s=Store(a.db)
 if a.cmd=='user':
  pw=getpass.getpass('Password (12+ characters): ')
  if len(pw)<12:raise SystemExit('Use at least 12 characters')
  with s.db(True) as db:db.execute('INSERT OR REPLACE INTO users VALUES(?,?,?)',(a.username,password_hash(pw),a.role))
 elif a.cmd=='import':
  import openpyxl
  w=openpyxl.load_workbook(a.xlsx,data_only=True);sheet=w['الأسماء'];count=0;missing=[];duplicates=[]
  # Stable source sequence is used; spreadsheet day marks are preferences only.
  with s.db() as db:existing={r[0] for r in db.execute('SELECT source_key FROM participants')}
  for n,r in enumerate(list(sheet.values)[4:],5):
   if not r[2]:continue
   source='invitees:'+hashlib.sha256((str(r[2]).strip()+'|'+str(r[3]).strip()+'|'+str(r[6]).strip()).encode()).hexdigest()
   if source in existing:continue
   phone=normalize_phone(r[6],True)
   if not phone:missing.append(n)
   elif s.matching(phone):duplicates.append(n)
   s.add({'name':r[2],'division':r[3],'nickname':r[5],'phone':phone,'day1':r[7],'day2':r[8]},source_key=source);count+=1
  print(json.dumps({'imported':count,'missing_phone_rows':missing,'duplicate_phone_rows':duplicates},ensure_ascii=False))
 elif a.cmd=='demo':
  for n in range(1,9):
   s.add({'name':'مشارك تجريبي '+str(n),'nickname':'ضيفنا '+str(n),'phone':'9900000'+str(n),'division':'التقسيم التجريبي '+str(n%3+1),'governorate':['مسقط','الداخلية','ظفار'][n%3]},source_key='demo:'+str(n))
  s.add({'name':'سجل تجريبي مكرر','phone':'99000008','division':'بيانات اختبار'},source_key='demo:duplicate')
  with s.db(True) as db:db.execute('INSERT OR REPLACE INTO users VALUES(?,?,?)',('reviewer',password_hash('Review-Only-2026'),'organizer'))
  s.set_open(True,'demo')
 elif a.cmd=='worker':
  if not Meta().enabled:raise SystemExit('WhatsApp disabled. No messages sent.')
  while True:
   dispatch_one(s,Meta());time.sleep(2)
if __name__=='__main__':main()
