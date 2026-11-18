"""Transactional arrival storage. Runtime data MUST live outside the public repo."""
import sqlite3, os, time, secrets, hashlib, hmac, json, re
from contextlib import contextmanager
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

SCHEMA='''
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS participants(id TEXT PRIMARY KEY, source_key TEXT UNIQUE, name TEXT NOT NULL, nickname TEXT NOT NULL DEFAULT '', division TEXT NOT NULL DEFAULT '', governorate TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', day1 TEXT NOT NULL DEFAULT '', day2 TEXT NOT NULL DEFAULT '', version INTEGER NOT NULL DEFAULT 1);
CREATE INDEX IF NOT EXISTS phone_idx ON participants(phone);
CREATE TABLE IF NOT EXISTS arrivals(participant_id TEXT PRIMARY KEY REFERENCES participants(id), arrived_at TEXT NOT NULL, source TEXT NOT NULL, actor TEXT NOT NULL, consent INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY, participant_id TEXT UNIQUE REFERENCES participants(id), status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, provider_id TEXT UNIQUE, updated_at REAL NOT NULL, error TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY, participant_id TEXT, digest TEXT NOT NULL, expires REAL NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS tickets(id TEXT PRIMARY KEY, participant_id TEXT NOT NULL, expires REAL NOT NULL);
CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('organizer','reception')));
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, username TEXT NOT NULL, csrf TEXT NOT NULL, expires REAL NOT NULL);
CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset REAL NOT NULL);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT OR IGNORE INTO settings VALUES('open','false');
INSERT OR IGNORE INTO settings VALUES('close_at','0');
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, at TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, participant_id TEXT);
'''

def normalize_phone(value, allow_empty=False):
    value=str(value or '').strip().translate(str.maketrans('٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹','01234567890123456789'))
    value=re.sub(r'[\s()\-]','',value)
    if not value and allow_empty:return ''
    if value.startswith('+968'):value=value[4:]
    elif value.startswith('00968'):value=value[5:]
    elif len(value)==11 and value.startswith('968'):value=value[3:]
    if not re.fullmatch(r'[279]\d{7}',value):raise ValueError('أدخل رقما عمانيا صحيحا من 8 أرقام أو مسبوقا بـ +968')
    return '+968'+value

def now():return datetime.now(timezone.utc).isoformat()
def oman(value):return datetime.fromisoformat(value).astimezone(ZoneInfo('Asia/Muscat')).isoformat() if value else None

def password_hash(value,salt=None):
    salt=salt or secrets.token_hex(16)
    return salt+':'+hashlib.scrypt(value.encode(),salt=salt.encode(),n=16384,r=8,p=1).hex()

def verify_password(value,encoded):return hmac.compare_digest(password_hash(value,encoded.split(':')[0]),encoded)

class Store:
    def __init__(self,path):
        self.path=str(Path(path).resolve());Path(self.path).parent.mkdir(mode=0o700,parents=True,exist_ok=True)
        with self.db() as db:db.executescript(SCHEMA)
        os.chmod(self.path,0o600)
    @contextmanager
    def db(self,write=False):
        c=sqlite3.connect(self.path,timeout=20);c.row_factory=sqlite3.Row;c.execute('PRAGMA foreign_keys=ON')
        try:
            if write:c.execute('BEGIN IMMEDIATE')
            yield c;c.commit()
        except: c.rollback();raise
        finally:c.close()
    def audit(self,db,actor,action,pid=None):db.execute('INSERT INTO audit(at,actor,action,participant_id) VALUES(?,?,?,?)',(now(),actor,action,pid))
    def limited(self,key,limit=8,seconds=300):
        t=time.time()
        with self.db(True) as db:
            r=db.execute('SELECT * FROM limits WHERE key=?',(key,)).fetchone()
            if not r or r['reset']<t:
                db.execute('INSERT OR REPLACE INTO limits VALUES(?,?,?)',(key,1,t+seconds));return False
            db.execute('UPDATE limits SET count=count+1 WHERE key=?',(key,));return r['count']>=limit
    def set_open(self,value,actor):
        with self.db(True) as db:
            db.execute("UPDATE settings SET value=? WHERE key='open'",(json.dumps(bool(value)),));db.execute("UPDATE settings SET value=? WHERE key='close_at'",(str(time.time()+12*3600 if value else 0),));self.audit(db,actor,'open' if value else 'close')
    def is_open(self):
        with self.db() as db:return db.execute("SELECT value FROM settings WHERE key='open'").fetchone()[0]=='true' and float(db.execute("SELECT value FROM settings WHERE key='close_at'").fetchone()[0])>time.time()
    def add(self,data,actor='import',pid=None,version=None,source_key=None):
        fields=['name','nickname','division','governorate','phone','day1','day2'];values=[str(data.get(k,'') or '').strip() for k in fields]
        if not values[0] or any(len(v)>250 for v in values):raise ValueError('تحقق من الاسم وطول الحقول')
        values[4]=normalize_phone(values[4],True)
        with self.db(True) as db:
            if pid:
                # An arrival phone is locked: pending message recipient must never drift.
                old=db.execute('SELECT * FROM participants WHERE id=?',(pid,)).fetchone()
                if not old:raise ValueError('المشارك غير موجود')
                if db.execute('SELECT 1 FROM arrivals WHERE participant_id=?',(pid,)).fetchone() and old['phone']!=values[4]:raise ValueError('لا يمكن تغيير رقم الهاتف بعد تسجيل الوصول')
                cur=db.execute('UPDATE participants SET '+','.join(k+'=?' for k in fields)+',version=version+1 WHERE id=? AND version=?',values+[pid,version])
                if cur.rowcount!=1:raise ValueError('تغير السجل لدى مستخدم آخر. أعد تحميله قبل الحفظ')
            else:
                pid=secrets.token_urlsafe(16)
                db.execute('INSERT INTO participants(id,source_key,'+','.join(fields)+') VALUES('+','.join('?' for _ in range(9))+')',[pid,source_key]+values)
            self.audit(db,actor,'participant_saved',pid)
        return pid
    def matching(self,phone):
        with self.db() as db:return [dict(r) for r in db.execute('SELECT * FROM participants WHERE phone=?',(phone,))]
    def arrive(self,pid,source,actor,consent):
        with self.db(True) as db:
            if db.execute("SELECT value FROM settings WHERE key='open'").fetchone()[0]!='true' or float(db.execute("SELECT value FROM settings WHERE key='close_at'").fetchone()[0])<=time.time():raise ValueError('تسجيل الوصول مغلق حاليا. يرجى مراجعة فريق الاستقبال')
            p=db.execute('SELECT * FROM participants WHERE id=?',(pid,)).fetchone()
            if not p:raise ValueError('المشارك غير موجود')
            existing=db.execute('SELECT * FROM arrivals WHERE participant_id=?',(pid,)).fetchone()
            if existing:return {'duplicate':True,'arrived_at':oman(existing['arrived_at']),'name':p['nickname'] or p['name']}
            t=now();db.execute('INSERT INTO arrivals VALUES(?,?,?,?,?)',(pid,t,source,actor,int(consent)))
            if consent and p['phone']:db.execute('INSERT INTO outbox(id,participant_id,status,updated_at) VALUES(?,?,?,?)',(secrets.token_urlsafe(16),pid,'pending',time.time()))
            self.audit(db,actor,'arrived',pid)
            return {'duplicate':False,'arrived_at':oman(t),'name':p['nickname'] or p['name']}
    def roster(self):
        with self.db() as db:
            rows=[dict(r) for r in db.execute('SELECT p.*,a.arrived_at,a.source,a.consent,o.status AS message_status,o.id AS message_id,o.error AS message_error FROM participants p LEFT JOIN arrivals a ON a.participant_id=p.id LEFT JOIN outbox o ON o.participant_id=p.id ORDER BY a.arrived_at DESC,p.rowid')]
        for r in rows:r['arrived_at']=oman(r['arrived_at'])
        return rows
    def claim_message(self):
        with self.db(True) as db:
            # A crash after POST is ambiguous. Never auto-send again.
            db.execute("UPDATE outbox SET status='uncertain',error='تحقق من حالة المزود قبل إعادة الإرسال',updated_at=? WHERE status='processing' AND updated_at<?",(time.time(),time.time()-120))
            row=db.execute("SELECT o.*,p.phone,p.nickname,p.name FROM outbox o JOIN participants p ON p.id=o.participant_id WHERE o.status='pending' ORDER BY o.updated_at LIMIT 1").fetchone()
            if row:db.execute("UPDATE outbox SET status='processing',attempts=attempts+1,updated_at=? WHERE id=?",(time.time(),row['id']))
            return dict(row) if row else None
    def message_result(self,oid,status,provider_id=None,error=''):
        with self.db(True) as db:db.execute("UPDATE outbox SET status=?,provider_id=coalesce(?,provider_id),error=?,updated_at=? WHERE id=? AND status IN ('processing','pending','uncertain')",(status,provider_id,error,time.time(),oid))
    def retry(self,oid,actor):
        with self.db(True) as db:
            cur=db.execute("UPDATE outbox SET status='pending',error='',provider_id=NULL,updated_at=? WHERE id=? AND status='failed'",(time.time(),oid))
            if cur.rowcount!=1:raise ValueError('تتاح الإعادة للفشل المؤكد فقط، ولا تكرر الرسائل المرسلة أو غير محسومة الحالة')
            self.audit(db,actor,'message_retry')
