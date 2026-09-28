'use strict';
// DEEP BELOW v2 - UI, camp, HUD, input, main loop
const cv=$('game'),cx=cv.getContext('2d'),fxc=$('fx'),fx=fxc.getContext('2d'),wrap=$('wrap');
cv.width=VW;cv.height=VH;
let campViewport=false;
function resize(){
 campViewport=(state==='surface'&&CAMP.active)||state==='intro';wrap.classList.toggle('in-camp',campViewport);wrap.classList.toggle('in-intro',state==='intro');
 const portrait=innerWidth<700&&innerHeight>innerWidth,s=Math.min(innerWidth/VW,innerHeight/VH),w=campViewport?innerWidth:Math.floor(VW*s),h=campViewport?innerHeight:Math.floor(VH*s),areaH=portrait?innerHeight:h,d=Math.min(2,window.devicePixelRatio||1);
 wrap.style.width=w+'px';wrap.style.height=areaH+'px';
 cv.width=campViewport?Math.ceil(w/campPixelScale()):VW;cv.height=campViewport?Math.ceil(h/campPixelScale()):VH;
 for(const c of [cv,fxc]){c.style.height=h+'px';c.style.top=portrait&&!campViewport?Math.floor((innerHeight-h)*.43)+'px':'0'}
 fxc.width=Math.floor(w*d);fxc.height=Math.floor(h*d);wrap.style.fontSize=campViewport?'16px':portrait?'12px':Math.max(10,h/40)+'px';
}
addEventListener('resize',resize);resize();
const img=(src,c)=>`<img class='ic ${c||''}' src='${src}'>`;

// ---------- panels & messages ----------
const PANELS=['menu','surface','results','pause','confirm','info','victory','ng','story'];
function showPanel(n){if(n){clearInputs();$('interact').style.display='none'}for(const p of PANELS)$('p-'+p).classList.toggle('on',p===n)}
function toast(h,kind=''){const d=document.createElement('div');d.className='toast'+(kind?' '+kind:'');d.innerHTML=h;$('toasts').appendChild(d);setTimeout(()=>d.remove(),kind==='autosave'?3000:4600)}
let confirmAction=null;
function showConfirm(title,text,action){confirmAction=action;$('confirmbox').innerHTML=`<h2 class='c'>${title}</h2><p class='c dim'>${text}</p><div class='c sec'><button id='b-confirm-cancel'>CANCEL</button><button id='b-confirm-yes' class='go'>SELL UNLOCKED STOCK</button></div>`;showPanel('confirm')}
$('confirmbox').addEventListener('click',e=>{if(e.target.id==='b-confirm-cancel'){confirmAction=null;SND.ui();renderSurface()}else if(e.target.id==='b-confirm-yes'){const action=confirmAction;confirmAction=null;SND.ui();if(action)action();renderSurface()}});
function ach(id){if(!id||S.ach[id])return;const a=ACH.find(x=>x.id===id);if(!a)return;S.ach[id]=Date.now();save();toast(`<b>ACHIEVEMENT</b> &middot; ${a.n}<br><span class='dim'>${a.d}</span>`);SND.ach()}
let msgT=0,hintT=0,hintTut=false,promptS='',lastDeep=-1;
function msg(s,d){const m=$('msg');m.textContent=s;m.style.opacity=1;msgT=d}
function showHint(h,d){const e=$('hint');e.innerHTML=h;e.style.display='block';hintT=d;hintTut=false}
function hintOnce(k,h){if(S.seen[k])return;S.seen[k]=1;save();showHint(h,6)}
function setPrompt(s){if(s===promptS)return;promptS=s;const e=$('prompt');e.textContent=s;e.style.display=s?'block':'none'}
const TUT=[
['Move with <b>W A S D</b>. Aim with the mouse.',r=>r.moved>60],
['Hold <b>RIGHT MOUSE</b> (or LEFT with the pickaxe) to mine. Dig toward the colored ore veins.',r=>r.broke],
['Walk near ore chunks to scoop them into your <b>backpack</b>.',()=>P.pack.length>0],
['<b>1-6</b>, the mouse wheel, or holding <b>TAB</b> switches items. Left mouse uses the selected one.',r=>r.tutT>8],
['Your <b>lamp oil</b> is your clock. <b>Die, and you lose your backpack.</b>',r=>r.tutT>7],
['Return to a <b>LIFT</b> (follow the arrow) and press <b>SPACE</b>. Then craft or sell at camp.',r=>r.tutT>9]];
function tickUI(dt){
 if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').style.opacity=0}
 if(hintT>0){hintT-=dt;if(hintT<=0&&!hintTut)$('hint').style.display='none'}
 if(state==='run'&&RUN&&P&&!paused){if(RUN.deep!==lastDeep){lastDeep=RUN.deep;packDirty=true}
  if(RUN.tut>=0&&!P.dead){RUN.tutT+=dt;const s=TUT[RUN.tut];if(hintT<=0&&!hintTut){const e=$('hint');e.innerHTML=s[0];e.style.display='block';hintTut=true}
   if(s[1](RUN)){RUN.tut++;RUN.tutT=0;hintTut=false;if(hintT<=0)$('hint').style.display='none';if(RUN.tut>=TUT.length){RUN.tut=-1;S.tut=true;save()}}}}
 else if(hintTut){hintTut=false;$('hint').style.display='none'}}

// ---------- HUD ----------
let lastTools='',hotSig='';const mc=$('mini').getContext('2d');
function slotIcon(i){const s=SLOTS[i];if(s==='pick')return gearIcon('pick',S.gear.pick);if(s==='sword')return gearIcon('sword',S.gear.sword);if(s==='bow')return gearIcon('bow',S.gear.bow);return IC[s]}
function slotCount(i){const s=SLOTS[i];if(s==='bow')return S.gear.bow>=0&&BOWS[S.gear.bow].ammo?S.cons.bolts:'';if(s==='dyn'||s==='flare'||s==='tonic')return S.cons[s]||0;return''}
function slotName(i){const s=SLOTS[i];if(s==='pick')return PICKS[S.gear.pick].n;if(s==='sword')return S.gear.sword>=0?SWORDS[S.gear.sword].n:'No sword';if(s==='bow')return S.gear.bow>=0?BOWS[S.gear.bow].n:'No ranged';return ITEMS[s].n}
function drawHotbar(){const sig=P.slot+'|'+SLOTS.map((s,i)=>slotOK(i)+':'+slotCount(i)).join(',')+S.gear.pick+S.gear.sword+S.gear.bow;if(sig===hotSig&&!hotDirty)return;hotSig=sig;hotDirty=false;
 let h='';for(let i=0;i<SLOTS.length;i++){h+=`<button aria-label='${slotName(i)}' data-slot='${i}' class='hs ${i===P.slot?'sel':''} ${slotOK(i)?'':'off'}'><span class='n'>${i+1}</span><img src='${slotIcon(i)}'><span class='c'>${slotCount(i)}</span></button>`}$('hotbar').innerHTML=h;
 let w='';for(let i=0;i<SLOTS.length;i++){const a=i/SLOTS.length*6.283-1.571;w+=`<div class='ws ${slotOK(i)?'':'off'}' id='ws${i}' style='left:${50+Math.cos(a)*36}%;top:${50+Math.sin(a)*36}%'><img src='${slotIcon(i)}'></div>`}w+=`<div class='wl' id='wlab'></div>`;$('wheel').innerHTML=w}
let wheelOn=false,wheelSel=-1;
function updWheel(){const on=!!K.tab&&state==='run'&&!paused&&P&&!P.dead;if(on!==wheelOn){wheelOn=on;$('wheel').style.display=on?'block':'none';if(!on&&wheelSel>=0){selectSlot(wheelSel);wheelSel=-1}if(on){hotDirty=true;drawHotbar()}}
 if(!on)return;const dx=M.x-VW/2,dy=M.y-VH/2;let sel=P.slot;if(Math.hypot(dx,dy)>12){let a=Math.atan2(dy,dx)+1.571;if(a<0)a+=6.283;sel=Math.round(a/(6.283/SLOTS.length))%SLOTS.length}
 if(sel!==wheelSel){wheelSel=sel;for(let i=0;i<SLOTS.length;i++){const e=$('ws'+i);if(e)e.classList.toggle('hi',i===sel)}const l=$('wlab');if(l)l.textContent=slotName(sel)}}
function updHUD(){
 $('hpf').style.width=clamp(P.hp/P.mhp*100,0,100)+'%';$('hpt').textContent=Math.ceil(Math.max(0,P.hp));
 $('oilf').style.width=clamp(P.oil/P.moil*100,0,100)+'%';$('oilt').textContent=P.oil>0?Math.ceil(P.oil)+'s':'OUT';
 $('depth').textContent=Math.floor(P.y/TS*1.5)+actDepth(ACT)+' m \u00b7 '+LAYERS[curLayer].name;
 const w=[];if(P.oil<=0)w.push('LAMP OUT');const pr=pressureRate(curLayer);if(pr>0)w.push('PRESSURE -'+pr.toFixed(1)+' HP/s');if(RUN.dark>0)w.push('DARKNESS');$('warn').textContent=w.join(' \u00b7 ');
 if(packDirty){packDirty=false;const cnt={};for(const id of P.pack)cnt[id]=(cnt[id]||0)+1;const ids=Object.keys(cnt).sort((a,b)=>ITEMS[b].v-ITEMS[a].v),val=P.pack.reduce((s,id)=>s+ITEMS[id].v,0),full=P.pack.length>=P.cap;
  let h=`<div id='packv' class='${full?'full':''}'>$${fmt(val)}</div><div class='dim'>BACKPACK ${P.pack.length}/${P.cap}</div>`;const gd=gdepth(RUN.deep);if(gd>0)h+=`<div class='gold'>+${Math.round(gd*10*modBonus())}% depth bonus</div>`;
  for(const id of ids)h+=`<span class='it'><img src='${ICONURL[id]}'>${cnt[id]}</span>`;$('pack').innerHTML=h}
 const sc=Math.max(lv('scan'),S.exp.loadout==='surveyor'||ench('pick','pulse')?1:0),tl=`<div><span class='k'>RMB</span>Mine</div><div><span class='k'>Q</span>Tonic <span class='k'>F</span>Flare</div><div><span class='k'>R</span>Rope \u00d7${S.cons.rope}</div>`+(sc?`<div><span class='k'>E</span>Interact / Scan ${P.scanCD>0?Math.ceil(P.scanCD)+'s':'READY'}</div>`:'');
 if(tl!==lastTools){lastTools=tl;$('tools').innerHTML=tl}
 drawHotbar();updWheel();const fs=UTILITIES.map(u=>(S.cons[u.id]||0)+u.id).join('|');if($('fieldtools').dataset.sig!==fs){$('fieldtools').dataset.sig=fs;$('fieldtools').innerHTML=UTILITIES.filter(u=>S.cons[u.id]>0).map(u=>`<button data-field='${u.id}'>${u.n} ×${S.cons[u.id]}</button>`).join('')}
 const bb=$('bossbar'),show=boss&&!boss.dead&&boss.st!=='sleep'&&Math.hypot(boss.x-P.x,boss.y-P.y)<TS*30;bb.style.display=show?'block':'none';if(show){$('bossn').textContent=ENAME[boss.type]+(boss.ph===2?'  \u2620':'');$('bossf').style.width=clamp(boss.hp/boss.mhp*100,0,100)+'%'}
 drawMini()}
function drawMini(){mc.imageSmoothingEnabled=false;mc.fillStyle='#000';mc.fillRect(0,0,144,120);const pty=Math.floor(P.y/TS),sy=clamp(pty-30,0,MH-60);mc.drawImage(mm,0,sy,72,60,0,0,144,120);
 for(const p of POIS)if((p.seen||p.critical)&&!p.done&&p.y/TS>=sy&&p.y/TS<sy+60){mc.fillStyle=p.contract?'#83dfda':'#d5c58b';mc.fillRect(p.x/TS*2-1,(p.y/TS-sy)*2-1,3,3)}
 for(const i of RUN.act){const l=lifts[i];if(l&&l.y>=sy-1&&l.y<sy+60){mc.fillStyle='#f0c860';mc.fillRect(l.x*2,(l.y-sy)*2,4,4)}}
 if(boss&&!boss.dead){const by=Math.floor(boss.y/TS);if(by>=sy&&by<sy+60&&expl[I(Math.floor(boss.x/TS),by)]){mc.fillStyle='#d04030';mc.fillRect(Math.floor(boss.x/TS)*2-2,(by-sy)*2-2,5,5)}}
 if(RUN.scanT>0)for(const s of RUN.scan){const t=tAt(s.x,s.y);if(!(TI[t].ore||t===T.CHEST)||s.y<sy||s.y>=sy+60)continue;mc.fillStyle=t===T.CHEST?'#e0b050':css(ITEMS[TI[t].ore].c);mc.fillRect(s.x*2,(s.y-sy)*2,2,2)}
 if(Math.floor(TT*4)%2===0){mc.fillStyle='#fff';mc.fillRect(Math.floor(P.x/TS)*2-1,(pty-sy)*2-1,3,3)}}

// ---------- quests ----------
function qBase(q){if(!q)return 0;const s=S.stats;switch(q.t){case 'sold':return s.sold;case 'kills':return s.kills;case 'kt':return s.kt[q.et]||0;default:return 0}}
function qProg(q){const s=S.stats;switch(q.t){case 'sold':return[Math.min(q.goal,s.sold-S.qb),q.goal];case 'craftw':return[(S.gear.sword>=0||S.gear.bow>=0)?1:0,1];case 'kills':return[Math.min(q.goal,s.kills-S.qb),q.goal];case 'kt':return[Math.min(q.goal,(s.kt[q.et]||0)-S.qb),q.goal];
 case 'reach':return[(S.reached[q.a]!=null&&S.reached[q.a]>=q.l)?1:0,1];case 'deliver':return[Math.min(q.goal,S.mats[q.item]||0),q.goal];case 'boss':return[S.boss[q.b]?1:0,1]}return[0,1]}
function rwText(rw){const a=[];if(rw.m)a.push('$'+fmt(rw.m));for(const k in rw)if(k!=='m')a.push(rw[k]+' '+(k==='bolts'?'bolts':ITEMS[k].n+(rw[k]>1?'s':'')));return a.join(' + ')}
function claimQuest(){const q=QUESTS[S.q];if(!q)return;const p=qProg(q);if(p[0]<p[1])return;if(q.t==='deliver')S.mats[q.item]-=q.goal;if(q.rw.m){S.money+=q.rw.m;S.stats.earned+=q.rw.m}for(const k in q.rw)if(k!=='m')S.cons[k]=(S.cons[k]||0)+q.rw[k];
 S.q++;S.qb=qBase(QUESTS[S.q]);if(S.q>=7)ach('quests');save();SND.quest();toast(`<b>QUEST COMPLETE</b> &middot; ${q.n}<br><span class='dim'>Reward: ${rwText(q.rw)}</span>`)}

// ---------- camp ----------
let TAB='forge';
function reqHTML(c,m){let h='';for(const k in c){const have=S.mats[k]||0,ok=have>=c[k];h+=`<div class='${ok?'ok':'no'}'><img class='ic s' src='${ICONURL[k]}'>${ITEMS[k].n} ${have}/${c[k]}</div>`}if(m)h+=`<div class='${S.money>=m?'ok':'no'}'>$${fmt(m)}</div>`;return h}
const canPay=(c,m)=>{if(m&&S.money<m)return false;if(c)for(const k in c)if((S.mats[k]||0)<c[k])return false;return true};
const pay=(c,m)=>{if(m)S.money-=m;if(c)for(const k in c)S.mats[k]-=c[k]};
function gearStat(g,i){if(i<0)return'None';const x=GEAR[g][i];if(g==='pick')return'Power '+x.pw;if(g==='sword')return'Damage '+x.dmg+(x.slow?' \u00b7 slows':'');if(g==='bow')return'Damage '+x.dmg+' \u00b7 '+(1/x.rate).toFixed(1)+'/s'+(x.ammo?' \u00b7 bolts':'')+(x.pierce?' \u00b7 pierce':'')+(x.slow?' \u00b7 slows':'');return'Blocks '+Math.round(x.dr*100)+'% dmg'}
function tabForge(){let h=`<div class='grid'>`;for(const g of['pick','sword','bow','armor']){const cur=S.gear[g],list=GEAR[g],nx=list[cur+1];
 h+=`<div class='card'><h3>${GEARN[g].toUpperCase()}</h3><div class='ch'>${img(gearIcon(g,cur),'l')}<div><b>${cur>=0?list[cur].n:'Nothing'}</b><br><span class='dim'>${gearStat(g,cur)}</span><br><span class='gold'>${ENCHANTS[g].find(e=>e.id===S.exp.ench[g])?.n||'No branch equipped'}</span></div></div>`;
 if(nx){h+=`<div class='sec dim'>NEXT</div><div class='ch'>${img(gearIcon(g,cur+1))}<div><b>${nx.n}</b><br><span class='dim'>${gearStat(g,cur+1)}</span></div></div><div class='req'>${reqHTML(nx.c,nx.m)}</div><button data-craft='${g}' ${canPay(nx.c,nx.m)?'':'disabled'}>FORGE</button>`}else h+=`<p class='gold'>Mastered.</p>`;h+=`</div>`}
 return h+`</div><p class='dim sec'>Your pickaxe decides which layer seals you can break. Right mouse always mines.</p>`}
function tabMarket(){const ids=Object.keys(S.mats).filter(k=>S.mats[k]>0&&!S.exp.protected[k]).sort((a,b)=>ITEMS[b].v-ITEMS[a].v),mb=modBonus()*(mod('oath')?.5:1);let tot=0;for(const k of ids)tot+=Math.round(ITEMS[k].v*mb)*S.mats[k];
 let h=`<div class='row'><span class='dim'>Materials are your crafting stock. Sell what you do not need.${mb>1?' Challenge bonus: +'+Math.round((mb-1)*100)+'%':''}</span><button data-sellall='1' ${tot?'':'disabled'}>SELL UNLOCKED STOCK ($${fmt(tot)})</button></div><div class='sec'>`;
 if(!ids.length)h+=`<p class='dim'>Your stash is empty. Bring ore up from the deep.</p>`;for(const k of ids){const p=Math.round(ITEMS[k].v*mb);h+=`<div class='mrow'>${img(ICONURL[k],'s')}<span class='nm'>${ITEMS[k].n}</span><span>\u00d7${S.mats[k]}</span><span class='gold'>$${fmt(p)} ea</span><button class='sm' data-sell='${k}' data-n='1'>SELL 1</button><button class='sm' data-sell='${k}' data-n='all'>SELL ALL</button></div>`}return h+`</div>`}
function tabSupplies(){let h=`<div class='grid g5'>`;for(const s of SUP){const have=S.cons[s.id]||0,full=have>=s.max;h+=`<div class='card'><div class='ch'>${img(IC[s.id])}<h3>${s.n}</h3></div><p>${s.d}</p><div class='dim'>Carrying ${have}/${s.max}</div><button data-buy='${s.id}' ${full||S.money<s.m?'disabled':''}>BUY $${s.m}</button>`;if(s.c)h+=`<div class='req'>${reqHTML(s.c)}</div><button data-mk='${s.id}' ${full||!canPay(s.c)?'disabled':''}>CRAFT</button>`;h+=`</div>`}return h+`</div>`}
function tabUpgrades(){let h=`<div class='grid g5'>`;for(const u of UPG){const l=lv(u.id),mx=l>=u.max,c=cost(u);h+=`<div class='card'><div class='ch'>${img(IC['up_'+u.id])}<h3>${u.n}</h3></div><div class='pips'>${'\u25a0'.repeat(l)}${'\u25a1'.repeat(u.max-l)}</div><p>${u.d}</p><div class='dim'>${u.v(l)}${mx?'':' &rarr; '+u.v(l+1)}</div><button data-up='${u.id}' ${mx||S.money<c?'disabled':''}>${mx?'MAX':'$'+fmt(c)}</button></div>`}return h+`</div>`}
function tabQuests(){const q=QUESTS[S.q];let h=`<div class='npc'>${img(IC.npc)}<div style='flex:1'><h3>OLD MARROW, QUARTERMASTER</h3>`;
 if(!q){h+=`<div class='say'>You did it. The king is dead and the deep is quiet... for now. Go on, dig as you please. Or start over and make it hurt.</div>`}
 else{const p=qProg(q),done=p[0]>=p[1];h+=`<div class='say'>\u201c${q.say}\u201d</div><b class='gold'>${q.n}</b><div>${q.d}</div><div class='qbar'><div style='width:${p[0]/p[1]*100}%'></div></div><div class='row'><span class='dim'>Progress ${Math.max(0,p[0])}/${p[1]} &middot; Reward: ${rwText(q.rw)}</span><button data-claim='1' ${done?'':'disabled'}>${q.t==='deliver'?'HAND OVER':'CLAIM'}</button></div>`}
 h+=`<div class='dim sec'>Quests completed: ${Math.min(S.q,QUESTS.length)}/${QUESTS.length}</div></div></div>`;return h}
function sell(id,n){if(S.exp.protected[id]||!ITEMS[id])return;const c=S.mats[id]||0;n=n==='all'?c:Math.min(c,n);if(n<=0)return;const v=Math.round(ITEMS[id].v*modBonus()*(mod('oath')?.5:1))*n;S.mats[id]-=n;S.money+=v;S.stats.sold+=v;S.stats.earned+=v;if(S.stats.earned>=50000)ach('rich')}
$('surf').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;AU.init();const d=b.dataset;
 if(d.tab){TAB=d.tab;SND.ui()}
 else if(d.craft){const g=d.craft,nx=GEAR[g][S.gear[g]+1];if(nx&&canPay(nx.c,nx.m)){pay(nx.c,nx.m);S.gear[g]++;S.stats.crafted++;if(g==='sword'||g==='bow')S.stats.craftw++;ach('smith');if(S.gear.sword>=0&&S.gear.bow>=0&&S.gear.armor>=0)ach('arsenal');if(g==='pick'&&S.gear.pick>=PICKS.length-1)ach('maxpick');SND.craft();toast(`<b>FORGED</b> &middot; ${nx.n}`)}}
 else if(d.sell){sell(d.sell,d.n==='all'?'all':1);SND.buy()}
 else if(d.sellall){showConfirm('SELL UNLOCKED STOCK?','Unlocked stock will be sold. Materials may be needed for your contract or next gear recipe. Lock anything you want to keep in Safe Storage.',()=>{for(const k of Object.keys(S.mats))sell(k,'all');save();SND.buy()});return}
 else if(d.buy){const s=SUP.find(x=>x.id===d.buy);if(S.money>=s.m&&(S.cons[s.id]||0)<s.max){S.money-=s.m;S.cons[s.id]=Math.min(s.max,(S.cons[s.id]||0)+s.q);SND.buy()}}
 else if(d.mk){const s=SUP.find(x=>x.id===d.mk);if(canPay(s.c)&&(S.cons[s.id]||0)<s.max){pay(s.c);S.cons[s.id]=Math.min(s.max,(S.cons[s.id]||0)+s.q);SND.craft()}}
 else if(d.up){const u=UPG.find(x=>x.id===d.up),c=cost(u);if(S.money>=c&&lv(u.id)<u.max){S.money-=c;S.up[u.id]=lv(u.id)+1;SND.buy()}}
 else if(d.claim)claimQuest();
 else if(d.act!=null){S.act=+d.act;S.startL=0;SND.ui()}
 else if(d.layer!=null){S.startL=+d.layer;SND.ui()}
 else if(b.id==='b-menu'){SND.ui();save();showMenu();return}
 else if(b.id==='b-ngc'){SND.ui();showNG();return}
 else if(b.id==='b-go'){SND.ui();save();startRun(S.act,S.startL);return}
 save();renderSurface()});

// ---------- results, victory, new game+ ----------
function showResults(o){const cnt={};for(const id of o.kept)cnt[id]=(cnt[id]||0)+1;const ids=Object.keys(cnt).sort((a,b)=>ITEMS[b].v-ITEMS[a].v);
 let h=(o.expansion||'')+`<h2 class='c'>${o.won?'A CHAPTER CLOSES':o.ok?'YOU MADE IT OUT':'LOST IN THE DARK'}</h2><div class='list'><div class='dim c'>Reached ${o.maxD+actDepth(o.a)} m &middot; ${ACTS[o.a].layers[o.deep].name} &middot; ${Math.floor(o.time/60)}m ${Math.floor(o.time%60)}s</div><div class='sec'>`;
 if(!o.ok&&ids.length)h+=`<div class='dim'>Your Salvage Pouch saved:</div>`;if(!ids.length)h+=`<div class='dim'>${o.ok?'You came back empty-handed.':'Your backpack is lost to the deep.'}</div>`;
 for(const id of ids)h+=`<div class='row'><span><img src='${ICONURL[id]}'>${ITEMS[id].n} &times;${cnt[id]}</span><span>$${fmt(ITEMS[id].v*cnt[id])}</span></div>`;
 h+=`</div><div class='sec'>`;if(ids.length)h+=`<div class='row dim'><span>Added to your stash (worth)</span><span>$${fmt(o.base)}</span></div>`;if(o.bonus)h+=`<div class='row'><span>Depth bonus paid in cash</span><span class='gold'>+$${fmt(o.bonus)}</span></div>`;if(o.lost)h+=`<div class='row'><span class='bad'>Lost in the dark</span><span class='bad'>-$${fmt(o.lost)}</span></div>`;
 h+=`<div class='row dim'><span>Wallet</span><span>$${fmt(S.money)}</span></div></div></div><div class='c sec'><button id='b-cont' class='go'>CONTINUE</button></div>`;$('res').innerHTML=h;showPanel('results')}
$('res').addEventListener('click',e=>{if(e.target.id==='b-cont'){SND.ui();TAB=S.won&&!S.seenWin?'quests':TAB;if(S.won)S.seenWin=true;renderSurface()}});
function showVictory(){paused=true;M.l=M.r=false;MUS.set('victory');const s=S.stats;$('vic').innerHTML=`<h2 class='c'>YOU WIN</h2><div class='c'>${img(IC.king,'l')}</div><p class='c sec'>The Hollow King falls. Beneath his throne, the Sunken Root opens. Iona is still below.</p><div class='list sec'><div class='row'><span>Expeditions</span><span class='gold'>${s.runs}</span></div><div class='row'><span>Creatures defeated</span><span class='gold'>${s.kills}</span></div><div class='row'><span>Total earned</span><span class='gold'>$${fmt(s.earned)}</span></div><div class='row'><span>Challenges active</span><span class='gold'>${S.mods.length}</span></div></div><p class='dim sec c'>Escape with the Crown. The five layers of <b>The Sunken Root</b> are now available from camp. Follow Iona’s memories and decide what the mine will become.</p><div class='c sec'><button id='b-vic' class='go'>ESCAPE WITH THE CROWN</button></div>`;showPanel('victory')}
$('vic').addEventListener('click',e=>{if(e.target.id==='b-vic'){paused=false;showPanel(null);endRun(true)}});
let ngSel=[];
function showNG(){ngSel=S.mods.slice();drawNG();showPanel('ng')}
function drawNG(){let h=`<h2 class='c'>NEW GAME+</h2><p class='dim'>Begin a new mining season. Gear, money and route unlocks reset. Your camp, journal, collections, enchantments and relationships endure. Pick challenges: each one adds <b class='gold'>+15%</b> to all ore payouts.</p><div class='sec'>`;
 for(const m of MODS)h+=`<div class='mod ${ngSel.includes(m.id)?'on':''}' data-mod='${m.id}'><b>${ngSel.includes(m.id)?'\u2620':'\u25cb'}</b><span><b>${m.n}</b><br><span class='dim'>${m.d}</span></span></div>`;
 h+=`</div><div class='row sec'><button id='b-ngx'>CANCEL</button><span class='gold'>Payout x${(1+ngSel.length*.15).toFixed(2)}</span><button id='b-ngs' class='go'>BEGIN</button></div>`;$('ngbox').innerHTML=h}
$('ngbox').addEventListener('click',e=>{const m=e.target.closest('[data-mod]');if(m){const id=m.dataset.mod;ngSel=ngSel.includes(id)?ngSel.filter(x=>x!==id):ngSel.concat([id]);SND.ui();drawNG();return}
 if(e.target.id==='b-ngx'){SND.ui();if(state==='surface')renderSurface();else showMenu()}
 else if(e.target.id==='b-ngs'){if(!confirm('Start New Game+? Money, gear, upgrades, materials and unlocks reset.'))return;const d=defSave();for(const k of['money','up','gear','mats','cons','unl','act','startL','reached','boss','q'])S[k]=d[k];S.mods=ngSel.slice();S.ng=(S.ng||0)+1;S.qb=qBase(QUESTS[0]);S.tut=true;S.checkpoint=null;S.lastResult=null;CAMP.active=false;CAMP.menu=null;if(S.mods.length)ach('ng');save();SND.quest();TAB='forge';renderSurface()}});

// ---------- info screens ----------
let infoBack='menu';
function showInfo(h,back){infoBack=back;$('info').innerHTML=`<button id='b-info-close' class='info-close'>BACK</button>`+h+`<div class='c sec'><button id='b-back'>BACK</button></div>`;showPanel('info')}
const HOW=`<h2>HOW TO PLAY</h2><p><b>Your first trip:</b> Follow the guided arrival scene and follow the gold trail to the lift. Below, mine two copper and follow blue lamps to Iona’s relay. Return to the starting lift and press E to bank your haul. You do not need to reach the bottom.</p><p>In camp, <b>GUIDE / ?</b> explains your next step. <b>PLACES / C</b> shows every building symbol and can mark a walking route.</p><div class='list'>
<p><b class='gold'>The loop.</b> Descend, mine, fight, and get back to a lift before your lamp dies. Ore goes into your <b>stash</b>: forge gear with it or sell it at the Market.</p>
<p class='sec'><b class='gold'>The risk.</b> Die and your backpack is lost. Deeper layers pay a cash depth bonus but hit much harder.</p>
<p class='sec'><b class='gold'>Gear.</b> Forge pickaxes (they break layer seals), swords, ranged weapons and armor. Old Marrow gives quests with rewards.</p>
<p class='sec'><b class='gold'>Bosses.</b> The Brood Mother waits at the bottom of the Old Mine. Kill her to open the Frozen Deep. The Hollow King guards the Sunken Root. The Root Sovereign waits beneath five living layers.</p>
<p class='sec'><b class='gold'>Controls.</b> WASD / arrows move &middot; E interact (scanner away from objects) &middot; Z lantern pulse &middot; LMB use selected item &middot; RMB mine &middot; 1-6 or wheel select &middot; hold TAB weapon wheel &middot; Q tonic &middot; F flare &middot; R rope &middot; SPACE lift &middot; ESC pause</p>
<p class='sec'><b class='gold'>Camp.</b> Walk to stations and press E. C opens shortcuts after discovery; J opens your journal. Lock materials in Safe Storage before selling. Rebuild the refinery for bars and the forge for equipment branches.</p><p class='sec'><b class='gold'>Utilities.</b> B bridge, G decoy, H heat pack, V memory recorder, Y pollen infusion. Craft them at the restored Workshop. Z pulses your lantern every 18 seconds.</p><p class='sec'><b class='gold'>Tips.</b> Crawlers shudder before they charge. Cracked ground means a burrower. Red circles are about to explode. Stalkers and wraiths fear flares.</p></div>`;
function achHTML(){const n=ACH.filter(a=>S.ach[a.id]).length;let h=`<h2>ACHIEVEMENTS <span class='dim'>${n}/${ACH.length}</span></h2>`;for(const a of ACH){const on=!!S.ach[a.id];h+=`<div class='ach ${on?'':'off'}'><span class='ic'>${on?'\u2605':'\u2606'}</span><span><b>${a.n}</b><br><span class='dim'>${a.d}</span></span></div>`}return h}
function statsHTML(){const s=S.stats,row=(a,b)=>`<div class='row'><span>${a}</span><span class='gold'>${b}</span></div>`,tm=Math.floor(s.time/60);
 return `<h2>STATISTICS</h2><div class='list'>`+row('Expeditions',fmt(s.runs))+row('Escapes',fmt(s.escapes))+row('Deaths',fmt(s.deaths))+row('Total earned','$'+fmt(s.earned))+row('Sold at market','$'+fmt(s.sold))+row('Best haul','$'+fmt(s.best))+row('Deepest point',fmt(s.deepest)+' m')+row('Blocks mined',fmt(s.mined))+row('Ore mined',fmt(s.ores))+row('Gear forged',fmt(s.crafted))+row('Rare discoveries',fmt(s.rares))+row('Creatures defeated',fmt(s.kills))+row('Bosses slain',(S.boss.brood?1:0)+(S.boss.king?1:0)+(S.boss.sovereign?1:0)+'/3')+row('Wins',fmt(S.wins||0))+row('New Game+ level',fmt(S.ng||0))+row('Time underground',Math.floor(tm/60)+'h '+(tm%60)+'m')+`</div>`}
function settingsHTML(){const sl=(id,n,min,max)=>`<label>${n}<span><input type='range' min='${min}' max='${max}' step='0.05' value='${S.set[id]}' data-set='${id}'> <span id='v-${id}'>${Math.round(S.set[id]*100)}%</span></span></label>`;
 return `<h2>SETTINGS</h2>${sl('master','Master volume',0,1)}${sl('music','Music',0,1)}${sl('sfx','Sound effects',0,1)}${sl('shake','Screen shake',0,1.5)}${sl('contrast','Extra cave contrast',0,1)}${sl('reduced','Reduced motion',0,1)}${sl('parts','Particles',0,1)}<div class='sec c'><button id='b-reset'>RESET SAVE</button></div>`}
$('info').addEventListener('click',e=>{if(e.target.id==='b-back'||e.target.id==='b-info-close'){SND.ui();if(infoBack==='menu')showMenu();else showPanel(infoBack)}
 else if(e.target.id==='b-reset'){if(confirm('Erase ALL progress? This cannot be undone.')){try{localStorage.removeItem(SKEY)}catch(err){}storageLocked=false;storageWarning='';S=defSave();CAMP.active=false;save();AU.vol();showMenu()}}});
$('info').addEventListener('input',e=>{const id=e.target.dataset.set;if(!id)return;S.set[id]=+e.target.value;AU.vol();save();const o=$('v-'+id);if(o)o.textContent=Math.round(S.set[id]*100)+'%'});

// ---------- menu & pause ----------
function showMenu(){state='menu';clearInputs();$('hud').style.display='none';$('campbar').style.display='none';$('objective').style.display='none';$('interact').style.display='none';$('touch-controls').classList.remove('on');$('b-play').textContent=S.checkpoint?'RESUME EXPEDITION':S.lastResult?'VIEW LAST RETURN':!S.exp.flags.briefed&&!S.stats.runs&&!S.ng?'BEGIN YOUR STORY':'ENTER CAMP';$('b-ngp').style.display=S.won?'block':'none';showPanel('menu');if(MUS.mode!=='menu')MUS.set('menu',0,0)}
const btn=(id,f)=>$(id).addEventListener('click',()=>{AU.init();SND.ui();f()});
btn('b-play',()=>{if(storageLocked){showInfo('<h2>SAVE RECOVERY</h2><p>'+esc(storageWarning)+'</p>','menu');return}if(S.checkpoint)resumeExpedition();else if(S.lastResult){state='results';showResults(S.lastResult)}else enterCamp()});btn('b-ngp',()=>showNG());
btn('b-how',()=>showInfo(HOW,'menu'));btn('b-ach',()=>showInfo(achHTML(),'menu'));btn('b-stats',()=>showInfo(statsHTML(),'menu'));btn('b-set',()=>showInfo(settingsHTML(),'menu'));
btn('b-save',()=>downloadSave());btn('b-load',()=>$('save-file').click());
btn('b-resume',()=>togglePause());btn('b-pset',()=>showInfo(settingsHTML(),'pause'));btn('b-phow',()=>showInfo(HOW,'pause'));btn('b-pcamp',()=>showInfo(guideHTML(false),'pause'));
$('save-file').addEventListener('change',e=>{importSaveFile(e.target.files[0],err=>{e.target.value='';if(err){alert(err.message);return}paused=false;P=null;state='menu';AU.vol();CAMP.active=false;CAMP.menu=null;showMenu()})});
btn('b-abandon',()=>{if(confirm('Abandon this run? Your backpack will be lost.')){paused=false;showPanel(null);P.hp=0;P.dead=1;endRun(false)}});
function togglePause(){if(state!=='run'||!P||P.dead||$('p-victory').classList.contains('on'))return;paused=!paused;M.l=M.r=false;showPanel(paused?'pause':null)}

// ---------- input ----------
function toGame(e){const r=cv.getBoundingClientRect();M.x=(e.clientX-r.left)/r.width*VW;M.y=(e.clientY-r.top)/r.height*VH}
addEventListener('mousemove',toGame);
cv.addEventListener('mousedown',e=>{AU.init();toGame(e);e.preventDefault();if(state!=='run'||paused||!P||P.dead||wheelOn)return;if(e.button===0){M.l=true;M.lp=true;if(P.slot>=3){useSlot();M.lp=false}}else if(e.button===2)M.r=true});
cv.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;AU.init();toGame(e.touches[0]);if(state==='run'&&!paused&&P&&!P.dead&&!wheelOn){M.l=true;M.lp=true;if(P.slot>=3){useSlot();M.lp=false}}e.preventDefault()},{passive:false});
cv.addEventListener('touchmove',e=>{if(e.touches.length===1){toGame(e.touches[0]);e.preventDefault()}},{passive:false});
cv.addEventListener('touchend',e=>{M.l=false;e.preventDefault()},{passive:false});
addEventListener('mouseup',e=>{if(e.button===0)M.l=false;else if(e.button===2)M.r=false});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{if(state==='run'&&!paused&&P){e.preventDefault();cycleSlot(e.deltaY>0?1:-1)}},{passive:false});
const touchControls=$('touch-controls');
touchControls.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-touch-key],[data-touch-hold],[data-touch-action]');if(!el)return;e.preventDefault();if(e.isTrusted)el.setPointerCapture?.(e.pointerId);const key=el.dataset.touchKey,hold=el.dataset.touchHold,action=el.dataset.touchAction;if(key){K[key]=true;el.classList.add('on')}else if(hold){if(hold==='use'){M.l=true;M.lp=true;if(state==='run'&&!paused&&P&&!P.dead&&P.slot>=3){useSlot();M.lp=false;}}else if(hold==='mine')M.r=true;el.classList.add('on')}else if(action==='interact'){if(state==='intro')interactIntro();else if(state==='surface')campInteract();else interactWorld()}else if(action==='ability')useAbility();else if(state!=='run'||paused||!P||P.dead)return;else if(action==='tonic')useTonic();else if(action==='flare')throwFlare();else if(action==='scan')doScan();else if(action==='rope')useRope();else if(action==='pause')togglePause()});
touchControls.addEventListener('pointerup',e=>{const el=e.target.closest('[data-touch-key],[data-touch-hold]');if(!el)return;e.preventDefault();const key=el.dataset.touchKey,hold=el.dataset.touchHold;if(key)K[key]=false;if(hold==='use')M.l=false;if(hold==='mine')M.r=false;el.classList.remove('on')});
touchControls.addEventListener('pointercancel',e=>{const el=e.target.closest('[data-touch-key],[data-touch-hold]');if(!el)return;const key=el.dataset.touchKey,hold=el.dataset.touchHold;if(key)K[key]=false;if(hold==='use')M.l=false;if(hold==='mine')M.r=false;el.classList.remove('on')});
addEventListener('click',()=>AU.init());
addEventListener('keydown',e=>{AU.init();const k=e.key.toLowerCase();if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||(e.target.tagName==='BUTTON'&&(k===' '||k==='enter')))return;if((state==='intro'||state==='run'&&!paused)&&(k===' '||k.startsWith('arrow')||k==='tab'))e.preventDefault();K[k]=true;if(e.repeat)return;
 if(state!=='run'||!P)return;if(k==='escape'){togglePause();return}if(paused||P.dead)return;
 if(k>='1'&&k<='6')selectSlot(+k-1);else if(k==='e')interactWorld();else if(k==='q')useTonic();else if(k==='f')throwFlare();else if(k==='r')useRope();else if(k===' '&&RUN.onLift>=0)endRun(true)});
addEventListener('keyup',e=>{K[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{for(const k in K)K[k]=false;M.l=M.r=false;if(state==='run'&&!paused&&P&&!P.dead)togglePause()});

// ---------- attract mode & loop ----------
const A={x:MW*TS/2,y:20*TS,t:0};
function attract(dt){A.t-=dt;if(A.t<=0){A.t=rnd(6,10);for(let n=0;n<60;n++){const x=ri(3,MW-4),y=ri(4,LH*2-4);if(tAt(x,y)===T.AIR){A.x=(x+.5)*TS;A.y=(y+.5)*TS;break}}}const f=1-Math.exp(-dt*.35);cam.x+=(A.x-cam.x)*f;cam.y+=(A.y-cam.y)*f;updFX(dt)}
function prefetch(){const cs=CH*TS,c0=Math.floor((cam.x-VW/2)/cs)-1,c1=Math.floor((cam.x+VW/2)/cs)+1,r0=Math.floor((cam.y-VH/2)/cs)-1,r1=Math.floor((cam.y+VH/2)/cs)+1;for(let y=r0;y<=r1;y++)for(let x=c0;x<=c1;x++){if(x<0||y<0||x*CH>=MW||y*CH>=MH)continue;if(!chunks[y*16+x]){getChunk(x,y);return}}}
let last=performance.now();
function frame(now){let dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;TT+=dt;
 try{
  if(campViewport!==((state==='surface'&&CAMP.active)||state==='intro')||wrap.classList.contains('in-intro')!==(state==='intro'))resize();
  if(state==='intro')updateIntro(dt);else if(state==='run'){if(wheelOn)dt*=.3;if(!paused){if(hitstop>0){hitstop-=dt;updFX(dt*.15)}else{update(dt);if(state==='run')updFX(dt)}}}else if(state==='surface'&&CAMP.active)updateCamp(dt);else attract(dt);
  MUS.update(dt);tickUI(dt);if(state==='intro')renderIntro();else if(state==='surface'&&CAMP.active)renderCamp();else if(tiles){prefetch();render()}if(state==='run'&&P)updHUD();else if(wheelOn){wheelOn=false;$('wheel').style.display='none'}
 }catch(err){console.error(err);paused=true;if(state==='run'){showPanel('pause');$('objective').textContent='Simulation paused after an error. Export your character before reloading.'}}
 requestAnimationFrame(frame)}

// ---------- boot ----------
setupExpansionUI();setupIntroUI();load();setInterval(()=>{if((state==='run'||state==='surface')&&save())toast('AUTOSAVED','autosave')},60000);setAct(0);genWorld(4242);{const l=lifts[0];cam.x=(l.x+1)*TS;cam.y=(l.y+6)*TS;A.x=cam.x;A.y=cam.y}
if(matchMedia('(prefers-reduced-motion: reduce)').matches){S.set.reduced=1;S.set.shake=0}if(!storageLocked&&needsIntro())beginIntro(false);else{showMenu();MUS.mode='menu'}if(storageWarning)toast(esc(storageWarning));requestAnimationFrame(frame);
