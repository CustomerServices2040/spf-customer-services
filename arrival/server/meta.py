"""Official Meta template transport. Disabled unless explicitly configured."""
import os, json, urllib.request, urllib.error
class DeliveryError(Exception):
    def __init__(self,state,code):self.state=state;self.code=code
class Meta:
    def __init__(self):
        self.enabled=os.getenv('WHATSAPP_ENABLED')=='true'
    def send(self,phone,template,parameters,correlation=None,otp=False):
        if not self.enabled:raise DeliveryError('disabled','provider_disabled')
        required=['META_TOKEN','META_PHONE_ID','META_API_VERSION']
        if any(not os.getenv(k) for k in required) or not template:raise DeliveryError('disabled','provider_unconfigured')
        components=[{'type':'body','parameters':[{'type':'text','text':x} for x in parameters]}]
        if otp:components.append({'type':'button','sub_type':'url','index':'0','parameters':[{'type':'text','text':parameters[0]}]})
        body={'messaging_product':'whatsapp','to':phone.lstrip('+'),'type':'template','template':{'name':template,'language':{'code':os.getenv('META_LANGUAGE','ar')},'components':components}}
        if correlation:body['biz_opaque_callback_data']=correlation
        url='https://graph.facebook.com/'+os.environ['META_API_VERSION']+'/'+os.environ['META_PHONE_ID']+'/messages'
        request=urllib.request.Request(url,json.dumps(body).encode(),{'Authorization':'Bearer '+os.environ['META_TOKEN'],'Content-Type':'application/json'})
        try:
            with urllib.request.urlopen(request,timeout=15) as r:result=json.load(r)
            pid=result.get('messages',[{}])[0].get('id')
            if not pid:raise DeliveryError('uncertain','missing_provider_id')
            return pid
        except urllib.error.HTTPError as e:
            # Do not log provider payloads or tokens. A 5xx can be ambiguous.
            raise DeliveryError('failed' if 400<=e.code<500 else 'uncertain','http_'+str(e.code)) from None
        except (TimeoutError,urllib.error.URLError,json.JSONDecodeError):raise DeliveryError('uncertain','network_or_response_error') from None

def dispatch_one(store,provider):
    if not provider.enabled:return False
    row=store.claim_message()
    if not row:return False
    try:
        pid=provider.send(row['phone'],os.getenv('META_WELCOME_TEMPLATE',''),[row['nickname'] or row['name']],row['callback_token'])
        # accepted is not delivered; signed webhooks are authoritative.
        store.message_result(row['id'],'accepted',pid)
    except DeliveryError as e:store.message_result(row['id'],'pending' if e.state=='disabled' else e.state,error=e.code)
    return True
