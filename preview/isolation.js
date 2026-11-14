/* Preview environment boundary only. The original application is unmodified.
   Permit reads. Prevent token entry or outbound publication from this review origin. */
(()=>{
 'use strict';
 const nativeFetch=window.fetch.bind(window);
 window.fetch=(input,options={})=>{
   const request=input instanceof Request?input:null;
   const method=String(options.method||request?.method||'GET').toUpperCase();
   const url=new URL(request?.url||String(input),location.href);
   if(!['GET','HEAD','OPTIONS'].includes(method)&&url.origin!==location.origin){
     return Promise.reject(new Error('معاينة مستقلة: النشر الخارجي معطّل لحماية النسخة الرسمية.'));
   }
   return nativeFetch(input,options);
 };
 const isolateInputs=()=>{
   document.querySelectorAll('input[type="password"]:not([disabled])').forEach(input=>{
     if(/github|token/i.test(input.id+' '+input.name+' '+input.placeholder)){
       input.disabled=true;
       input.placeholder='النشر الخارجي معطّل في المعاينة';
     }
   });
 };
 document.addEventListener('DOMContentLoaded',()=>{
   isolateInputs();
   new MutationObserver(isolateInputs).observe(document.body,{childList:true,subtree:true});
 });
})();
