/* Shared contrast math. No data, storage or network access. */
(function(scope){
'use strict';
function parse(value){
 if(!value||value==='none'||value==='transparent')return [0,0,0,0];
 if(value[0]==='#'){let h=value.slice(1);if(h.length<5)h=[...h].map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).concat(h.length===8?parseInt(h.slice(6),16)/255:1)}
 const values=value.match(/[-+]?(?:\d*\.)?\d+%?/g);if(!values||values.length<3)return null;
 const unit=value.startsWith('color(srgb');return values.slice(0,3).map(v=>parseFloat(v)*(v.includes('%')?2.55:unit?255:1)).concat(values[3]===undefined?1:parseFloat(values[3])/(values[3].includes('%')?100:1));
}
function over(f,b){const a=f[3]??1;return f.slice(0,3).map((v,i)=>v*a+b[i]*(1-a)).concat(1)}
function luminance(c){return c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function score(f,backgrounds){return Math.min(...backgrounds.map(b=>ratio(over(f,b),b)))}
function pick(candidates,backgrounds,minimum){return candidates.find(c=>score(c.color,backgrounds)>=minimum)||candidates.reduce((a,b)=>score(a.color,backgrounds)>score(b.color,backgrounds)?a:b)}
function background(element,cache){
 if(cache.has(element))return cache.get(element);
 const parent=element.parentElement||element.getRootNode().host;
 let under=parent?background(parent,cache):[[255,255,255,1]];
 const style=getComputedStyle(element),solid=parse(style.backgroundColor);
 if(solid&&solid[3]>=.999)under=[solid];else if(solid&&solid[3]>0)under=under.map(c=>over(solid,c));
 // Resolve stacked gradients from back to front; transparent decoration is not a white surface.
 if(style.backgroundImage!=='none'&&!style.backgroundImage.includes('url(')){
  const layers=[];let depth=0,start=0;const image=style.backgroundImage;
  for(let i=0;i<image.length;i++){if(image[i]==='(')depth++;else if(image[i]===')')depth--;else if(image[i]===','&&!depth){layers.push(image.slice(start,i));start=i+1}}layers.push(image.slice(start));
  for(const layer of layers.reverse()){
   const colors=(layer.match(/(?:rgba?\(|color\(srgb\s)[^)]*\)/g)||[]).map(parse).filter(Boolean);
   // Doughnut labels occupy the opaque centre, not the coloured perimeter.
   const centre=layer.match(/^\s*radial-gradient\(circle[^,]*,\s*(?:rgba?\([^)]*\)|color\(srgb[^)]*\))\s+(\d+)%/);
   if(centre&&Number(centre[1])>=40&&colors[0]?.[3]>=.999)under=[colors[0]];
   else if(colors.length)under=colors.flatMap(c=>under.map(b=>over(c,b))).slice(0,32);
  }
 }
 cache.set(element,under);return under;
}
const api={parse,over,luminance,ratio,score,pick,background};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else scope.BusolaContrast=api;
})(typeof window!=='undefined'?window:globalThis);
