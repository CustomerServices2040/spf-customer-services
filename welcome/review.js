(() => {
  const $=id=>document.getElementById(id);
  const key='busola.signature.review.v1';
  const live='https://customerservices2040.github.io/spf-customer-services/legacy/#overview';
  let saved={};try{saved=JSON.parse(localStorage.getItem(key))||{}}catch{}
  const theme=$('theme'), variant=$('variant'), frame=document.querySelector('#platform iframe');
  const query=new URLSearchParams(location.search);
  function choose(select,value){if([...select.options].some(o=>o.value===value))select.value=value;}
  choose(variant,query.get('concept')||saved.variant);choose(theme,query.get('theme')||saved.theme);
  let instance;
  function enter(update=true){instance?.destroy();instance=null;$('stage').hidden=true;$('tools').hidden=true;$('platform').hidden=false;if(!frame.src)frame.src=live;if(update)location.hash='overview';$('back').focus()}
  function show(){
    instance?.destroy();$('tools').hidden=false;$('stage').hidden=false;$('platform').hidden=true;
    instance=BusolaWelcome.mount($('stage'),{settings:{...saved,variant:variant.value},theme:theme.value,admin:true,onEnter:enter,onSave:data=>{const next={...data,theme:theme.value};localStorage.setItem(key,JSON.stringify(next));saved=next;choose(variant,data.variant)}});
  }
  function change(){saved={...saved,variant:variant.value,theme:theme.value};try{localStorage.setItem(key,JSON.stringify(saved))}catch{}show()}
  variant.onchange=theme.onchange=change;
  $('edit').onclick=()=>instance?.edit();
  $('back').onclick=()=>{history.replaceState(null,'',location.pathname+location.search);show();document.querySelector('.bw-go')?.focus()};
  const exitView=document.createElement('button');
  exitView.id='exitView';exitView.textContent='إنهاء العرض';exitView.hidden=true;
  document.body.append(exitView);
  function presentation(active){
    document.body.classList.toggle('review-presentation',active);
    exitView.hidden=!active;
  }
  $('full').onclick=async()=>{
    presentation(true);
    try{await document.documentElement.requestFullscreen()}catch{/* Embedded browsers keep the presentation layout. */}
  };
  exitView.onclick=()=>{presentation(false);if(document.fullscreenElement)document.exitFullscreen()};
  document.addEventListener('fullscreenchange',()=>presentation(!!document.fullscreenElement));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')presentation(false)});
  onhashchange=()=>{if(location.hash==='#overview'){if($('platform').hidden)enter(false)}else show()};
  if(location.hash==='#overview'||saved.enabled===false)enter(false);else show();
})();
