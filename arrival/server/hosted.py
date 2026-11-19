"""Render launch: same-origin HTTPS, durable DB; no outbound message worker."""
import os
import uvicorn
if __name__ == '__main__':
    origin=os.environ.get('RENDER_EXTERNAL_URL','').rstrip('/')
    if not origin.startswith('https://'):
        raise SystemExit('RENDER_EXTERNAL_URL must be HTTPS')
    os.environ['PUBLIC_ORIGIN']=origin
    os.environ['WHATSAPP_ENABLED']='false'
    uvicorn.run('arrival.server.run:app',host='0.0.0.0',port=int(os.getenv('PORT','10000')),proxy_headers=False)
