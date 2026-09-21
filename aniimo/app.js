(function () {
"use strict";
var ANIIMO=["Loufeuteau","Jappardent","Hurlebrasier","Inferlupin","Célestia","Stellaria","Cuicui","Trombec","Clairbec","Tubabec","Iris","Valsiris","Irisalis","Tilotus","Filoutus","Givrotus","Voilotus","Cumulaine","Turbulaine","Lainirique","Fredon","Sorcelonde","Nutrion","Crabourgeon","Crabiflore","Cristocrabe","Farfafeu","Flamirage","Fluoretti","Voletti","Somniwing","Eko","Ekolombo","Bourgeonnet","Rapiéronce","Méliflore","Pomœuf","Danzard","Pomawk","Plumiel","Fragrancier","Flammi","Igniti","Fulmi","Osky","Glaivrier","Molosabre","Voltige","Voltignasse","Écurixe","Écurouste","Louloutre","Bulloutre","Ondeloutre","Terriloutre","Astrid","Astor","Astrophel","Balabée","Coléobée","Boulabée","Touffu","Fulgucrin","Casquimou","Casquipreux","Casquillon","Machou","Casquimord","Cuiragon","Infergon","Ourso","Grizzo","Silexodon","Lavasaure","Magmarex","Géodosaure","Cristorex","Cabaroc","Bastiroc","Bulbi","Voilueur","Luminelle","Falou","Fabulle","Pulsato","Reefish","Coraliz","Cheekie","Wavwal","Bubbeep","Glameep","Popapus","Gachapus","Malangel","Malevsera","Fennelun","Soleon","Petit Esprit de Feu","Lunara","Hélion"];
var PRIORITIES=["Crabiflore","Igniti","Pomawk","Boulabée","Écurouste","Infergon","Magmarex","Pulsato"];
var NUMBERS={"Crabiflore":"024","Igniti":"041","Pomawk":"037","Boulabée":"058","Écurouste":"048","Infergon":"067","Magmarex":"072","Pulsato":"082"};
var DETAILS={"Crabiflore":{"no":"024","image":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10162.png","elements":["Roche","Herbe"],"role":"RUPT.","habitat":"Voie de béryl","mobility":"Tunnel","pathfinding":"—","trait":"Furtivité","summary":"Un briseur robuste dont la carapace végétalisée lui donne une identité très marquée. Son kit profite particulièrement des fenêtres de rupture.","stats":{"pv":95,"rupt":104,"atq":80,"defm":77,"defp":109,"regen":85},"source":"https://wiki.aniimo.com/fr/item/024/basic-form"},"Pomawk":{"no":"037","image":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10475.png","elements":["Herbe"],"role":"RUPT.","habitat":"Bois de la tour-aux-roses","mobility":"—","pathfinding":"—","trait":"Accord","summary":"Un Aniimo de rupture basé sur le rythme et l'accumulation de Volume, avec une forte capacité à ouvrir des fenêtres de contrôle.","stats":{"pv":87,"rupt":107,"atq":90,"defm":76,"defp":80,"regen":100},"source":"https://wiki.aniimo.com/fr/item/037/basic-form"},"Igniti":{"no":"041","image":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10032.png","elements":["Ténèbres"],"role":"DPS","habitat":"Voie de béryl","mobility":"Dissimulation","pathfinding":"Voler Lv.2","trait":"Ferveur du combat","summary":"Un DPS mobile et agressif qui cherche des éliminations rapides et profite fortement de l'enchaînement des combats.","stats":{"pv":90,"rupt":52,"atq":125,"defm":70,"defp":77,"regen":91},"source":"https://wiki.aniimo.com/fr/item/041/basic-form"},"Écurouste":{"no":"048","image":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10512.png","elements":["Feu"],"role":"RUPT.","habitat":"Forêt des foudres","mobility":"—","pathfinding":"Grimper Lv.2","trait":"Feu déchaîné","summary":"Un spécialiste de la rupture au profil très solide, capable de convertir l'utilisation de compétences en attaques de base renforcées.","stats":{"pv":110,"rupt":108,"atq":82,"defm":80,"defp":80,"regen":88},"source":"https://wiki.aniimo.com/fr/item/048/basic-form"},"Boulabée":{"no":"058","image":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10454.png","elements":["Roche"],"role":"Soutien","habitat":"Voie de béryl","mobility":"Boule déferlante","pathfinding":"—","trait":"Renforcement rocheux","summary":"Un soutien rocheux qui prépare le terrain avec des amas de roche et des effets de désintégration pour faciliter le travail de l'équipe.","stats":{"pv":91,"rupt":52,"atq":114,"defm":54,"defp":101,"regen":104},"source":"https://wiki.aniimo.com/fr/item/058/basic-form"},"Infergon":{"no":"067","image":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10025.png","elements":["Feu"],"role":"DPS","habitat":"—","mobility":"Bilatéral","pathfinding":"Voler Lv.2","trait":"Pouvoir du feu","summary":"Un DPS feu aérien qui devient plus dangereux quand la cible accumule les débuffs de Feu.","stats":{"pv":95,"rupt":50,"atq":125,"defm":85,"defp":70,"regen":80},"source":"https://wiki.aniimo.com/fr/item/067/basic-form"},"Magmarex":{"no":"072","image":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10283.png","elements":["Feu","Roche"],"role":"RUPT.","habitat":"Isthme du zéphyr","mobility":"Fast and Furious","pathfinding":"—","trait":"Charge pyro","summary":"Un briseur massif orienté Feu/Roche, avec beaucoup de PV et une excellente valeur de rupture.","stats":{"pv":110,"rupt":104,"atq":91,"defm":89,"defp":70,"regen":75},"source":"https://wiki.aniimo.com/fr/item/072/basic-form"},"Pulsato":{"no":"082","image":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10122.png","elements":["Électrique"],"role":"RÉGÉN.","habitat":"—","mobility":"—","pathfinding":"—","trait":"Surtension électrique","summary":"Un régénérateur électrique centré sur la gestion d'énergie et le maintien du rythme de l'équipe.","stats":{"pv":88,"rupt":90,"atq":92,"defm":75,"defp":75,"regen":118},"source":"https://wiki.aniimo.com/fr/item/082/basic-form"}};
var APP_URL="https://tfortun-dev.github.io/test/";
var STORAGE_KEY="aniimo-carnet-idyll-v2";
var SB_URL="https://eukjpxrqdzpvihzxpjtb.supabase.co";
var SB_KEY="sb_publishable_P3jFs6AJphD_T65Lq69qgQ_cidOkGjk";
var SB_SESSION_KEY="aniimo-supabase-session-v1";
var LEGACY_KEY="aniimo-carnet-idyll-v1";
var SYNC_KEY="aniimo-github-sync-v1";
var CLOUD_REPO="tfortun-dev/test";
var CLOUD_PATH="aniimo-data/save.enc.json";
var API="https://api.github.com";
var filter="all";
var state=loadState();
var cloudBusy=false,cloudTimer=null,pollTimer=null,runtimeToken="",runtimePassphrase="";
var sbBusy=false,sbTimer=null,sbPollTimer=null,sbSession=loadSbSession();

function q(s){return document.querySelector(s);}
function qa(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function norm(v){return String(v==null?"":v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function emptyState(){return {version:3,updatedAt:0,caught:[],wanted:PRIORITIES.slice(),entries:[],analysis:{}};}
function sanitize(data){
  var base=emptyState(),d=data&&typeof data==="object"?data:{};
  base.updatedAt=Number(d.updatedAt)||0;
  base.caught=Array.from(new Set((Array.isArray(d.caught)?d.caught:[]).filter(function(n){return ANIIMO.indexOf(n)>-1;})));
  base.wanted=Array.from(new Set((Array.isArray(d.wanted)?d.wanted:PRIORITIES).filter(function(n){return ANIIMO.indexOf(n)>-1;})));
  base.entries=(Array.isArray(d.entries)?d.entries:[]).filter(Boolean).map(function(e){
    return {id:String(e.id||Date.now()+Math.random()),date:String(e.date||""),title:String(e.title||""),area:String(e.area||""),aniimo:ANIIMO.indexOf(e.aniimo)>-1?e.aniimo:"",text:String(e.text||""),created:Number(e.created)||Date.now(),modified:Number(e.modified)||Number(e.created)||Date.now()};
  });
  base.analysis={};
  var srcAnalysis=d.analysis&&typeof d.analysis==="object"?d.analysis:{};
  ANIIMO.forEach(function(name){
    var a=srcAnalysis[name];
    if(!a||typeof a!=="object")return;
    base.analysis[name]={
      seen:!!a.seen,analysed:!!a.analysed,trained:!!a.trained,
      form:String(a.form||""),encounter:String(a.encounter||""),conditions:String(a.conditions||""),
      strengths:String(a.strengths||""),weaknesses:String(a.weaknesses||""),strategy:String(a.strategy||""),
      notes:String(a.notes||""),modified:Number(a.modified)||0
    };
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
  if(sync!==false){schedulePush();scheduleSupabasePush();}
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
  var analysed=Object.keys(state.analysis||{}).filter(function(n){return state.analysis[n]&&state.analysis[n].analysed;}).length;
  if(q("#score"))q("#score").textContent=c+"/"+ANIIMO.length;
  if(q("#bar"))q("#bar").style.width=Math.round(c/ANIIMO.length*100)+"%";
  if(q("#prioScore"))q("#prioScore").textContent=p+"/8 priorités obtenues";
  if(q("#sCaught"))q("#sCaught").textContent=c;
  if(q("#sWanted"))q("#sWanted").textContent=state.wanted.length;
  if(q("#sAnalyzed"))q("#sAnalyzed").textContent=analysed;
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
function analysisFor(n){
  var a=state.analysis&&state.analysis[n];
  return a||{seen:false,analysed:false,trained:false,form:"",encounter:"",conditions:"",strengths:"",weaknesses:"",strategy:"",notes:"",modified:0};
}
function analysisMethod(role){
  if(role==="DPS")return "Teste le burst sur une courte fenêtre, puis les dégâts soutenus. Note la facilité à rester au contact, la dépendance aux conditions de son trait et sa survie quand le combat se prolonge.";
  if(role==="RUPT.")return "Mesure surtout la vitesse à laquelle il fait monter la rupture, la facilité à placer ses compétences et la qualité de la fenêtre créée une fois la cible brisée.";
  if(role==="Soutien")return "Observe ce qu'il apporte aux alliés : buffs, débuffs, contrôle, préparation du terrain et temps nécessaire avant que son soutien devienne réellement utile.";
  if(role==="RÉGÉN.")return "Suis la génération d'énergie sur une rotation complète : fréquence des compétences, temps morts et capacité à maintenir le rythme de toute l'équipe.";
  return "Observe son rôle réel en combat, ses meilleures situations, ses contraintes et ce qui change quand tu modifies son équipe ou sa façon de jouer.";
}
function renderTargets(){
  var root=q("#targets");if(!root)return;
  root.innerHTML=PRIORITIES.map(function(n){
    var d=DETAILS[n]||{},a=analysisFor(n);
    return '<article class="target '+(caught(n)?"done":"")+'">'+
      '<button class="targetvisual" type="button" data-detail="'+esc(n)+'" aria-label="Voir la fiche de '+esc(n)+'"><img src="'+esc(d.image||"")+'" alt="'+esc(n)+'" loading="lazy"></button>'+
      '<div class="targetbody"><small>#'+NUMBERS[n]+' · '+esc(d.role||"priorité")+'</small><b>'+esc(n)+'</b>'+
      '<div class="minitags">'+(d.elements||[]).map(function(x){return '<span>'+esc(x)+'</span>';}).join("")+'</div>'+
      '<div class="targetprogress"><span class="'+(a.seen?"ok":"")+'">Vu</span><span class="'+(a.analysed?"ok":"")+'">Analysé</span><span class="'+(caught(n)?"ok":"")+'">Capturé</span></div>'+
      '<div class="targetactions"><button class="smallbtn" type="button" data-catch="'+esc(n)+'">'+(caught(n)?"✓ Capturé":"Marquer capturé")+'</button><button class="smallbtn ghost" type="button" data-detail="'+esc(n)+'">Fiche</button></div></div></article>';
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
    var d=DETAILS[n]||{},a=analysisFor(n),visual=d.image?'<img class="anithumb" src="'+esc(d.image)+'" alt="" loading="lazy">':'<div class="anithumb placeholder">'+esc(n.charAt(0))+'</div>';
    return '<article class="ani '+(caught(n)?"caught ":"")+(wanted(n)?"wanted":"")+'">'+visual+
      '<input class="check" type="checkbox" aria-label="Capturé '+esc(n)+'" data-dex="'+esc(n)+'" '+(caught(n)?"checked":"")+'>'+
      '<div class="aniname"><b>'+esc(n)+'</b><small>'+(d.role?esc(d.role)+(a.analysed?" · analysé":""):(caught(n)?"dans ta collection":"pas encore coché"))+'</small></div>'+
      '<button class="infobtn" type="button" data-detail="'+esc(n)+'" aria-label="Voir la fiche de '+esc(n)+'">i</button>'+
      '<button class="star '+(wanted(n)?"on":"")+'" type="button" data-star="'+esc(n)+'" aria-label="Favori '+esc(n)+'">★</button></article>';
  }).join("");
}

function setField(id,value){var el=q(id);if(el)el.value=value||"";}
function openDetail(name){
  var modal=q("#aniimoModal");if(!modal)return;
  var d=DETAILS[name]||{},a=analysisFor(name);
  modal.setAttribute("data-name",name);
  q("#detailName").textContent=name;
  q("#detailNo").textContent=d.no?"NO."+d.no:"Carnet personnel";
  q("#detailRole").textContent=d.role||"À documenter";
  q("#detailElements").innerHTML=(d.elements||[]).map(function(x){return '<span>'+esc(x)+'</span>';}).join("");
  var img=q("#detailImage"),ph=q("#detailPlaceholder");
  if(d.image){img.src=d.image;img.alt=name;img.hidden=false;ph.hidden=true;}else{img.hidden=true;ph.hidden=false;ph.textContent=name.charAt(0);}
  q("#detailSummary").textContent=d.summary||"Cette fiche est prête à être enrichie avec tes propres observations.";
  q("#detailHabitat").textContent=d.habitat||"—";
  q("#detailMobility").textContent=d.mobility||"—";
  q("#detailPath").textContent=d.pathfinding||"—";
  q("#detailTrait").textContent=d.trait||"—";
  q("#detailMethod").textContent=analysisMethod(d.role||"");
  var s=d.stats||{};
  q("#detailStats").innerHTML=d.stats?'<span>PV <b>'+s.pv+'</b></span><span>RUPT. <b>'+s.rupt+'</b></span><span>ATQ <b>'+s.atq+'</b></span><span>DÉF M. <b>'+s.defm+'</b></span><span>DÉF P. <b>'+s.defp+'</b></span><span>RÉGÉN. <b>'+s.regen+'</b></span>':'<span>Données officielles à ajouter</span>';
  var src=q("#detailSource");src.hidden=!d.source;if(d.source)src.href=d.source;
  q("#aSeen").checked=!!a.seen;q("#aAnalysed").checked=!!a.analysed;q("#aCaught").checked=caught(name);q("#aTrained").checked=!!a.trained;
  setField("#aForm",a.form);setField("#aEncounter",a.encounter);setField("#aConditions",a.conditions);
  setField("#aStrengths",a.strengths);setField("#aWeaknesses",a.weaknesses);setField("#aStrategy",a.strategy);setField("#aNotes",a.notes);
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.classList.add("modalopen");
}
function closeDetail(){
  var modal=q("#aniimoModal");if(!modal)return;modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.classList.remove("modalopen");
}
function saveAnalysis(){
  var modal=q("#aniimoModal"),name=modal&&modal.getAttribute("data-name");if(!name)return;
  state.analysis=state.analysis||{};
  state.analysis[name]={
    seen:q("#aSeen").checked,analysed:q("#aAnalysed").checked,trained:q("#aTrained").checked,
    form:q("#aForm").value.trim(),encounter:q("#aEncounter").value.trim(),conditions:q("#aConditions").value.trim(),
    strengths:q("#aStrengths").value.trim(),weaknesses:q("#aWeaknesses").value.trim(),strategy:q("#aStrategy").value.trim(),
    notes:q("#aNotes").value.trim(),modified:Date.now()
  };
  if(q("#aCaught").checked&&!caught(name))state.caught.push(name);
  if(!q("#aCaught").checked&&caught(name))state.caught=state.caught.filter(function(x){return x!==name;});
  saveLocal();renderTargets();renderDex();renderRecent();toast("Analyse de "+name+" enregistrée");
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
  var email=q("#cloudEmail"),account=q("#cloudAccount");
  if(sbSession&&sbSession.user){
    if(email&&!email.value)email.value=sbSession.user.email||"";
    if(account)account.textContent=sbSession.user.email||"Compte connecté";
    setStatus("Cloud connecté · synchro automatique active","ok");
  }else{
    if(account)account.textContent="Aucun compte connecté";
    setStatus("À connecter une fois par appareil","");
  }
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

function loadSbSession(){
  try{return JSON.parse(localStorage.getItem(SB_SESSION_KEY)||"null");}catch(e){return null;}
}
function saveSbSession(s){
  sbSession=s||null;
  if(sbSession)localStorage.setItem(SB_SESSION_KEY,JSON.stringify(sbSession));
  else localStorage.removeItem(SB_SESSION_KEY);
  renderSyncUi();
}
async function sbFetch(path,opt){
  opt=opt||{};
  var headers=Object.assign({"apikey":SB_KEY,"Content-Type":"application/json"},opt.headers||{});
  if(sbSession&&sbSession.access_token)headers.Authorization="Bearer "+sbSession.access_token;
  return fetch(SB_URL+path,Object.assign({},opt,{headers:headers}));
}
async function refreshSbSession(){
  if(!sbSession||!sbSession.refresh_token)return false;
  var res=await fetch(SB_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:sbSession.refresh_token})});
  if(!res.ok){saveSbSession(null);return false;}
  var d=await res.json();d.expires_at=Math.floor(Date.now()/1000)+(d.expires_in||3600);saveSbSession(d);return true;
}
async function ensureSbSession(){
  if(!sbSession)return false;
  if(!sbSession.expires_at)return true;
  if(sbSession.expires_at-Math.floor(Date.now()/1000)>60)return true;
  return refreshSbSession();
}
async function registerSupabase(){
  var email=(q("#cloudEmail").value||"").trim(),password=q("#cloudPassword").value||"";
  if(!email||password.length<6){alert("Entre ton email et un mot de passe d’au moins 6 caractères.");return;}
  setStatus("Création du compte…","busy");
  var res=await fetch(SB_URL+"/auth/v1/signup?redirect_to="+encodeURIComponent(APP_URL),{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:password})});
  var d=await res.json();
  if(!res.ok){setStatus("Erreur de création","err");alert(d.msg||d.message||"Création du compte impossible.");return;}
  if(d.access_token){
    d.expires_at=Math.floor(Date.now()/1000)+(d.expires_in||3600);saveSbSession(d);await syncSupabase(false,false);startSupabasePolling();toast("Compte connecté");
  }else{
    setStatus("Compte créé · confirme l’email puis connecte-toi","ok");
    alert("Compte créé. Supabase peut demander de confirmer ton adresse email. Après confirmation, reviens ici et clique sur Se connecter.");
  }
}
async function loginSupabase(){
  var email=(q("#cloudEmail").value||"").trim(),password=q("#cloudPassword").value||"";
  if(!email||!password){alert("Entre ton email et ton mot de passe.");return;}
  setStatus("Connexion…","busy");
  var res=await fetch(SB_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:password})});
  var d=await res.json();
  if(!res.ok){setStatus("Connexion impossible","err");alert(d.error_description||d.msg||d.message||"Connexion impossible.");return;}
  d.expires_at=Math.floor(Date.now()/1000)+(d.expires_in||3600);saveSbSession(d);await syncSupabase(false,false);startSupabasePolling();toast("Cloud connecté");
}
async function logoutSupabase(){
  try{if(sbSession&&sbSession.access_token)await sbFetch("/auth/v1/logout",{method:"POST"});}catch(e){}
  saveSbSession(null);clearInterval(sbPollTimer);toast("Cloud déconnecté");
}
async function getSupabaseSave(){
  if(!await ensureSbSession())return null;
  var uid=sbSession&&sbSession.user&&sbSession.user.id;if(!uid)return null;
  var res=await sbFetch("/rest/v1/aniimo_saves?user_id=eq."+encodeURIComponent(uid)+"&select=data,updated_at",{method:"GET"});
  if(res.status===401&&await refreshSbSession())return getSupabaseSave();
  if(!res.ok)throw new Error("Supabase "+res.status+" · "+(await res.text()).slice(0,180));
  var rows=await res.json();return rows&&rows[0]?rows[0]:null;
}
async function putSupabaseSave(){
  if(!await ensureSbSession())throw new Error("Session expirée.");
  var uid=sbSession&&sbSession.user&&sbSession.user.id;if(!uid)throw new Error("Utilisateur introuvable.");
  var res=await sbFetch("/rest/v1/aniimo_saves?on_conflict=user_id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=representation"},body:JSON.stringify({user_id:uid,data:state})});
  if(res.status===401&&await refreshSbSession())return putSupabaseSave();
  if(!res.ok)throw new Error("Supabase "+res.status+" · "+(await res.text()).slice(0,180));
  return res.json();
}
async function syncSupabase(forcePush,silent){
  if(sbBusy||!sbSession)return;
  sbBusy=true;if(!silent)setStatus("Synchronisation cloud…","busy");
  try{
    var remote=await getSupabaseSave();
    if(!remote){await putSupabaseSave();setStatus("Cloud synchronisé · première sauvegarde créée","ok");if(!silent)toast("Sauvegarde cloud créée");return;}
    var remoteState=sanitize(remote.data||{});
    if(!forcePush&&remoteState.updatedAt>state.updatedAt){
      state=remoteState;saveLocal(false,false);renderAll();setStatus("Cloud synchronisé · données récupérées","ok");if(!silent)toast("Données cloud récupérées");
    }else if(forcePush||state.updatedAt>remoteState.updatedAt){
      await putSupabaseSave();setStatus("Cloud synchronisé · à jour","ok");if(!silent)toast("Cloud mis à jour");
    }else setStatus("Cloud synchronisé · déjà à jour","ok");
  }catch(e){console.error(e);setStatus("Erreur cloud","err");if(!silent)alert("Synchronisation impossible.\n\n"+e.message);}
  finally{sbBusy=false;}
}
function scheduleSupabasePush(){
  if(!sbSession)return;
  clearTimeout(sbTimer);sbTimer=setTimeout(function(){syncSupabase(true,true);},900);
}
function startSupabasePolling(){
  clearInterval(sbPollTimer);
  if(sbSession)sbPollTimer=setInterval(function(){syncSupabase(false,true);},30000);
}

function renderAll(){renderStats();renderTargets();renderDex();renderEntries();renderRecent();renderOptions();renderSyncUi();}
function bind(){
  document.addEventListener("click",function(ev){
    var x=ev.target.closest("[data-view]");if(x){go(x.getAttribute("data-view"));return;}
    x=ev.target.closest("[data-go]");if(x){go(x.getAttribute("data-go"));return;}
    x=ev.target.closest("[data-catch]");if(x){toggleCaught(x.getAttribute("data-catch"));return;}
    x=ev.target.closest("[data-star]");if(x){toggleWanted(x.getAttribute("data-star"));return;}
    x=ev.target.closest("[data-detail]");if(x){openDetail(x.getAttribute("data-detail"));return;}
    x=ev.target.closest("[data-close-modal]");if(x){closeDetail();return;}
    x=ev.target.closest("[data-filter]");if(x){filter=x.getAttribute("data-filter");qa("[data-filter]").forEach(function(b){b.classList.toggle("on",b===x);});renderDex();return;}
    x=ev.target.closest("[data-edit]");if(x){editEntry(x.getAttribute("data-edit"));return;}
    x=ev.target.closest("[data-del]");if(x&&confirm("Supprimer cette entrée ?")){state.entries=state.entries.filter(function(e){return e.id!==x.getAttribute("data-del");});saveLocal();renderEntries();renderRecent();toast("Entrée supprimée");}
  });
  document.addEventListener("change",function(ev){if(ev.target.matches("[data-dex]"))toggleCaught(ev.target.getAttribute("data-dex"));});
  q("#search").addEventListener("input",renderDex);
  if(q("#saveAnalysis"))q("#saveAnalysis").addEventListener("click",saveAnalysis);
  document.addEventListener("keydown",function(ev){if(ev.key==="Escape")closeDetail();});
  q("#form").addEventListener("submit",submitJournal);
  q("#cancel").addEventListener("click",resetForm);
  q("#export").addEventListener("click",exportJson);
  q("#import").addEventListener("change",importJson);
  q("#reset").addEventListener("click",function(){if(confirm("Tout effacer sur cet appareil ? La sauvegarde GitHub ne sera pas supprimée automatiquement.")){state=emptyState();state.updatedAt=Date.now();saveLocal();renderAll();resetForm();toast("Carnet local réinitialisé");}});
  if(q("#cloudRegister"))q("#cloudRegister").addEventListener("click",registerSupabase);
  if(q("#cloudLogin"))q("#cloudLogin").addEventListener("click",loginSupabase);
  if(q("#cloudSync"))q("#cloudSync").addEventListener("click",function(){syncSupabase(false,false);});
  if(q("#cloudLogout"))q("#cloudLogout").addEventListener("click",logoutSupabase);
  document.addEventListener("visibilitychange",function(){if(!document.hidden&&sbSession)syncSupabase(false,true);});
}
function init(){
  bind();renderOptions();resetForm();renderAll();
  if(sbSession){syncSupabase(false,true);startSupabasePolling();}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();