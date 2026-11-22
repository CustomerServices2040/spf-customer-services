"""Render launch: same-origin HTTPS, durable DB; no outbound message worker."""
import os
import uvicorn
import json
from .core import Store
if __name__ == '__main__':
    origin=os.environ.get('RENDER_EXTERNAL_URL','').rstrip('/')
    if not origin.startswith('https://'):
        raise SystemExit('RENDER_EXTERNAL_URL must be HTTPS')
    # One-time private seed is supplied via Render environment, never source files.
    seed=os.environ.pop('ARRIVAL_BOOTSTRAP_JSON','')
    if seed:
        data=json.loads(seed)
        store=Store(os.environ['ARRIVAL_DB'])
        with store.db(True) as db:
            if not db.execute("SELECT 1 FROM settings WHERE key='bootstrap_done'").fetchone():
                if db.execute('SELECT 1 FROM participants').fetchone() or db.execute('SELECT 1 FROM users').fetchone():
                    raise RuntimeError('Bootstrap requires an empty installation')
                for r in data['participants']:
                    db.execute('INSERT INTO participants(id,source_key,name,nickname,division,governorate,phone,day1,day2,version) VALUES(?,?,?,?,?,?,?,?,?,?)',r)
                db.execute('INSERT INTO users VALUES(?,?,?)',(data['username'],data['password_hash'],'organizer'))
                db.execute("INSERT INTO settings VALUES('bootstrap_done','true')")
    os.environ['PUBLIC_ORIGIN']=origin
    os.environ['WHATSAPP_ENABLED']='false'
    uvicorn.run('arrival.server.run:app',host='0.0.0.0',port=int(os.getenv('PORT','10000')),proxy_headers=False)
