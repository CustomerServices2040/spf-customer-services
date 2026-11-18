'use strict';
(() => {
  const value=window.ARRIVAL_SERVICE_ORIGIN;
  if(!value)return;
  try {
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('Invalid service origin');
    document.querySelector('#open').href=url.origin+'/admin';
    document.querySelector('#open').hidden=false;
    document.querySelector('#state').textContent='الدخول مخصص للمنظمين وفريق الاستقبال، باستخدام حسابات وصلاحيات مستقلة.';
  } catch {document.querySelector('#state').textContent='لم يضبط عنوان الخدمة الآمنة بصورة صحيحة. يرجى مراجعة مسؤول النظام.';}
})();
