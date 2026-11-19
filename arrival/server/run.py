import os
from .app import create_app
app=create_app(demo=os.getenv('ARRIVAL_DEMO')=='true')
