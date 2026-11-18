import argparse,os
p=argparse.ArgumentParser();p.add_argument('--host',default='127.0.0.1');p.add_argument('--port',type=int,default=4173);a,_=p.parse_known_args()
os.environ['ARRIVAL_DEMO']='true';os.environ['COOKIE_SECURE']='false';os.environ['ARRIVAL_DB']='/tmp/busola-review/arrival.db'
import uvicorn
uvicorn.run('server.run:app',host=a.host,port=a.port)
