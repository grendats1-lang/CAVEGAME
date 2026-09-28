'use strict';
// DEEP BELOW v2 - gameplay core: player, weapons, mining, items, hazards, projectiles
function shake(a){shakeT=Math.min(1,shakeT+a)}
function part(p){if(parts.length>=700)return;if(!p.keep&&Math.random()>S.set.parts)return;p.max=p.life;p.z=p.z||0;p.vz=p.vz||0;p.vx=p.vx||0;p.vy=p.vy||0;p.sz=p.sz||1;p.type=p.type||'chip';p.cs=css(p.col);parts.push(p)}
function text(x,y,s,col,big){if(texts.length>=80)return;const l=big?2.4:1.1;texts.push({x,y,s,c:css(col),life:l,max:l,big})}
function sparks(x,y,n,col){for(let i=0;i<n;i++)part({x,y,vx:rnd(-110,110),vy:rnd(-110,110),life:rnd(.12,.3),col:col||[255,rnd(170,220),rnd(90,140)],type:'spark'})}
const vary=c=>{const m=rnd(.8,1.15);return[c[0]*m,c[1]*m,c[2]*m]};
function solidPx(x,y){return TI[tAt(Math.floor(x/TS),Math.floor(y/TS))].solid}
function blocked(x,y,hw,mode){const x0=Math.floor((x-hw)/TS),x1=Math.floor((x+hw-.01)/TS),y0=Math.floor((y-hw)/TS),y1=Math.floor((y+hw-.01)/TS);for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const t=tAt(tx,ty);if(mode===2){if(TI[t].solid&&t!==T.CHASM)return true}else if(TI[t].solid||(mode===1&&t===T.LAVA))return true}return false}
function nudge(e,ax,s,hw,mode){for(let o=1;o<=6;o++)for(const g of[-1,1]){if(ax===1){if(!blocked(e.x+s,e.y+g*o,hw,mode)&&!blocked(e.x,e.y+g,hw,mode)){e.y+=g*.8;return}}else{if(!blocked(e.x+g*o,e.y+s,hw,mode)&&!blocked(e.x+g,e.y,hw,mode)){e.x+=g*.8;return}}}}
function moveBox(e,dx,dy,hw,mode){let hit=false;const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/2)),sx=dx/n,sy=dy/n;for(let i=0;i<n;i++){if(sx){if(!blocked(e.x+sx,e.y,hw,mode))e.x+=sx;else{hit=true;if(!sy&&mode===0)nudge(e,1,sx,hw,mode)}}if(sy){if(!blocked(e.x,e.y+sy,hw,mode))e.y+=sy;else{hit=true;if(!sx&&mode===0)nudge(e,0,sy,hw,mode)}}}return hit}
function los(x0,y0,x1,y1){let dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy,x=x0,y=y0;for(let n=0;n<80;n++){if(x===x1&&y===y1)return true;const e2=2*e;if(e2>=dy){e+=dy;x+=sx}if(e2<=dx){e+=dx;y+=sy}if(x===x1&&y===y1)return true;if(TI[tAt(x,y)].opaque)return false}return false}
const pw=()=>PICKS[S.gear.pick].pw*(mod('brittle')?.75:1)*(ench('pick','breaker')?1.35:ench('pick','prospector')?.85:1);
const lampR=()=>LAMP(lv('lamp'))*(mod('dim')?.7:1)*(S.exp.condition==='blackout'?.5:1);
const armorDR=()=>S.gear.armor>=0?ARMORS[S.gear.armor].dr:0;
const gdepth=k=>(ACT===2?8:ACT*5)+k;
const actDepth=a=>ACTS.slice(0,a).reduce((n,v)=>n+v.layers.length,0)*LH*1.5;
const pressureRate=k=>ACT?Math.max(0,k+(ACT===2?3:2)-lv('suit'))*.35:Math.max(0,k-1-lv('suit'))*.8;
const SLOTS=['pick','sword','bow','dyn','flare','tonic'];
let hotDirty=true,zones=[];
function slotOK(i){const s=SLOTS[i];if(s==='pick')return true;if(s==='sword')return S.gear.sword>=0;if(s==='bow')return S.gear.bow>=0;return(S.cons[s]||0)>0}
function selectSlot(i){if(!P||i<0||i>=SLOTS.length)return;if(!slotOK(i)){SND.denied();return}if(P.slot!==i){P.slot=i;SND.sel();hotDirty=true}}
function cycleSlot(d){if(!P)return;for(let n=1;n<=SLOTS.length;n++){const i=((P.slot+d*n)%SLOTS.length+SLOTS.length)%SLOTS.length;if(slotOK(i)){selectSlot(i);return}}}
const PCOL={stone:[150,140,130],bolt:[210,200,180],crystal:[190,160,230],frost:[190,225,240],glob:[150,180,70],boulder:[110,100,90],ice:[180,215,235],orb:[160,120,220]};

// ---------- run lifecycle ----------
function startRun(a,k){
 if(!ACTS[a]||!Number.isInteger(k)||k<0||k>=ACTS[a].layers.length)return;
 AU.init();S.act=a;S.startL=k;const seed=seedForRun();setAct(a);genWorld(seed);
 const lf=lifts[k],mh=Math.round((100+25*lv('hp'))*(mod('glass')?.6:1)),mo=Math.round(OILM(lv('oil'))*(mod('wick')?.65:1)),cap=Math.max(4,Math.round(PACK[lv('pack')]*(mod('heavy')?.7:1)));
 P={x:(lf.x+1)*TS,y:(lf.y+1)*TS,vx:0,vy:0,kx:0,ky:0,hp:mh,mhp:mh,oil:mo,moil:mo,aim:0,face:1,cd:0,bcd:0,sw:0,swk:'pick',inv:0,pack:[],cap,step:0,walk:0,rope:-1,dead:0,scanCD:0,slot:0};
 RUN={a,start:k,deep:k,t:0,act:new Set(),scan:[],scanT:0,scanR:0,scanX:0,scanY:0,drip:1,moan:rnd(8,20),rumble:rnd(20,40),spawn:25,trem:rnd(35,60),unst:1,shim:6,full:false,lampOut:false,tut:S.tut?-1:0,tutT:0,moved:0,broke:false,maxD:0,deathT:0,onLift:-1,dark:0,won:0};
 for(let i=0;i<Math.max(1,S.unl[a]||1);i++)RUN.act.add(i);RUN.act.add(k);
 enemies=gEnemies.map(e=>mkEnemy(e.type,e.x,e.y,layerOf(Math.floor(e.y/TS))));
 boss=null;if(bossSpawn){boss=mkEnemy(bossSpawn.type,bossSpawn.x,bossSpawn.y,NL-1);enemies.push(boss)}
 items=gItems.map(o=>({id:o.id,x:o.x,y:o.y,z:0,vx:0,vy:0,vz:0,t:1,world:1}));
 parts=[];texts=[];rocks=[];dyns=[];dlights=[];projs=[];flares=[];zones=[];wob.clear();hitstop=0;flashT=0;shakeT=0;
 cam.x=P.x;cam.y=P.y;curLayer=k;state='run';paused=false;showPanel(null);$('hud').style.display='block';$('touch-controls').classList.add('on');M.l=M.r=false;
 if(!restoreMode)S.lastResult=null;runExpansion(seed);if(!restoreMode)S.stats.runs++;if(a===1)ach('act2');save();MUS.set('cave',k,a);SND.lift();msg((a?ACTS[a].name.toUpperCase()+' · ':'')+LAYERS[k].name.toUpperCase(),3);packDirty=true;hotDirty=true}
function endRun(ok){if(state!=='run')return;state='results';paused=false;M.l=M.r=false;$('hud').style.display='none';$('touch-controls').classList.remove('on');setPrompt('');
 const expansion=endExpansion(ok);const keepN=SALV[lv('salv')]+(S.exp.projects.infirmary?1:0)+(ench('armor','rescue')?3:0),all=P.pack.slice().sort((a,b)=>ITEMS[b].v-ITEMS[a].v),kept=ok?all:all.slice(0,keepN),val=a=>a.reduce((s,id)=>s+ITEMS[id].v,0);
 const base=val(kept),lost=ok?0:val(all)-base,bonus=ok?Math.round(base*.1*gdepth(RUN.deep)*modBonus()):0;
 for(const id of kept){S.mats[id]=(S.mats[id]||0)+1;if(ITEMS[id].r>=3||ITEMS[id].refined)S.exp.protected[id]=1;}
 S.money+=bonus;S.stats.earned+=bonus;S.stats.best=Math.max(S.stats.best,base);S.stats.deepest=Math.max(S.stats.deepest,RUN.maxD+actDepth(ACT));
 if(ok){S.stats.escapes++;if(base>0)ach('escape');if(P.hp/P.mhp<.15)ach('close');if(RUN.lampOut)ach('dark');if(P.pack.length>=P.cap)ach('full');if(base>=1000)ach('haul1k')}else S.stats.deaths++;
 S.tut=true;RUN.tut=-1;S.lastResult={ok,kept,base,bonus,lost,deep:RUN.deep,a:RUN.a,time:RUN.t,maxD:RUN.maxD,won:RUN.won};save();MUS.set('camp',0,0);
 $('objective').style.display='none';$('interact').style.display='none';showResults({expansion,ok,kept,base,bonus,lost,deep:RUN.deep,a:RUN.a,time:RUN.t,maxD:RUN.maxD,won:RUN.won})}
function die(){if(P.dead)return;P.hp=0;P.dead=1;RUN.deathT=0;SND.death();shake(.6);M.l=M.r=false;P.rope=-1;msg('YOU DIED',3)}
function envHurt(a){if(P.dead)return;if(RUN.x?.heat>0)return;a*=ench('armor','pressure')?.5:1;if(RUN.x){RUN.x.damage+=a;RUN.x.cause=P.oil<=0?'Darkness':tAt(Math.floor(P.x/TS),Math.floor(P.y/TS))===T.LAVA?'Lava':'Pressure or environmental hazard';if(RUN.x.fragile)RUN.x.fragileBroken=true}P.hp-=a;flashT=Math.max(flashT,.08);if(P.hp<=0)die()}
function hurtPlayer(dm,nx,ny){if(P.inv>0||P.dead)return;dm*=(1-armorDR())*(ench('sword','bulwark')&&P.sw>0?.6:1);if(RUN.x){RUN.x.damage+=dm;RUN.x.hits++;RUN.x.cause='Creature strike or projectile';if(RUN.x.fragile)RUN.x.fragileBroken=true}P.hp-=dm;P.inv=.55;P.kx+=nx*200;P.ky+=ny*200;shake(.4);flashT=.35;SND.hurt();text(P.x,P.y-14,'-'+Math.round(dm),[220,90,70],0);if(P.rope>=0){P.rope=-1;showHint('Rope climb interrupted!',2)}if(P.hp<=0)die()}

// ---------- main update ----------
function update(dt){
 RUN.t+=dt;S.stats.time+=dt;
 const ptx=Math.floor(P.x/TS),pty=Math.floor(P.y/TS),k=layerOf(pty);curLayer=k;
 RUN.maxD=Math.max(RUN.maxD,Math.floor(P.y/TS*1.5));
 if(k>RUN.deep){RUN.deep=k;msg(LAYERS[k].name.toUpperCase(),3.5);SND.deeper();if(ACT===0)ach(['','l2','l3','l4','l5'][k]);const h=ACTS[ACT].hints[k];if(h)hintOnce('layer'+ACT+'_'+k,h)}
 if(ACT===1&&k===0)hintOnce('layer1_0',ACTS[1].hints[0]);
 if(k>(S.reached[ACT]==null?-1:S.reached[ACT])){S.reached[ACT]=k;save()}
 const bossNear=boss&&!boss.dead&&boss.st!=='sleep'&&Math.hypot(boss.x-P.x,boss.y-P.y)<TS*22,mmode=bossNear?'boss':'cave';if(mmode!==MUS.mode||k!==MUS.layer)MUS.set(mmode,k,ACT);
 let chase=0;for(const e of enemies)if(!e.boss&&e.al>0&&Math.hypot(e.x-P.x,e.y-P.y)<TS*12)chase++;MUS.int+=(clamp(chase/4,0,1)-MUS.int)*Math.min(1,dt*.8);
 if(RUN.dark>0)RUN.dark-=dt;
 const wmx=M.x+camX0,wmy=M.y+camY0;
 if(P.dead){RUN.deathT+=dt;if(RUN.deathT>2.4){endRun(false);return}}
 else{
  P.aim=Math.atan2(wmy-(P.y-4),wmx-P.x);P.face=Math.cos(P.aim)>=0?1:-1;
  let mx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),my=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);if(P.rope>=0){mx=0;my=0}
  const ln=Math.hypot(mx,my)||1,here=tAt(ptx,pty),ice=here===T.ICEFLOOR,sp=SPEED(lv('boots'))*(here===T.WATER?.55:here===T.SAP&&!ench('pick','rootcarver')&&RUN.x.heat<=0?.6:1)*(S.exp.loadout==='porter'?.85:1)*(ench('armor','porter')?.9:1)*(P.sw>0?.85:1),f=1-Math.exp(-dt*(ice?2.4:14));
  P.vx+=(mx/ln*sp-P.vx)*f;P.vy+=(my/ln*sp-P.vy)*f;const kd=Math.exp(-dt*9);P.kx*=kd;P.ky*=kd;
  const ox=P.x,oy=P.y;const hit=moveBox(P,(P.vx+P.kx)*dt,(P.vy+P.ky)*dt,5,0);if(hit&&ice){P.vx*=.5;P.vy*=.5}const md=Math.hypot(P.x-ox,P.y-oy);RUN.moved+=md;P.renderMoving=md>.015;P.walk+=md;P.step+=md;
  if(P.step>15){P.step=0;SND.step(here===T.WATER?1:ice?2:0);if(here===T.WATER)for(let i=0;i<3;i++)part({x:P.x,y:P.y+4,vx:rnd(-20,20),vy:rnd(-20,20),z:1,vz:rnd(20,50),life:.4,col:[120,140,150]});else part({x:P.x,y:P.y+4,vx:rnd(-8,8),vy:rnd(-4,4),life:.6,col:ice?[190,210,220]:[110,100,88],sz:2,type:'dust'})}
  if(ice)hintOnce('ice','<b>Ice!</b> You slide. Plan your stops.');
  P.cd-=dt;P.bcd-=dt;P.sw=Math.max(0,P.sw-dt/.16);P.inv-=dt;P.scanCD-=dt;
  if(!slotOK(P.slot)){P.slot=0;hotDirty=true}
  target=findTarget(wmx,wmy);
  if(P.rope<0){if(M.r&&P.cd<=0){P.cd=SWING[lv('swing')];swingPick()}else if(M.l)useSlot()}
  if(P.oil>0){P.oil-=dt;if(P.oil<=0){P.oil=0;RUN.lampOut=true;SND.lampOut();msg('YOUR LAMP HAS GONE OUT',3);showHint('Something stirs in the dark. <b>Get to a lift, now.</b>',6)}else if(P.oil<P.moil*.2)hintOnce('lowoil','Your lamp is running low. Is what lies deeper worth it?')}
  else envHurt(.8*dt);
  const pres=pressureRate(k);if(pres>0){envHurt(pres*dt);hintOnce('pressure'+ACT,'The crushing <b>pressure</b> down here hurts. Upgrade your <b>Pressure Suit</b>.')}
  if(here===T.LAVA){envHurt(40*(1-lv('suit')*.15)*dt);if(Math.random()<.4)part({x:P.x+rnd(-4,4),y:P.y+2,vy:-20,life:.5,col:[255,140,50],type:'spark'});hintOnce('lava','<b>Lava!</b> Get out of it!')}
  if(flg[I(ptx,pty)]&1){RUN.unst-=dt;if(RUN.unst<=0){RUN.unst=rnd(.6,1.3);dropRock(P.x+rnd(-20,20)+P.vx*.4,P.y+rnd(-20,20)+P.vy*.4);hintOnce('unstable','<b>Loose ceiling!</b> Watch for shadows and keep moving.')}}
  let onLift=-1;for(let i=0;i<lifts.length;i++){const l=lifts[i];if(ptx>=l.x&&ptx<=l.x+1&&pty>=l.y&&pty<=l.y+1)onLift=i}
  if(onLift>=0&&!RUN.act.has(onLift)){RUN.act.add(onLift);if(onLift+1>(S.unl[ACT]||0)){S.unl[ACT]=onLift+1;save()}beat('lift');msg('LIFT RESTORED',3);showHint('You can now start expeditions in <b>'+LAYERS[onLift].name+'</b>.',6);SND.lift()}
  RUN.onLift=onLift;setPrompt(onLift>=0?'[SPACE] Ride the lift up and bank your haul':'');
  if(P.rope>=0){P.rope+=dt;if(Math.random()<.3)part({x:P.x+rnd(-6,6),y:P.y-rnd(0,10),vy:-15,life:.6,col:[200,180,140],type:'spark'});if(P.rope>=(ench('armor','rescue')?2:3)){S.cons.rope=Math.max(0,S.cons.rope-1);save();endRun(true);return}}
 }
 for(const v of vents){if(Math.abs(v.y-P.y)>320)continue;v.t-=dt;if(v.t<=0&&v.on<=0){v.on=2.6;v.t=rnd(5,9);if(Math.hypot(v.x-P.x,v.y-P.y)<220)SND.hiss(v.x)}
  if(v.on>0){v.on-=dt;if(Math.random()<.6)part({x:v.x+rnd(-3,3),y:v.y+rnd(-3,3),vx:rnd(-12,12),vy:rnd(-12,12),life:rnd(1,1.8),col:ACT?[120,96,120]:[118,122,70],sz:rnd(3,6),type:'gas'});if(!P.dead&&Math.hypot(v.x-P.x,v.y-P.y)<24){envHurt(12*dt);hintOnce('gas','Toxic gas! Wait for the vent to settle.')}}}
 if(k>=3||ACT){RUN.trem-=dt;if(RUN.trem<=0){RUN.trem=rnd(40,70);shake(.7);SND.rumble(.5);msg('THE CAVE TREMBLES',2);for(let n=0;n<5;n++)dropRock(P.x+rnd(-90,90),P.y+rnd(-70,70))}}
 RUN.spawn-=dt*(P.oil<=0?3:1);if(RUN.spawn<=0){RUN.spawn=Math.max(6,18-gdepth(k)*2);spawnNear(k)}
 RUN.drip-=dt;if(RUN.drip<=0){RUN.drip=rnd(.8,3.5);SND.drip(rnd(-1,1));spawnDrip()}
 RUN.moan-=dt;if(RUN.moan<=0){RUN.moan=Math.max(6,rnd(14,34)-k*3);SND.moan()}
 RUN.rumble-=dt;if(RUN.rumble<=0){RUN.rumble=rnd(25,50);SND.rumble(.15)}
 RUN.shim-=dt;if(RUN.shim<=0){RUN.shim=12;const fr=findRare(12);if(fr){SND.shimmer(clamp((fr.x-P.x)/200,-1,1));if(!RUN.shimSeen){RUN.shimSeen=1;showHint('You hear a faint crystalline ring nearby... something rare is close.',5)}}}
 for(const e of enemies)updEnemy(e,dt);enemies=enemies.filter(e=>!e.dead);
 updItems(dt);updRocks(dt);updDyns(dt);updFlares(dt);updProjs(dt);updZones(dt);
 RUN.scanT-=dt;updateExpansion(dt);M.lp=false}
function findRare(r){const tx=Math.floor(P.x/TS),ty=Math.floor(P.y/TS);for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const t=tAt(tx+i,ty+j);if(t===T.DIAMOND||t===T.STARMETAL||t===T.VOIDSTONE||t===T.MYTHRIL)return{x:(tx+i)*TS,y:(ty+j)*TS}}for(const o of items)if(o.world&&ITEMS[o.id].r>=3&&Math.hypot(o.x-P.x,o.y-P.y)<r*TS)return o;return null}
function spawnNear(k){if(enemies.length>=180)return;let c=0;for(const e of enemies)if(!e.boss&&Math.hypot(e.x-P.x,e.y-P.y)<TS*25)c++;if(c>=8+gdepth(k)*2)return;const en=LAYERS[k].en,keys=Object.keys(en);
 for(let tr=0;tr<30;tr++){const a=rnd(0,6.28),d=rnd(10,18),tx=Math.floor(P.x/TS+Math.cos(a)*d),ty=Math.floor(P.y/TS+Math.sin(a)*d);if(tAt(tx,ty)!==T.AIR||layerOf(ty)!==k)continue;if(boss&&Math.hypot((tx+.5)*TS-boss.x,(ty+.5)*TS-boss.y)<TS*14)continue;
  let type=keys[ri(0,keys.length-1)];if(P.oil<=0&&(k>=1||ACT))type='stalker';enemies.push(mkEnemy(type,(tx+.5)*TS,(ty+.5)*TS,k));return}}
function spawnDrip(){for(let tr=0;tr<10;tr++){const x=P.x+rnd(-120,120),y=P.y+rnd(-80,80);if(!solidPx(x,y)&&lightAt(x,y)>.15){part({x,y,z:rnd(30,50),type:'drip',life:3,col:[150,170,180],keep:1});return}}}

// ---------- weapons ----------
function findTarget(wx,wy){const REACH=30,tx=Math.floor(wx/TS),ty=Math.floor(wy/TS),ok=(x,y)=>{const t=tAt(x,y);return TI[t].solid&&TI[t].hp<1e9&&x>0&&y>0&&x<MW-1&&y<MH-1};
 if(ok(tx,ty)&&Math.hypot((tx+.5)*TS-P.x,(ty+.5)*TS-P.y)<=REACH+6)return{x:tx,y:ty};
 const dx=Math.cos(P.aim),dy=Math.sin(P.aim);for(let s=4;s<=REACH;s+=2){const x=Math.floor((P.x+dx*s)/TS),y=Math.floor((P.y-3+dy*s)/TS);if(ok(x,y))return{x,y};const t=tAt(x,y);if(TI[t].solid&&t!==T.CHASM)break}return null}
function useSlot(){const s=SLOTS[P.slot];
 if(s==='pick'){if(P.cd<=0){P.cd=SWING[lv('swing')];swingPick()}}
 else if(s==='sword'){if(P.cd<=0){P.cd=SWING[lv('swing')]*.9;slash()}}
 else if(s==='bow'){if(P.bcd<=0)shoot()}
 else if(M.lp){if(s==='dyn')throwDyn();else if(s==='flare')throwFlare();else if(s==='tonic')useTonic()}}
function arcHit(range,arc,dmg,slow){const a=P.aim;let hit=false;for(const e of enemies){if(e.dead||e.under)continue;const dx=e.x-P.x,dy=e.y-(P.y-3),d=Math.hypot(dx,dy)||1;if(d<range+e.hw){let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<arc||d<12){const cr=Math.random()<.06+lv('luck')*.012;hurtEnemy(e,dmg*(cr?1.8:1),dx/d,dy/d,slow);if(cr)text(e.x,e.y-14,'CRIT',[240,200,120],0);hit=true}}}return hit}
function swingPick(){P.sw=1;P.swk='pick';SND.whoosh();if(arcHit(24,1.1,pw()*1.1+1,0)){shake(.15);hitstop=Math.max(hitstop,.035);return}if(target)mineTile(target.x,target.y)}
function slash(){const sw=SWORDS[S.gear.sword];P.sw=1;P.swk='sword';SND.slash();const a=P.aim;for(let i=0;i<9;i++){const aa=a-1.25+i*.31;part({x:P.x+Math.cos(aa)*20,y:P.y-3+Math.sin(aa)*20,vx:Math.cos(aa)*40,vy:Math.sin(aa)*40,life:.16,col:[230,225,210],type:'spark'})}
 if(arcHit(34,1.35,sw.dmg,sw.slow)){shake(.2);hitstop=Math.max(hitstop,.05)}}
function shoot(){const b=BOWS[S.gear.bow];if(b.ammo&&S.cons.bolts<=0){P.bcd=.5;SND.denied();msg('NO BOLTS',1.2);return}if(projs.length>=180)return;if(b.ammo){S.cons.bolts--;hotDirty=true}
 P.bcd=b.rate*(1-lv('swing')*.06);const a=P.aim+rnd(-.03,.03),shotSpeed=b.spd*(ench('bow','frost')?.8:1),sx=P.x+Math.cos(a)*8,sy=P.y-4+Math.sin(a)*8;
 projs.push({x:sx,y:sy,vx:Math.cos(a)*shotSpeed,vy:Math.sin(a)*shotSpeed,dmg:b.dmg,life:1.3,from:'p',pierce:(b.pierce||0)+(ench('bow','pierce')?2:0),slow:b.slow||ench('bow','frost')||0,kind:b.kind,hit:new Set()});SND.shoot(b.kind);P.sw=.5;P.swk='bow'}
function eshoot(x,y,a,spd,dmg,kind){if(projs.length>=180||Math.abs(x-P.x)>VW/2-16||Math.abs(y-P.y)>VH/2-16)return;projs.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,dmg,life:3,from:'e',kind})}
function updProjs(dt){for(const p of projs){p.life-=dt;const sp=Math.hypot(p.vx,p.vy)||1;for(let i=0;i<3&&p.life>0;i++){p.x+=p.vx*dt/3;p.y+=p.vy*dt/3;const t=tAt(Math.floor(p.x/TS),Math.floor(p.y/TS));
  if(TI[t].solid&&t!==T.CHASM){p.life=0;if(p.from==='p'){sparks(p.x,p.y,3,PCOL[p.kind]);SND.thunk(p.x)}else splash(p);break}
  if(p.from==='p'){for(const e of enemies){if(e.dead||e.under||p.hit.has(e))continue;if(Math.hypot(e.x-p.x,e.y-p.y)<e.hw+3){p.hit.add(e);hurtEnemy(e,p.dmg,p.vx/sp,p.vy/sp,p.slow);if(ench('bow','chain')&&!p.chained){p.chained=true;const q=enemies.find(q=>q!==e&&!q.dead&&Math.hypot(q.x-e.x,q.y-e.y)<65);if(q){hurtEnemy(q,p.dmg*.5,0,0);sparks(q.x,q.y,8,[130,220,230])}}if(p.pierce>0){p.pierce--;continue}p.life=0;break}}}
  else if(!P.dead&&Math.hypot(P.x-p.x,P.y-3-p.y)<(p.kind==='boulder'?9:6)){hurtPlayer(p.dmg,p.vx/sp,p.vy/sp);p.life=0;splash(p);break}}
  if(Math.random()<.5)part({x:p.x,y:p.y,life:.2,col:PCOL[p.kind],type:p.kind==='stone'||p.kind==='boulder'?'dust':'spark',sz:1})}
 projs=projs.filter(p=>p.life>0)}
function splash(p){if(p.kind==='glob')SND.splat(p.x);for(let i=0;i<7;i++)part({x:p.x,y:p.y,vx:rnd(-50,50),vy:rnd(-50,50),z:2,vz:rnd(20,60),life:.5,col:PCOL[p.kind]})}
function updZones(dt){for(const z of zones){z.t+=dt;if(z.t>=z.T){z.done=1;SND.slam(z.x);shake(.35);for(let n=0;n<14;n++)part({x:z.x+rnd(-z.r*.6,z.r*.6),y:z.y+rnd(-z.r*.6,z.r*.6),vx:rnd(-60,60),vy:rnd(-60,60),z:2,vz:rnd(40,100),life:rnd(.5,1),col:[110,100,90],sz:ri(1,2)});for(let n=0;n<8;n++)part({x:z.x+rnd(-z.r*.5,z.r*.5),y:z.y+rnd(-z.r*.5,z.r*.5),vx:rnd(-20,20),vy:rnd(-20,20),life:rnd(.8,1.4),col:[120,110,100],sz:rnd(4,7),type:'dust'});
  const d=Math.hypot(P.x-z.x,P.y-z.y);if(!P.dead&&d<z.r)hurtPlayer(z.dmg,(P.x-z.x)/(d||1),(P.y-z.y)/(d||1))}}zones=zones.filter(z=>!z.done)}

// ---------- mining ----------
function mineTile(x,y){const i=I(x,y),t=tiles[i],k=layerOf(y),mat=TI[t].mat,cxp=(x+.5)*TS,cyp=(y+.5)*TS,fx0=cxp-Math.cos(P.aim)*10,fy0=cyp-Math.sin(P.aim)*10;
 if(t===T.CHEST){openChest(x,y);return}
 if(t===T.BARRIER&&S.gear.pick<sealReq(k)){SND.hit('hard',0,cxp);SND.denied();sparks(fx0,fy0,6);shake(.1);msg('TOO HARD: NEEDS A '+PICKS[sealReq(k)].n.toUpperCase(),2);hintOnce('barrier','This is a <b>layer seal</b>. Forge a stronger <b>Pickaxe</b> at camp to break through.');return}
 let p=pw()*(t===T.ROOT&&ench('pick','rootcarver')?2:1);if(RUN.x){RUN.x.mining++;RUN.x.attention=clamp(RUN.x.attention+(ench('pick','silent')?.35:1),0,100)}const crit=Math.random()<.06+lv('luck')*.012;if(crit)p*=2;
 dmg[i]+=p;wob.set(i,.12);const hp=tileHP(x,y);
 for(let n=crit?9:4+ri(0,2);n>0;n--)part({x:fx0,y:fy0,vx:rnd(-60,60)-Math.cos(P.aim)*40,vy:rnd(-60,60)-Math.sin(P.aim)*40,z:rnd(2,8),vz:rnd(30,90),life:rnd(.5,1.1),col:vary(tileCol(t,k)),sz:ri(1,2)});
 for(let n=0;n<2;n++)part({x:fx0,y:fy0,vx:rnd(-15,15),vy:rnd(-15,15),life:rnd(.6,1.2),col:[120,108,96],sz:rnd(2,4),type:'dust'});
 if(mat==='ore'||mat==='crystal'||mat==='hard'||mat==='ice'||crit)sparks(fx0,fy0,crit?8:3);
 SND.hit(mat,TI[t].ore?ITEMS[TI[t].ore].v:0,cxp);shake(.05+Math.min(.1,hp*.005)+(crit?.12:0));
 if(crit){text(cxp,cyp-8,'CRIT',[240,200,120],0);hitstop=Math.max(hitstop,.03)}
 alertNear(cxp,cyp,ench('pick','silent')?1.75:ench('pick','breaker')?14:7);if(dmg[i]>=hp)breakTile(x,y,true)}
function breakTile(x,y,byP){const i=I(x,y),t=tiles[i];if(!TI[t].solid||TI[t].hp>1e9||t===T.CHEST)return;
 const k=layerOf(y),cxp=(x+.5)*TS,cyp=(y+.5)*TS;tiles[i]=T.AIR;dmg[i]=0;wob.delete(i);redraw(x,y);miniTile(x,y);
 for(let n=0;n<14;n++)part({x:cxp+rnd(-5,5),y:cyp+rnd(-5,5),vx:rnd(-70,70),vy:rnd(-70,70),z:rnd(2,10),vz:rnd(30,110),life:rnd(.6,1.4),col:vary(tileCol(t,k)),sz:ri(1,2)});
 for(let n=0;n<7;n++)part({x:cxp+rnd(-6,6),y:cyp+rnd(-6,6),vx:rnd(-20,20),vy:rnd(-20,20),life:rnd(.8,1.6),col:[118,106,94],sz:rnd(3,6),type:'dust'});
 SND.brk(TI[t].mat,cxp);shake(.09);if(byP){S.stats.mined++;RUN.broke=true}
 const it=TI[t].ore;
 if(it){const n=(!mod('cursed')&&Math.random()<lv('luck')*.08?2:1)+(ench('pick','prospector')&&S.stats.ores%3===0?1:0)+(RUN.x?.condition==='rich'?1:0);for(let j=0;j<n;j++)drop(it,cxp,cyp);if(n>1)text(cxp,cyp-10,'DOUBLE!',[220,200,140],0);S.stats.ores++;if(RUN.x){RUN.x.ore++;if(RUN.x.firstOre<0)RUN.x.firstOre=RUN.t}beat('ore');ach('first');if(ITEMS[it].r>=3)rare(it,cxp,cyp)}
 else if(byP&&!mod('cursed')&&isRock(t)&&t!==T.GRAVEL&&Math.random()<.005*(1+lv('luck')*.45)){const id=ACT?(Math.random()<.5?'mythril':'frostite'):k<=1?'fossil':(k>=3&&Math.random()<.35?'diamond':'geode');drop(id,cxp,cyp);rare(id,cxp,cyp)}
 if(t===T.WOOD&&byP&&Math.random()<.6){for(let n=0;n<3;n++)dropRock(cxp+rnd(-30,30),cyp+rnd(-30,30));showHint('You knocked out a support beam!',3)}}
function rare(id,x,y){const it=ITEMS[id],c=it.c.map(v=>Math.min(255,v*1.35));hitstop=.16;shake(.35);dlights.push({x,y,r:6,c:[1,.9,.7],life:.8,max:.8});for(let n=0;n<28;n++)part({x,y,vx:rnd(-90,90),vy:rnd(-90,90),life:rnd(.5,1.3),col:c,type:'spark',keep:1});SND.rare(it.r||2);text(x,y-14,it.n.toUpperCase()+'!',c,1);S.stats.rares++;if(id==='diamond')ach('diamond');if(id==='starmetal')ach('star');if(id==='relic')ach('relic')}
function drop(id,x,y,world){if(items.length>=900)return;items.push({id,x,y,z:4,vx:rnd(-45,45),vy:rnd(-45,45),vz:rnd(50,90),t:0,world:world?1:0})}
function openChest(x,y){const i=I(x,y),k=layerOf(y),cxp=(x+.5)*TS,cyp=(y+.5)*TS;tiles[i]=T.AIR;decor[i]=9;redraw(x,y);miniTile(x,y);SND.chest();shake(.12);
 for(let n=ri(2,4);n>0;n--)drop(pickOre(k),cxp,cyp);if(Math.random()<.4)drop('oil',cxp,cyp);if(Math.random()<.25)drop('dyn',cxp,cyp);if(Math.random()<.25)drop('flare',cxp,cyp);if(Math.random()<.3)drop('bolts',cxp,cyp);if(Math.random()<.15)drop('tonic',cxp,cyp);if((k>=3||ACT)&&Math.random()<.12)drop('relic',cxp,cyp,1);
 for(let n=0;n<14;n++)part({x:cxp,y:cyp,vx:rnd(-60,60),vy:rnd(-60,60),life:rnd(.3,.7),col:[240,200,120],type:'spark'});text(cxp,cyp-10,'CHEST',[220,190,120],0)}
function alertNear(x,y,r){if(RUN?.x?.condition==='echoes')r*=2;for(const e of enemies)if(!e.boss&&Math.hypot(e.x-x,e.y-y)<r*TS)e.al=Math.max(e.al,4)}

// ---------- items ----------
function canTake(id){const it=ITEMS[id];if(it.use)return true;if(P.pack.length<P.cap)return true;return P.pack.some(p=>ITEMS[p].v<it.v)}
function collect(o){const it=ITEMS[o.id];
 if(o.id==='oil'){const was=P.oil;P.oil=Math.min(P.moil,P.oil+30);text(P.x,P.y-12,'+30s OIL',[230,180,90],0);SND.pick(40);if(was<=0)msg('LAMP RELIT',2);return}
 if(it.use){const q=o.id==='bolts'?10:1;S.cons[o.id]=(S.cons[o.id]||0)+q;save();hotDirty=true;text(P.x,P.y-12,'+'+q+' '+it.n.toUpperCase(),[220,150,110],0);SND.pick(30);return}
 if(P.pack.length>=P.cap){let mi=0;for(let j=1;j<P.pack.length;j++)if(ITEMS[P.pack[j]].v<ITEMS[P.pack[mi]].v)mi=j;const old=P.pack.splice(mi,1)[0];items.push({id:old,x:P.x,y:P.y,z:3,vx:rnd(-50,50),vy:rnd(-50,50),vz:40,t:-1.5});text(P.x,P.y-22,'dropped '+ITEMS[old].n,[150,130,110],0)}
 P.pack.push(o.id);packDirty=true;SND.pick(it.v);text(P.x,P.y-12,'+'+it.n+' $'+it.v,it.r>=2?it.c:[220,205,170],0);
 if(o.world&&it.r>=3)rare(o.id,P.x,P.y)}
function updItems(dt){for(const o of items){o.t+=dt;
  if(o.vx||o.vy){const nx=o.x+o.vx*dt,ny=o.y+o.vy*dt;if(solidPx(nx,o.y))o.vx*=-.5;else o.x=nx;if(solidPx(o.x,ny))o.vy*=-.5;else o.y=ny;const f=Math.exp(-dt*3);o.vx*=f;o.vy*=f;if(Math.abs(o.vx)<1)o.vx=0;if(Math.abs(o.vy)<1)o.vy=0}
  if(o.z>0||o.vz>0){o.vz-=320*dt;o.z+=o.vz*dt;if(o.z<=0){o.z=0;o.vz=Math.abs(o.vz)>25?-o.vz*.4:0}}
  if(!P.dead&&o.t>.4){const dx=P.x-o.x,dy=P.y-o.y,d=Math.hypot(dx,dy)||1;if(d<42){if(canTake(o.id)){const a=(42-d)/42*1100;o.vx+=dx/d*a*dt;o.vy+=dy/d*a*dt;if(d<9){collect(o);o.gone=1}}else if(!RUN.full){RUN.full=true;showHint('<b>Backpack full!</b> Only more valuable finds will replace your worst items.',5)}}}}
 items=items.filter(o=>!o.gone)}

// ---------- rocks, dynamite, flares ----------
function dropRock(x,y){if(rocks.length>=80)return;if(solidPx(x,y))return;rocks.push({x,y,t:0,T:.9});SND.trickle(x)}
function overlaps(e,tx,ty,hw){return e.x+hw>tx*TS&&e.x-hw<(tx+1)*TS&&e.y+hw>ty*TS&&e.y-hw<(ty+1)*TS}
function updRocks(dt){for(const r of rocks){r.t+=dt;if(Math.random()<.3)part({x:r.x+rnd(-4,4),y:r.y,z:rnd(20,40),vz:-20,life:.5,col:[110,100,90]});
  if(r.t>=r.T){r.done=1;SND.impact(r.x);shake(.25*Math.max(0,1-Math.hypot(r.x-P.x,r.y-P.y)/200));
   for(let n=0;n<10;n++)part({x:r.x,y:r.y,vx:rnd(-60,60),vy:rnd(-60,60),z:2,vz:rnd(30,80),life:rnd(.5,1),col:[104,96,86],sz:ri(1,2)});for(let n=0;n<6;n++)part({x:r.x,y:r.y,vx:rnd(-25,25),vy:rnd(-25,25),life:rnd(.8,1.4),col:[118,108,96],sz:rnd(3,6),type:'dust'});
   const pd=Math.hypot(P.x-r.x,P.y-r.y);if(!P.dead&&pd<14)hurtPlayer(14*(1+gdepth(layerOf(Math.floor(r.y/TS)))*.25),(P.x-r.x)/(pd||1),(P.y-r.y)/(pd||1));
   for(const e of enemies)if(!e.under&&Math.hypot(e.x-r.x,e.y-r.y)<14)hurtEnemy(e,6,0,0);
   const tx=Math.floor(r.x/TS),ty=Math.floor(r.y/TS);if(tAt(tx,ty)===T.AIR&&Math.random()<.5&&!decor[I(tx,ty)]&&!overlaps(P,tx,ty,6)&&!enemies.some(e=>overlaps(e,tx,ty,e.hw+1))&&!items.some(o=>Math.floor(o.x/TS)===tx&&Math.floor(o.y/TS)===ty)){tiles[I(tx,ty)]=T.GRAVEL;redraw(tx,ty);miniTile(tx,ty)}}}
 rocks=rocks.filter(r=>!r.done)}
function lob(o,dt){const nx=o.x+o.vx*dt,ny=o.y+o.vy*dt;if(solidPx(nx,o.y))o.vx*=-.4;else o.x=nx;if(solidPx(o.x,ny))o.vy*=-.4;else o.y=ny;const fr=Math.exp(-dt*(o.z>0?.5:4));o.vx*=fr;o.vy*=fr;o.vz-=300*dt;o.z+=o.vz*dt;if(o.z<0){o.z=0;o.vz=Math.abs(o.vz)>30?-o.vz*.35:0}}
function throwDyn(){if(state!=='run'||paused||!P)return;if(!S.cons.dyn||P.dead||P.rope>=0)return;S.cons.dyn--;if(RUN.x)RUN.x.uses.dyn=(RUN.x.uses.dyn||0)+1;S.stats.dyn++;hotDirty=true;if(S.stats.dyn>=15)ach('boom');const a=P.aim;dyns.push({x:P.x+Math.cos(a)*6,y:P.y+Math.sin(a)*6,vx:Math.cos(a)*150,vy:Math.sin(a)*150,z:6,vz:60,f:1.7});save();SND.fuse()}
function throwFlare(){if(state!=='run'||paused||!P)return;if(!S.cons.flare||P.dead||P.rope>=0)return;S.cons.flare--;if(RUN.x)RUN.x.uses.flare=(RUN.x.uses.flare||0)+1;hotDirty=true;const a=P.aim;flares.push({x:P.x+Math.cos(a)*6,y:P.y+Math.sin(a)*6,vx:Math.cos(a)*140,vy:Math.sin(a)*140,z:6,vz:50,life:25});save();SND.flare();hintOnce('flare','Flares burn for 25s. <b>Stalkers and wraiths</b> keep away from them.')}
function updDyns(dt){for(const d of dyns){d.f-=dt;lob(d,dt);if(Math.random()<.7)part({x:d.x,y:d.y-d.z-2,vx:rnd(-20,20),vy:rnd(-30,0),life:.25,col:[255,200,110],type:'spark'});if(d.f<=0){d.done=1;explode(d.x,d.y)}}dyns=dyns.filter(d=>!d.done)}
function updFlares(dt){for(const f of flares){f.life-=dt;lob(f,dt);if(Math.random()<.8)part({x:f.x+rnd(-1,1),y:f.y-f.z-2,vx:rnd(-15,15),vy:rnd(-35,-5),life:rnd(.2,.5),col:[255,rnd(120,190),rnd(60,100)],type:'spark'})}flares=flares.filter(f=>f.life>0)}
function explode(x,y){SND.boom();shake(.8);hitstop=Math.max(hitstop,.06);dlights.push({x,y,r:9,c:[1,.75,.4],life:.6,max:.6});const tx=Math.floor(x/TS),ty=Math.floor(y/TS);
 for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const X=tx+i,Y=ty+j;if(Math.hypot((X+.5)*TS-x,(Y+.5)*TS-y)>2.4*TS)continue;const t=tAt(X,Y);if(t===T.CHEST)openChest(X,Y);else if(t!==T.BARRIER)breakTile(X,Y,false)}
 for(let n=0;n<40;n++)part({x,y,vx:rnd(-160,160),vy:rnd(-160,160),life:rnd(.2,.6),col:[255,rnd(140,210),rnd(60,110)],type:'spark',keep:1});for(let n=0;n<25;n++)part({x:x+rnd(-20,20),y:y+rnd(-20,20),vx:rnd(-40,40),vy:rnd(-40,40),life:rnd(1,2),col:[90,82,74],sz:rnd(5,9),type:'dust'});
 for(const e of enemies){const d=Math.hypot(e.x-x,e.y-y)||1;if(d<44+e.hw)hurtEnemy(e,e.boss?40:18,(e.x-x)/d,(e.y-y)/d)}
 const pd=Math.hypot(P.x-x,P.y-y)||1;if(pd<38)hurtPlayer(28*(1-pd/50),(P.x-x)/pd,(P.y-y)/pd);alertNear(x,y,14);
 for(let n=0;n<3;n++)if(Math.random()<.5)dropRock(x+rnd(-40,40),y+rnd(-40,40))}

// ---------- abilities ----------
function doScan(){if(state!=='run'||paused||!P||P.dead)return;const l=Math.max(lv('scan'),S.exp.loadout==='surveyor'||ench('pick','pulse')?1:0);if(!l){showHint('You need a <b>Cave Scanner</b> upgrade for that.',3);SND.denied();return}if(P.scanCD>0||P.dead)return;P.scanCD=SCANCD[l];RUN.scanT=5;RUN.scanR=SCANR[l];RUN.scanX=P.x;RUN.scanY=P.y;RUN.scan=[];
 const tx=Math.floor(P.x/TS),ty=Math.floor(P.y/TS),r=SCANR[l];for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(i*i+j*j>r*r)continue;const t=tAt(tx+i,ty+j);if(TI[t].ore||(l>=2&&t===T.CHEST))RUN.scan.push({x:tx+i,y:ty+j})}SND.scan()}
function useTonic(){if(state!=='run'||paused||!P||P.dead)return;if(mod('nomad')){showHint('Nomad’s Lantern: discover landmarks to heal.',3);return}if(!S.cons.tonic||P.dead||P.hp>=P.mhp)return;if(RUN.x){RUN.x.tonics++;RUN.x.uses.tonic=(RUN.x.uses.tonic||0)+1;}S.cons.tonic--;hotDirty=true;P.hp=Math.min(P.mhp,P.hp+45);save();SND.heal();text(P.x,P.y-14,'+45 HP',[140,210,130],0);for(let n=0;n<12;n++)part({x:P.x+rnd(-6,6),y:P.y-rnd(0,10),vy:-rnd(10,30),life:rnd(.4,.8),col:[160,220,150],type:'spark'})}
function useRope(){if(state!=='run'||paused||!P)return;if(!S.cons.rope||P.dead||P.rope>=0)return;P.rope=0;SND.lift();showHint('Climbing out... hold on for '+(ench('armor','rescue')?2:3)+' seconds. Taking damage cancels it.',3)}

// ---------- effects & camera ----------
function updFX(dt){
 for(const p of parts){p.life-=dt;const ox=p.x,oy=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.type==='chip'||p.type==='drip'){if(p.type==='chip'&&solidPx(p.x,p.y)){p.x=ox;p.y=oy;p.vx*=-.4;p.vy*=-.4}p.vz-=320*dt;p.z+=p.vz*dt;if(p.z<=0){p.z=0;if(p.type==='drip'){p.life=0;for(let i=0;i<3;i++)part({x:p.x,y:p.y,vx:rnd(-18,18),vy:rnd(-12,12),z:1,vz:rnd(15,35),life:.35,col:[130,150,160]})}else{p.vz=Math.abs(p.vz)>30?-p.vz*.35:0;p.vx*=.6;p.vy*=.6}}}
  else if(p.type==='dust'||p.type==='gas'){const f=Math.exp(-dt*2);p.vx*=f;p.vy*=f;p.y-=dt*(p.type==='gas'?4:2)}
  else if(p.type==='spark'){const f=Math.exp(-dt*5);p.vx*=f;p.vy*=f}
  else if(p.type==='mote'){p.vx+=rnd(-6,6)*dt;p.vy+=rnd(-6,6)*dt}}
 parts=parts.filter(p=>p.life>0);
 for(const t of texts){t.life-=dt;t.y-=dt*(t.big?8:18)}texts=texts.filter(t=>t.life>0);
 for(const d of dlights)d.life-=dt;dlights=dlights.filter(d=>d.life>0);
 for(const [k,v] of wob){if(v-dt<=0)wob.delete(k);else wob.set(k,v-dt)}
 shakeT=Math.max(0,shakeT-dt*1.6);flashT=Math.max(0,flashT-dt);
 if(state==='run'&&P){if(Math.random()<dt*5)part({x:P.x+rnd(-90,90),y:P.y+rnd(-70,70),vx:rnd(-3,3),vy:rnd(-3,3),life:rnd(2,4),col:ACT?[190,200,210]:[170,160,145],type:'mote'});
  const tx=P.x+(M.x-VW/2)*.15,ty=P.y+(M.y-VH/2)*.15,f=1-Math.exp(-dt*7);cam.x+=(tx-cam.x)*f;cam.y+=(ty-cam.y)*f}
 cam.x=clamp(cam.x,VW/2,MW*TS-VW/2);cam.y=clamp(cam.y,VH/2,MH*TS-VH/2)}
