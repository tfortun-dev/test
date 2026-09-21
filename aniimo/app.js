(function () {
"use strict";
var ANIIMO=["Loufeuteau","Jappardent","Hurlebrasier","Inferlupin","Célestia","Stellaria","Cuicui","Trombec","Clairbec","Tubabec","Iris","Valsiris","Irisalis","Tilotus","Filoutus","Givrotus","Voilotus","Cumulaine","Turbulaine","Lainirique","Fredon","Sorcelonde","Nutrion","Crabourgeon","Crabiflore","Cristocrabe","Farfafeu","Flamirage","Fluoretti","Voletti","Somniwing","Eko","Ekolombo","Bourgeonnet","Rapiéronce","Méliflore","Pomœuf","Danzard","Pomawk","Plumiel","Fragrancier","Flammi","Igniti","Fulmi","Osky","Glaivrier","Molosabre","Voltige","Voltignasse","Écurixe","Écurouste","Louloutre","Bulloutre","Ondeloutre","Terriloutre","Astrid","Astor","Astrophel","Balabée","Coléobée","Boulabée","Touffu","Fulgucrin","Casquimou","Casquipreux","Casquillon","Machou","Casquimord","Cuiragon","Infergon","Ourso","Grizzo","Silexodon","Lavasaure","Magmarex","Géodosaure","Cristorex","Cabaroc","Bastiroc","Bulbi","Voilueur","Luminelle","Falou","Fabulle","Pulsato","Reefish","Coraliz","Cheekie","Wavwal","Bubbeep","Glameep","Popapus","Gachapus","Malangel","Malevsera","Fennelun","Soleon","Petit Esprit de Feu","Lunara","Hélion"];
var PRIORITIES=["Crabiflore","Igniti","Pomawk","Boulabée","Écurouste","Infergon","Magmarex","Pulsato"];
var NUMBERS={"Crabiflore":"024","Igniti":"041","Pomawk":"037","Boulabée":"058","Écurouste":"048","Infergon":"067","Magmarex":"072","Pulsato":"082"};
var STORAGE_KEY="aniimo-carnet-idyll-v2";
var LEGACY_KEY="aniimo-carnet-idyll-v1";
var SYNC_KEY="aniimo-github-sync-v1";
var CLOUD_REPO="tfortun-dev/test";
var CLOUD_PATH="aniimo-data/save.enc.json";
var API="https://api.github.com";
var filter="all";
var state=loadState();
var cloudBusy=false,cloudTimer=null,pollTimer=null,runtimeToken="",runtimePassphrase="";

function q(s){return document.querySelector(s);}
function qa(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function norm(v){return String(v==null?"":v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function emptyState(){return {version:2,updatedAt:0,caught:[],wanted:PRIORITIES.slice(),entries:[]};}
function sanitize(data){
  var base=emptyState(),d=data&&typeof data==="object"?data:{};
  base.updatedAt=Number(d.updatedAt)||0;
  base.caught=Array.from(new Set((Array.isArray(d.caught)?d.caught:[]).filter(function(n){return ANIIMO.indexOf(n)>-1;})));
  base.wanted=Array.from(new Set((Array.isArray(d.wanted)?d.wanted:PRIORITIES).filter(function(n){return ANIIMO.indexOf(n)>-1;})));
  base.entries=(Array.isArray(d.entries)?d.entries:[]).filter(Boolean).map(function(e){
    return {id:String(e.id||Date.now()+Math.random()),date:String(e.date||""),title:String(e.title||""),area:String(e.area||""),aniimo:ANIIMO.indexOf(e.aniimo)>-1?e.aniimo:"",text:String(e.text||""),created:Number(e.created)||Date.now(),modified:Number(e.modified)||Number(e.created)||Date.now()};
  });
  return base;
}
function loadState(){
  try{
    var raw=localStorage.getItem(STORAGE_KEY);
    if(raw)return sanitize(JSON.parse(raw));
    raw=localStorage.getItem(LEGACY_KEY);
    if(raw){
      var migrated=sanitize(JSON.parse(raw));
      migrated.updatedAt=Date.now();
      localStorage.setItem(STORAGE_KEY,JSON.stringify(migrated));
      return migrated;
    }
  }catch(e){console.warn(e);}
  return emptyState();
}
function saveLocal(touch,sync){
  if(touch!==false)state.updatedAt=Date.now();
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){console.warn(e);}
  renderStats();
  if(sync!==false)schedulePush();
}
function caught(n){return state.caught.indexOf(n)>-1;}
function wanted(n){return state.wanted.indexOf(n)>-1;}
function toast(t){var e=q("#toast");if(!e)return;e.textContent=t;e.classList.add("on");clearTimeout(toast.timer);toast.timer=setTimeout(function(){e.classList.remove("on");},1800);}
function go(v){
  qa(".tab").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-view")===v);});
  qa(".view").forEach(function(x){x.classList.toggle("on",x.id===v);});
  if(v==="dex")renderDex();
  if(v==="journal")renderEntries();
  if(v==="save")renderSyncUi();
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderStats(){
  var c=state.caught.length,p=PRIORITIES.filter(caught).length;
  if(q("#score"))q("#score").textContent=c+"/"+ANIIMO.length;
  if(q("#bar"))q("#bar").style.width=Math.round(c/ANIIMO.length*100)+"%";
  if(q("#prioScore"))q("#prioScore").textContent=p+"/8 priorités obtenues";
  if(q("#sCaught"))q("#sCaught").textContent=c;
  if(q("#sWanted"))q("#sWanted").textContent=state.wanted.length;
  if(q("#sEntries"))q("#sEntries").textContent=state.entries.length;
}
function toggleCaught(n){
  state.caught=caught(n)?state.caught.filter(function(x){return x!==n;}):state.caught.concat(n);
  saveLocal();renderTargets();renderDex();renderRecent();toast(caught(n)?n+" capturé":n+" retiré");
}
function toggleWanted(n){
  state.wanted=wanted(n)?state.wanted.filter(function(x){return x!==n;}):state.wanted.concat(n);
  saveLocal();renderDex();toast(wanted(n)?n+" ajouté aux favoris":n+" retiré des favoris");
}
function renderTargets(){
  var root=q("#targets");if(!root)return;
  root.innerHTML=PRIORITIES.map(function(n){
    return '<article class="target '+(caught(n)?"done":"")+'"><small>#'+NUMBERS[n]+' · priorité</small><b>'+esc(n)+'</b><button class="smallbtn" type="button" data-catch="'+esc(n)+'">'+(caught(n)?"✓ Capturé":"Marquer capturé")+'</button></article>';
  }).join("");
}
function renderDex(){
  var root=q("#dexGrid"),search=q("#search");if(!root||!search)return;
  var needle=norm(search.value.trim()),list=ANIIMO.filter(function(n){return !needle||norm(n).indexOf(needle)>-1;});
  if(filter==="wanted")list=list.filter(wanted);
  if(filter==="caught")list=list.filter(caught);
  if(filter==="missing")list=list.filter(function(n){return !caught(n);});
  if(!list.length){root.innerHTML='<div class="empty">Aucun Aniimo ne correspond à ce filtre.</div>';return;}
  root.innerHTML=list.map(function(n){
    return '<article class="ani '+(caught(n)?"caught ":"")+(wanted(n)?"wanted":"")+'"><input class="check" type="checkbox" aria-label="Capturé '+esc(n)+'" data-dex="'+esc(n)+'" '+(caught(n)?"checked":"")+'><div><b>'+esc(n)+'</b><small>'+(caught(n)?"dans ta collection":"pas encore coché")+'</small></div><button class="star '+(wanted(n)?"on":"")+'" type="button" data-star="'+esc(n)+'" aria-label="Favori '+esc(n)+'">★</button></article>';
  }).join("");
}
function renderOptions(){
  var el=q("#linked");if(!el)return;var current=el.value;
  el.innerHTML='<option value="">— aucun —</option>'+ANIIMO.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join("");
  if(ANIIMO.indexOf(current)>-1)el.value=current;
}
function sortedEntries(){return state.entries.slice().sort(function(a,b){return (b.date||"").localeCompare(a.date||"")||(b.modified||b.created||0)-(a.modified||a.created||0);});}
function renderEntries(){
  var root=q("#entries");if(!root)return;var list=sortedEntries();
  if(!list.length){root.innerHTML='<div class="empty">Ton journal est vide.</div>';return;}
  root.innerHTML=list.map(function(e){
    return '<article class="entry"><div class="entrytop"><div><h3>'+esc(e.title)+'</h3><div class="meta">'+esc(e.date||"")+(e.area?" · "+esc(e.area):"")+(e.aniimo?" · "+esc(e.aniimo):"")+'</div></div><div class="actions"><button class="icon" type="button" data-edit="'+esc(e.id)+'">✎</button><button class="icon" type="button" data-del="'+esc(e.id)+'">×</button></div></div><p>'+esc(e.text)+'</p></article>';
  }).join("");
}
function renderRecent(){
  var root=q("#recent");if(!root)return;var list=sortedEntries().slice(0,3);
  if(!list.length){root.innerHTML='<div class="empty">Pas encore de note. Ton premier souvenir apparaîtra ici.</div>';return;}
  root.innerHTML='<div class="entries">'+list.map(function(e){var t=esc(e.text);return '<article class="entry"><h3>'+esc(e.title)+'</h3><div class="meta">'+esc(e.date||"")+(e.aniimo?" · "+esc(e.aniimo):"")+'</div><p>'+t.slice(0,220)+(t.length>220?"…":"")+'</p></article>';}).join("")+'</div>';
}
function resetForm(){
  var form=q("#form");if(!form)return;form.reset();q("#eid").value="";q("#date").value=new Date().toISOString().slice(0,10);q("#cancel").hidden=true;
}
function editEntry(id){
  var e=state.entries.find(function(x){return x.id===id;});if(!e)return;go("journal");
  q("#eid").value=e.id;q("#date").value=e.date||"";q("#title").value=e.title||"";q("#area").value=e.area||"";q("#linked").value=e.aniimo||"";q("#text").value=e.text||"";q("#cancel").hidden=false;q("#title").focus();
}
function submitJournal(ev){
  ev.preventDefault();var id=q("#eid").value,old=state.entries.find(function(x){return x.id===id;}),now=Date.now();
  var e={id:id||String(now)+Math.random().toString(16).slice(2),date:q("#date").value,title:q("#title").value.trim(),area:q("#area").value.trim(),aniimo:q("#linked").value,text:q("#text").value.trim(),created:old?old.created:now,modified:now};
  if(!e.title||!e.text)return;
  state.entries=old?state.entries.map(function(x){return x.id===id?e:x;}):state.entries.concat(e);
  saveLocal();renderEntries();renderRecent();resetForm();toast(old?"Entrée modifiée":"Entrée ajoutée");
}
function exportJson(){
  var blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="aniimo-carnet-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},500);toast("Sauvegarde exportée");
}
function importJson(ev){
  var file=ev.target.files&&ev.target.files[0];if(!file)return;var r=new FileReader();
  r.onload=function(){try{state=sanitize(JSON.parse(r.result));state.updatedAt=Date.now();saveLocal();renderAll();toast("Sauvegarde importée");}catch(e){alert("Fichier de sauvegarde invalide.");}ev.target.value="";};r.readAsText(file);
}
function syncCfg(){
  try{var c=JSON.parse(localStorage.getItem(SYNC_KEY)||"{}");return {remember:c.remember!==false,token:String(c.token||""),passphrase:String(c.passphrase||"")};}
  catch(e){return {remember:true,token:"",passphrase:""};}
}
function saveSyncCfg(){
  var remember=q("#rememberSync")?q("#rememberSync").checked:true;
  localStorage.setItem(SYNC_KEY,JSON.stringify({remember:remember,token:remember?runtimeToken:"",passphrase:remember?runtimePassphrase:""}));
}
function setStatus(text,kind){
  var el=q("#syncStatus");if(!el)return;el.textContent=text;el.className="syncstatus"+(kind?" "+kind:"");
}
function renderSyncUi(){
  var c=syncCfg();if(!runtimeToken&&c.token)runtimeToken=c.token;if(!runtimePassphrase&&c.passphrase)runtimePassphrase=c.passphrase;
  if(q("#githubToken")&&!q("#githubToken").value)q("#githubToken").value=runtimeToken;
  if(q("#syncPassphrase")&&!q("#syncPassphrase").value)q("#syncPassphrase").value=runtimePassphrase;
  if(q("#rememberSync"))q("#rememberSync").checked=c.remember;
  setStatus(runtimeToken&&runtimePassphrase?"Prêt · synchro automatique active":"À configurer",runtimeToken&&runtimePassphrase?"ok":"");
}
function b64(bytes){var s="";for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s);}
function unb64(s){var bin=atob(s),out=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
function textB64(text){return b64(new TextEncoder().encode(text));}
function b64Text(s){return new TextDecoder().decode(unb64(s));}
async function derive(pass,salt){
  var material=await crypto.subtle.importKey("raw",new TextEncoder().encode(pass),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:180000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function encryptData(data,pass){
  var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await derive(pass,salt),plain=new TextEncoder().encode(JSON.stringify(data));
  var enc=await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},key,plain);
  return {format:"aniimo-encrypted-save",version:1,salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(enc))};
}
async function decryptData(env,pass){
  if(!env||env.format!=="aniimo-encrypted-save")throw new Error("Format de sauvegarde inconnu.");
  var salt=unb64(env.salt),iv=unb64(env.iv),key=await derive(pass,salt),plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:iv},key,unb64(env.data));
  return sanitize(JSON.parse(new TextDecoder().decode(plain)));
}
async function gh(url,opt){
  opt=opt||{};var headers=Object.assign({"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},opt.headers||{});
  if(runtimeToken)headers.Authorization="Bearer "+runtimeToken;
  return fetch(url,Object.assign({},opt,{headers:headers}));
}
async function getCloud(){
  var res=await gh(API+"/repos/"+CLOUD_REPO+"/contents/"+CLOUD_PATH+"?ref=main&t="+Date.now());
  if(res.status===404)return null;
  if(!res.ok)throw new Error("GitHub "+res.status+" · "+(await res.text()).slice(0,180));
  var d=await res.json();return {sha:d.sha,text:b64Text(String(d.content||"").replace(/\n/g,""))};
}
async function putCloud(env,sha){
  if(!runtimeToken)throw new Error("Token GitHub manquant.");
  var body={message:"Sync Aniimo companion",content:textB64(JSON.stringify(env)),branch:"main"};if(sha)body.sha=sha;
  var res=await gh(API+"/repos/"+CLOUD_REPO+"/contents/"+CLOUD_PATH,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!res.ok)throw new Error("GitHub "+res.status+" · "+(await res.text()).slice(0,180));
  return res.json();
}
async function syncCloud(forcePush,silent){
  if(cloudBusy||!runtimeToken||!runtimePassphrase){if(!silent&&!cloudBusy)setStatus("Configuration incomplète","err");return;}
  cloudBusy=true;if(!silent)setStatus("Synchronisation…","busy");
  try{
    var file=await getCloud();
    if(!file){await putCloud(await encryptData(state,runtimePassphrase),null);setStatus("Synchronisé · première sauvegarde créée","ok");if(!silent)toast("Sauvegarde GitHub créée");return;}
    var remote;
    try{remote=await decryptData(JSON.parse(file.text),runtimePassphrase);}catch(e){throw new Error("Clé de chiffrement incorrecte ou sauvegarde illisible.");}
    if(!forcePush&&remote.updatedAt>state.updatedAt){state=remote;saveLocal(false,false);renderAll();setStatus("Synchronisé · données GitHub récupérées","ok");if(!silent)toast("Données GitHub récupérées");}
    else if(forcePush||state.updatedAt>remote.updatedAt){await putCloud(await encryptData(state,runtimePassphrase),file.sha);setStatus("Synchronisé · GitHub à jour","ok");if(!silent)toast("GitHub mis à jour");}
    else setStatus("Synchronisé · déjà à jour","ok");
  }catch(e){console.error(e);setStatus("Erreur de synchro","err");if(!silent)alert("Synchronisation GitHub impossible.\n\n"+e.message);}
  finally{cloudBusy=false;}
}
function schedulePush(){if(!runtimeToken||!runtimePassphrase)return;clearTimeout(cloudTimer);cloudTimer=setTimeout(function(){syncCloud(true,true);},1200);}
function startPolling(){clearInterval(pollTimer);if(runtimeToken&&runtimePassphrase)pollTimer=setInterval(function(){syncCloud(false,true);},30000);}
async function connectGithub(){
  runtimeToken=(q("#githubToken").value||"").trim();runtimePassphrase=q("#syncPassphrase").value||"";
  if(!runtimeToken||runtimePassphrase.length<6){alert("Renseigne ton token GitHub et une clé de chiffrement d’au moins 6 caractères.");return;}
  saveSyncCfg();setStatus("Vérification…","busy");await syncCloud(false,false);startPolling();
}
function disconnectGithub(){
  runtimeToken="";runtimePassphrase="";localStorage.removeItem(SYNC_KEY);clearInterval(pollTimer);
  if(q("#githubToken"))q("#githubToken").value="";if(q("#syncPassphrase"))q("#syncPassphrase").value="";
  setStatus("Déconnecté · données locales conservées","");toast("Synchronisation déconnectée");
}
function renderAll(){renderStats();renderTargets();renderDex();renderEntries();renderRecent();renderOptions();renderSyncUi();}
function bind(){
  document.addEventListener("click",function(ev){
    var x=ev.target.closest("[data-view]");if(x){go(x.getAttribute("data-view"));return;}
    x=ev.target.closest("[data-go]");if(x){go(x.getAttribute("data-go"));return;}
    x=ev.target.closest("[data-catch]");if(x){toggleCaught(x.getAttribute("data-catch"));return;}
    x=ev.target.closest("[data-star]");if(x){toggleWanted(x.getAttribute("data-star"));return;}
    x=ev.target.closest("[data-filter]");if(x){filter=x.getAttribute("data-filter");qa("[data-filter]").forEach(function(b){b.classList.toggle("on",b===x);});renderDex();return;}
    x=ev.target.closest("[data-edit]");if(x){editEntry(x.getAttribute("data-edit"));return;}
    x=ev.target.closest("[data-del]");if(x&&confirm("Supprimer cette entrée ?")){state.entries=state.entries.filter(function(e){return e.id!==x.getAttribute("data-del");});saveLocal();renderEntries();renderRecent();toast("Entrée supprimée");}
  });
  document.addEventListener("change",function(ev){if(ev.target.matches("[data-dex]"))toggleCaught(ev.target.getAttribute("data-dex"));});
  q("#search").addEventListener("input",renderDex);
  q("#form").addEventListener("submit",submitJournal);
  q("#cancel").addEventListener("click",resetForm);
  q("#export").addEventListener("click",exportJson);
  q("#import").addEventListener("change",importJson);
  q("#reset").addEventListener("click",function(){if(confirm("Tout effacer sur cet appareil ? La sauvegarde GitHub ne sera pas supprimée automatiquement.")){state=emptyState();state.updatedAt=Date.now();saveLocal();renderAll();resetForm();toast("Carnet local réinitialisé");}});
  if(q("#connectGithub"))q("#connectGithub").addEventListener("click",connectGithub);
  if(q("#syncNow"))q("#syncNow").addEventListener("click",function(){syncCloud(false,false);});
  if(q("#pushGithub"))q("#pushGithub").addEventListener("click",function(){syncCloud(true,false);});
  if(q("#disconnectGithub"))q("#disconnectGithub").addEventListener("click",disconnectGithub);
  document.addEventListener("visibilitychange",function(){if(!document.hidden&&runtimeToken&&runtimePassphrase)syncCloud(false,true);});
}
function init(){
  bind();renderOptions();resetForm();renderAll();
  var c=syncCfg();
  if(c.token&&c.passphrase){runtimeToken=c.token;runtimePassphrase=c.passphrase;q("#githubToken").value=runtimeToken;q("#syncPassphrase").value=runtimePassphrase;syncCloud(false,true);startPolling();}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();