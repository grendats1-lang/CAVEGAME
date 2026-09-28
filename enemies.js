'use strict';
// DEEP BELOW v2 - creatures and bosses
const EB={crawler:{hp:8,dmg:15,spd:44,hw:5},bat:{hp:5,dmg:11,spd:66,hw:3,fly:1},spitter:{hp:10,dmg:17,spd:35,hw:5},burrower:{hp:17,dmg:24,spd:48,hw:6},stalker:{hp:20,dmg:26,spd:31,hw:5},golem:{hp:75,dmg:36,spd:19,hw:7,armor:1},wraith:{hp:18,dmg:20,spd:46,hw:4,fly:1},sporeling:{hp:7,dmg:42,spd:55,hw:4},
 brood:{hp:1100,dmg:30,spd:50,hw:10,boss:1},king:{hp:4000,dmg:40,spd:44,hw:12,boss:1,fly:1}};
const ENAME={brood:'THE BROOD MOTHER',king:'THE HOLLOW KING'};
function mkEnemy(type,x,y,k){const b=EB[type],g=gdepth(k),rv=mod('rav')?1.6:1,m=b.boss?rv:(1+g*.6)*rv,dm=b.boss?rv:(1+g*.35)*rv,hp=b.hp*m;
 return{type,x,y,vx:0,vy:0,hp,mhp:hp,dmg:b.dmg*dm,spd:b.spd*(1+(b.boss?0:g*.05)),hw:b.hw,fly:!!b.fly,armor:!!b.armor,boss:!!b.boss,
  st:type==='bat'?'roost':type==='burrower'?'under':type==='stalker'?'hunt':b.boss?'sleep':'idle',t:rnd(0,2),fl:0,k,dir:rnd(0,6.28),cd:rnd(.5,1.5),cd2:rnd(1,3),acd:0,an:rnd(0,9),al:0,os:Math.random()<.5?-1:1,slow:0,under:type==='burrower',alpha:1,ph:1,n:0}}
function nearFlare(e){for(const f of flares)if(Math.hypot(f.x-e.x,f.y-e.y)<TS*5)return f;return null}
function contactMul(e){switch(e.type){case 'crawler':return e.st==='charge'?1:e.st==='stalk'?.5:0;case 'bat':return e.st==='fly'||e.st==='swoop'?1:0;case 'spitter':return .4;case 'burrower':return e.st==='up'?.6:0;case 'stalker':return e.st==='hunt'||e.st==='lunge'?1:0;case 'golem':return .5;case 'wraith':return e.st==='drift'?.5:0;case 'sporeling':return 0;default:return e.st==='charge'?1:(e.st==='sleep'||e.st==='roar'||e.under)?0:.6}}
function updEnemy(e,dt){
 const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;if(d>TS*28&&!e.boss)return;
 e.fl-=dt;e.cd-=dt;e.cd2-=dt;e.acd-=dt;e.an+=dt;e.al-=dt;e.t-=dt;if(e.slow>0)e.slow-=dt;
 const tx=Math.floor(e.x/TS),ty=Math.floor(e.y/TS),vis=!P.dead&&d<TS*9&&los(tx,ty,Math.floor(P.x/TS),Math.floor(P.y/TS));if(vis)e.al=Math.max(e.al,2.5);const sees=vis||(!P.dead&&e.al>0);
 const sm=e.slow>0?.5:1;let ax=0,ay=0,sp=e.spd*sm,nocol=false;const mode=e.fly?2:1;
 const toP=()=>{ax=dx/d;ay=dy/d},away=()=>{ax=-dx/d;ay=-dy/d};
 const orbit=r=>{const a=Math.atan2(e.y-P.y,e.x-P.x)+e.os*.9,gx=P.x+Math.cos(a)*r,gy=P.y+Math.sin(a)*r,l=Math.hypot(gx-e.x,gy-e.y)||1;ax=(gx-e.x)/l;ay=(gy-e.y)/l};
 const wander=m=>{if(e.t<=0){e.dir=rnd(0,6.28);e.t=rnd(1,3)}ax=Math.cos(e.dir)*m;ay=Math.sin(e.dir)*m};
 const fl=nearFlare(e);
 switch(e.type){
 case 'crawler':{
  if(e.st==='idle'){wander(.35);if(sees){e.st='stalk';SND.chit(e.x);alertNear(e.x,e.y,5);hintOnce('enemy','Crawlers circle and <b>charge</b>. Watch for the shudder, then sidestep.')}}
  else if(e.st==='stalk'){orbit(46);if(d>100)toP();if(e.cd<=0&&d<85&&vis){e.st='wind';e.t=.45;SND.chit(e.x)}if(e.hp<e.mhp*.3&&!e.fled){e.fled=1;e.st='flee';e.t=1.4}if(!sees&&d>TS*14)e.st='idle'}
  else if(e.st==='wind'){if(e.t<=0){e.st='charge';e.t=.36;const px=P.x+P.vx*.25,py=P.y+P.vy*.25,l=Math.hypot(px-e.x,py-e.y)||1;e.cx=(px-e.x)/l;e.cy=(py-e.y)/l}}
  else if(e.st==='charge'){ax=e.cx;ay=e.cy;sp=e.spd*4.4*sm;if(e.t<=0){e.st='rec';e.t=.6}}
  else if(e.st==='rec'){if(e.t<=0){e.st='stalk';e.cd=rnd(.9,1.7)}}
  else if(e.st==='flee'){away();sp*=1.4;if(e.t<=0)e.st='stalk'}break}
 case 'bat':{
  if(e.st==='roost'){if(!P.dead&&(d<TS*6||e.al>0)){e.st='fly';e.t=rnd(1,2);SND.bat(e.x);alertNear(e.x,e.y,4)}}
  else if(e.st==='fly'){if(fl){ax=e.x-fl.x;ay=e.y-fl.y;const l=Math.hypot(ax,ay)||1;ax/=l;ay/=l;break}const a=Math.atan2(-dy,-dx)+e.an*1.3*e.os,gx=P.x+Math.cos(a)*38+Math.sin(e.an*7)*10,gy=P.y+Math.sin(a)*30,l=Math.hypot(gx-e.x,gy-e.y)||1;ax=(gx-e.x)/l;ay=(gy-e.y)/l;
   if(e.t<=0){e.st='swoop';e.t=.45;e.cx=dx/d;e.cy=dy/d;SND.bat(e.x)}if(d>TS*16||P.dead)e.st='roost'}
  else if(e.st==='swoop'){ax=e.cx;ay=e.cy;sp=e.spd*2.5*sm;if(e.t<=0){e.st='fly';e.t=rnd(1.2,2.6)}}break}
 case 'spitter':{
  if(e.st==='idle'){wander(.3);if(sees){e.st='kite';hintOnce('spitter','<b>Spitters</b> keep their distance and lob acid. Close in fast or shoot back.')}}
  else if(e.st==='kite'){if(d<75)away();else if(d>130)toP();else{ax=-dy/d*e.os;ay=dx/d*e.os}if(Math.random()<dt*.5)e.os*=-1;if(e.cd<=0&&vis&&d<190){e.st='aim';e.t=.55}if(!sees&&d>TS*14)e.st='idle'}
  else if(e.st==='aim'){if(e.t<=0){const a=Math.atan2(P.y-4+P.vy*.35-e.y,P.x+P.vx*.35-e.x),n=gdepth(e.k)>=3?3:1;for(let i=0;i<n;i++)eshoot(e.x,e.y-4,a+(i-(n-1)/2)*.22,140,e.dmg,'glob');SND.spit(e.x);e.st='kite';e.cd=rnd(1.1,1.8)}}break}
 case 'burrower':{
  if(e.st==='under'){nocol=true;e.under=true;if(sees||d<TS*10){toP()}else wander(.4);
   if(Math.random()<dt*14)part({x:e.x+rnd(-4,4),y:e.y+rnd(-3,3),vx:rnd(-10,10),vy:rnd(-10,10),life:.6,col:[110,100,88],sz:2,type:'dust'});if(Math.random()<dt*1.2&&d<TS*8)SND.burrow(e.x);
   if(d<14&&e.cd<=0&&!solidPx(e.x,e.y)){e.st='rise';e.t=.75;SND.rumble(.12);hintOnce('burrow','Something is moving <b>under the rock</b>. When the ground cracks, <b>move!</b>')}}
  else if(e.st==='rise'){nocol=true;if(e.t<=0){e.st='up';e.under=false;e.t=2.4;SND.emerge(e.x);shake(.3);for(let n=0;n<14;n++)part({x:e.x,y:e.y,vx:rnd(-80,80),vy:rnd(-80,80),z:2,vz:rnd(40,110),life:rnd(.5,1),col:[104,94,82],sz:ri(1,2)});if(!P.dead&&d<18)hurtPlayer(e.dmg,dx/d,dy/d)}}
  else if(e.st==='up'){toP();sp=e.spd*.45*sm;if(e.t<=0){e.st='dig';e.t=.5}}
  else if(e.st==='dig'){if(e.t<=0){e.st='under';e.under=true;e.cd=rnd(1.5,2.5)}}break}
 case 'stalker':{
  if(P.dead||d>TS*18)break;
  if(fl){ax=e.x-fl.x;ay=e.y-fl.y;const l=Math.hypot(ax,ay)||1;ax/=l;ay/=l;sp=e.spd*2*sm;break}
  const lit=P.oil>0&&RUN.dark<=0&&d<lampR()*TS*.7;
  if(e.st==='hunt'){toP();sp=(lit?e.spd*.45:e.spd*2.6)*sm;if(!lit&&d<50&&e.cd<=0){e.st='wind';e.t=.3}if(!e.seen&&d<TS*9){e.seen=1;SND.growl(e.x);hintOnce('stalker','Something pale watches from the dark. It fears your light... and <b>flares</b>.')}}
  else if(e.st==='wind'){if(e.t<=0){e.st='lunge';e.t=.25;e.cx=dx/d;e.cy=dy/d}}
  else if(e.st==='lunge'){ax=e.cx;ay=e.cy;sp=e.spd*6*sm;if(e.t<=0){e.st='hunt';e.cd=rnd(1.5,2.5)}}
  if(Math.random()<dt*.05)SND.growl(e.x);break}
 case 'golem':{
  if(e.st==='idle'){if(sees){e.st='walk';hintOnce('golem','<b>Golems</b> are armored. Weak weapons barely scratch them. Stay out of the slam circle.')}break}
  if(e.st==='walk'){toP();if(d<46&&e.cd<=0){e.st='slam';e.t=1;zones.push({x:e.x,y:e.y,r:44,t:0,T:1,dmg:e.dmg});SND.gwind(e.x)}else if(d>90&&d<220&&e.cd2<=0&&vis){e.st='throw';e.t=.7}}
  else if(e.st==='slam'){if(e.t<=0){e.st='walk';e.cd=rnd(2.5,3.5);for(let n=0;n<2;n++)dropRock(e.x+rnd(-50,50),e.y+rnd(-50,50))}}
  else if(e.st==='throw'){if(e.t<=0){eshoot(e.x,e.y-6,Math.atan2(P.y-4-e.y,P.x-e.x),120,e.dmg*.8,'boulder');e.st='walk';e.cd2=rnd(3,5)}}break}
 case 'wraith':{
  if(e.st==='idle'){if(sees){e.st='drift';SND.wraith(e.x);hintOnce('wraith','<b>Frost Wraiths</b> blink next to you and fire ice. Keep moving.')}break}
  if(fl&&e.st==='drift'){ax=e.x-fl.x;ay=e.y-fl.y;const l=Math.hypot(ax,ay)||1;ax/=l;ay/=l;break}
  if(e.st==='drift'){orbit(70);if(e.cd<=0&&d<200){e.st='fade';e.t=.4;SND.wraith(e.x)}}
  else if(e.st==='fade'){e.alpha=Math.max(0,e.t/.4);if(e.t<=0){for(let tr=0;tr<20;tr++){const a=rnd(0,6.28),r=rnd(48,70),nx=P.x+Math.cos(a)*r,ny=P.y+Math.sin(a)*r;if(!blocked(nx,ny,e.hw,2)){e.x=nx;e.y=ny;break}}e.st='appear';e.t=.5}}
  else if(e.st==='appear'){e.alpha=1-Math.max(0,e.t/.5);if(e.t<=0){e.alpha=1;const a=Math.atan2(P.y-4-e.y,P.x-e.x);for(let i=-1;i<=1;i++)eshoot(e.x,e.y-4,a+i*.25,150,e.dmg,'ice');SND.shoot('frost');e.st='drift';e.cd=rnd(2.2,3.4)}}break}
 case 'sporeling':{
  if(e.st==='idle'){wander(.3);if(sees){e.st='rush';hintOnce('spore','<b>Sporelings</b> explode when they reach you. Kill them at range or back off!')}}
  else if(e.st==='rush'){toP();sp=e.spd*1.2*sm;if(d<22){e.st='fuse';e.t=.8;SND.fuseS(e.x)}}
  else if(e.st==='fuse'){if(e.t<=0){sporeBurst(e,true);return}}break}
 case 'brood':case 'king':{
  const r=bossAI(e,dt,dx,dy,d,vis);ax=r[0];ay=r[1];sp=r[2]*sm;nocol=!!r[3];break}}
 const fast=e.st==='charge'||e.st==='swoop'||e.st==='lunge',f=1-Math.exp(-dt*(fast?20:7));e.vx+=(ax*sp-e.vx)*f;e.vy+=(ay*sp-e.vy)*f;
 if(nocol){e.x=clamp(e.x+e.vx*dt,TS*1.5,MW*TS-TS*1.5);e.y=clamp(e.y+e.vy*dt,TS*1.5,MH*TS-TS*1.5)}
 else{const hit=moveBox(e,e.vx*dt,e.vy*dt,e.hw,mode);if(hit&&e.st==='charge'){e.st=e.boss?'move':'rec';e.t=e.boss?1:.8;shake(e.boss?.4:.05);if(e.boss)SND.impact(e.x)}}
 const cm=contactMul(e);if(!P.dead&&cm>0&&!e.under&&d<e.hw+7&&e.acd<=0){e.acd=e.boss?.65:.75;hurtPlayer(e.dmg*cm,dx/d,dy/d);if(e.type==='bat'){e.st='fly';e.t=rnd(1.5,3)}}}
function bossAI(e,dt,dx,dy,d,vis){
 if(e.st==='sleep'){if(!P.dead&&d<TS*10){e.st='roar';e.t=1.6;SND.roar();shake(.6);msg(ENAME[e.type],3);hintOnce('boss_'+e.type,e.type==='brood'?'<b>The Brood Mother!</b> Watch her wind-ups, dodge her acid, and thin out her brood.':'<b>The Hollow King.</b> Get off the marked ground and slip between his rings of void.')}return[0,0,0]}
 if(e.st==='roar'){if(e.t<=0){e.st='move';e.t=1.2}return[0,0,0,0]}
 if(e.hp<e.mhp*.5&&e.ph===1){e.ph=2;SND.roar();shake(.5);msg('ENRAGED',2);e.spd*=1.25}
 const p2=e.ph===2;let ax=0,ay=0,sp=e.spd,nc=0;
 switch(e.st){
 case 'move':{const a=Math.atan2(e.y-P.y,e.x-P.x)+.6*e.os,r=e.type==='king'?80:64,gx=P.x+Math.cos(a)*r,gy=P.y+Math.sin(a)*r,l=Math.hypot(gx-e.x,gy-e.y)||1;ax=(gx-e.x)/l;ay=(gy-e.y)/l;if(Math.random()<dt*.3)e.os*=-1;if(e.t<=0&&!P.dead)pickBossAttack(e,p2);break}
 case 'wind':{if(Math.random()<.5)part({x:e.x+rnd(-8,8),y:e.y+rnd(-8,8),vx:rnd(-20,20),vy:rnd(-20,20),life:.4,col:[120,110,100],sz:3,type:'dust'});if(e.t<=0){e.st='charge';e.t=.6;e.cx=dx/d;e.cy=dy/d;SND.roar()}break}
 case 'charge':{ax=e.cx;ay=e.cy;sp=e.spd*4;if(e.t<=0){e.st='move';e.t=rnd(1,1.8)}break}
 case 'volley':{if(e.t<=0){const a=Math.atan2(P.y-4-e.y,P.x-e.x),n=p2?7:5;for(let i=0;i<n;i++)eshoot(e.x,e.y,a+(i-(n-1)/2)*.2,150,e.dmg*.7,'glob');SND.spit(e.x);e.n++;if(e.n<(p2?3:2))e.t=.45;else{e.n=0;e.st='move';e.t=rnd(1,1.6)}}break}
 case 'summon':{if(e.t<=0){let c=0;for(const q of enemies)if(!q.boss&&Math.hypot(q.x-e.x,q.y-e.y)<TS*14)c++;if(c<6)for(let i=0;i<(e.type==='king'?2:3);i++){const a=rnd(0,6.28),x=e.x+Math.cos(a)*26,y=e.y+Math.sin(a)*26;if(!blocked(x,y,5,1)){const m=mkEnemy(e.type==='king'?'wraith':'crawler',x,y,e.k);m.al=6;m.st=e.type==='king'?'drift':'stalk';enemies.push(m);for(let j=0;j<8;j++)part({x,y,vx:rnd(-30,30),vy:rnd(-30,30),life:rnd(.6,1),col:[100,90,80],sz:4,type:'dust'})}}e.st='move';e.t=rnd(1.2,2)}break}
 case 'dive':{e.under=true;nc=1;ax=dx/d;ay=dy/d;sp=e.spd*1.4;if(Math.random()<dt*20)part({x:e.x+rnd(-8,8),y:e.y+rnd(-6,6),vx:rnd(-15,15),vy:rnd(-15,15),life:.7,col:[110,100,88],sz:3,type:'dust'});if(e.t<=0&&!solidPx(e.x,e.y)){e.st='rise';e.t=1;zones.push({x:e.x,y:e.y,r:40,t:0,T:1,dmg:e.dmg*1.2})}break}
 case 'rise':{e.under=true;nc=1;if(e.t<=0){e.under=false;SND.emerge(e.x);shake(.6);for(let n=0;n<6;n++)dropRock(e.x+rnd(-70,70),e.y+rnd(-70,70));e.st='move';e.t=1.5}break}
 case 'slam':{if(e.t<=0){zones.push({x:P.x+P.vx*.3,y:P.y+P.vy*.3,r:30,t:0,T:1,dmg:e.dmg});SND.gwind(e.x);e.n++;e.t=.45;if(e.n>=(p2?5:3)){e.n=0;e.st='move';e.t=1.6}}break}
 case 'orbs':{if(e.t<=0){const n=p2?20:14,off=e.n*.3;for(let i=0;i<n;i++)eshoot(e.x,e.y-8,off+i/n*6.283,95,e.dmg*.6,'orb');SND.wraith(e.x);e.n++;e.t=.7;if(e.n>=(p2?3:2)){e.n=0;e.st='move';e.t=1.4}}break}
 case 'dark':{if(e.t<=0){RUN.dark=5;msg('THE LIGHT FADES',2);SND.roar();for(let i=0;i<2;i++){const a=rnd(0,6.28),x=P.x+Math.cos(a)*70,y=P.y+Math.sin(a)*70;if(!blocked(x,y,4,2)){const m=mkEnemy('wraith',x,y,e.k);m.st='drift';m.al=6;enemies.push(m)}}e.st='move';e.t=1.5}break}}
 return[ax,ay,sp,nc]}
function pickBossAttack(e,p2){const o=e.type==='brood'?['wind','volley','summon','wind'].concat(p2?['dive','volley','dive']:[]):['slam','orbs','summon','wind'].concat(p2?['dark','orbs','slam']:[]);const s=o[ri(0,o.length-1)];e.st=s;e.n=0;
 if(s==='wind')e.t=.7;else if(s==='volley')e.t=.6;else if(s==='summon'){e.t=.8;SND.roar()}else if(s==='dive'){e.t=2;SND.burrow(e.x)}else if(s==='slam')e.t=0;else if(s==='orbs')e.t=.7;else e.t=.1}
function bossDefeated(e){SND.bossDie();shake(1);hitstop=.4;dlights.push({x:e.x,y:e.y,r:12,c:[1,.9,.7],life:2,max:2});for(let n=0;n<80;n++)part({x:e.x,y:e.y,vx:rnd(-160,160),vy:rnd(-160,160),life:rnd(.5,1.6),col:e.type==='king'?[200,170,255]:[255,200,120],type:'spark',keep:1});
 for(const q of enemies)if(!q.boss&&Math.hypot(q.x-e.x,q.y-e.y)<TS*16){q.dead=1;for(let n=0;n<6;n++)part({x:q.x,y:q.y,vx:rnd(-40,40),vy:rnd(-40,40),life:.8,col:[90,80,70],sz:3,type:'dust'})}
 const first=!S.boss[e.type];S.boss[e.type]=1;
 if(e.type==='brood'){drop('heart',e.x,e.y,1);for(let i=0;i<3;i++)drop('starmetal',e.x,e.y);ach('brood');if((S.unl[1]||0)<1)S.unl[1]=1;msg('THE BROOD MOTHER IS DEAD',4);showHint('The ice below cracks open. <b>The Frozen Deep</b> can now be reached from camp.',8)}
 else{drop('crown',e.x,e.y,1);for(let i=0;i<3;i++)drop('voidstone',e.x,e.y);ach('king');S.won=true;if(first)S.wins++;RUN.won=1;msg('THE HOLLOW KING FALLS',4);setTimeout(()=>{if(state==='run'&&P&&!P.dead)showVictory()},4000)}
 save();boss=null}
function sporeBurst(e,armed){e.dead=1;SND.pop(e.x);for(let n=0;n<(armed?30:10);n++)part({x:e.x,y:e.y,vx:rnd(-60,60),vy:rnd(-60,60),life:rnd(.8,1.6),col:[130,100,120],sz:rnd(3,7),type:'gas'});if(armed){shake(.3);const d=Math.hypot(P.x-e.x,P.y-e.y)||1;if(!P.dead&&d<34)hurtPlayer(e.dmg,(P.x-e.x)/d,(P.y-e.y)/d);for(const q of enemies)if(q!==e&&!q.boss&&Math.hypot(q.x-e.x,q.y-e.y)<30)hurtEnemy(q,8,0,0)}}
function hurtEnemy(e,dm,nx,ny,slow){if(e.dead||e.under)return;if(e.st==='sleep'){e.st='roar';e.t=1;SND.roar();msg(ENAME[e.type],3)}
 if(e.armor){const red=Math.max(dm*.55,dm-5);if(red<dm*.75)SND.armor(e.x);dm=red}
 e.hp-=dm;e.fl=.12;const kb=e.boss?20:e.armor?50:170;e.vx+=nx*kb;e.vy+=ny*kb;e.al=6;if(slow)e.slow=2.5;
 if(!e.boss&&(e.st==='wind'||e.st==='charge'||e.st==='aim'||e.st==='lunge')){e.st=e.type==='spitter'?'kite':e.type==='stalker'?'hunt':'rec';e.t=.5}
 if(e.st==='idle')e.st=e.type==='spitter'?'kite':e.type==='golem'?'walk':e.type==='wraith'?'drift':e.type==='sporeling'?'rush':'stalk';if(e.st==='roost')e.st='fly';
 SND.ehit(e.x);for(let n=0;n<5;n++)part({x:e.x,y:e.y,vx:nx*60+rnd(-40,40),vy:ny*60+rnd(-40,40),z:4,vz:rnd(20,60),life:rnd(.4,.9),col:e.type==='golem'?[110,104,96]:e.type==='wraith'?[170,200,220]:[74,82,52]});
 text(e.x,e.y-12,''+Math.round(dm*10)/10,[230,210,180],0);
 if(e.hp<=0){e.dead=1;S.stats.kills++;S.stats.kt[e.type]=(S.stats.kt[e.type]||0)+1;if(S.stats.kills>=100)ach('kills');
  if(e.boss){bossDefeated(e);return}
  if(e.type==='sporeling'){sporeBurst(e,false);return}
  SND.edie(e.x);for(let n=0;n<12;n++)part({x:e.x,y:e.y,vx:rnd(-70,70),vy:rnd(-70,70),z:4,vz:rnd(30,80),life:rnd(.5,1),col:e.type==='stalker'?[140,130,120]:e.type==='wraith'?[170,200,220]:[60,52,44]});
  const r=Math.random();if((e.type==='crawler'||e.type==='spitter')&&r<.35)drop('chitin',e.x,e.y);else if(e.type==='golem'){drop(pickOre(e.k),e.x,e.y);drop(pickOre(e.k),e.x,e.y)}else if(e.type==='burrower'&&r<.4)drop(pickOre(e.k),e.x,e.y);else if(e.type==='wraith'&&r<.3)drop(ACT?'frostite':'bolts',e.x,e.y);else if(e.type==='stalker'&&r<.2)drop('oil',e.x,e.y)}}

// ---------- creature sprites ----------
function drawEnemy(e,camx,camy){const x=Math.round(e.x-camx),y=Math.round(e.y-camy);if(x<-30||y<-40||x>VW+30||y>VH+30||e.under)return;const w=e.fl>0?'#e8e0d0':null,s=e.vx>=0?1:-1;cx.globalAlpha=clamp(e.alpha==null?1:e.alpha,0,1);
 switch(e.type){
 case 'crawler':{const c=w||(ACT?'#3e4650':e.k>=4?'#4a2a22':'#3a332c'),hl=w||'#5e5246',j=e.st==='wind'?ri(-1,1):0,lg=Math.floor(e.an*12)%2;px(x-6,y+2,12,3,'rgba(0,0,0,.35)');
  for(const i of[-3,0,3]){px(x+i+j,y-5+((lg+i)&1),1,2,w||'#221c18');px(x+i+j,y+3+((lg+i+1)&1),1,2,w||'#221c18')}
  px(x-5+j,y-3,10,6,c);px(x-4+j,y-4,8,1,c);px(x-4+j,y+3,8,1,c);px(x-3+j,y-3,5,1,hl);px(x-4+j,y,8,1,w||'#241e19');px(x+s*5+(s<0?-1:0)+j,y-2,2,4,w||'#2a241f');px(x+s*7+j,y-2,1,1,w||'#1a1410');px(x+s*7+j,y+1,1,1,w||'#1a1410');break}
 case 'bat':{const c=w||'#4a3e40',wf=Math.sin(e.an*25)>0;px(x-2,y+7,4,2,'rgba(0,0,0,.25)');px(x-2,y-2,4,4,c);if(wf){px(x-6,y-3,4,2,c);px(x+2,y-3,4,2,c)}else{px(x-6,y,4,2,c);px(x+2,y,4,2,c)}break}
 case 'spitter':{const c=w||'#4a5040',sac=e.st==='aim'?'#b8d060':'#6e7c46',lg=Math.floor(e.an*10)%2;px(x-6,y+3,12,3,'rgba(0,0,0,.35)');for(const i of[-4,-1,2])px(x+i,y+2+((lg+i)&1),1,2,w||'#262a20');px(x-5,y-3,10,6,c);px(x-4,y-4,8,1,c);px(x-3,y-3,4,1,w||'#62684e');px(x-s*3-2,y-7,5,5,w||sac);px(x-s*3-1,y-7,2,1,w||'#d0e090');px(x+s*5+(s<0?-1:0),y-2,2,3,w||'#2e3226');break}
 case 'burrower':{if(e.st==='rise')break;const c=w||'#7a6252';px(x-7,y+4,14,3,'rgba(0,0,0,.35)');px(x-6,y-6,12,11,c);px(x-5,y-7,10,1,c);px(x-4,y-5,4,2,w||'#98806c');px(x-3,y-2,6,4,w||'#2a1c16');for(const i of[-3,-1,1])px(x+i,y-2,1,1,'#d8ccb0');px(x-6,y+1,12,1,w||'#5e4a3e');break}
 case 'stalker':{const c=w||(ACT?'#8a8c98':'#8c8378'),lg=Math.floor(e.an*8)%2;px(x-4,y+3,8,2,'rgba(0,0,0,.3)');px(x-2,y-8,4,10,c);px(x-2,y-11,4,3,c);px(x-1,y-8,1,9,w||'#6e665c');px(x-5,y-6+lg,3,1,c);px(x+2,y-6+(1-lg),3,1,c);px(x-6,y-5+lg,1,3,c);px(x+5,y-5+(1-lg),1,3,c);px(x-2,y+2,1,2+lg,c);px(x+1,y+2,1,3-lg,c);break}
 case 'golem':{const c=w||(ACT?'#6a7280':'#6e665e'),up=e.st==='slam'?-3:0;px(x-8,y+5,16,3,'rgba(0,0,0,.4)');px(x-6,y-9,12,14,c);px(x-5,y-10,10,1,c);px(x-5,y-8,4,3,w||'#8a8278');px(x-6,y-2,12,1,w||'#4e4842');px(x+1,y-5,1,4,w||'#4e4842');px(x-9,y-7+up,3,8,c);px(x+6,y-7+up,3,8,c);px(x-4,y+5,3,2,c);px(x+1,y+5,3,2,c);break}
 case 'wraith':{const c=w||'#9aaabb';cx.globalAlpha*=.78;px(x-3,y-8,6,7,c);px(x-2,y-9,4,1,c);for(let i=0;i<4;i++)px(x-2+Math.round(Math.sin(e.an*6+i)*1.5),y-1+i,4-i,1,c);break}
 case 'sporeling':{const bl=e.st==='fuse'&&Math.floor(TT*12)%2,c=w||(bl?'#e8d8e0':'#8a5e74'),lg=Math.floor(e.an*14)%2;px(x-4,y+2,8,2,'rgba(0,0,0,.3)');px(x-4,y-5,8,4,c);px(x-3,y-6,6,1,c);px(x-2,y-5,1,1,w||'#c0a0b0');px(x+1,y-4,1,1,w||'#c0a0b0');px(x-1,y-1,2,3,w||'#b8aa98');px(x-2,y+1+lg,1,1,'#6a5a4a');px(x+1,y+2-lg,1,1,'#6a5a4a');break}
 case 'brood':{const c=w||'#4a3a30',lg=Math.floor(e.an*10)%2,j=e.st==='wind'?ri(-1,1):0;px(x-14,y+6,28,5,'rgba(0,0,0,.4)');for(let i=-9;i<=9;i+=4){px(x+i+j,y-11+((lg+(i>>2))&1)*2,2,4,w||'#2a201a');px(x+i+j,y+7-((lg+(i>>2))&1)*2,2,4,w||'#2a201a')}
  px(x-12+j,y-7,24,14,c);px(x-10+j,y-9,20,2,c);px(x-10+j,y+7,20,1,c);px(x-8+j,y-7,12,2,w||'#6a5646');for(const q of[[-6,-2],[-1,1],[4,-3]])px(x+q[0]+j,y+q[1],4,3,w||'#b8a888');px(x+s*12+(s<0?-3:0)+j,y-4,3,8,w||'#2e241c');break}
 case 'king':{const c=w||'#3e3450',b=Math.round(Math.sin(e.an*2)*2);px(x-10,y+8,20,4,'rgba(0,0,0,.4)');px(x-8,y-14+b,16,20,c);px(x-10,y-4+b,20,12,w||'#2e2640');px(x-5,y-20+b,10,7,w||'#4a4060');px(x-6,y-24+b,12,3,'#c8a860');for(const i of[-6,-2,2,5])px(x+i,y-26+b,1,2,'#e0c070');px(x-12,y-10+b,3,12,c);px(x+9,y-10+b,3,12,c);break}}
 cx.globalAlpha=1}
function enemyEyes(e,camx,camy){if(e.under||(e.alpha!=null&&e.alpha<.3))return;const x=Math.round(e.x-camx),y=Math.round(e.y-camy),l=lightAt(e.x,e.y),a=e.boss?.95:(1-clamp(l*4,0,1))*.9;if(a<=.05)return;cx.globalAlpha=a;const s=e.vx>=0?1:-1;
 switch(e.type){case 'stalker':px(x-1,y-10,1,1,'#efe4c8');px(x+1,y-10,1,1,'#efe4c8');break;case 'crawler':px(x+s*5,y-1,1,1,'#b0603a');px(x+s*5,y+1,1,1,'#b0603a');break;case 'spitter':if(e.st==='aim'){cx.globalAlpha=.8;px(x-s*3-1,y-6,3,3,'#d8f080')}px(x+s*5,y-1,1,1,'#c0d060');break;case 'golem':px(x-2,y-6,1,1,'#e0a040');px(x+2,y-6,1,1,'#e0a040');break;case 'wraith':px(x-2,y-6,1,1,'#e8f4ff');px(x+1,y-6,1,1,'#e8f4ff');break;case 'burrower':if(e.st==='up'){px(x-3,y-4,1,1,'#e07050');px(x+2,y-4,1,1,'#e07050')}break;case 'brood':for(const i of[-2,0,2])px(x+s*10+i,y-3,1,1,'#e06040');break;case 'king':{const b=Math.round(Math.sin(e.an*2)*2);px(x-3,y-17+b,2,1,'#e8e0ff');px(x+2,y-17+b,2,1,'#e8e0ff');break}case 'bat':px(x-1,y-1,1,1,'#a04a3a');px(x+1,y-1,1,1,'#a04a3a');break}
 cx.globalAlpha=1}
