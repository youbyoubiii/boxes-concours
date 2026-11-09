const COL=["#E0A526","#2E9C8F","#C2503A","#6E57C9","#4A8F3C","#C05E9C","#3C7DC4"];
const SEXN={E:"Étalon",J:"Jument",H:"Hongre",I:"Sexe à préciser"};
let H=[
[1,"Orage","E","Écurie du Moulin",[]],[2,"Quartz","E","Écurie du Moulin",[],"M. Laurent"],[3,"Tempête","E","Haras des Pins",[2]],
[4,"Bella","J","Écurie du Moulin",[]],[5,"Nuage","J","Écurie du Moulin",[]],[6,"Perle","J","Club Hippique de l’Aube",[],"","Veut être avec Haras des Pins"],
[7,"Rubis","H","Club Hippique de l’Aube",[]],[8,"Silex","H","Club Hippique de l’Aube",[]],[9,"Opale","J","Club Hippique de l’Aube",[]],
[10,"Zéphyr","H","Haras des Pins",[]],[11,"Ibis","J","Haras des Pins",[]],[12,"Jade","J","Poney Club des Landes",[6]],
[13,"Kiwi","H","Poney Club des Landes",[]],[14,"Lutin","E","Poney Club des Landes",[]],[15,"Mistral","H","Poney Club des Landes",[]],
[16,"Noisette","J","Écurie du Moulin",[],"M. Laurent"],[17,"Ulysse","H","Haras des Pins",[]],[18,"Vesta","J","Haras des Pins",[]]
].map(a=>({id:a[0],nom:a[1],sx:a[2],ec:a[3],club:"",av:a[4].slice(),resp:a[5]||"",com:"",ref:"",wk:[],ak:[]}));
H.forEach(h=>h.av.forEach(o=>{const t=H.find(x=>x.id==o);if(t&&!t.av.includes(h.id))t.av.push(h.id)}));
let P=[{n:"Bloc A",al:[{c:8,g:[],b:[]},{c:8,g:[],b:[]},{c:8,g:[],b:[]}]}],N=0,AD=[],NM=[],BL=[],AL=[],ZN=[],FC=[],AU=[],NBR=[],SIDE=[];
/* Les allées vont par paires dos à dos (cloison) : 1-2, 3-4, 5-6… Entre deux paires il y a un espace :
   les boxes y sont en face (FC). ZN = zone de regroupement autorisée (une allée, ou deux allées en face). */
function rebuild(){NM=[];AD=[];BL=[];AL=[];ZN=[];FC=[];AU=[];NBR=[];SIDE=[];let k=0;const st=[];
 P.forEach((bl,bi)=>{st[bi]=[];bl.al.forEach((a,ai)=>{st[bi][ai]=k;const ar=[];AU.push(ar);for(let i=0;i<a.c;i++){NM[k]=String.fromCharCode(65+bi%26)+(ai+1)+"-"+(i+1);AD[k]=i<a.c-1&&!a.g.includes(i+1);BL[k]=a.b.includes(i+1);AL[k]=bi+"_"+ai;ZN[k]=bi+"_"+Math.floor((ai+1)/2);FC[k]=-1;if(!BL[k])ar.push(k);k++}})});
 P.forEach((bl,bi)=>bl.al.forEach((a,ai)=>{const n=bl.al[ai+1];if(ai%2==1&&n){for(let i=0;i<Math.min(a.c,n.c);i++){FC[st[bi][ai]+i]=st[bi][ai+1]+i;FC[st[bi][ai+1]+i]=st[bi][ai]+i}}}));
 for(let i=0;i<k;i++){NBR[i]=[];SIDE[i]=[]}
 for(let i=0;i<k;i++){
  if(AD[i]&&!BL[i]&&!BL[i+1]){NBR[i].push(i+1);NBR[i+1].push(i);SIDE[i].push(i+1);SIDE[i+1].push(i)}
  if(FC[i]>i&&!BL[i]&&!BL[FC[i]]){NBR[i].push(FC[i]);NBR[FC[i]].push(i)}
 }
 N=k}
rebuild();
let G=Array(N).fill(null),sel=null,TAB="prep",GROUP_MODE="both",PERSON_LAYOUTS={},GROUP_AREAS={},GROUP_LAYOUTS={},NO_HOLES=true,RULES={EJ:"block",EE:"block",AV:"block",facing:false};
let HM=new Map(),HMv=null;
const $=id=>document.getElementById(id),hb=id=>{if(HMv!==H){HMv=H;HM=new Map(H.map(h=>[h.id,h]))}return HM.get(id)};
const ecs=()=>[...new Map(H.map(h=>[norm(h.ec),h.ec])).values()],ecol=e=>{const i=ecs().findIndex(x=>norm(x)==norm(e));return COL[(i<0?0:i)%COL.length]};
const hit=(ks,h)=>!!(ks&&h&&ks.length&&(ks.includes(norm(h.resp))||ks.includes(norm(h.ec))));
function pairProblem(a,b){
 if(!a||!b)return null;
 if(a.sx=="E"&&b.sx=="E")return{key:"EE",txt:"Deux étalons côte à côte"};
 if((a.sx=="E"&&b.sx=="J")||(a.sx=="J"&&b.sx=="E")){
  if((a.pair&&a.pair===b.pair)||(!a.pair&&!b.pair&&a.resp&&a.resp===b.resp))return null;
  return{key:"EJ",txt:"Étalon à côté d’une jument"}}
 if(a.av.includes(b.id))return{key:"AV",txt:"Chevaux à éviter côte à côte"};
 if(hit(a.ak,b)||hit(b.ak,a))return{key:"AV",txt:"Souhait d’éviter côte à côte"};
 return null}
function issues(g){
 const out=[];
 const seen=new Set();
 for(let k=0;k<N;k++){
  const links=(SIDE[k]||[]).map(k2=>[k2,"côte à côte"]);
  if(RULES.facing&&FC[k]>k)links.push([FC[k],"face à face"]);
  for(const [k2,where] of links){if(k2<k)continue;const a=hb(g[k]),b=hb(g[k2]),p=pairProblem(a,b);if(!p)continue;
   const mode=RULES[p.key]||"block";if(mode==="allow")continue;
   const id=k+":"+k2+":"+p.key;if(seen.has(id))continue;seen.add(id);
   out.push({k,k2,hard:mode==="block",txt:`${p.txt} (${where}) : ${a.nom} (${boxName(k)}) et ${b.nom} (${boxName(k2)})`})}}
 for(let k=0;k<N-2;k++){if(!AD[k]||!AD[k+1])continue;
  const a=hb(g[k]),m=hb(g[k+1]),c=hb(g[k+2]);
  if(a&&c&&!m&&a.sx=="E"&&c.sx=="E")out.push({k,k2:k+2,hard:false,txt:`Deux étalons (${a.nom}, ${c.nom}) séparés par un box vide : un hongre peut les séparer`})}
 return out}
const boxName=k=>NM[k];
const groupKey=h=>{
 if(!h)return"";
 if(h.grp&&String(h.grp).startsWith("manualgroup:"))return"grp:"+h.grp;
 if(h.club&&norm(h.club))return"club:"+norm(h.club);
 if(h.ref)return"ref:"+norm(h.ref);
 if(h.pair)return"pair:"+h.pair;
 if(h.resp)return"rider:"+norm(h.resp)+"|"+norm(h.ec);
 if(h.grp&&!String(h.grp).startsWith("horse_"))return"grp:"+h.grp;
 return h.grp?"grp:"+h.grp:"horse:"+h.id;
};
const groupDisplay=h=>h.club&&norm(h.club)?(h.resp||h.nom):h.ref?((h.resp||h.nom)+" · réservation "+h.ref):(h.resp||h.nom);
const personKey=h=>h.resp?"rider:"+norm(h.resp):"club:"+norm(h.ec);
const personLabel=h=>h.resp||"Sans cavalier";
const layoutGraph=mode=>mode==="line"?SIDE:NBR;
const escHTML=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function groupInfo(){
 const counts=new Map();H.forEach(h=>{const k=groupKey(h);counts.set(k,(counts.get(k)||0)+1)});
 const keys=[...counts.keys()],idx=new Map(keys.map((k,i)=>[k,i]));
 const label=h=>{const k=groupKey(h),i=idx.get(k)||0;return k.startsWith("grp:manualgroup:")?"G"+(i+1):!h.club&&h.ref?"R"+h.ref:"G"+(i+1)};
 const color=h=>COL[(idx.get(groupKey(h))||0)%COL.length];
 const members=new Map(),stallions=new Set();H.forEach(h=>{const k=groupKey(h);if(counts.get(k)>1){if(!members.has(k))members.set(k,[]);members.get(k).push(h.nom)}if(h.sx==="E")stallions.add(k)});
 return{counts,label,color,members,stallions};
}
function outerAisle(k){const ai=+(AL[k]||"0_0").split("_")[1];return ai%4===0||ai%4===3}
function aisleEnd(k){return (SIDE[k]||[]).length<2}
function stallionPlacementPenalty(g,onlyKey=null){
 const groups=new Map();for(let k=0;k<N;k++){const h=hb(g[k]);if(!h||onlyKey&&groupKey(h)!==onlyKey)continue;const key=groupKey(h);if(!groups.has(key))groups.set(key,{positions:[],stallions:[]});const row=groups.get(key);row.positions.push(k);if(h.sx==="E")row.stallions.push(k)}
 let penalty=0;groups.forEach(row=>{if(!row.stallions.length)return;const groupOnOuter=row.positions.every(outerAisle),groupAtEnd=row.positions.some(aisleEnd);if(!groupOnOuter&&!groupAtEnd)penalty+=1;
  row.stallions.forEach(k=>{if(!outerAisle(k)&&!aisleEnd(k))penalty+=3})});return penalty;
}
function spreadBy(g,keyOf,graphFor=()=>layoutGraph(GROUP_MODE)){
 const by=new Map();
 for(let k=0;k<N;k++){const h=hb(g[k]);if(!h)continue;const key=keyOf(h);if(!by.has(key))by.set(key,new Set());by.get(key).add(k)}
 let spread=0;
 by.forEach((pos,key)=>{if(pos.size<2)return;const unseen=new Set(pos),graph=graphFor(key);let comps=0;
  while(unseen.size){comps++;const first=unseen.values().next().value,stack=[first];unseen.delete(first);
   while(stack.length){const k=stack.pop();(graph[k]||[]).forEach(v=>{if(unseen.has(v)){unseen.delete(v);stack.push(v)}})}}
  spread+=Math.max(0,comps-1)});
 return spread;
}
const groupSpread=g=>spreadBy(g,groupKey);
const clubSpread=g=>spreadBy(g,h=>h.club&&norm(h.club)?"club:"+norm(h.club):groupKey(h),()=>NBR);
const peopleSpread=g=>spreadBy(g,personKey,key=>layoutGraph(PERSON_LAYOUTS[key]||GROUP_MODE));
const stableSpread=(g,e)=>spreadBy(g,h=>norm(h.ec)===norm(e)?"target":"horse:"+h.id,()=>SIDE);
function interposedSingles(g){
 const counts=new Map();H.forEach(h=>counts.set(groupKey(h),(counts.get(groupKey(h))||0)+1));let n=0;
 AU.forEach(ar=>{const left=[],right=Array(ar.length).fill(false);let found=false;
  for(let i=ar.length-1;i>=0;i--){right[i]=found;const h=hb(g[ar[i]]);if(h&&(counts.get(groupKey(h))||0)>1)found=true}
  found=false;for(let i=0;i<ar.length;i++){left[i]=found;const h=hb(g[ar[i]]);if(h&&(counts.get(groupKey(h))||0)>1)found=true}
  ar.forEach((k,i)=>{const h=hb(g[k]);if(h&&(counts.get(groupKey(h))||0)===1&&left[i]&&right[i])n++})});
 return n;
}
function groupArrangement(g,key){
 const pos=[];for(let k=0;k<N;k++){const h=hb(g[k]);if(h&&groupKey(h)===key)pos.push(k)}
 if(pos.length<2)return "line";
 const lanes=new Set(pos.map(k=>AL[k]));
 if(lanes.size===1){const ar=AU.find(a=>a.includes(pos[0]));const ix=pos.map(k=>ar.indexOf(k)).sort((a,b)=>a-b);
  if(ix.every((v,i)=>i===0||v===ix[i-1]+1)&&ix.slice(1).every((v,i)=>SIDE[ar[ix[i]]].includes(ar[v])))return "line"}
 const lanePairs=new Set();for(let k=0;k<N;k++)if(FC[k]>k)lanePairs.add([AL[k],AL[FC[k]]].sort().join("|"));
 for(const pair of lanePairs){const [a,b]=pair.split("|");if([...lanes].some(x=>x!==a&&x!==b))continue;
  const rows=[];for(let k=0;k<N;k++)if(FC[k]>k&&AL[k]===a&&AL[FC[k]]===b)rows.push([k,FC[k]]);
  rows.sort((x,y)=>NM[x[0]].localeCompare(NM[y[0]],undefined,{numeric:true}));
  const indexes=pos.map(k=>{for(let i=0;i<rows.length;i++)if(rows[i].includes(k))return i;return -1});
  if(indexes.includes(-1))continue;const unique=[...new Set(indexes)].sort((x,y)=>x-y);
  if(unique.length!==Math.ceil(pos.length/2)||!unique.every((v,i)=>i===0||v===unique[i-1]+1))continue;
  if(unique.slice(0,-1).some(i=>!pos.includes(rows[i][0])||!pos.includes(rows[i][1])))continue;
  const tail=rows[unique[unique.length-1]].filter(k=>pos.includes(k));if(tail.length===(pos.length%2||2))return "face";
 }
 return null;
}
function groupPattern(key,available){
 const count=H.filter(h=>groupKey(h)===key).length;if(count<2)return null;
 const avail=new Set(available);
 for(const ar of AU){for(let i=0;i<=ar.length-count;i++){const slots=ar.slice(i,i+count);if(slots.every(k=>avail.has(k))&&slots.slice(1).every((k,j)=>SIDE[slots[j]].includes(k)))return{slots,layout:"line"}}}
 const pairs=new Set();for(let k=0;k<N;k++)if(FC[k]>k&&avail.has(k)&&avail.has(FC[k]))pairs.add([AL[k],AL[FC[k]]].sort().join("|"));
 for(const pair of pairs){const [a,b]=pair.split("|");const rows=[];for(let k=0;k<N;k++)if(FC[k]>k&&AL[k]===a&&AL[FC[k]]===b&&avail.has(k)&&avail.has(FC[k]))rows.push([k,FC[k]]);
  rows.sort((x,y)=>NM[x[0]].localeCompare(NM[y[0]],undefined,{numeric:true}));const need=Math.ceil(count/2);
  for(let i=0;i<=rows.length-need;i++){const run=rows.slice(i,i+need);if(run.slice(1).some((r,j)=>!SIDE[run[j][0]].includes(r[0])||!SIDE[run[j][1]].includes(r[1])))continue;
   const slots=run.flat().slice(0,count);return{slots,layout:"face"}}
 }
 return null;
}
function groupPatterns(key,available){
 const count=H.filter(h=>groupKey(h)===key).length,avail=new Set(available),out=[],seen=new Set();if(count<1)return out;
 const add=(slots,layout)=>{const sig=slots.join(",");if(!seen.has(sig)){seen.add(sig);out.push({slots,layout})}};
 for(const ar of AU)for(let i=0;i<=ar.length-count;i++){const slots=ar.slice(i,i+count);if(slots.every(k=>avail.has(k))&&slots.slice(1).every((k,j)=>SIDE[slots[j]].includes(k)))add(slots,"line")}
 const pairs=new Set();for(let k=0;k<N;k++)if(FC[k]>k&&avail.has(k)&&avail.has(FC[k]))pairs.add([AL[k],AL[FC[k]]].sort().join("|"));
 for(const pair of pairs){const [a,b]=pair.split("|"),rows=[];for(let k=0;k<N;k++)if(FC[k]>k&&AL[k]===a&&AL[FC[k]]===b&&avail.has(k)&&avail.has(FC[k]))rows.push([k,FC[k]]);
  rows.sort((x,y)=>NM[x[0]].localeCompare(NM[y[0]],undefined,{numeric:true}));const need=Math.ceil(count/2);
  for(let i=0;i<=rows.length-need;i++){const run=rows.slice(i,i+need);if(run.slice(1).some((r,j)=>!SIDE[run[j][0]].includes(r[0])||!SIDE[run[j][1]].includes(r[1])))continue;add(run.flat().slice(0,count),"face")}}
 return out;
}
function groupArrangementCandidate(members,slots,base,priority,reverse=false){
 const g=base.slice(),remaining=members.slice(),rank=new Map([...priority].map((s,i)=>[s,i]));
 const orderedSlots=reverse?slots.slice().reverse():slots;
 const cost=(h,k)=>{let n=0,links=[...(SIDE[k]||[])];if(RULES.facing&&FC[k]>=0)links.push(FC[k]);for(const j of links){const other=hb(g[j]);if(!other)continue;const p=pairProblem(h,other);if(!p)continue;const mode=RULES[p.key]||"block";n+=mode==="block"?1000:mode==="warn"?100:0}return n};
 for(const k of orderedSlots){let best=0,bc=Infinity;for(let i=0;i<remaining.length;i++){const h=remaining[i],c=cost(h,k)*100+((rank.get(h.sx)||0));if(c<bc){bc=c;best=i}}g[k]=remaining.splice(best,1)[0].id}
 const issuesHere=issues(g),hard=issuesHere.filter(x=>x.hard).length,warn=issuesHere.filter(x=>!x.hard).length;
 return{g,layoutScore:hard*100000+warn*100+(NO_HOLES?holes(g).bt.length*25:0)+stallionPlacementPenalty(g)*1000+(slots.layout==="face"?1:0),hard,warn};
}
function findGroupPlacement(key,area,source){
 const members=H.filter(h=>groupKey(h)===key);if(!members.length)return{error:"Ce groupe ne contient aucun cheval."};
 const base=source.slice();members.forEach(h=>{const i=base.indexOf(h.id);if(i>=0)base[i]=null});
 const layoutPref=GROUP_LAYOUTS[key]||"auto",free=[...Array(N).keys()].filter(k=>!BL[k]&&base[k]==null),patterns=groupPatterns(key,free).filter(p=>p.slots.every(k=>area==="exterior"?outerAisle(k):!outerAisle(k))&& (layoutPref==="auto"||p.layout===layoutPref));
 if(!patterns.length){if(layoutPref==="face")return{error:"Impossible de placer ce groupe face à face dans cette zone : aucune paire de boxes alignés n’est libre. Le plan reste inchangé."};return{error:area==="exterior"?"Impossible de placer ce groupe à l’extérieur : il n’y a plus de ligne ou de paire de boxes face à face assez longue dans les allées extérieures.":"Impossible de placer ce groupe dans une allée intérieure : il n’y a plus de ligne ou de paire de boxes face à face assez longue."}}
 const oldHard=new Set(issues(base).filter(x=>x.hard).map(x=>{const a=hb(base[x.k]),b=hb(base[x.k2]),p=pairProblem(a,b);return x.k+":"+x.k2+":"+(p?p.key:"")+":"+[a&&a.id,b&&b.id].sort().join("-")})),priorities=["HEJI","EHJI","HJEI","EJHI","JHEI","JEHI"];let best=null;
 patterns.forEach(pattern=>priorities.forEach(priority=>[false,true].forEach(reverse=>{const c=groupArrangementCandidate(members,pattern.slots,base,priority,reverse);c.layout=pattern.layout;c.layoutScore+=pattern.layout==="face"?1:0;if(!best||c.layoutScore<best.layoutScore)best=c})));
 const newHard=issues(best.g).filter(x=>x.hard).filter(x=>{const a=hb(best.g[x.k]),b=hb(best.g[x.k2]),p=pairProblem(a,b);return !oldHard.has(x.k+":"+x.k2+":"+(p?p.key:"")+":"+[a&&a.id,b&&b.id].sort().join("-"))});
 if(newHard.length)return{error:"Impossible de placer ce groupe dans cette zone sans créer de conflit bloquant de voisinage. Choisissez l’autre zone ou libérez des boxes."};
 const layout=groupArrangement(best.g,key);if(!layout||layoutPref!=="auto"&&layout!==layoutPref)return{error:"La disposition demandée n’est pas possible avec les boxes libres de cette zone. Le plan reste inchangé."};
 return{g:best.g,layout,area};
}
function placeGroupProgressively(key,area){
 const result=findGroupPlacement(key,area,G);if(result.error)return result.error;
 const members=H.filter(h=>groupKey(h)===key);pushU();GROUP_AREAS[key]=area;G=result.g;sel=null;draw();
 setSt("Groupe « "+(members[0].club||groupDisplay(members[0]))+" » placé "+(area==="exterior"?"à l’extérieur":"dans une allée intérieure")+" "+(result.layout==="line"?"en ligne":"face à face")+(members.some(h=>h.sx==="E")?" avec priorité aux bouts d’allée et aux allées extérieures":"")+". Les autres groupes placés restent en place.");return"ok";
}
function setGroupLayout(key,layout){
 const old=GROUP_LAYOUTS[key]||"auto";if(old===layout)return;
 if(GROUP_AREAS[key]){if(layout==="auto")delete GROUP_LAYOUTS[key];else GROUP_LAYOUTS[key]=layout;const result=findGroupPlacement(key,GROUP_AREAS[key],G);if(result.error){if(old==="auto")delete GROUP_LAYOUTS[key];else GROUP_LAYOUTS[key]=old;return result.error}
  if(old==="auto")delete GROUP_LAYOUTS[key];else GROUP_LAYOUTS[key]=old;const members=H.filter(h=>groupKey(h)===key);pushU();if(layout==="auto")delete GROUP_LAYOUTS[key];else GROUP_LAYOUTS[key]=layout;G=result.g;sel=null;draw();setSt("Disposition du groupe « "+(members[0].club||groupDisplay(members[0]))+" » mise à jour : "+(layout==="face"?"face à face":layout==="line"?"en ligne":"selon la place")+".");return"ok"}
 pushU();if(layout==="auto")delete GROUP_LAYOUTS[key];else GROUP_LAYOUTS[key]=layout;draw();setSt("Disposition enregistrée. Choisissez la zone pour placer ce groupe.");return"ok";
}
function singleWouldInterposeGroup(g,k){
 const ar=AU.find(a=>a.includes(k));if(!ar)return false;const at=ar.indexOf(k),sizes=new Map();H.forEach(h=>sizes.set(groupKey(h),(sizes.get(groupKey(h))||0)+1));
 const isGroup=pos=>{const h=hb(g[pos]);return h&&(sizes.get(groupKey(h))||0)>1};
 let left=false,right=false;for(let i=at-1;i>=0&&SIDE[ar[i+1]].includes(ar[i]);i--)if(isGroup(ar[i])){left=true;break}
 for(let i=at+1;i<ar.length&&SIDE[ar[i-1]].includes(ar[i]);i++)if(isGroup(ar[i])){right=true;break}
 return left&&right;
}
function boxBetweenOccupied(g,k){
 const ar=AU.find(a=>a.includes(k));if(!ar)return false;const at=ar.indexOf(k);let left=false,right=false;
 for(let i=at-1;i>=0&&SIDE[ar[i+1]].includes(ar[i]);i--)if(g[ar[i]]!=null){left=true;break}
 for(let i=at+1;i<ar.length&&SIDE[ar[i-1]].includes(ar[i]);i++)if(g[ar[i]]!=null){right=true;break}
 return left&&right;
}
function placeRestAndComplete(){
 const rows=new Map();H.forEach(h=>{const key=groupKey(h);if(!rows.has(key))rows.set(key,[]);rows.get(key).push(h)});
 const grouped=[...rows.entries()].filter(([,m])=>m.length>1||m[0].club||m[0].ref||m[0].resp).sort((a,b)=>Number(b[1].some(h=>h.sx==="E"))-Number(a[1].some(h=>h.sx==="E"))||b[1].length-a[1].length||(a[1][0].club||groupDisplay(a[1][0])).localeCompare(b[1][0].club||groupDisplay(b[1][0]),"fr"));
 let working=G.slice(),placedGroups=0,failedGroups=[];const areas={...GROUP_AREAS};
 for(const [key,members] of grouped){if(members.every(h=>working.includes(h.id)))continue;
  const pref=areas[key],choices=pref?[pref]:(members.some(h=>h.sx==="E")?["exterior","interior"]:["interior","exterior"]),plans=choices.map(area=>findGroupPlacement(key,area,working)).filter(x=>!x.error);
  if(!plans.length){failedGroups.push(members[0].club||groupDisplay(members[0]));continue}
  const plan=plans.sort((a,b)=>{const score=p=>{const is=issues(p.g);return is.filter(x=>!x.hard).length*100+stallionPlacementPenalty(p.g)*10+(p.layout==="face"?1:0)};return score(a)-score(b)})[0];
  working=plan.g;areas[key]=plan.area;placedGroups++;
 }
 const groupedKeys=new Set(grouped.map(([key])=>key)),singles=H.filter(h=>!groupedKeys.has(groupKey(h))&&!working.includes(h.id)).sort((a,b)=>Number(b.sx==="E")-Number(a.sx==="E")||Number(b.sx==="H")-Number(a.sx==="H")||a.nom.localeCompare(b.nom,"fr"));
 let placedSingles=0;const blockedSingles=[];
 for(const h of singles){let best=null;for(let k=0;k<N;k++){if(BL[k]||working[k]!=null||singleWouldInterposeGroup(working,k))continue;
   let warnings=0,links=[...(SIDE[k]||[])];if(RULES.facing&&FC[k]>=0)links.push(FC[k]);let hard=false;
   for(const j of links){const other=hb(working[j]);if(!other)continue;const p=pairProblem(h,other);if(!p)continue;const mode=RULES[p.key]||"block";if(mode==="block"){hard=true;break}if(mode==="warn")warnings++}
   if(hard)continue;let cost=warnings*10000;if(h.sx==="E"&&!outerAisle(k)&&!aisleEnd(k))cost+=20;if(!aisleEnd(k))cost+=2;
   const ar=AU.find(a=>a.includes(k)),at=ar?ar.indexOf(k):-1;if(NO_HOLES&&boxBetweenOccupied(working,k))cost-=1000;else if(ar&&at>0&&at<ar.length-1)cost+=4;
   if(!best||cost<best.cost)best={k,cost};
  }
  if(best){working[best.k]=h.id;placedSingles++}else blockedSingles.push(h.nom);
 }
 const changed=working.some((id,k)=>id!==G[k])||JSON.stringify(areas)!==JSON.stringify(GROUP_AREAS);
 if(changed){pushU();G=working;GROUP_AREAS=areas;sel=null;draw()}
 const remainingGroups=grouped.filter(([,members])=>!members.every(h=>G.includes(h.id))).length,remaining=H.filter(h=>!G.includes(h.id)).length;
 setSt(placedGroups+" groupe(s) placé(s), "+placedSingles+" cheval(aux) isolé(s) ajouté(s). "+remainingGroups+" groupe(s) et "+remaining+" cheval(aux) restent à placer"+(failedGroups.length?" ; groupes sans place conforme : "+failedGroups.slice(0,4).join(", ")+(failedGroups.length>4?"…":""):"")+(blockedSingles.length?" ; certains chevaux isolés ne peuvent être placés sans conflit bloquant":"")+". Les groupes restent soudés et aucun nouveau conflit bloquant n’est ajouté.");
}
function facePairShortage(g){
 const by=new Map();for(let k=0;k<N;k++){const h=hb(g[k]);if(!h)continue;const p=personKey(h);if(!by.has(p))by.set(p,new Set());by.get(p).add(k)}
 let miss=0;by.forEach((pos,key)=>{if(pos.size<2||(PERSON_LAYOUTS[key]||GROUP_MODE)!=="face")return;let pairs=0;pos.forEach(k=>{if(FC[k]>k&&pos.has(FC[k]))pairs++});miss+=Math.max(0,Math.floor(pos.size/2)-pairs)});
 return miss;
}
/* Boxes libres au milieu d'une allée (entre deux chevaux) et boxes libres avant le premier cheval */
function holes(g){const bt=[];let lead=0;
 const check=ar=>{let f=-1,l=-1;ar.forEach((k,j)=>{if(g[k]!=null){if(f<0)f=j;l=j}});if(f<0)return;lead+=f;for(let j=f+1;j<l;j++)if(g[ar[j]]==null)bt.push(ar[j])};
 AU.forEach(ar=>{let run=[];ar.forEach(k=>{if(run.length&&!(SIDE[run[run.length-1]]||[]).includes(k)){check(run);run=[]}run.push(k)});check(run)});
 return{bt,lead}}
function score(g,issueCount=issues(g).filter(x=>x.hard).length,targetEc=null,targetGroup=null){
 let s=-1000*issueCount;
 for(let k=0;k<N-1;k++){if(!AD[k])continue;
  const a=hb(g[k]),b=hb(g[k+1]);if(!a||!b)continue;
  if(a&&b&&groupKey(a)===groupKey(b))s+=GROUP_MODE==="line"?110:GROUP_MODE==="face"?15:55;
  if(a&&b&&personKey(a)===personKey(b)){const pm=PERSON_LAYOUTS[personKey(a)]||GROUP_MODE;s+=pm==="line"?125:pm==="face"?-30:45}
  if(!pairProblem(a,b)){if(a.ec==b.ec)s+=10;if(hit(a.wk,b)||hit(b.wk,a))s+=40}}
 for(let k=0;k<N;k++){if(FC[k]<=k)continue;
  const a=hb(g[k]),b=hb(g[FC[k]]);if(!a||!b)continue;
  if(groupKey(a)===groupKey(b))s+=GROUP_MODE==="face"?180:GROUP_MODE==="line"?-30:65;
  if(personKey(a)===personKey(b)){const pm=PERSON_LAYOUTS[personKey(a)]||GROUP_MODE;s+=pm==="face"?230:pm==="line"?-80:60}
  if(a.ec==b.ec)s+=10;if(hit(a.wk,b)||hit(b.wk,a))s+=40}
 if(targetEc){for(let k=0;k<N;k++){if(!SIDE[k])continue;const a=hb(g[k]);if(!a||norm(a.ec)!==norm(targetEc))continue;for(const k2 of SIDE[k])if(k2>k){const b=hb(g[k2]);if(b&&norm(b.ec)===norm(targetEc))s+=220}}
  s-=1200*(N+1)*stableSpread(g,targetEc)}
 const E={};
 for(let k=0;k<N;k++){const h=hb(g[k]);if(!h)continue;const e=E[h.ec]||(E[h.ec]={a:new Set(),z:new Set()});e.a.add(AL[k]);e.z.add(ZN[k])}
 for(const e in E)s-=30*(E[e].z.size-1)+5*(E[e].a.size-E[e].z.size);
 const hz=holes(g);s-=(NO_HOLES?100*(N+1):80)*hz.bt.length+15*hz.lead;
 s-=1000*(N+1)*clubSpread(g);
 s-=500*(N+1)*peopleSpread(g);
 s-=300*(N+1)*facePairShortage(g);
 s-=300*groupSpread(g);
 s-=1400*(N+1)*interposedSingles(g);
 s-=250*(N+1)*stallionPlacementPenalty(g);
 if(targetGroup)s-=100000*(N+1)*(groupArrangement(g,targetGroup)?0:1);
 return s}
function auto(preferGroup=null,targetEc=null){
 /* Les conflits sont prioritaires : les souhaits, le regroupement et les trous ne
    servent à départager que les plans ayant le même nombre de conflits. */
 const n=H.length,all=[...Array(N).keys()].filter(k=>!BL[k]),groupCounts=new Map();H.forEach(h=>groupCounts.set(groupKey(h),(groupCounts.get(groupKey(h))||0)+1));
 const sorted=[...H].sort((a,b)=>{const ag=groupCounts.get(groupKey(a))>1,bg=groupCounts.get(groupKey(b))>1;if(ag!==bg)return ag?-1:1;if(ag&&groupKey(a)!==groupKey(b))return groupKey(a).localeCompare(groupKey(b));return norm(a.ec).localeCompare(norm(b.ec))||personKey(a).localeCompare(personKey(b))||groupKey(a).localeCompare(groupKey(b))||a.nom.localeCompare(b.nom)}),
  order=targetEc?[...sorted.filter(h=>norm(h.ec)===norm(targetEc)),...sorted.filter(h=>norm(h.ec)!==norm(targetEc))]:preferGroup?[...sorted.filter(h=>groupKey(h)===preferGroup),...sorted.filter(h=>groupKey(h)!==preferGroup)]:sorted;
 if(!n||!all.length){G=Array(N).fill(null);sel=null;draw();return}
 /* Graine stable : mêmes réservations et même plan donnent le même résultat. */
 let seed=2166136261;
 const seedText=JSON.stringify({H:H.map(h=>[h.id,h.nom,h.sx,h.ec,h.club,h.resp,h.av,h.pair,h.ref,h.grp]),P,GROUP_MODE,PERSON_LAYOUTS,targetEc,preferGroup});
 for(let i=0;i<seedText.length;i++)seed=Math.imul(seed^seedText.charCodeAt(i),16777619)>>>0;
 const rand=()=>{seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
 const hard=g=>issues(g).filter(x=>x.hard).length,soft=(g,h)=>score(g,h,targetEc,preferGroup)+1000*h,
  better=(h,s,bh,bs)=>h<bh||(h===bh&&s>bs);
 let bestG=null,bestH=Infinity,bestS=-Infinity,prev=-1;
 const slots=(GROUP_MODE==="face"||H.some(h=>(PERSON_LAYOUTS[personKey(h)]||GROUP_MODE)==="face"))?(()=>{const used=new Set(),out=[];for(let k=0;k<N;k++)if(FC[k]>k&&!BL[k]&&!BL[FC[k]]){out.push(k,FC[k]);used.add(k);used.add(FC[k])}return out.concat(all.filter(k=>!used.has(k)))})():all;
 const pattern=preferGroup?groupPattern(preferGroup,all):null;
 for(const slack of [0,2,4,8,16,1e9]){
  const limit=Math.min(slots.length,n+slack),forced=pattern?pattern.slots:[],forcedSet=new Set(forced),US=forced.concat(slots.filter(k=>!forcedSet.has(k)).slice(0,Math.max(0,limit-forced.length)));
  if(US.length===prev)continue;prev=US.length;
  let g=Array(N).fill(null);order.slice(0,US.length).forEach((h,i)=>g[US[i]]=h.id);
  let ch=hard(g),cs=soft(g,ch),best=g.slice(),bh=ch,bs=cs;
  const steps=25000;
  for(let i=0;i<steps&&US.length>1;i++){
   const a=US[Math.floor(rand()*US.length)],b=US[Math.floor(rand()*US.length)];
   if(a===b||g[a]===g[b])continue;
   [g[a],g[b]]=[g[b],g[a]];
   const nh=hard(g),ns=soft(g,nh),progress=i/steps,temp=70*(1-progress)+2,delta=ns-cs;
   let accept=false;
   if(nh<ch)accept=true;
   else if(nh===ch)accept=delta>=0||rand()<Math.exp(delta/temp);
   else accept=rand()<0.025*(1-progress);
   if(accept){ch=nh;cs=ns;if(better(ch,cs,bh,bs)){bh=ch;bs=cs;best=g.slice()}}
   else [g[a],g[b]]=[g[b],g[a]];
  }
  if(better(bh,bs,bestH,bestS)){bestH=bh;bestS=bs;bestG=best}
  /* N'ajoute pas de boxes supplémentaires si un plan sans conflit existe déjà. */
  if(bestH===0)break;
 }
 G=bestG||Array(N).fill(null);sel=null;draw()}
function delH(id){
 pushU();H=H.filter(h=>h.id!==id);H.forEach(h=>{h.av=h.av.filter(x=>x!==id)});
 G=G.map(x=>x===id?null:x);if(sel===id)sel=null;parseWishes();draw()}
function tap(k){
 if(BL[k])return;const occ=G[k];
 if(sel!=null){pushU();
  const from=G.indexOf(sel);
  if(from>-1){G[from]=occ}
  G[k]=sel;sel=null}
 else if(occ!=null){sel=occ}
 draw()}
function showHorseTip(h,k,target){
 const tip=$("horseTip");tip.replaceChildren();
 const head=document.createElement("strong");head.textContent=h.nom+" · "+boxName(k);tip.appendChild(head);
 const line=(label,value)=>{if(!value)return;const p=document.createElement("p");p.textContent=label+": "+value;tip.appendChild(p)};
 line("Sexe",SEXN[h.sx]);line("Club de regroupement",h.club);line("Club engageur",h.ec);line("Cavalier",h.resp);line("Réservation",h.ref);
 const pref=PERSON_LAYOUTS[personKey(h)]||GROUP_MODE;line("Disposition",pref==="face"?"Face à face":pref==="line"?"En ligne":"En ligne ou face à face");
 const avoids=(h.av||[]).map(id=>hb(id)).filter(Boolean).map(x=>x.nom);
 if(avoids.length)line("À éviter",avoids.join(", "));
 tip.hidden=false;
 const r=target.getBoundingClientRect(),width=Math.min(340,window.innerWidth-24);
 const left=Math.max(12,Math.min(r.left,window.innerWidth-width-12));
 tip.style.left=left+"px";
 let top=r.bottom+8;if(top+tip.offsetHeight>window.innerHeight-8)top=Math.max(8,r.top-tip.offsetHeight-8);
 tip.style.top=top+"px";
}
function hideHorseTip(){$("horseTip").hidden=true}
function draw(){
 hideHorseTip();
 $("noHoles").checked=NO_HOLES;
 const placed=G.filter(x=>x!=null).length,iss=issues(G),hardIssues=iss.filter(i=>i.hard).length;
 const bad=new Set(),warn=new Set();iss.forEach(i=>{const set=i.hard?bad:warn;set.add(i.k);set.add(i.k2)});
 $("stat").innerHTML=`<span>${H.length} chevaux</span><span>${BL.filter(x=>!x).length} boxes</span><span>${placed} placés</span><span class="${hardIssues?"bad":""}">${hardIssues} conflit${hardIssues>1?"s":""}</span><span>${iss.length-hardIssues} avertissement${iss.length-hardIssues>1?"s":""}</span>`;
 const un=H.filter(h=>!G.includes(h.id));
 $("pool").innerHTML=un.length?"":"<span class='sub'>Tous les chevaux sont placés.</span>";
 const GI=groupInfo();
 un.forEach(h=>{const b=document.createElement("button");b.className="chip"+(sel===h.id?" sel":"");
  const gm=GI.counts.get(groupKey(h))>1?`<span class="gmark" style="background:${GI.color(h)}" title="Groupe ${escHTML(groupDisplay(h))} : ${escHTML(GI.members.get(groupKey(h)).join(", "))}">${escHTML(GI.label(h))}</span>`:"";
  b.innerHTML=`<span class="dot" style="background:${GI.color(h)}"></span>${escHTML(h.nom)}<span class="clubmark" style="background:${GI.color(h)}" title="${h.club?"Club : "+escHTML(h.club):h.ref?"Réservation : "+escHTML(h.ref):"Sans club"}">${escHTML(h.club||h.ref||h.resp||"Sans club")}</span>${gm}<span class="sx ${h.sx}">${h.sx}</span><span class="x" role="button" aria-label="Supprimer ${escHTML(h.nom)}" title="Supprimer">×</span>`;
  b.onclick=()=>{sel=sel===h.id?null:h.id;draw()};
  b.querySelector(".x").onclick=e=>{e.stopPropagation();delH(h.id)};$("pool").appendChild(b)});
 const groupRows=new Map();H.forEach(h=>{const key=groupKey(h);if(!groupRows.has(key))groupRows.set(key,[]);groupRows.get(key).push(h)});
 const groupBox=$("planGroups"),doneBox=$("planGroupsDone");groupBox.replaceChildren();doneBox.replaceChildren();
 const orderedGroups=[...groupRows.entries()].filter(([,members])=>members.length>1||members[0].club||members[0].ref||members[0].resp).sort((a,b)=>b[1].length-a[1].length||(a[1][0].club||groupDisplay(a[1][0])).localeCompare(b[1][0].club||groupDisplay(b[1][0]),"fr"));
 orderedGroups.forEach(([key,members])=>{
  const placed=members.filter(h=>G.includes(h.id)).length,done=placed===members.length,target=done?doneBox:groupBox;
  const item=document.createElement("div");item.className="plan-group-item";const badge=document.createElement("span");badge.className="gmark";badge.style.background=GI.color(members[0]);badge.textContent=GI.label(members[0]);
  const hasStallion=members.some(h=>h.sx==="E");const label=document.createElement("span");label.className="group-label";const title=document.createElement("strong");title.textContent=members[0].club||groupDisplay(members[0]);const count=document.createElement("small");count.textContent=(done?members.length+" chevaux · placé":placed?placed+" / "+members.length+" chevaux · placement incomplet":members.length+" chevaux · à placer")+(hasStallion?" · ⚑ contient un étalon":"");label.append(title,count);
  const layoutLabel=document.createElement("label");layoutLabel.className="group-layout-choice";layoutLabel.appendChild(document.createTextNode("Disposition"));const layoutSelect=document.createElement("select");layoutSelect.setAttribute("aria-label","Disposition du groupe "+title.textContent);[["auto","Selon la place"],["line","En ligne"],["face","Face à face"]].forEach(([v,t])=>{const op=document.createElement("option");op.value=v;op.textContent=t;layoutSelect.appendChild(op)});layoutSelect.value=GROUP_LAYOUTS[key]||"auto";layoutSelect.onchange=()=>{const result=setGroupLayout(key,layoutSelect.value);if(result!=="ok"){setSt(result);layoutSelect.value=GROUP_LAYOUTS[key]||"auto"}};layoutLabel.appendChild(layoutSelect);
  const actions=document.createElement("div");actions.className="zone-actions";[["exterior","Extérieur"],["interior","Allée intérieure"]].forEach(([area,text])=>{const button=document.createElement("button");button.type="button";button.textContent=text;button.setAttribute("aria-pressed",GROUP_AREAS[key]===area?"true":"false");button.title="Placer ce groupe "+(area==="exterior"?"sur une allée extérieure":"dans une allée intérieure")+" sans déplacer les autres groupes déjà placés";button.onclick=()=>{const result=placeGroupProgressively(key,area);if(result!=="ok")setSt(result)};actions.appendChild(button)});item.append(badge,label,layoutLabel,actions);target.appendChild(item);
 });
 if(!groupBox.children.length){const note=document.createElement("span");note.className="plan-group-empty";note.textContent=orderedGroups.length?"Tous les groupes sont placés.":"Aucun groupe à placer.";groupBox.appendChild(note)}
 if(!doneBox.children.length){const note=document.createElement("span");note.className="plan-group-empty";note.textContent="Les groupes apparaîtront ici une fois tous leurs chevaux placés.";doneBox.appendChild(note)}
 const s=sel!=null?hb(sel):null;
 $("selbar").innerHTML=s?`<div class="sel-bar"><span><b>${s.nom}</b> · ${SEXN[s.sx]}${s.club?" · Club : "+s.club:""}${s.resp?" · "+s.resp:""}${s.ref?" · rés. "+s.ref:""}<br><span class="sub">Touchez un box pour le placer.</span></span><span><button id="ret">Retirer</button> <button id="del">Supprimer</button> <button id="ann">Annuler</button></span></div>`:"";
 if(s){$("del").onclick=()=>delH(sel);$("ret").onclick=()=>{pushU();const i=G.indexOf(sel);if(i>-1)G[i]=null;sel=null;draw()};$("ann").onclick=()=>{sel=null;draw()}}
 const q=norm($("q").value),hl=q?H.filter(h=>norm([h.nom,h.resp,h.ec,h.club,h.ref].join(" ")).includes(q)):[],hs=new Set(hl.map(h=>h.id));
 $("res").innerHTML=q&&!hl.length?"<li class='ok'>Aucun résultat.</li>":"";
 hl.slice(0,12).forEach(h=>{const i=G.indexOf(h.id),li=document.createElement("li"),b=document.createElement("button");li.className="ok";
  b.textContent=`${h.nom} · ${h.resp||"sans cavalier"} · ${h.ec}${h.ref?" · rés. "+h.ref:""} · ${i>-1?"box "+boxName(i):"à placer"}`;
  b.onclick=()=>{sel=h.id;draw();const e=i>-1&&$("t"+i);if(e)e.scrollIntoView({block:"center",inline:"center"})};
  li.appendChild(b);$("res").appendChild(li)});
 if(hl.length>12){const li=document.createElement("li");li.className="ok";li.textContent=`${hl.length-12} autres résultats : précisez la recherche.`;$("res").appendChild(li)}
 const plan=$("plan");plan.innerHTML="";
 let k0=0;
 P.forEach(bl=>{
  const bw=document.createElement("div");bw.className="bloc";bw.innerHTML=`<h3>${bl.n}</h3>`;
  const cols=document.createElement("div");cols.className="cols";bw.appendChild(cols);
  bl.al.forEach((al,ai)=>{
   if(ai%2===1){const wall=document.createElement("div");wall.className="wall-marker";wall.title=`Allées ${ai} et ${ai+1} dos à dos`;wall.textContent="DOS À DOS";cols.appendChild(wall)}
   if(ai>0&&ai%2===0){const path=document.createElement("div");path.className="walkway-marker";path.title=`Espace partagé : les boxes des allées ${ai} et ${ai+1} se font face`;
    path.innerHTML=`<span>PASSAGE</span><small>FACE À FACE<br>Allées ${ai} ↔ ${ai+1}</small>`;cols.appendChild(path)}
   const w=document.createElement("div");w.className="allee";const orientation=(ai%4===0||ai%4===3)?"Façade extérieure":"Face au passage partagé";w.innerHTML=`<b>Allée ${ai+1}</b><span class="orientation">${orientation}</span>`;
   const row=document.createElement("div");row.className="row";
   for(let c=0;c<al.c;c++){const k=k0+c,h=hb(G[k]);
    const t=document.createElement("button");t.id="t"+k;
    t.className="tile"+(h?"":" empty")+(bad.has(k)?" bad":warn.has(k)?" warn":"")+(BL[k]?" blk":"")+(h&&sel===h.id?" sel":"")+(h&&hs.has(h.id)?" hit":"");
    if(h)t.title=[h.nom,SEXN[h.sx],h.club,h.ec,h.resp,h.ref].filter(Boolean).join(" · ");
    if(!AD[k]&&c<al.c-1)t.style.marginBottom="22px";t.setAttribute("aria-label",h?`Box ${boxName(k)}, ${h.nom}`:`Box ${boxName(k)}, libre`);
    const gm=h&&GI.counts.get(groupKey(h))>1?`<span class="gmark" style="background:${GI.color(h)}" title="Groupe ${escHTML(groupDisplay(h))} : ${escHTML(GI.members.get(groupKey(h)).join(", "))}${GI.stallions.has(groupKey(h))?" · contient un étalon":""}">${escHTML(GI.label(h))}${GI.stallions.has(groupKey(h))?" · É":""}</span>`:"";
    const club=h?`<span class="clubmark" style="background:${GI.color(h)}" title="${h.club?"Club : "+escHTML(h.club):h.ref?"Réservation : "+escHTML(h.ref):"Cavalier : "+escHTML(h.resp)}">${escHTML(h.club||h.ref||h.resp||"Sans club")}</span>`:"";
    t.innerHTML=h?`<span class="n">${boxName(k)} <span class="sx ${h.sx}">${h.sx}</span></span>${club}${gm}<span class="nm">${escHTML(h.nom)}</span><span class="ec" style="background:${GI.color(h)}"></span><span class="x" role="button" aria-label="Supprimer ${escHTML(h.nom)}" title="Supprimer">×</span>`:`<span class="n">${boxName(k)}</span><span class="n">${BL[k]?"bloqué":"libre"}</span><span></span>`;
    t.onclick=()=>tap(k);
    if(h){t.addEventListener("mouseenter",()=>showHorseTip(h,k,t));t.addEventListener("focus",()=>showHorseTip(h,k,t));t.addEventListener("mouseleave",hideHorseTip);t.addEventListener("blur",hideHorseTip)}
    if(h)t.querySelector(".x").onclick=e=>{e.stopPropagation();delH(h.id)};
    row.appendChild(t)}
   k0+=al.c;w.appendChild(row);cols.appendChild(w)});
  plan.appendChild(bw)});
 const groupLegend=[...new Map(H.map(h=>[groupKey(h),h])).entries()].map(([key,h])=>`<span><i style="background:${GI.color(h)}"></i>${escHTML(groupDisplay(h))}${h.club?" · "+escHTML(h.club):h.ref?" · rés. "+escHTML(h.ref):""}${GI.stallions.has(key)?" · ⚑ groupe avec étalon":""}</span>`).join("");
 $("legend").innerHTML=groupLegend+`<span>Nom sur la case = cheval · couleur = groupe</span><span>É étalon · J jument · H hongre</span><span>⚑ groupe avec étalon · priorité aux bouts d’allée / extérieur</span>`;
 const hzb=holes(G).bt;
 $("alerts").innerHTML=(iss.length||hzb.length)?iss.map(i=>`<li class="${i.hard?"":"w"}">${i.hard?"À corriger · ":"À vérifier · "}${i.txt}</li>`).join("")+hzb.map(k=>`<li class="w">Box vide entre deux chevaux : ${NM[k]}</li>`).join(""):`<li class="ok">Aucun conflit dans le plan actuel.</li>`;
 $("fa").innerHTML=`<option value="">Aucun cheval à éviter</option>`+H.map(h=>`<option value="${h.id}">À éviter : ${h.nom}</option>`).join("");drawEc();save()}
const norm=s=>(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const setSt=t=>{$("st").textContent=t},msg=t=>{$("imsg").textContent=t};
let DB=null,last="",tm;
const snap=()=>JSON.stringify({H,G,P,GROUP_MODE,PERSON_LAYOUTS,GROUP_AREAS,GROUP_LAYOUTS,NO_HOLES,RULES});
function save(){const s=snap();if(s===last)return;last=s;
 try{localStorage.setItem(Concours.key(),s);Concours.touched()}catch(e){Concours.storageFull()}
 clearTimeout(tm);tm=setTimeout(async()=>{
  if(!DB){setSt("Enregistré sur cet appareil");return}
  try{await DB.set({json:s});setSt("Enregistré")}catch(e){setSt("Enregistré sur cet appareil seulement")}},600)}
function load(s){try{const o=JSON.parse(s);if(o.H&&o.G){let p=o.P||P;if(p[0]&&!p[0].al)p=[{n:"Bloc A",al:p.map(a=>({c:a.c,g:a.g,b:a.b}))}];
 const n=p.reduce((t,b)=>t+b.al.reduce((u,a)=>u+a.c,0),0);
 if(o.G.length==n){P=p;rebuild();H=o.H;G=o.G;if(["both","line","face"].includes(o.GROUP_MODE))GROUP_MODE=o.GROUP_MODE;if(o.PERSON_LAYOUTS&&typeof o.PERSON_LAYOUTS==="object")PERSON_LAYOUTS=Object.fromEntries(Object.entries(o.PERSON_LAYOUTS).filter(([,v])=>v==="line"||v==="face"));if(o.GROUP_AREAS&&typeof o.GROUP_AREAS==="object")GROUP_AREAS=Object.fromEntries(Object.entries(o.GROUP_AREAS).filter(([,v])=>v==="exterior"||v==="interior"));if(o.GROUP_LAYOUTS&&typeof o.GROUP_LAYOUTS==="object")GROUP_LAYOUTS=Object.fromEntries(Object.entries(o.GROUP_LAYOUTS).filter(([,v])=>v==="line"||v==="face"));if(typeof o.NO_HOLES==="boolean")NO_HOLES=o.NO_HOLES;if(o.RULES)RULES={...RULES,...o.RULES};H.forEach(h=>{h.club=h.club||"";h.com="";h.wk=[];h.ak=[]});parseWishes();last=s;return true}}}catch(e){}return false}
const cl=s=>(s||"").replace(/[<>]/g,"").trim();
const gk=h=>norm(h.resp)+"|"+norm(h.ec);
function parseWishes(){H.forEach(h=>{h.wk=[];h.ak=[]})}
function wishList(){
 const out=[],seen=new Set(),L={},PRS=[];
 for(let k=0;k<N;k++){if(AD[k])PRS.push([k,k+1]);if(FC[k]>k)PRS.push([k,FC[k]])}
 H.forEach(h=>{L[norm(h.resp)]=h.resp;L[norm(h.ec)]=h.ec});
 H.forEach(h=>{const g=gk(h);(h.wk||[]).forEach(key=>{const id=g+">"+key;if(seen.has(id))return;seen.add(id);
  const pm=H.some(x=>gk(x)==g&&G.includes(x.id)),pt=H.some(x=>hit([key],x)&&G.includes(x.id));
  const ok=PRS.some(([x,y])=>{const a=hb(G[x]),b=hb(G[y]);return !!(a&&b&&((gk(a)==g&&hit([key],b))||(gk(b)==g&&hit([key],a))))});
  const who=h.resp||h.ec,wt=L[key]||key;
  out.push({ok,txt:ok?`Respecté : ${who} avec ${wt}`:(pm&&pt?`Non respecté : ${who} voudrait être avec ${wt}`:`En attente : ${who} voudrait être avec ${wt}`)})})});
 return out}
function parseCSV(t){const l=t.split(/\r?\n/)[0],delims=[";",",","\t"],d=delims.sort((a,b)=>(l.split(b).length-1)-(l.split(a).length-1))[0];
 const rows=[];let r=[],f="",q=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
  else if(c=='"')q=true;else if(c==d){r.push(f);f=""}
  else if(c=="\n"||c=="\r"){if(c=="\r"&&t[i+1]=="\n")i++;r.push(f);f="";if(r.some(x=>x.trim()))rows.push(r);r=[]}
  else f+=c}
 r.push(f);if(r.some(x=>x.trim()))rows.push(r);return rows}
function importRes(R,hd,cc,replace){
 const ce=hd.findIndex(h=>h.includes("engageur")||h.includes("engager")||h.includes("ecurie")),clubCol=hd.findIndex(h=>h==="club"||(/^club\b/.test(h)&&!h.includes("engageur")&&!h.includes("engager"))),cr=hd.findIndex((h,i)=>i!=ce&&i!=clubCol&&["cavalier","responsable","nom","proprietaire"].some(x=>h.startsWith(x)));
 const cf=hd.findIndex(h=>h.includes("reserv")||h.startsWith("ref")||h.startsWith("num"));
 const nh=replace?[]:H.slice(),skip=[],stamp=Date.now();let id=Math.max(0,...nh.map(h=>h.id)),add=0,pi=0;
 const cnt=(r,c)=>{if(c<0)return 0;const raw=String(r[c]??"").trim(),m=raw.match(/^-?\d+/),v=m?parseInt(m[0],10):0;return Math.max(0,v)};
 R.slice(1).forEach((r,i)=>{
  const line=i+2,cav=cl(cr>=0?r[cr]:""),ecu=cl(ce>=0?r[ce]:""),club=cl(clubCol>=0?r[clubCol]:""),rf=cl(cf>=0?r[cf]:""),lab=cav||ecu||club||(rf?"Réservation "+rf:"Ligne "+line),ec=ecu||club||cav||"À identifier · ligne "+line;
  const n={E:cnt(r,cc[0]),H:cnt(r,cc[1]),J:cnt(r,cc[2])};
  if(n.E+n.H+n.J==0){skip.push(line);return}
  pi++;
  ["E","H","J"].forEach(sx=>{for(let j=1;j<=n[sx];j++){
   const nom=`${lab} ${sx=="E"?"É":sx}${j}`;
   const p=sx!="H"&&j<=Math.min(n.E,n.J)?`${stamp}_${pi}_${j}`:"";
   nh.push({id:++id,nom,sx,ec,club,av:[],resp:cav,pair:p,grp:`${stamp}_${pi}`,com:"",ref:rf,wk:[],ak:[]});add++}})});
 pushU();H=nh;parseWishes();G=replace?Array(N).fill(null):G.map(x=>H.some(h=>h.id==x)?x:null);sel=null;
 msg(`${R.length-1} ligne(s) lue(s) : ${pi} réservation(s) avec chevaux, ${add} cheval(aux) créé(s)`+(skip.length?`; ${skip.length} ligne(s) sans nombre de chevaux (lignes ${skip.slice(0,8).join(", ")})`:"")+". Noms provisoires : É = étalon.");draw()}
function doImport(t,replace){
 const R=parseCSV(t.replace(/^\uFEFF/,""));if(R.length<2){msg("Fichier vide ou sans ligne de données.");return}
 const hd=R[0].map(norm),ix=(...k)=>hd.findIndex(h=>k.some(x=>h.startsWith(x)));
 const ce=hd.findIndex(h=>h.includes("engageur")||h.includes("engager")||h.includes("ecurie")),clubCol=hd.findIndex(h=>h==="club"||(/^club\b/.test(h)&&!h.includes("engageur")&&!h.includes("engager"))),cn=hd.findIndex((h,i)=>i!=ce&&i!=clubCol&&(h.startsWith("nom")||h.startsWith("cheval")||h.startsWith("equide"))),cs=ix("sexe","sex"),cr=ix("cavalier","responsable"),ca=ix("a_eviter","eviter","incompat");
 const cE=hd.findIndex(h=>h.includes("entier")||h.includes("etalon")),cH=hd.findIndex(h=>h.includes("hongre")),cJ=hd.findIndex(h=>h.includes("jument")||h.includes("femelle"));
 const cf=hd.findIndex(h=>h.includes("reserv")||h.startsWith("ref")||h.startsWith("num"));
 if(cs<0&&(cE>=0||cH>=0||cJ>=0)){importRes(R,hd,[cE,cH,cJ],replace);return}
 if(cn<0&&ce<0&&clubCol<0&&cr<0&&cf<0){msg("Aucune colonne ne permet d’identifier les lignes du fichier.");return}
 const nh=replace?[]:H.slice(),avoid=[],skip=[];let id=Math.max(0,...nh.map(h=>h.id)),add=0,missingSex=0;
 R.slice(1).forEach((r,i)=>{const line=i+2,s=norm(cs>=0?r[cs]:""),club=cl(clubCol>=0?r[clubCol]:""),cavalier=cl(cr>=0?r[cr]:""),nom=cl(cn>=0?r[cn]:"")||`Nom à préciser · ligne ${line}`,ec=cl(ce>=0?r[ce]:"")||club||cavalier||"À identifier · ligne "+line;
  const sx=cs<0||!s?"I":s.startsWith("e")?"E":s.startsWith("j")||s.startsWith("f")?"J":s.startsWith("h")?"H":"I";if(sx==="I")missingSex++;
  if(r.every(v=>!String(v||"").trim())){skip.push(line);return}
  const rf=cl(cf>=0?r[cf]:"");
  nh.push({id:++id,nom,sx,ec,club,av:[],resp:cavalier,com:"",ref:rf,grp:rf?"ref_"+norm(rf):"horse_"+id,wk:[],ak:[]});add++;
  if(ca>=0&&r[ca])avoid.push([id,r[ca].split("|").map(norm)])});
 avoid.forEach(([i,ns])=>ns.forEach(n=>{const o=nh.find(h=>norm(h.nom)==n&&h.id!=i),me=nh.find(h=>h.id==i);
  if(o&&me){if(!me.av.includes(o.id))me.av.push(o.id);if(!o.av.includes(me.id))o.av.push(me.id)}}));
 pushU();H=nh;parseWishes();G=replace?Array(N).fill(null):G.map(x=>H.some(h=>h.id==x)?x:null);sel=null;
 msg(`${R.length-1} ligne(s) lue(s) : ${add} cheval(aux) importé(s)`+(missingSex?`; sexe à préciser pour ${missingSex}`:"")+(skip.length?`; ${skip.length} ligne(s) vide(s) écartée(s)`:"")+". Les noms répétés de lignes distinctes sont conservés.");draw()}
function remap(np){const m={};let k=0;P.forEach((bl,bi)=>bl.al.forEach((a,ai)=>{for(let i=0;i<a.c;i++){if(G[k]!=null)m[bi+"_"+ai+"_"+i]=G[k];k++}}));
 P=np;rebuild();UN.length=0;G=Array(N).fill(null);k=0;P.forEach((bl,bi)=>bl.al.forEach((a,ai)=>{for(let i=0;i<a.c;i++){const id=m[bi+"_"+ai+"_"+i];if(id!=null&&!BL[k])G[k]=id;k++}}));sel=null;draw()}
const alH=(a,j)=>`<fieldset class="al" style="border:1px solid var(--line);border-radius:8px;padding:8px;display:grid;gap:6px"><legend>Allée ${j+1}</legend><label>Nombre de boxes <input type="number" class="ac" min="1" max="60" value="${a.c}"></label><label>Passages après les boxes n° <input class="ag" placeholder="ex. 4, 8" value="${a.g.join(", ")}"></label><label>Boxes bloqués n° <input class="ab" placeholder="ex. 3" value="${a.b.join(", ")}"></label></fieldset>`;
const blH=(bl,i)=>`<fieldset class="bl" style="border:2px solid var(--pine);border-radius:10px;padding:10px;display:grid;gap:8px"><legend>Bloc ${String.fromCharCode(65+i%26)}</legend><label>Nom du bloc <input class="bn" value="${bl.n.replace(/"/g,"&quot;")}"></label><label>Nombre d’allées <input type="number" class="bna" min="1" max="20" value="${bl.al.length}"></label><div style="display:grid;gap:8px">${bl.al.map(alH).join("")}</div></fieldset>`;
const readP=()=>[...document.querySelectorAll("#cbl > fieldset.bl")].map((f,i)=>({n:f.querySelector(".bn").value.trim()||"Bloc "+String.fromCharCode(65+i%26),al:[...f.querySelectorAll("fieldset.al")].map(fs=>{const c=Math.min(60,Math.max(1,+fs.querySelector(".ac").value||1)),nums=q=>fs.querySelector(q).value.split(/[,; ]+/).map(Number).filter(x=>x>0);return{c,g:nums(".ag").filter(x=>x<c),b:nums(".ab").filter(x=>x<=c)}})}));
const dflA=l=>({c:l?l.c:8,g:l?l.g.slice():[],b:[]});
function drawCfg(){
 $("cfgbody").innerHTML=`<div style="display:grid;gap:10px;margin-top:10px"><label>Nombre de blocs <input type="number" id="cnb" min="1" max="20" value="${P.length}"></label><div id="cbl" style="display:grid;gap:12px"></div><p class="sub" style="margin:0">Un bloc regroupe plusieurs allées. Un passage coupe l’allée par un espace : les boxes de part et d’autre ne sont plus voisins. Un box bloqué est inutilisable.</p><button class="main" id="capp" type="button">Appliquer le plan</button></div>`;
 const fill=a=>{$("cbl").innerHTML=a.map(blH).join("")};fill(P);
 $("cnb").onchange=()=>{const cur=readP(),n=Math.min(20,Math.max(1,+$("cnb").value||1)),l=cur[cur.length-1];
  fill(Array.from({length:n},(_,i)=>cur[i]||{n:"Bloc "+String.fromCharCode(65+i%26),al:l.al.map(a=>dflA(a))}));$("cnb").value=n};
 $("cbl").onchange=e=>{if(!e.target.classList.contains("bna"))return;
  const cur=readP(),i=[...$("cbl").children].indexOf(e.target.closest("fieldset.bl")),n=Math.min(20,Math.max(1,+e.target.value||1)),b=cur[i];
  b.al=Array.from({length:n},(_,j)=>b.al[j]||dflA(b.al[b.al.length-1]));fill(cur)};
 $("capp").onclick=()=>{remap(readP());drawCfg()}}
$("cfg").addEventListener("toggle",()=>{if($("cfg").open)drawCfg()});
function readF(f,enc,cb){const r=new FileReader();r.onload=()=>cb(r.result);r.onerror=()=>msg("Le fichier n’a pas pu être lu. Choisissez un fichier CSV ou TXT valide.");r.readAsText(f,enc)}
$("imp").onchange=e=>{const f=e.target.files[0];if(!f)return;const replace=$("rep").checked;e.target.value="";
 const run=t=>{try{doImport(t,replace)}catch(err){msg("Import interrompu : le format du fichier n’a pas pu être interprété. Vérifiez la ligne d’en-tête et le séparateur CSV.")}};
 readF(f,"utf-8",t=>{if(t.includes("\uFFFD"))readF(f,"windows-1252",run);else run(t)})};
async function dl(name,data){
 try{if(typeof claude!=="undefined"&&claude&&claude.use){const d=await claude.use("downloads");if(d){await d.save({filename:name,data});return}}}catch(e){}
 try{const type=/\.json$/i.test(name)?"application/json":/\.html?$/i.test(name)?"text/html;charset=utf-8":"text/csv;charset=utf-8",b=new Blob([data],{type}),u=URL.createObjectURL(b),a=document.createElement("a");
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)}
 catch(e){setSt("Téléchargement impossible ici.")}}
const qc=s=>'"'+(s||'').replace(/"/g,'""')+'"';
$("exp").onclick=()=>{const rows=[["Nom du cheval","N° de box","Allée","Bloc"]];G.forEach((id,k)=>{const h=hb(id),parts=NM[k].match(/^([A-Z]+)(\d+)-(\d+)$/);if(h)rows.push([h.nom,parts?parts[3]:NM[k],parts?"Allée "+parts[2]:"",parts?"Bloc "+parts[1]:""])});dl("plan-boxes-simple.csv","\uFEFF"+rows.map(r=>r.map(qc).join(";")).join("\r\n"))};
async function exportPlanLayout(){
 const GI=groupInfo(),starts=[];let cursor=0;P.forEach(bl=>{starts.push(cursor);cursor+=bl.al.reduce((n,a)=>n+a.c,0)});
 const fg=hex=>{const m=hex.match(/[\da-f]{2}/gi)||["00","00","00"],rgb=m.slice(0,3).map(x=>parseInt(x,16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)),lum=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];return lum>.42?"#17232b":"#ffffff"};
 const sideTable=aisles=>{
  if(!aisles.length)return"<p class='empty-side'>Aucune allée</p>";
  let rows="";aisles.forEach(a=>{rows+=`<tr class="aisle-title"><th colspan="3">${escHTML(a.title)}</th></tr>`;a.rows.forEach(({k,h})=>{const label=h?(h.club||h.resp||h.ref||"Sans groupe"):BL[k]?"Hors service":"Libre",color=h?GI.color(h):"#e2e8e4",ink=h?fg(color):"#52635a",name=h?`<strong>${escHTML(h.nom)}</strong><small>${escHTML(SEXN[h.sx]||"Sexe à préciser")}</small>`:BL[k]?"Hors service":"Libre";rows+=`<tr class="${h?"occupied":"vacant"}"><td class="boxno">${escHTML(boxName(k))}</td><td class="horse">${name}</td><td class="group" style="border-left:5px solid ${color};${h?`background:${color};color:${ink}`:""}">${escHTML(label)}</td></tr>`})});
  return`<table><thead><tr><th>Box</th><th>Cheval</th><th>Groupe</th></tr></thead><tbody>${rows}</tbody></table>`;
 };
 const sections=P.map((bl,bi)=>{let base=starts[bi];const aisles=bl.al.map((al,ai)=>{const rows=Array.from({length:al.c},(_,i)=>({k:base+i,h:hb(G[base+i])}));base+=al.c;const ori=(ai%4===0||ai%4===3)?"extérieur":"intérieur";return{title:`Allée ${ai+1} · côté ${ori}`,rows}}),split=Math.ceil(aisles.length/2),left=aisles.slice(0,split),right=aisles.slice(split);
  return`<section class="block"><div class="block-layout"><div class="side">${sideTable(left)}</div><div class="block-label">${escHTML(bl.n||"Bloc "+String.fromCharCode(65+bi))}</div><div class="side">${sideTable(right)}</div></div></section>`}).reverse().join("");
 const legend=[...new Map(H.map(h=>[groupKey(h),h])).entries()].map(([key,h])=>`<span><i style="background:${GI.color(h)}"></i>${escHTML(h.club||groupDisplay(h))}${GI.stallions.has(key)?" · étalon":""}</span>`).join("");
 const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Plan des boxes</title><style>
*{box-sizing:border-box}body{margin:0;padding:20px;color:#17232b;font:13px/1.25 Arial,Helvetica,sans-serif;background-color:#fff;background-image:linear-gradient(#dfe5e1 1px,transparent 1px),linear-gradient(90deg,#dfe5e1 1px,transparent 1px);background-size:22px 22px}.sheet{max-width:1150px;margin:0 auto;background:#fff;padding:20px 24px;box-shadow:0 2px 14px #26382d22}.head{display:flex;justify-content:space-between;align-items:end;border-bottom:3px solid #26382d;padding-bottom:12px;margin-bottom:16px}.head h1{font-size:23px;margin:0}.head p{margin:4px 0 0;color:#53665c}.date{font-size:11px;color:#53665c}.block{margin:15px 0;padding:7px 0;border-bottom:8px solid #69786f;break-inside:avoid}.block-layout{display:grid;grid-template-columns:minmax(0,1fr) 82px minmax(0,1fr);align-items:center;gap:10px}.block-label{text-align:center;font-weight:800;font-size:16px;color:#34483d}.side table{border-collapse:collapse;width:100%;table-layout:fixed;background:#fff}.side th,.side td{border:1px solid #26352d;padding:4px 6px;overflow-wrap:anywhere}.side thead th{background:#e9efeb;text-align:left;font-size:11px}.side th:first-child,.boxno{width:58px;text-align:center;font-weight:700}.side th:last-child,.group{width:30%}.horse strong{display:block;font-size:12px}.horse small{display:block;color:#34483d;font-size:10px}.group{font-size:10px;font-weight:700}.aisle-title th{background:#dfe7e2;text-align:left;color:#34483d;padding:5px}.vacant td{height:22px;color:#748078;font-size:10px}.empty-side{color:#87928c;text-align:center}.legend{display:flex;flex-wrap:wrap;gap:7px 13px;margin:13px 0;color:#46584e;font-size:10px}.legend span{display:flex;align-items:center;gap:4px}.legend i{width:10px;height:10px;border-radius:2px}.foot{border-top:1px solid #bdc9c1;padding-top:8px;color:#596a61;font-size:10px}
@media print{@page{size:A4 portrait;margin:10mm}body{padding:0;background:#fff;background-image:none}.sheet{max-width:none;padding:0;box-shadow:none}.block{break-inside:avoid}.side th,.side td{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
@media(max-width:700px){body{padding:8px}.sheet{padding:12px}.block-layout{grid-template-columns:1fr}.block-label{grid-row:1}.side table{font-size:10px}}
</style></head><body><main class="sheet"><header class="head"><div><h1>Plan des boxes</h1><p>Concours · placement par blocs et allées</p></div><div class="date">Édité le ${escHTML(new Intl.DateTimeFormat("fr-FR",{dateStyle:"long"}).format(new Date()))}</div></header>${sections}<div class="legend">${legend}<span><i style="background:#cbd5cf"></i>Box libre / hors service</span><span>É étalon · J jument · H hongre</span></div><footer class="foot">Les groupes sont colorés ; les cases indiquent le numéro du box, le cheval, son sexe et son groupe.</footer></main></body></html>`;
 await dl("plan-boxes-mise-en-page.html",html);
 setSt("Mise en page téléchargée. Ouvrez le fichier HTML puis imprimez-le ou enregistrez-le en PDF.");
}
$("expLayout").onclick=exportPlanLayout;
$("tpl").onclick=()=>dl("modele-reservations.csv","\uFEFFn° réservation;club engageur;club;cavalier;nom;sexe\nR-001;Écurie du Moulin;Club du Moulin;M. Laurent;Orage;Étalon\nR-001;Écurie du Moulin;Club du Moulin;M. Laurent;Quartz;Étalon\nR-002;Haras des Pins;;Mme Roux;Bella;Jument\nR-002;Haras des Pins;;Mme Roux;Nuage;Jument\n");
$("placeRest").onclick=placeRestAndComplete;
$("noHoles").onchange=()=>{pushU();NO_HOLES=$("noHoles").checked;draw();setSt(NO_HOLES?"L’évitement des boxes vides est activé. Le plan les comblera quand cela ne crée pas de conflit bloquant et ne coupe pas un groupe.":"L’évitement renforcé des boxes vides est désactivé.")};
$("auto").onclick=()=>{pushU();auto()};
$("und").onclick=()=>{setSt(undo()?"Dernière action annulée.":"Rien à annuler.")};
$("clear").onclick=()=>{pushU();G=Array(N).fill(null);sel=null;draw()};
$("f").onsubmit=e=>{e.preventDefault();
 const id=Math.max(0,...H.map(h=>h.id))+1,a=$("fa").value?[+$("fa").value]:[];
 pushU();HMv=null;const rf=cl($("fq").value);H.push({id,nom:cl($("fn").value),sx:$("fs").value,ec:cl($("fe").value),club:"",av:a,resp:cl($("fr").value),com:"",ref:rf,grp:rf?"ref_"+norm(rf):"horse_"+id,wk:[],ak:[]});parseWishes();
 a.forEach(o=>hb(o).av.push(id));$("f").reset();draw()};
/* ===== Annuler (historique des 40 dernières actions) ===== */
const UN=[];
function pushU(){UN.push(JSON.stringify({H,G,P,GROUP_MODE,PERSON_LAYOUTS,GROUP_AREAS,GROUP_LAYOUTS,NO_HOLES,RULES}));if(UN.length>40)UN.shift()}
function undo(){
 const s=UN.pop();if(!s)return false;
 try{const o=JSON.parse(s);if(o.P){P=o.P;rebuild()}if(o.G.length!=N){UN.length=0;return false}H=o.H;G=o.G;if(["both","line","face"].includes(o.GROUP_MODE))GROUP_MODE=o.GROUP_MODE;if(o.PERSON_LAYOUTS)PERSON_LAYOUTS=o.PERSON_LAYOUTS;if(o.GROUP_AREAS)GROUP_AREAS=o.GROUP_AREAS;if(o.GROUP_LAYOUTS)GROUP_LAYOUTS=o.GROUP_LAYOUTS;if(typeof o.NO_HOLES==="boolean")NO_HOLES=o.NO_HOLES;if(o.RULES)RULES=o.RULES;parseWishes();sel=null;draw();return true}catch(e){return false}}

/* ===== Console de commandes ===== */
const AIDE=[
 "baisser A1-3 [n] : descend de n boxes (1 par défaut) tous les chevaux à partir de ce box, jusqu'au bout de l'allée. Le box A1-3 devient libre.",
 "baisser A2 ou baisser A : même chose pour toute une allée ou tout un bloc. « monter » fait l'inverse (les boxes au-dessus doivent être libres).",
 "tasser [A1 | A] : supprime les boxes vides entre les chevaux d'une allée, d'un bloc ou de tout le plan.",
 "vider A1-3 | A2 | A | tout : retire les chevaux d'un box, d'une allée, d'un bloc ou de tout le plan.",
 "placer NOM A1-3 : place un cheval dans un box (s'il est occupé, les deux chevaux sont échangés).",
 "echanger NOM1 et NOM2 : échange deux chevaux (ou deux boxes : echanger A1-1 et A1-2).",
 "retirer NOM ou retirer A1-3 : retire un cheval du plan. supprimer NOM : le supprime des réservations.",
 "regrouper NOM : rassemble toutes les réservations portant ce numéro, cavalier, écurie ou nom de cheval, puis recalcule et tasse tout le plan.",
 "auto : placement automatique. annuler : défait la dernière action."];
function runCmd(t){
 const pre=JSON.stringify({H,G,P}),raw=norm(t).replace(/\s+/g," ");
 const ok=(...l)=>({ok:1,l}),ko=x=>({ok:0,l:[x]});
 if(!raw)return ko("Tapez une commande (ex. baisser A1-3) ou « aide ».");
 const m=raw.match(/^(\S+)\s*(.*)$/),v=m[1],a=m[2];
 const commit=(g,msg)=>{UN.push(pre);if(UN.length>40)UN.shift();G=g;sel=null;draw();return ok(msg)};
 const ref=s=>{s=(s||"").replace(/\b(bloc|allee|box)\s+/g,"").trim();if(!s)return null;
  const all=[...Array(N).keys()],k=NM.findIndex(n=>norm(n)==s);
  if(k>-1)return{t:"box",ks:[k]};
  if(/^[a-z]\d+$/.test(s)){const ks=all.filter(i=>norm(NM[i]).split("-")[0]==s);if(ks.length)return{t:"al",ks}}
  if(/^[a-z]$/.test(s)){const ks=all.filter(i=>norm(NM[i])[0]==s);if(ks.length)return{t:"bl",ks}}
  return null};
 const horse=s=>{const n=norm(s).trim();if(!n)return{err:"Nom du cheval manquant."};
  let l=H.filter(h=>norm(h.nom)==n);if(!l.length)l=H.filter(h=>norm(h.nom).includes(n));
  if(!l.length)return{err:"Cheval introuvable : « "+s+" »."};
  if(l.length>1)return{err:l.length+" chevaux correspondent à « "+s+" » : "+l.slice(0,4).map(h=>h.nom).join(", ")+"… Précisez le nom."};
  return{h:l[0]}};
 const shiftG=(g,k,n)=>{const ar=AU.find(x=>x.length&&AL[x[0]]==AL[k]);if(!ar)return"Aucun box utilisable dans cette allée.";
  const j=ar.findIndex(x=>x>=k);if(j<0)return"Aucun box utilisable à partir de "+NM[k]+".";
  const L=ar.length,part=ar.slice(j),src=part.map(x=>g[x]);part.forEach(x=>{g[x]=null});
  for(let i=0;i<src.length;i++){if(src[i]==null)continue;const p=j+i+n;
   if(p<0||p>=L)return"Pas assez de place dans l’allée "+NM[k].split("-")[0]+" pour décaler de "+Math.abs(n)+" box.";
   if(p<j&&g[ar[p]]!=null)return"Le box "+NM[ar[p]]+" est occupé : impossible de remonter.";
   g[ar[p]]=src[i]}
  return null};
 if(v=="aide"||v=="help"||v=="?")return{ok:1,l:AIDE};
 if(["baisser","descendre","decaler","monter","remonter"].includes(v)){
  const mm=a.match(/^(.+?)(?:\s+(-?\d+))?$/);if(!mm)return ko("Précisez un box ou une allée : "+v+" A1-3");
  const r=ref(mm[1]);if(!r)return ko("Box, allée ou bloc introuvable : « "+mm[1]+" ».");
  let n=Math.min(50,Math.max(1,Math.abs(parseInt(mm[2])||1)));if(v=="monter"||v=="remonter")n=-n;
  const g=G.slice(),als=[...new Set(r.ks.map(k=>AL[k]))],starts=r.t=="box"?[r.ks[0]]:als.map(al=>r.ks.find(k=>AL[k]==al));
  for(const k of starts){const e=shiftG(g,k,n);if(e)return ko(e)}
  return commit(g,(n>0?"Descendu":"Remonté")+" de "+Math.abs(n)+" box : "+(r.t=="box"?"à partir de "+NM[starts[0]]:starts.length+" allée(s)")+".")}
 if(v=="tasser"||v=="compacter"){
  const r=a?ref(a):{ks:[...Array(N).keys()]};if(!r)return ko("Allée ou bloc introuvable : « "+a+" ».");
  const g=G.slice();
  [...new Set(r.ks.map(k=>AL[k]))].forEach(al=>{const ar=AU.find(x=>x.length&&AL[x[0]]==al);if(!ar)return;
   const ids=ar.map(x=>g[x]).filter(x=>x!=null);ar.forEach((x,i)=>{g[x]=i<ids.length?ids[i]:null})});
  return commit(g,"Chevaux tassés : plus de box vide entre eux.")}
 if(v=="vider"||(v=="retirer"&&ref(a))){
  if(!a)return ko("Précisez : vider A1-3, vider A2 (allée), vider A (bloc) ou vider tout.");
  const r=a=="tout"?{ks:[...Array(N).keys()]}:ref(a);if(!r)return ko("Box, allée ou bloc introuvable : « "+a+" ».");
  const g=G.slice();let c=0;r.ks.forEach(k=>{if(g[k]!=null){g[k]=null;c++}});
  return commit(g,c+" cheval(aux) retiré(s) du plan.")}
 if(v=="grouper"||v=="regrouper"){
  const q=norm(a).trim();if(!q)return ko("Précisez un numéro de réservation, un cavalier, une écurie ou un nom de cheval.");
  const matches=H.filter(h=>[h.ref,h.resp,h.ec,h.nom].some(x=>{const z=norm(x);return z===q||(q.length>1&&z.includes(q))}));
  if(!matches.length)return ko("Aucune réservation ne correspond à « "+a+" ».");
  const keys=new Set(matches.map(groupKey)),targets=H.filter(h=>matches.includes(h)||keys.has(groupKey(h))),group="manualgroup:"+q;
  UN.push(pre);if(UN.length>40)UN.shift();targets.forEach(h=>{h.grp=group});
  auto(groupKey(targets[0]));return ok(targets.length+" cheval(aux) regroupé(s) sous « "+a+" ». Le plan a été recalculé et tassé ; utilisez « annuler » pour revenir en arrière.")}
 if(v=="retirer"){
  const h=horse(a);if(h.err)return ko(h.err);const i=G.indexOf(h.h.id);
  if(i<0)return ko(h.h.nom+" n’est pas sur le plan.");
  const g=G.slice();g[i]=null;return commit(g,h.h.nom+" retiré du plan.")}
 if(v=="placer"){
  if(a=="auto"){UN.push(pre);auto();return ok("Placement automatique effectué.")}
  const aa=a.replace(/\b(box|dans|en|au)\b/g," ").replace(/\s+/g," ").trim(),mm=aa.match(/^(.+)\s+(\S+)$/);
  if(!mm)return ko("Format : placer NOM_DU_CHEVAL A1-3");
  const r=ref(mm[2]);if(!r||r.t!="box")return ko("Box introuvable : « "+mm[2]+" ».");
  const h=horse(mm[1]);if(h.err)return ko(h.err);
  const k=r.ks[0];if(BL[k])return ko("Le box "+NM[k]+" est bloqué.");
  const g=G.slice(),from=g.indexOf(h.h.id),occ=g[k];if(from>-1)g[from]=occ;g[k]=h.h.id;
  return commit(g,h.h.nom+" placé en "+NM[k]+(occ!=null&&occ!==h.h.id?" ("+(from>-1?"échangé avec ":"")+hb(occ).nom+(from>-1?"":" remis à placer")+")":"")+".")}
 if(v=="echanger"||v=="permuter"||v=="inverser"){
  const p=a.split(/\s+(?:et|avec)\s+|\s*[,\/]\s*/).filter(Boolean);
  if(p.length!=2)return ko("Format : echanger Orage et Quartz (ou deux boxes : echanger A1-1 et A1-2).");
  const pos=p.map(s=>{const r=ref(s);if(r&&r.t=="box")return{k:r.ks[0]};const h=horse(s);if(h.err)return{err:h.err};
   const i=G.indexOf(h.h.id);return i<0?{err:h.h.nom+" n’est pas placé : utilisez « placer »."}:{k:i}});
  const er=pos.find(x=>x.err);if(er)return ko(er.err);
  if(BL[pos[0].k]||BL[pos[1].k])return ko("Un des boxes est bloqué.");
  const g=G.slice();[g[pos[0].k],g[pos[1].k]]=[g[pos[1].k],g[pos[0].k]];
  return commit(g,"Échange effectué : "+NM[pos[0].k]+" ↔ "+NM[pos[1].k]+".")}
 if(v=="supprimer"){const h=horse(a);if(h.err)return ko(h.err);const nm=h.h.nom;delH(h.h.id);return ok(nm+" supprimé des réservations (« annuler » pour le remettre).")}
 if(v=="auto"||v=="automatique"||v=="remplir"){UN.push(pre);auto();return ok("Placement automatique effectué.")}
 if(v=="annuler"||v=="undo")return undo()?ok("Dernière action annulée."):ko("Rien à annuler.");
 return ko("Commande inconnue : « "+v+" ». Tapez « aide » pour la liste.")}
function showOut(r){const ul=$("cout");ul.innerHTML="";
 r.l.forEach(x=>{const li=document.createElement("li");if(r.ok)li.className="ok";li.textContent=x;ul.appendChild(li)})}
$("cf").onsubmit=e=>{e.preventDefault();const t=$("cin").value,r=runCmd(t);showOut(r);if(r.ok&&!/^\s*(aide|help|\?)/i.test(t))$("cin").value=""};

/* ===== Onglet Écuries ===== */
let KEEP=false;const EO=new Set();
const mkE=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const inpE=(v,ph,lab)=>{const i=document.createElement("input");i.value=v||"";i.placeholder=ph||"";i.setAttribute("aria-label",lab||ph||"");return i};
const btE=(txt,fn,cls)=>{const b=mkE("button",cls||"",txt);b.type="button";b.onclick=fn;return b};
const selSx=cur=>{const s=document.createElement("select");s.setAttribute("aria-label","Sexe");
 ["E","J","H","I"].forEach(x=>{const o=document.createElement("option");o.value=x;o.textContent=SEXN[x];if(x==cur)o.selected=true;s.appendChild(o)});return s};
const eMsg=t=>{$("emsg").textContent=t};
const idsOf=e=>H.filter(h=>norm(h.ec)==norm(e)).map(h=>h.id);
/* Recalcule le plan en priorisant une écurie sur une même allée et un même côté. */
function placeEc(e){
 const L=H.filter(h=>norm(h.ec)==norm(e));
 if(!L.length)return"Aucun cheval trouvé pour « "+e+" ».";
 pushU();auto(null,e);
 const spread=stableSpread(G,e),placed=L.filter(h=>G.includes(h.id)).length,lanes=[...new Set(L.map(h=>G.indexOf(h.id)).filter(i=>i>=0).map(i=>boxName(i).split("-")[0]))],ni=issues(G).filter(x=>x.hard).length;
 return L.length+" cheval(aux) de « "+e+" » regroupé(s) sur le même côté"+(spread?" au plus près possible ; la capacité des allées impose plusieurs groupes.":" en allée(s) continue(s)")+". "+placed+" placé(s) · "+lanes.join(", ")+(ni?" · "+ni+" conflit(s) à corriger.":".")}
function drawPrep(){
 const stats=$("prepStats"),stable=$("prepStable"),filter=$("prepFilter"),editor=$("groupEditor");
 const by=new Map();H.forEach(h=>{const k=groupKey(h);if(!by.has(k))by.set(k,{key:k,hs:[]});by.get(k).hs.push(h)});
 const groups=[...by.values()].map(r=>{const h=r.hs[0],names=[...new Set(r.hs.map(x=>x.resp||x.nom))];r.title=names.slice(0,3).join(" · ")+(names.length>3?" +"+(names.length-3):"");r.club=h.club||"";r.refs=[...new Set(r.hs.map(x=>x.ref).filter(Boolean))];r.riders=[...new Set(r.hs.map(x=>x.resp).filter(Boolean))];r.text=norm([r.title,r.club,...r.hs.flatMap(x=>[x.nom,x.resp,x.ref,x.ec])].join(" "));return r}).sort((a,b)=>a.title.localeCompare(b.title));
 const keep=stable.value;
 stable.replaceChildren();const allOpt=document.createElement("option");allOpt.value="";allOpt.textContent="Tous les groupes";stable.appendChild(allOpt);
 groups.forEach(r=>{const o=document.createElement("option");o.value=r.key;o.textContent=r.club?(r.title+" · club : "+r.club):r.title+(r.refs.length?" · réservation "+r.refs.join(", "):" · cavalier");stable.appendChild(o)});stable.value=groups.some(r=>r.key===keep)?keep:"";
 $("groupMode").value=GROUP_MODE;
 $("ruleEJ").value=RULES.EJ;$("ruleEE").value=RULES.EE;$("ruleAV").value=RULES.AV;$("ruleFacing").checked=!!RULES.facing;
 const q=norm(filter.value),keyFilter=stable.value;
 const rows=groups.filter(r=>(!keyFilter||r.key===keyFilter)&&(!q||r.text.includes(q)));
 const facePairs=FC.filter(x=>x>=0).length/2,needsFace=GROUP_MODE==="face"||Object.values(PERSON_LAYOUTS).includes("face");
 stats.textContent=H.length+" chevaux · "+groups.length+" groupes · "+[...new Set(H.map(h=>h.ref).filter(Boolean))].length+" réservations"+(needsFace&&!facePairs?" · aucune paire d’allées en face définie":"");
 editor.replaceChildren();
 if(!rows.length){const empty=document.createElement("p");empty.className="sub";empty.textContent=H.length?"Aucun club ne correspond à ces filtres.":"Aucune réservation à préparer.";editor.appendChild(empty);return}
 rows.forEach(r=>{
  const card=document.createElement("article");card.className="group-card";
  const head=document.createElement("div");head.className="group-card-head";
  const mark=document.createElement("span");mark.className="gmark";mark.textContent=r.hs.length+"";mark.style.background=ecol(r.club||r.hs[0].ec);
  const txt=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("small"),hasStallion=r.hs.some(h=>h.sx==="E");title.textContent=r.title;meta.textContent=(r.club?"Club : "+r.club:"Sans club · "+(r.refs.length?"réservation "+r.refs.join(", "):"groupe cavalier"))+" · "+r.hs.length+" cheval(aux)"+(hasStallion?" · ⚑ contient un étalon · priorité extérieur / bout d’allée":"");txt.append(title,meta);head.append(mark,txt);card.appendChild(head);
  const people=new Map();r.hs.forEach(h=>{const k=personKey(h);if(!people.has(k))people.set(k,{label:personLabel(h),hs:[]});people.get(k).hs.push(h)});
  people.forEach((p,key)=>{const block=document.createElement("section");block.className="person-block";
   const ph=document.createElement("div");ph.className="person-head";const who=document.createElement("strong");who.textContent=p.label;
   const layout=document.createElement("select");layout.setAttribute("aria-label","Disposition pour "+p.label);
   [["auto","Selon le réglage général"],["line","En ligne"],["face","Face à face"]].forEach(([v,l])=>{const op=document.createElement("option");op.value=v;op.textContent=l;layout.appendChild(op)});
   layout.value=PERSON_LAYOUTS[key]||"auto";layout.onchange=()=>{pushU();if(layout.value==="auto")delete PERSON_LAYOUTS[key];else PERSON_LAYOUTS[key]=layout.value;$("prepMsg").textContent="Disposition mise à jour pour "+p.label+". Recréez le plan pour l’appliquer.";draw()};
   ph.append(who,layout);block.appendChild(ph);
   const horses=document.createElement("div");horses.className="club-horse-list";
   p.hs.sort((a,b)=>a.nom.localeCompare(b.nom)).forEach(h=>{const row=document.createElement("div");row.className="club-horse-row";
    const label=document.createElement("span");label.textContent=h.nom+" · "+SEXN[h.sx]+(h.ref?" · rés. "+h.ref:"");
    const move=document.createElement("select");move.setAttribute("aria-label","Groupe club pour "+h.nom);const none=document.createElement("option");none.value="";none.textContent="Sans club";move.appendChild(none);[...new Set(H.map(x=>x.club).filter(Boolean))].sort((a,b)=>a.localeCompare(b)).forEach(name=>{const op=document.createElement("option");op.value=name;op.textContent=name;move.appendChild(op)});move.value=h.club||"";
    move.onchange=()=>{if(norm(move.value)===norm(h.club||""))return;pushU();const old=h.club;h.club=move.value;parseWishes();$("prepMsg").textContent=h.nom+(old?" déplacé du groupe « "+old+" »":" ajouté au groupe club")+(h.club?" vers « "+h.club+" »." :" ; le regroupement par réservation s’applique.");draw()};
    row.append(label,move);horses.appendChild(row)});block.appendChild(horses);card.appendChild(block);
  });
  const edit=document.createElement("div");edit.className="group-edit";const name=document.createElement("input");name.value=r.club;name.placeholder="Nom du club (clé de groupe)";name.setAttribute("aria-label","Nom du club utilisé comme clé de groupe");
  const apply=document.createElement("button");apply.type="button";apply.textContent=r.club?"Renommer / fusionner":"Créer un groupe club";apply.onclick=()=>{const v=cl(name.value);if(!v){$("prepMsg").textContent="Laissez le club vide pour regrouper par réservation.";return}pushU();r.hs.forEach(h=>{h.club=v});parseWishes();$("prepMsg").textContent="Groupe club « "+v+" » enregistré. Les noms des chevaux restent affichés dans la liste et sur le plan.";draw()};edit.append(name,apply);card.appendChild(edit);
  const groupAction=document.createElement("div");groupAction.className="group-action";const regroup=document.createElement("button");regroup.type="button";regroup.className="main";regroup.textContent="Regrouper ce groupe ensemble";regroup.disabled=r.hs.length<2;regroup.title=regroup.disabled?"Ce groupe ne contient qu’un cheval.":"Recréer le plan en plaçant ce groupe sur une ligne, ou face à face si la ligne ne suffit pas.";regroup.onclick=()=>{if(r.hs.length<2)return;pushU();TAB="plan";auto(r.key);const layout=groupArrangement(G,r.key);setSt(layout?"Groupe « "+r.title+" » regroupé "+(layout==="line"?"en ligne":"face à face")+". Il n’est jamais disposé dos à dos. Les chevaux isolés restent hors du groupe. Annuler permet de revenir au plan précédent.":"Impossible de disposer « "+r.title+" » en ligne ou face à face : vérifiez la capacité des allées et les contraintes de voisinage.")};groupAction.appendChild(regroup);card.appendChild(groupAction);editor.appendChild(card);
 });
}
function drawEc(){
 $("tprep").setAttribute("aria-selected",TAB=="prep");$("tp").setAttribute("aria-selected",TAB=="plan");$("te").setAttribute("aria-selected",TAB=="ec");
 $("vPrep").hidden=TAB!="prep";$("vPlan").hidden=TAB!="plan";$("vEc").hidden=TAB!="ec";
 if(TAB=="prep"){drawPrep();return}
 if(TAB!="ec")return;
 const pl=H.filter(h=>G.includes(h.id)).length;
 $("est").innerHTML=`<span>${ecs().length} écurie(s)</span><span>${H.length} chevaux</span><span>${pl} placés</span><span>${H.length-pl} à placer</span>`;
 if(KEEP){KEEP=false;return}
 const iss=issues(G),bad=new Set();iss.forEach(i=>{bad.add(i.k);bad.add(i.k2)});
 const q=norm($("eq").value),box=$("elist");box.innerHTML="";let shown=0;
 [...ecs()].sort((a,b)=>a.localeCompare(b)).forEach(e=>{
  const L=H.filter(h=>norm(h.ec)==norm(e)).sort((a,b)=>"EJH".indexOf(a.sx)-"EJH".indexOf(b.sx)||a.nom.localeCompare(b.nom));
  if(q&&!norm([e,...L.map(h=>[h.club,h.nom,h.resp,h.ref].join(" "))].join(" ")).includes(q))return;
  shown++;
  const n=s=>L.filter(h=>h.sx==s).length,pls=L.filter(h=>G.includes(h.id)),ks=pls.map(h=>G.indexOf(h.id)),cf=ks.filter(i=>bad.has(i)).length;
  const al=[...new Set(ks.map(i=>boxName(i).split("-")[0]))],rs=[...new Set(L.map(h=>h.resp).filter(Boolean))];
  const d=document.createElement("details");d.className="ecard";if(q||EO.has(e))d.open=true;
  const sm=document.createElement("summary"),dot=mkE("span","dot");dot.style.display="inline-block";dot.style.marginRight="8px";dot.style.background=ecol(e);
  sm.appendChild(dot);sm.appendChild(mkE("b","",e));
  sm.appendChild(mkE("span","sub"," · "+L.length+" cheval(aux) · "+pls.length+" placé(s)"+(cf?" · ⚠ "+cf+" conflit(s)":"")));
  d.appendChild(sm);
  const body=mkE("div","eb");
  body.appendChild(mkE("div","sub",n("E")+" étalon(s) · "+n("J")+" jument(s) · "+n("H")+" hongre(s)"+(al.length?" · Allées : "+al.join(", "):"")));
  if(rs.length)body.appendChild(mkE("div","sub","Cavaliers : "+rs.join(", ")));
  /* actions sur l'écurie */
  const bar=mkE("div","bar");bar.style.margin="6px 0";
  const rn=inpE(e,"Nom de l’écurie","Nom de l’écurie");rn.style.cssText="flex:1;min-width:140px;width:auto";
  bar.appendChild(rn);
  bar.appendChild(btE("Renommer",()=>{const nn=cl(rn.value);if(!nn||nn==e)return;pushU();H.forEach(h=>{if(norm(h.ec)==norm(e))h.ec=nn});
   if(EO.delete(e))EO.add(nn);parseWishes();eMsg("Écurie renommée : "+nn+".");draw()}));
  bar.appendChild(btE("Regrouper l’écurie",()=>{eMsg(placeEc(e))},"main"));
  bar.appendChild(btE("Retirer du plan",()=>{const ids=idsOf(e);if(!ids.some(x=>G.includes(x))){eMsg("Aucun cheval de « "+e+" » sur le plan.");return}
   pushU();G=G.map(x=>ids.includes(x)?null:x);eMsg("« "+e+" » retirée du plan.");draw()}));
  let armed=false,tmo=0;const del=btE("Supprimer l’écurie",()=>{
   if(!armed){armed=true;del.textContent="Confirmer la suppression";del.classList.add("danger");tmo=setTimeout(()=>{armed=false;del.textContent="Supprimer l’écurie";del.classList.remove("danger")},4000);return}
   clearTimeout(tmo);pushU();const ids=idsOf(e);H=H.filter(h=>norm(h.ec)!=norm(e));H.forEach(h=>{h.av=h.av.filter(x=>!ids.includes(x))});
   G=G.map(x=>ids.includes(x)?null:x);sel=null;EO.delete(e);parseWishes();eMsg("« "+e+" » supprimée (bouton Annuler pour la remettre).");draw()});
  bar.appendChild(del);body.appendChild(bar);
  /* chevaux modifiables */
  L.forEach(h=>{
   const i=G.indexOf(h.id),r=mkE("div","hr");
   const top=mkE("div","gr"),nm=inpE(h.nom,"Nom du cheval","Nom du cheval"),sx=selSx(h.sx);
   nm.onchange=()=>{const v=cl(nm.value);if(!v){nm.value=h.nom;return}pushU();h.nom=v;KEEP=true;draw()};
   sx.onchange=()=>{pushU();h.sx=sx.value;draw()};
   top.appendChild(nm);top.appendChild(sx);r.appendChild(top);
   const g2=mkE("div","gr"),rp=inpE(h.resp,"Cavalier","Cavalier"),rf=inpE(h.ref,"N° de réservation","N° de réservation");
   rp.onchange=()=>{pushU();h.resp=cl(rp.value);parseWishes();KEEP=true;draw()};
   rf.onchange=()=>{pushU();h.ref=cl(rf.value);KEEP=true;draw()};
   g2.appendChild(rp);g2.appendChild(rf);r.appendChild(g2);
   const ft=mkE("div","bar");ft.style.margin="0";
   ft.appendChild(mkE("span","sub"+(bad.has(i)?" badt":""),(i>-1?"Box "+boxName(i):"À placer")+(bad.has(i)?" · ⚠ conflit":"")));
   ft.appendChild(btE("Voir sur le plan",()=>{TAB="plan";sel=h.id;draw();const t2=i>-1&&$("t"+i);if(t2)t2.scrollIntoView({block:"center",inline:"center"})}));
   if(i>-1)ft.appendChild(btE("Retirer du plan",()=>{pushU();G[i]=null;draw()}));
   ft.appendChild(btE("Supprimer",()=>{delH(h.id)},"danger"));
   r.appendChild(ft);body.appendChild(r)});
  /* ajouter un cheval à cette écurie */
  const af=mkE("div","gr");af.style.marginTop="8px";
  const an=inpE("","Nouveau cheval de cette écurie","Nom du nouveau cheval"),as=selSx("H");
  af.appendChild(an);af.appendChild(as);body.appendChild(af);
  const ab=btE("Ajouter ce cheval",()=>{const v=cl(an.value);if(!v)return;pushU();const id=Math.max(0,...H.map(h=>h.id))+1;
   H=H.concat([{id,nom:v,sx:as.value,ec:e,av:[],resp:rs[0]||"",com:"",ref:"",grp:"horse_"+id,wk:[],ak:[]}]);EO.add(e);parseWishes();eMsg(v+" ajouté à "+e+".");draw()},"main");
  ab.style.marginTop="6px";body.appendChild(ab);
  d.appendChild(body);d.addEventListener("toggle",()=>{if(d.open)EO.add(e);else EO.delete(e)});box.appendChild(d)});
 if(!shown)box.appendChild(mkE("p","sub",H.length?"Aucune écurie ne correspond au filtre.":"Aucune écurie : créez-en une ci-dessus ou importez un fichier CSV."))}
$("eq").oninput=drawEc;
$("eund").onclick=()=>{eMsg(undo()?"Dernière action annulée.":"Rien à annuler.")};
$("eauto").onclick=()=>{pushU();auto();eMsg("Placement automatique effectué.")};
$("eexp").onclick=()=>dl("ecuries.csv","\uFEFFécurie;club;cheval;sexe;cavalier;n° de réservation;box\n"+[...H].sort((a,b)=>a.ec.localeCompare(b.ec)||a.nom.localeCompare(b.nom)).map(h=>{const i=G.indexOf(h.id);return[qc(h.ec),qc(h.club),qc(h.nom),SEXN[h.sx],qc(h.resp),qc(h.ref),i>-1?boxName(i):""].join(";")}).join("\n"));
$("nef").onsubmit=ev=>{ev.preventDefault();
 const ec=cl($("ne_ec").value),rs=cl($("ne_resp").value),num=id=>Math.min(50,Math.max(0,parseInt($("ne_"+id).value)||0)),n={E:num("E"),H:num("H"),J:num("J")};
 if(!ec||n.E+n.H+n.J==0){eMsg("Indiquez l’écurie et au moins un cheval.");return}
 pushU();let id=Math.max(0,...H.map(h=>h.id));const stamp=Date.now(),lab=rs||ec,rf=cl($("ne_ref").value),nh=[];
 ["E","H","J"].forEach(sx=>{for(let j=1;j<=n[sx];j++){const p=sx!="H"&&j<=Math.min(n.E,n.J)?stamp+"_"+j:"";
  nh.push({id:++id,nom:lab+" "+(sx=="E"?"É":sx)+j,sx,ec,club:"",av:[],resp:rs,pair:p,grp:rf?"ref_"+norm(rf):"res_"+stamp,com:"",ref:rf,wk:[],ak:[]})}});
 H=H.concat(nh);parseWishes();EO.add(ec);$("nef").reset();eMsg(nh.length+" cheval(aux) ajouté(s) à "+ec+".");draw()};


/* ===== Sauvegarde / restauration complète ===== */
const bmsg=t=>{$("bmsg").textContent=t};
function cleanBackup(o){
 if(!o||!Array.isArray(o.H)||!Array.isArray(o.G)||!Array.isArray(o.P)||!o.P.length)return null;
 const P2=o.P.map((b,i)=>({n:String(b&&b.n||"Bloc "+String.fromCharCode(65+i%26)),al:Array.isArray(b&&b.al)?b.al.map(a=>({c:Math.min(60,Math.max(1,+a.c||1)),g:Array.isArray(a.g)?a.g.map(Number).filter(x=>x>0):[],b:Array.isArray(a.b)?a.b.map(Number).filter(x=>x>0):[]})):[]}));
 if(P2.some(b=>!b.al.length))return null;
 const ids=new Set(),H2=[];
 for(const h of o.H){if(!h||typeof h.nom!=="string"||!"EJHI".includes(h.sx)||typeof h.ec!=="string"||ids.has(h.id)||h.id==null)return null;ids.add(h.id);
  H2.push({id:h.id,nom:h.nom,sx:h.sx,ec:h.ec,club:String(h.club||""),av:Array.isArray(h.av)?h.av.filter(x=>x!=null):[],resp:String(h.resp||""),com:"",ref:String(h.ref||""),pair:h.pair||"",grp:String(h.grp||""),wk:[],ak:[]})}
 const n=P2.reduce((t,b)=>t+b.al.reduce((u,a)=>u+a.c,0),0);
 if(o.G.length!=n)return null;
 const seen=new Set(),G2=o.G.map(x=>{if(x==null||!ids.has(x)||seen.has(x))return null;seen.add(x);return x});
 return{H:H2,G:G2,P:P2,GROUP_MODE:["both","line","face"].includes(o.GROUP_MODE)?o.GROUP_MODE:"both",PERSON_LAYOUTS:o.PERSON_LAYOUTS&&typeof o.PERSON_LAYOUTS==="object"?Object.fromEntries(Object.entries(o.PERSON_LAYOUTS).filter(([,v])=>v==="line"||v==="face")):{},GROUP_AREAS:o.GROUP_AREAS&&typeof o.GROUP_AREAS==="object"?Object.fromEntries(Object.entries(o.GROUP_AREAS).filter(([,v])=>v==="exterior"||v==="interior")):{},GROUP_LAYOUTS:o.GROUP_LAYOUTS&&typeof o.GROUP_LAYOUTS==="object"?Object.fromEntries(Object.entries(o.GROUP_LAYOUTS).filter(([,v])=>v==="line"||v==="face")):{},NO_HOLES:typeof o.NO_HOLES==="boolean"?o.NO_HOLES:true,RULES:o.RULES&&typeof o.RULES==="object"?{EJ:["block","warn","allow"].includes(o.RULES.EJ)?o.RULES.EJ:"block",EE:["block","warn","allow"].includes(o.RULES.EE)?o.RULES.EE:"block",AV:["block","warn","allow"].includes(o.RULES.AV)?o.RULES.AV:"block",facing:!!o.RULES.facing}:{EJ:"block",EE:"block",AV:"block",facing:false}}}
$("bk").onclick=()=>{const d=new Date(),p=n=>String(n).padStart(2,"0"),
 name="sauvegarde-boxes-"+Concours.slug()+"-"+d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"-"+p(d.getHours())+"h"+p(d.getMinutes())+".json";
 dl(name,JSON.stringify({appli:"boxes-concours",version:1,concours:Concours.nom,date:d.toISOString(),H,G,P,GROUP_MODE,PERSON_LAYOUTS,GROUP_AREAS,GROUP_LAYOUTS,NO_HOLES,RULES},null,1));
 bmsg("Sauvegarde téléchargée : "+name+" ("+H.length+" chevaux, "+G.filter(x=>x!=null).length+" placés).")};
$("rst").onchange=e=>{const f=e.target.files[0];if(!f)return;
 readF(f,"utf-8",t=>{let c=null;try{c=cleanBackup(JSON.parse(t))}catch(err){}
  if(!c){bmsg("Fichier non reconnu : ce n’est pas une sauvegarde de cet outil. Rien n’a été modifié.");e.target.value="";return}
  pushU();P=c.P;GROUP_MODE=c.GROUP_MODE;PERSON_LAYOUTS=c.PERSON_LAYOUTS;GROUP_AREAS=c.GROUP_AREAS||{};GROUP_LAYOUTS=c.GROUP_LAYOUTS||{};NO_HOLES=c.NO_HOLES;RULES=c.RULES;rebuild();H=c.H;G=c.G;parseWishes();sel=null;last="";
  bmsg("Sauvegarde restaurée : "+H.length+" chevaux, "+G.filter(x=>x!=null).length+" placés. « Annuler » permet de revenir en arrière.");
  draw();e.target.value=""})};
$("tprep").onclick=()=>{TAB="prep";draw()};$("tp").onclick=()=>{TAB="plan";draw()};$("te").onclick=()=>{TAB="ec";draw()};
$("groupMode").onchange=()=>{pushU();GROUP_MODE=$("groupMode").value;$("prepMsg").textContent="Disposition enregistrée. Recréez le plan pour l’appliquer.";draw()};
[["ruleEJ","EJ"],["ruleEE","EE"],["ruleAV","AV"]].forEach(([id,key])=>$(id).onchange=()=>{pushU();RULES[key]=$(id).value;$("prepMsg").textContent="Règle enregistrée. Recréez le plan pour l’appliquer.";draw()});
$("ruleFacing").onchange=()=>{pushU();RULES.facing=$("ruleFacing").checked;$("prepMsg").textContent="Portée des règles mise à jour. Recréez le plan pour l’appliquer.";draw()};
$("prepStable").onchange=draw;$("prepFilter").oninput=draw;
$("prepBuild").onclick=()=>{pushU();TAB="plan";auto();setSt("Plan recalculé avec les groupes et la disposition choisis. « Annuler » permet de revenir au placement précédent.");$("prepMsg").textContent="Plan recréé avec la disposition choisie. « Annuler » restaure le plan précédent."};
$("pdf").onclick=()=>{$("printDate").textContent="Édité le "+new Intl.DateTimeFormat("fr-FR",{dateStyle:"long"}).format(new Date());window.print()};
parseWishes();$("q").oninput=draw;
try{const s=localStorage.getItem(Concours.key());if(s&&load(s))draw();else auto()}catch(e){auto()}
Concours.init();
