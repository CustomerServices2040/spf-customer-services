(() => {
  'use strict';
  const base = document.currentScript.src;
  const asset = name => new URL(name, base).href;
  const variants = {cinema:'البوصلة السينمائية', digital:'البوصلة الرقمية الحية', executive:'البوصلة القيادية'};
  const axes = ['north','east','south','west'];
  const defaults = {
    variant:'cinema', enabled:true, motion:true, concepts:true, photo:true, crest:true, compass:true,
    org:'صندوق الحماية الاجتماعية', unit:'المديرية العامة لخدمات المتعاملين',
    title:'بوصلة المتعامل', slogan:'خير الناس أنفعهم للناس',
    intro:'منصة متكاملة تستعرض تجربة المتعامل، ومنظومة الخدمات، والأداء المؤسسي، والتوجهات المستقبلية.',
    action:'دخول المنصة', north:'المتعامل', east:'الموظف', south:'الخدمة', west:'المستقبل',
    northMessage:'الإنسان محور اهتمامنا وغاية جهودنا', eastMessage:'كفاءات ممكنة تصنع جودة التجربة',
    southMessage:'خدمات متكاملة تواكب احتياجات المجتمع', westMessage:'رؤية طموحة وابتكار مستدام',
    domain0:'تجربة المتعامل', domain1:'الخدمات والتواصل', domain2:'الأداء المؤسسي', domain3:'آفاق المستقبل',
    pitch:1, scale:1, logo:1, gap:1, opacity:.76, pos:50, shine:.17, speed:1.65,
    radius:8, brand:'start', side:'right', align:'start', font:'inheritStudio', picture:'',
    metal:'#cca862', background:'', surface:''
  };
  const forumDefaults = {
    ...defaults, title:'ملتقى دوائر المحافظات', slogan:'رؤية واحدة، وجهود متكاملة، وأثر ممتد.',
    intro:'ملتقى يجمع القيادات المؤسسية والميدانية لتوحيد الجهود، وتبادل الخبرات، ورسم ملامح المستقبل.',
    action:'دخول الملتقى', registration:'تسجيل وصول المشاركين', atlasTitle:'دوائر الحماية الاجتماعية',
    atlasCaption:'اختر محافظة', opacity:.45
  };
  // Map positions are in the coordinate system of the approved 724 × 940 map.
  const provinces = [
    ['muscat','مسقط',605,292],['dhofar','ظفار',200,796],['musandam','مسندم',407,44],
    ['buraimi','البريمي',366,237],['dakhiliyah','الداخلية',501,415],['dhahirah','الظاهرة',367,381],
    ['north_batinah','شمال الباطنة',428,224],['south_batinah','جنوب الباطنة',523,275],
    ['north_sharqiyah','شمال الشرقية',593,372],['south_sharqiyah','جنوب الشرقية',641,450],
    ['wusta','الوسطى',446,606]
  ];
  const symbols = {
    north:'<circle cx="12" cy="7" r="3.4"/><path d="M4.5 21v-2.4a7.5 7.5 0 0 1 15 0V21"/>',
    east:'<rect x="3" y="7.5" width="18" height="13" rx="2"/><path d="M8 7.5V5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 5v2.5M3 12c5 3 13 3 18 0m-11 2h4"/>',
    south:'<path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Zm-9 9 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>',
    west:'<path d="M2 18h20M5 15a7 7 0 0 1 14 0M12 2v3m-8 2 2 2m14-2-2 2"/>',
    channel:'<path d="M3 4.5h14v10H9l-4 3v-3H3zM18 9h3v10h-2v2l-4-2h-4"/>',
    performance:'<path d="M3 21h18M5 17v-4m6 4V8m6 9V3"/>',
    gate:'<path d="M4 21V5h11v16M8 4l7-1v18l-7-2zM18 12h4m-2-2 2 2-2 2"/>'
  };
  function icon(name) {
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+symbols[name]+'</svg>';
  }
  function compass(variant) {
    const ticks = Array.from({length:96}, (_,i) => {
      const major=i%8===0, minor=i%2===0;
      return '<path transform="rotate('+i*3.75+' 200 200)" d="M200 27v'+(major?15:minor?8:4)+'" stroke="'+(major?'#f6e2b6':'#73968b')+'" stroke-width="'+(major?2:1)+'"/>';
    }).join('');
    const rays = Array.from({length:8},(_,i)=>'<g transform="rotate('+45*i+' 200 200)"><path d="M200 69l10 116-10 15z" fill="#729080" opacity=".34"/><path d="M200 69l-10 116 10 15z" fill="#d9c699" opacity=".21"/></g>').join('');
    const signals='<g fill="none" stroke="#7aa79d" opacity=".57"><path d="m67 158 53-54 79-15 71 33 57 66-20 74-59 53-81-2-58-61z"/><path d="m120 104 47 209 103-191 37 140L67 158"/></g><g fill="#e8cd91"><circle cx="120" cy="104" r="3"/><circle cx="270" cy="122" r="3"/><circle cx="307" cy="262" r="3"/><circle cx="167" cy="313" r="3"/></g>';
    return '<svg viewBox="0 0 400 400" aria-hidden="true"><defs><linearGradient id="rim" x2="1" y2="1"><stop stop-color="#6d5938"/><stop offset=".32" stop-color="#f4db9d"/><stop offset=".57" stop-color="#8d734d"/><stop offset=".79" stop-color="#edd7a2"/><stop offset="1" stop-color="#655035"/></linearGradient><radialGradient id="face" cx=".38" cy=".28" r=".78"><stop stop-color="var(--veil)"/><stop offset="1" stop-color="var(--base)"/></radialGradient></defs><g class="bw-ring"><circle cx="200" cy="200" r="195" fill="none" stroke="var(--line)" stroke-opacity=".35"/><circle cx="200" cy="200" r="185" fill="url(#face)" stroke="url(#rim)" stroke-width="6"/><circle cx="200" cy="200" r="180" fill="none" stroke="var(--metal)"/>'+ticks+'<circle cx="200" cy="200" r="145" fill="none" stroke="var(--line)" stroke-opacity=".38"/><circle cx="200" cy="200" r="96" fill="none" stroke="var(--line)" stroke-dasharray="1 6"/>'+rays+(variant==='executive'?'':signals)+'</g><g class="bw-bearing"><g class="bw-needle"><path d="m200 51 17 149-17-10z" fill="#f9e9bb"/><path d="m200 51-17 149 17-10z" fill="var(--metal)"/><path d="m200 342 17-142-17 9z" fill="#558678"/><path d="m200 342-17-142 17 9z" fill="#829f90"/><circle cx="200" cy="200" r="19" fill="url(#rim)"/><circle cx="200" cy="200" r="10" fill="#1f3932" stroke="#efd69d"/></g></g></svg>';
  }
  function atlas() {
    const routes = provinces.slice(1).map(([, ,x,y])=>'<path d="M605 292 Q'+((605+x)/2+30)+' '+((292+y)/2+35)+' '+x+' '+y+'"/>').join('');
    const points = provinces.map(([id,name,x,y],i)=>'<g class="bw-point" data-id="'+id+'" transform="translate('+x+' '+y+')" style="--i:'+i+'"><title>'+name+'</title><circle class="hit" r="25"/><circle class="halo" r="17"/><circle class="pin" r="7"/></g>').join('');
    return '<svg class="bw-atlas-svg" viewBox="-35 -25 805 995" aria-hidden="true"><defs><filter id="atlas-tone" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".16 .49 .08 0 .17  .12 .44 .06 0 .25  .08 .31 .05 0 .21  0 0 0 1 0"/></filter></defs><image href="'+asset('../forum/assets/oman.png')+'" width="724" height="940" filter="url(#atlas-tone)"/><g class="bw-routes">'+routes+'</g>'+points+'</svg>';
  }
  function mount(host,options={}) {
    const forum = options.context==='forum';
    const initial = forum ? forumDefaults : defaults;
    const config = {...initial,...options.settings};
    // Upgrade only the unchanged stock copy from the previous welcome.
    const old = {intro:forum?'يجمع ملتقى دوائر المحافظات قيادات المديرية لمناقشة تجربة المتعامل، وتبادل الممارسات، وتحديد أولويات تطوير الخدمة في المحافظات.':'منصة مؤسسية متكاملة تستعرض واقع خدمات المتعاملين، ومنجزاتها، وأداءها، وتوجهاتها المستقبلية، وتدعم تطوير الخدمات واتخاذ القرار.',action:forum?'الدخول إلى الملتقى':'بدء استعراض المنصة',title:forum?'ملتقى المدراء':initial.title,slogan:forum?'خير الناس أنفعهم للناس':'الإنسان غايتنا، والتميز وجهتنا'};
    for (const [key,value] of Object.entries(old)) if (config[key]===value) config[key]=initial[key];
    const root=document.createElement('section');
    root.className='bw';root.dir='rtl';root.lang='ar';root.dataset.context=forum?'forum':'main';host.append(root);
    const brand='<header class="bw-brand"><img alt="شعار صندوق الحماية الاجتماعية"><div><strong></strong><span></span></div></header>';
    const copy='<div class="bw-copy"><h1></h1><h2></h2><p></p><div class="bw-actions"><button class="bw-go" type="button" autofocus><b></b></button>'+(forum?'<a class="bw-checkin">'+icon('gate')+'<span></span></a>':'')+'</div></div>';
    const bearings=axes.map(key=>'<button type="button" class="bw-axis bw-'+key+'" data-axis="'+key+'">'+icon(key)+'<span></span></button>').join('');
    const instrument='<figure class="bw-instrument"><div class="bw-map">'+bearings+'<div class="bw-dial"></div></div><figcaption class="bw-message" aria-live="polite"></figcaption></figure>';
    const territory='<figure class="bw-atlas"><div class="bw-cartography">'+atlas()+'</div><figcaption><strong></strong><label><span></span><select></select></label></figcaption></figure>';
    const domains='<footer class="bw-domains">'+['north','channel','performance','west'].map(s=>'<div>'+icon(s)+'<span></span></div>').join('')+'</footer>';
    root.innerHTML='<div class="bw-photo"></div><div class="bw-wash"></div><div class="bw-lines"></div>'+brand+'<div class="bw-layout">'+copy+(forum?territory:instrument)+'</div>'+(forum?'':domains);
    const get=selector=>root.querySelector(selector);
    let editor=null, timer=null, current='', active='north', angle=0;
    function selectAxis(key) {
      const target=axes.indexOf(key)*90;
      angle+=((target-angle+540)%360+360)%360-180;
      active=key;
      root.style.setProperty('--bearing',angle+'deg');
      for (const button of root.querySelectorAll('[data-axis]')) button.setAttribute('aria-pressed',String(button.dataset.axis===key));
      get('.bw-message').textContent=config[key+'Message'];
    }
    function selectProvince(id) {
      for (const node of root.querySelectorAll('.bw-point')) node.classList.toggle('active',node.dataset.id===id);
      get('.bw-atlas select').value=id;
    }
    if (forum) {
      const select=get('.bw-atlas select');
      provinces.forEach(([id,name])=>select.add(new Option(name,id)));
      select.onchange=()=>selectProvince(select.value);
      get('.bw-atlas-svg').onclick=event=>{const node=event.target.closest('.bw-point');if(node)selectProvince(node.dataset.id)};
      get('.bw-checkin').href=asset('../forum/arrival/checkin.html');
      selectProvince('muscat');
    } else {
      for (const b of root.querySelectorAll('[data-axis]')) b.onclick=()=>{root.classList.add('bw-engaged');selectAxis(b.dataset.axis)};
    }
    function render() {
      root.dataset.variant=forum?'atlas':Object.hasOwn(variants,config.variant)?config.variant:'cinema';
      root.dataset.theme=options.theme||'original';
      root.dataset.motion=config.motion?'on':'off';
      for (const key of ['side','brand','align']) root.dataset[key]=config[key];
      for (const key of ['pitch','scale','logo','gap','shine']) root.style.setProperty('--'+key,config[key]);
      for (const [key,value] of Object.entries({photo:config.opacity,pos:config.pos+'%',turn:config.speed+'s',radius:config.radius+'px',type:config.font==='inheritStudio'?'var(--bs-user-font,StudioNoto),BusolaWelcome,Tahoma,sans-serif':config.font+',Tahoma,sans-serif',metal:config.metal,base:config.background,veil:config.surface})) {
        if(value!=='' && value!=null) root.style.setProperty('--'+key,value);else root.style.removeProperty('--'+key);
      }
      for (const [selector,key] of Object.entries({'.bw-brand strong':'org','.bw-brand span':'unit','h1':'title','h2':'slogan','.bw-copy p':'intro','.bw-go b':'action'})) get(selector).textContent=config[key];
      const logo=get('.bw-brand img');logo.src=asset('spf-logo.webp');logo.hidden=!config.crest;
      const photo=get('.bw-photo');photo.hidden=!config.photo;
      photo.style.backgroundImage=/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(config.picture)?'url('+config.picture+')':'';
      const figure=get('figure');figure.hidden=!config.compass;root.classList.toggle('bw-text-only',figure.hidden);
      if (forum) {
        get('.bw-checkin span').textContent=config.registration;
        get('.bw-atlas figcaption strong').textContent=config.atlasTitle;
        get('.bw-atlas label span').textContent=config.atlasCaption;
        get('.bw-atlas figcaption').hidden=!config.concepts;
      } else {
        if(current!==root.dataset.variant) {current=root.dataset.variant;get('.bw-dial').innerHTML=compass(current)}
        for (const key of axes) {get('.bw-'+key+' span').textContent=config[key];get('.bw-'+key).hidden=!config.concepts}
        get('.bw-message').hidden=get('.bw-domains').hidden=!config.concepts;
        root.querySelectorAll('.bw-domains span').forEach((item,i)=>item.textContent=config['domain'+i]);
        selectAxis(active);
      }
    }
    function enter(){
      if(timer!==null)return;
      root.classList.add('bw-leaving');
      timer=setTimeout(()=>options.onEnter?.(),config.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches?260:0);
    }
    render();get('.bw-go').onclick=enter;
    function edit(){
      if(!options.admin||document.fullscreenElement||editor)return;
      const original={...config};const dialog=document.createElement('dialog');editor=dialog;dialog.className='bwe';dialog.dir='rtl';dialog.setAttribute('aria-label','تحرير التجربة الافتتاحية');host.append(dialog);
      dialog.innerHTML='<h2>تحرير التجربة الافتتاحية</h2><div class="fields"></div><p role="status"></p><footer><button type="button" data-save>حفظ</button><button type="button" data-reset>استعادة الافتراضي</button><button type="button" data-close>إلغاء</button></footer>';
      const groups=[
        ['المحتوى',[...(!forum?[['variant','التصور',variants]]:[]),['org','اسم المؤسسة'],['unit','اسم المديرية'],['title','العنوان'],['slogan','العبارة المؤسسية'],['intro','الوصف'],...(forum?[['registration','رابط المشارك'],['atlasTitle','عنوان الخريطة'],['atlasCaption','اختيار المحافظة']]:axes.flatMap((key,i)=>[[key,'اسم المحور · '+defaults[key]],[key+'Message','رسالة '+defaults[key]],['domain'+i,'مجال المنصة · '+(i+1)]])),['action','زر الدخول']]],
        ['المظهر',[['font','الخط',{inheritStudio:'خط المنصة',BusolaWelcome:'IBM Plex Sans Arabic',Tahoma:'Tahoma',Arial:'Arial'}],['pitch','حجم النص',[.8,1.3,.05]],['background','لون الخلفية','color'],['surface','لون التدرج','color'],['metal','لون الإبراز','color'],['scale',forum?'حجم الخريطة':'حجم البوصلة',[.7,1.15,.05]],['side','توزيع الرسم والنص',{right:'اعتيادي',left:'معكوس'}],['logo','حجم الشعار',[.7,1.5,.05]],['brand','موضع الشعار',{start:'يمين',end:'يسار'}],['align','محاذاة النص',{start:'يمين',center:'وسط'}],['gap','المسافات',[.6,1.4,.1]],['radius','استدارة الزر',[0,40,1]]]],
        ['الصورة والحركة',[['picture','استبدال الصورة','file'],['pos','موضع الصورة',[0,100,1]],['opacity','شفافية الصورة',[0,.75,.01]],['shine','التوهج',[0,.5,.01]],['speed','مدة حركة الرسم بالثواني',[.4,2.5,.1]]]],
        ['الظهور',[['enabled','تفعيل الواجهة'],['motion','تفعيل الحركة'],['photo','الصورة'],['crest','الشعار'],['compass',forum?'الخريطة':'البوصلة'],['concepts','المفاهيم']]]
      ];
      function fields(){
        const box=dialog.querySelector('.fields');box.replaceChildren();
        for(const [title,items] of groups){
          const group=document.createElement('details');group.open=box.childElementCount===0;const summary=document.createElement('summary');summary.textContent=title;group.append(summary);box.append(group);
          for(const [key,label,spec] of items){
            const row=document.createElement('label');row.textContent=label;
            const isSelect=spec&&typeof spec==='object'&&!Array.isArray(spec);
            const control=document.createElement(isSelect?'select':key==='intro'?'textarea':'input');
            if(isSelect)Object.entries(spec).forEach(([v,t])=>control.add(new Option(t,v)));
            else if(Array.isArray(spec)){control.type='range';[control.min,control.max,control.step]=spec;}
            else if(typeof defaults[key]==='boolean'){control.type='checkbox';control.checked=config[key];}
            else if(spec)control.type=spec;
            if(spec==='file')control.accept='image/png,image/jpeg,image/webp';
            else if(control.type!=='checkbox')control.value=config[key]||(spec==='color'?getComputedStyle(root).getPropertyValue(key==='background'?'--base':'--veil').trim():config[key]??'');
            control.oninput=async()=>{
              if(spec==='file'){
                const f=control.files[0];if(!f)return;
                if(f.size>2200000||!['image/png','image/jpeg','image/webp'].includes(f.type)){dialog.querySelector('[role=status]').textContent='اختر صورة JPG أو PNG أو WebP أصغر من 2.2 ميغابايت.';return;}
                const reader=new FileReader();reader.onload=()=>{config[key]=reader.result;render()};reader.readAsDataURL(f);
              }else{config[key]=control.type==='checkbox'?control.checked:control.type==='range'?+control.value:control.value;render();}
            };
            row.append(control);group.append(row);
          }
        }
      }
      function close(){dialog.close();dialog.remove();editor=null;}
      function cancel(){Object.assign(config,original);render();close();}
      dialog.oncancel=e=>{e.preventDefault();cancel()};
      dialog.querySelector('[data-close]').onclick=cancel;
      dialog.querySelector('[data-reset]').onclick=()=>{Object.assign(config,initial);render();fields()};
      dialog.querySelector('[data-save]').onclick=async()=>{try{await options.onSave({...config});close()}catch{dialog.querySelector('[role=status]').textContent='تعذر الحفظ على هذا الجهاز. جرب صورة أصغر ثم أعد الحفظ.'}};
      fields();dialog.showModal();
    }
    return {edit,destroy(){clearTimeout(timer);editor?.remove();root.remove()}};
  }
  window.BusolaWelcome={mount,variants};
})();
