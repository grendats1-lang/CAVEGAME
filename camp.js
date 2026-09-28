'use strict';
// Signs use the same geometry in the world and in the accessible place guide.
const CAMP_LAYOUT={smelter:[184,98],workshop:[285,73],map:[395,105],tower:[518,74],board:[276,164],marrow:[163,172],training:[484,189],archive:[177,282],gallery:[290,301],garden:[409,278],locker:[62,285],lift:[534,282],fire:[365,203]};
function cpx(x,y,w,h,c){px(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)),c)}
const campPixelScale=()=>innerWidth<700?3:Math.max(3,Math.min(4,Math.floor(innerHeight/220)));
const STATION_SIGNS={
 forge:{use:'Craft picks, weapons and enchantments',path:'M1 5H15L12 9H9V12H12V14H4V12H6V9H3Z'},
 smelter:{use:'Turn banked ore into useful bars',path:'M3 2H13V14H3ZM5 4V7H11V4ZM6 11L8 8L10 11L8 13Z'},
 workshop:{use:'Make ropes, flares and supplies',path:'M3 1L6 4L5 7L13 12L11 14L4 7L1 6V2L3 4L4 3Z'},
 infirmary:{use:'Improve health and death salvage',path:'M6 1H10V6H15V10H10V15H6V10H1V6H6Z'},
 map:{use:'Choose routes and optional biomes',path:'M1 3L5 1L11 3L15 1V13L11 15L5 13L1 15ZM5 3V11L7 12V4ZM10 5V12L12 13V4Z'},
 archive:{use:'Read recovered stories and research',path:'M1 2H6L8 4L10 2H15V13H10L8 15L6 13H1ZM3 4V11H6V5ZM10 5V11H13V4Z'},
 board:{use:'Choose what to do on your next trip',path:'M4 1H12V3H14V15H2V3H4ZM5 5V7H11V5ZM5 9V10H11V9ZM5 12V13H9V12Z'},
 training:{use:'Try your weapons on a safe target',path:'M3 1H13V3H15V13H13V15H3V13H1V3H3ZM4 4V12H12V4ZM6 6H10V10H6Z'},
 gallery:{use:'See relics and claim collections',path:'M4 2H12L15 6L8 15L1 6ZM4 5L8 11L12 5H10L8 8L6 5Z'},
 tower:{use:'Hear rumors and choose run conditions',path:'M7 5H9V15H7ZM3 3H5V5H3V9H5V11H3L1 9V5ZM11 3H13L15 5V9L13 11H11V9H13V5H11ZM7 1H9V3H7Z'},
 garden:{use:'Research the Root and its endings',path:'M7 15V9L2 8L1 3L6 4L8 7L10 2H15L14 7L9 10V15Z'},
 marrow:{use:'Talk to Old Marrow about Iona',path:'M8 1L16 14H10L8 9L6 14H0ZM8 4L3 12H5L8 7L11 12H13Z'},
 locker:{use:'Protect materials or sell spare ore',path:'M2 3H14L16 6V14H0V6ZM2 8V12H14V8H10V10H6V8ZM7 6V8H9V6Z'},
 lift:{use:'Prepare an expedition and descend',path:'M1 1H15V15H12V4H4V15H1ZM7 5H9V10H12L8 14L4 10H7Z'},
 fire:{use:'Rest by the fire and hear camp news',path:'M8 0L12 5L14 10L12 14H4L2 10L4 5L5 9L8 6ZM8 9L6 12H10Z'}
};
const SIGN_PATHS=Object.fromEntries(Object.entries(STATION_SIGNS).map(([k,v])=>[k,new Path2D(v.path)]));
function stationIcon(id){return `<svg class='station-symbol' viewBox='-3 -3 22 22' aria-hidden='true'><path fill-rule='evenodd' d='${STATION_SIGNS[id].path}'/></svg>`}
function campNextStep(){
 if(!S.exp.flags.briefed)return {id:'marrow',title:'Meet Old Marrow',text:'His niece Iona sent a signal from below. Hear him out.'};
 if(!S.exp.flags.extraction)return {id:'lift',title:'Bring Iona’s signal home',text:'Head to the lift. Your first trip is a short rescue mission.'};
 if(S.gear.pick===0)return {id:'forge',title:'Turn your haul into a better pick',text:'Visit the Forge. A Copper Pick costs $35, 4 copper and 3 coal.'};
 if(!S.exp.visited.archive)return {id:'archive',title:'Listen to the recovered recording',text:'The Archive is open. Find out what Iona discovered.'};
 return {id:'board',title:'Choose your next reason to descend',text:'Pick a contract, keep the ore it needs, then leave from the lift.'};
}
function guideHTML(routes=true){const n=campNextStep(),steps=[['Meet Marrow',!!S.exp.flags.briefed],['Recover Iona’s relay',!!S.exp.flags.object],['Bring the signal home',!!S.exp.flags.extraction],['Craft a better pick',S.gear.pick>0]];
 return `<section class='guide-next'><span class='eyebrow'>YOUR NEXT STEP</span><h3>${n.title}</h3><p>${n.text}</p>${routes?`<button data-route='${n.id}' class='go'>SHOW ME THE WAY ${stationIcon(n.id)}</button>`:''}</section><ol class='guide-checklist'>${steps.map(([t,done])=>`<li class='${done?'done':''}'><span aria-label='${done?'Complete':'To do'}'>${done?'✓':'○'}</span>${t}</li>`).join('')}</ol><div class='guide-lessons'><section><h3>1 · Leave camp</h3><p>On a new save, the short arrival scene leads into your first descent. At camp, walk with <kbd>WASD</kbd> or the arrow keys. Approach a sign and press <kbd>E</kbd>, or tap the prompt. At the lift, keep the Surveyor loadout for your first trip and choose <b>Descend</b>. The rest of camp can wait.</p></section><section><h3>2 · Follow the blue lamps</h3><p>Move close to copper, aim with the mouse and hold <b>right mouse</b> to mine. Walk over the pieces to collect them. Iona’s relay needs <b>two copper</b>. Follow the blue marker, then press <kbd>E</kbd> at the relay.</p></section><section><h3>3 · Fight, light, retreat</h3><p><b>Left mouse</b> uses your selected tool; <kbd>1–6</kbd> or the wheel changes it. A pick can fight too. <kbd>F</kbd> throws a flare, <kbd>Q</kbd> drinks a tonic, <kbd>Z</kbd> pulses your lantern. Step away while enemies wind up. Watch HP and oil.</p></section><section><h3>4 · Bring something home</h3><p>Follow the gold lift arrow back to an active lift and press <kbd>E</kbd>. Your haul becomes safe camp stock. A rope (<kbd>R</kbd>) also escapes, but takes three uninterrupted seconds. <b>You can leave early.</b> Dying loses most carried loot; discoveries and camp upgrades remain.</p></section><section><h3>5 · Make the next trip easier</h3><p>Use the <b>anvil</b> sign to craft, the <b>chest</b> to protect or sell spare ore, and the <b>clipboard</b> to choose a contract. Restore stations when you can afford them. You do not need every building at once.</p></section><section><h3>Touch & comfort</h3><p>Use the direction pad to move. Underground, tap the cave to aim, hold <b>MINE</b> or <b>USE</b>, and tap the item buttons. In camp, tap a nearby building prompt to interact. <b>Escape</b> pauses underground; the main menu has sound, motion and contrast settings.</p></section></div>${routes?`<button data-exp='quick'>BUILDING SYMBOLS & ROUTES</button>`:''}`;
}
let campGuideKey='';
function updateCampGuide(){
 const n=campNextStep(),id=CAMP.destination||n.id,s=hubStations().find(s=>s.id===id),near=CAMP.near?.id===id,key=[id,near,n.title,CAMP.menu].join('|');
 if(key===campGuideKey)return;campGuideKey=key;
 $('camp-guide').innerHTML=`${stationIcon(id)}<div><span class='eyebrow'>${CAMP.destination?'YOUR DESTINATION':'NEXT STEP'}</span><strong>${esc(CAMP.destination?s.n:n.title)}</strong><p>${near?'You’re here. Press E or tap the prompt.':`Follow the gold trail to ${esc(s.n)}.`}</p></div><button data-exp='guide' aria-label='Open the step-by-step guide'>?</button>`;
}
// Recompute only after a destination changes or the player leaves the old route.
// Eight-unit nodes include the player's collision boundary, so a trail never crosses a cabin.
function campRoute(id){
 const s=hubStations().find(s=>s.id===id),step=8,W=80,H=45,start=Math.round(CAMP.y/step)*W+Math.round(CAMP.x/step),goal=Math.round((s.y+19)/step)*W+Math.round(s.x/step);
 if(CAMP.route?.id===id&&CAMP.route.points.some(p=>Math.hypot(p.x-CAMP.x,p.y-CAMP.y)<15))return CAMP.route.points;
 const prev=new Int32Array(W*H).fill(-1),q=[start];prev[start]=start;
 for(let i=0;i<q.length&&prev[goal]<0;i++){const a=q[i],x=a%W,y=Math.floor(a/W);for(const [dx,dy] of D4){const X=x+dx,Y=y+dy,b=Y*W+X;if(X<0||X>=W||Y<0||Y>=H||prev[b]>=0||hubBlocked(X*step,Y*step))continue;prev[b]=a;q.push(b)}}
 const points=[];if(prev[goal]>=0)for(let p=goal;p!==start;p=prev[p])points.push({x:p%W*step,y:Math.floor(p/W)*step});points.reverse();CAMP.route={id,points};return points;
}
let campTerrain=null;
function buildCampTerrain(){
 const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');
 const road=new Uint8Array(640*360),r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)};
 r(0,0,640,360,'#17201f');
 // A clearing and footpaths worn between actual destinations, rather than bordered plots.
 for(const station of hubStations()){
  const ox=CAMP.x,oy=CAMP.y,old=CAMP.route;CAMP.x=320;CAMP.y=224;CAMP.route=null;const path=campRoute(station.id);CAMP.x=ox;CAMP.y=oy;CAMP.route=old;
  for(const p of path)for(let yy=-9;yy<=9;yy++)for(let xx=-10;xx<=10;xx++){const x=p.x+xx,y=p.y+yy;if(x<0||x>=640||y<0||y>=360)continue;if(xx*xx+yy*yy<45+ih(x,y,54)*45)road[y*640+x]=1}
 }
 for(let y=0;y<360;y++)for(let x=0;x<640;x++){
  const h=ih(x>>2,y>>2,33),d=((x-343)/71)**2+((y-222)/30)**2;
  if(road[y*640+x]||d<1+ih(x,y,4)*.1){road[y*640+x]=1;r(x,y,1,1,h>.8?'#474335':h>.35?'#403d31':'#38392f')}
  else if(h>.74)r(x,y,1,1,'#202c27');
 }
 for(let i=0;i<2100;i++){
  const x=Math.floor(ih(i,2,9)*640),y=Math.floor(ih(i,3,9)*360);
  if(road[y*640+x]){if(i%4===0){r(x,y,2,1,'#605b46');r(x,y+1,3,1,'#2b3029')}}
  else {r(x,y,1,2,'#374536');if(i%3===0){r(x-1,y+1,3,1,'#303e30');r(x+1,y-1,1,1,'#48503a')}}
 }
 // Old rails, sleepers and puddles run past the supply shed into the shaft.
 for(let x=405;x<589;x+=9){r(x,318,3,15,'#302d27');r(x,319,3,1,'#62533b')}
 for(const y of [321,328]){r(403,y,190,1,'#727164');r(403,y+1,190,1,'#252e2d')}
 for(const [x,y,w] of [[107,254,22],[215,134,16],[472,304,19],[329,115,14]]){r(x,y,w,4,'#111e20');r(x+3,y-2,w-7,7,'#18272b');r(x+5,y,w-10,1,'#42534f')}
 // Ragged cliff edge. Openings remain available along the entire walkable boundary.
 for(let i=0;i<72;i++){const x=i*9,h=5+Math.floor(ih(i,7,6)*13);r(x,26-h,12,h,'#0f171a');r(x,26-h,12,1,'#43483d');r(x,27,10,5,'#202927')}
 return c;
}
function campCrate(x,y){cpx(x,y,9,8,'#27352c');cpx(x+.5,y,8,6,'#927a4b');cpx(x+1,y+1,7,1,'#b49b66');cpx(x+3,y,1,6,'#594b32');cpx(x+6,y,1,6,'#594b32');cpx(x,y+5,9,1,'#c0a974')}
function campLamp(x,y,t){
 cpx(x-1,y-16,2,19,'#1b302c');cpx(x-2,y-17,6,1,'#9aa588');cpx(x+2,y-16,1,4,'#526a59');cpx(x+1,y-13,4,5,'#423d29');cpx(x+2,y-12,2,3,'#ffdc86');
 const g=cx.createRadialGradient(x+2,y-10,1,x+2,y-10,24);g.addColorStop(0,'#ffe1a62c');g.addColorStop(1,'#edb45600');cx.fillStyle=g;cx.fillRect(x-23,y-35,50,50);
}
function campSign(s,x,y){
 cpx(x-10,y-8,21,2,'#121a1a');cpx(x-9,y-8,2,7,'#6c6250');cpx(x+8,y-8,1,7,'#5a5846');
 cpx(x-8,y-4,17,17,'#141c1b');cpx(x-7,y-3,15,14,'#675e45');cpx(x-6,y-2,13,12,'#302f26');
 cx.save();cx.translate(Math.round(x-5),Math.round(y-1));cx.scale(.625,.625);cx.fillStyle=CAMP.near?.id===s.id?'#dcca94':'#ad9f76';cx.fill(SIGN_PATHS[s.id],'evenodd');cx.restore();cpx(x-7,y+10,4,1,'#8b7853');
}
function campBuilding(s,t){
 const x=s.x,y=s.y,built=!!S.exp.projects[s.id]||!PROJECTS.some(p=>p.id===s.id);
 cx.fillStyle='#0b201d65';cx.beginPath();cx.ellipse(x+4,y+6,37,10,0,0,Math.PI*2);cx.fill();
 if(campSpecialBuilding(s,t,built))return;
 if(s.id==='fire'){
  for(let i=0;i<10;i++){const a=i/10*6.28;cpx(x+Math.cos(a)*13-2,y+Math.sin(a)*7,4,3,'#899180');cpx(x+Math.cos(a)*13-2,y+Math.sin(a)*7,3,1,'#bbc1a2')}
  for(const f of [-1,1]){cx.save();cx.translate(x,y);cx.rotate(f*.35);cpx(-10,-1,20,3,'#8b613c');cpx(-8,-1,16,1,'#c2985a');cx.restore()}
  for(let i=0;i<7;i++){const h=8+Math.sin(t*7+i*3)*3;cpx(x-6+i*2,y-h,2,h,['#da7536','#ffd18a','#f6a747'][i%3])}
  for(let i=0;i<5;i++){const a=(t*6+i*6)%30;cpx(x+Math.sin(a+i)*4,y-10-a,.7,.7,'#ffe1a299')}
  const g=cx.createRadialGradient(x,y,5,x,y,50);g.addColorStop(0,'#ffb34824');g.addColorStop(1,'#ffb34800');cx.fillStyle=g;cx.fillRect(x-50,y-50,100,100);
  for(const off of [-26,22]){cpx(x+off,y+9,6,13,'#182d28');cpx(x+off,y+7,5,12,'#95734c');cpx(x+off+1,y+7,1,12,'#c0a474')}return;
 }
 if(s.id==='board'){
  cpx(x-23,y-32,46,32,'#302f24');cpx(x-21,y-30,42,27,'#826843');cpx(x-20,y-29,40,1,'#b29967');
  for(let i=0;i<4;i++){cpx(x-17+i*9,y-25+i%2*3,7,16-i%2*3,'#e0d3a9');cpx(x-15+i*9,y-22+i%2*3,4,.6,'#857758');cpx(x-15+i*9,y-19+i%2*3,3,.6,'#9e8d65');cpx(x-14+i*9,y-26+i%2*3,1,2,'#b7613e')}
  for(const dx of [-21,19]){cpx(x+dx,y-3,3,14,'#3b3c2c');cpx(x+dx,y-3,1,14,'#b19766')}cpx(x-25,y-35,50,4,'#5e7160');cpx(x-25,y-35,50,1,'#99ad88');campSign(s,x,y-46);return;
 }
 if(s.id==='lift'){
  cpx(x-30,y-30,60,38,'#172b2b');cpx(x-25,y-27,50,34,'#071719');
  for(let i=0;i<7;i++){cpx(x-24+i*8,y-24,1,30,'#354641');cpx(x-24,y-24+i*5,48,1,'#243834')}
  for(const a of [-1,1]){cpx(x+a*28-2,y-32,5,45,'#566c68');cpx(x+a*28-2,y-32,1,43,'#b4c0a1');for(let i=0;i<4;i++)cpx(x+a*28-1,y-27+i*9,1,1,'#d2cda6')}
  cpx(x-33,y-35,66,6,'#7c8e7e');cpx(x-33,y-35,66,1,'#c1c9a8');cpx(x-30,y+7,60,6,'#a18b57');for(let i=0;i<7;i++)cpx(x-27+i*9,y+7,4,6,'#343f34');
  for(const off of [-19,18]){cpx(x+off,y-28,1,35,'#a09167');cpx(x+off,y+13,2,25,'#899587')}
  cpx(x-22,y+12,44,15,'#494f40');for(let i=0;i<6;i++)cpx(x-22,y+13+i*2.5,44,1,'#827c58');campSign(s,x,y-31);campLamp(x+34,y,t);return;
 }
 if(s.id==='training'){
  for(let i=0;i<7;i++){cpx(x-28+i*9,y-18,2,21,'#6c7153');cpx(x-28+i*9,y-18,1,20,'#b4ab7b')}cpx(x-28,y-11,58,2,'#8d8b63');
  for(const dx of [-14,15]){cpx(x+dx-1,y-20,3,28,'#b8a271');cx.fillStyle='#6c5b3c';cx.beginPath();cx.ellipse(x+dx,y-16,9,10,0,0,6.29);cx.fill();for(const [r,c] of [[7,'#c1ad7c'],[4,'#9b593d'],[2,'#e6d7a1']]){cx.fillStyle=c;cx.beginPath();cx.arc(x+dx,y-16,r,0,6.29);cx.fill()}}campSign(s,x,y-37);return;
 }
 if(s.id==='marrow'||s.id==='infirmary'){
  const pale=s.id==='infirmary';for(let i=0;i<25;i++)cpx(x-8-i,y-40+i,16+i*2,1.5,pale?(i%6===0?'#9da68a':'#86856d'):(i%6===0?'#607367':'#576756'));
  cpx(x-31,y-15,62,22,pale?'#747966':'#465946');for(let i=0;i<8;i++)cpx(x-29+i*8,y-14,1,20,pale?'#9c9b7950':'#b0bba750');cpx(x-7,y-15,14,22,'#192b29');cpx(x-8,y-15,2,22,'#ddcea1');cpx(x+7,y-15,2,22,'#9d9f7d');cpx(x-32,y+6,64,2,'#444f3d');
  for(const dx of [-33,33]){cx.strokeStyle='#b9ad7b';cx.lineWidth=.7;cx.beginPath();cx.moveTo(x+dx,y-15);cx.lineTo(x+dx*1.15,y+11);cx.stroke()}campSign(s,x+18,y-12);campCrate(x-26,y+8);return;
 }
 const roof={forge:'#394d4c',smelter:'#867051',workshop:'#566c79',map:'#4a5d51',archive:'#3d535f',gallery:'#465159',tower:'#3f5147',garden:'#4a6252',locker:'#5d563c'}[s.id];
 const brick=s.id==='forge'||s.id==='smelter';
 cpx(x-32,y-30,64,38,'#23362f');cpx(x-30,y-29,60,36,brick?'#695340':'#65553d');
 for(let row=0;row<7;row++){cpx(x-30,y-28+row*5,60,.7,'#423e304d');if(brick)for(let i=0;i<6;i++)cpx(x-30+i*12+(row%2)*6,y-28+row*5,.7,5,'#c9a57466');else cpx(x-29,y-27+row*5,58,.6,'#c9b07b65')}
 cpx(x-30,y+3,60,4,'#485449');cpx(x-31,y-29,2,32,'#8d7955');cpx(x+29,y-29,2,32,'#584e38');
 // Individual overlapping roof courses, ridge flashing and moss on the shaded eaves.
 for(let row=0;row<5;row++){const inset=(4-row)*3;cpx(x-35+inset,y-47+row*4,70-inset*2,5,roof);cpx(x-35+inset,y-47+row*4,70-inset*2,.6,'#c4d0ac65');for(let i=0;i<7;i++)cpx(x-30+inset+i*9+(row%2)*3,y-46+row*4,.5,3,'#192e2d70')}
 cpx(x-24,y-49,48,2,'#7c8270');cpx(x-36,y-29,72,3,'#2d4339');cpx(x-36,y-29,72,.7,'#7f8b77');for(let i=0;i<8;i++)cpx(x-31+i*8,y-28,4,1+i%3,'#526d48');
 cpx(x-7,y-15,14,22,'#253a32');cpx(x-6,y-14,12,20,'#4d5039');for(let i=0;i<4;i++)cpx(x-5+i*3,y-13,.5,18,'#8d8258');cpx(x-8,y-16,16,2,'#a48a5d');cpx(x+3,y-5,1.5,1.5,'#f0d891');cpx(x-9,y+6,18,3,'#9a9a77');
 for(const dx of [-23,16]){cpx(x+dx-1,y-22,10,12,'#333e31');cpx(x+dx,y-21,8,9,built?'#edc37e':'#7f907b');cpx(x+dx,y-21,8,1,built?'#fff0ba':'#a1b299');cpx(x+dx+3.5,y-21,.7,9,'#706b48');cpx(x+dx,y-16.5,8,.7,'#706b48');cpx(x+dx-2,y-11,12,2,'#b29d6d')}
 if(['forge','smelter','workshop'].includes(s.id)){
  cpx(x+20,y-51,9,21,'#3e4f48');cpx(x+21,y-51,7,20,'#8a8d75');for(let i=0;i<4;i++)cpx(x+21,y-50+i*5,7,.7,'#bdbaa166');cpx(x+19,y-53,11,3,'#bbc0a2');cpx(x+20,y-53,9,1,'#344840');
  if(built)for(let i=0;i<7;i++){const a=(t*9+i*6)%43;cx.fillStyle=`rgba(184,197,179,${.23*(1-a/43)})`;cx.beginPath();cx.ellipse(x+24+Math.sin(a*.08+i)*3,y-55-a,2+a*.08,1.5+a*.07,0,0,6.29);cx.fill()}
 }
 if(s.id==='forge'){cpx(x-30,y+11,18,3,'#a2b9b3');cpx(x-29,y+14,14,3,'#6f8d88');cpx(x-24,y+16,5,5,'#4c5f55');cpx(x-28,y+21,13,2,'#859084')}
 if(s.id==='smelter'){cpx(x-29,y-13,13,17,'#4d5140');cpx(x-27,y-12,9,12,'#172926');if(built){cpx(x-26,y-7,7,6,'#e98436');cpx(x-24,y-6,3,4,'#ffdb7f');for(let i=0;i<3;i++)cpx(x-26+i*3,y-11,.7,12,'#848771')}campCrate(x+17,y+9)}
 if(s.id==='archive'||s.id==='map'){cpx(x-29,y+10,20,2,'#c5b288');for(let i=0;i<5;i++)cpx(x-28+i*3.5,y+4,2.5,6,['#6c8f93','#b6915d','#b77658'][i%3]);cpx(x-28,y+12,2,6,'#7c7755')}
 if(s.id==='gallery'){cpx(x-26,y+9,10,10,'#647b72');cpx(x-25,y+8,8,2,'#8c967c');cpx(x-23,y+1,4,7,'#dcb763');cpx(x-22,y,2,5,'#ffedb4')}
 if(s.id==='locker'||s.id==='workshop'){campCrate(x-29,y+10);campCrate(x-19,y+13);campCrate(x-27,y+2)}
 if(s.id==='tower'){for(const dx of [-7,6]){cpx(x+dx,y-78,2,30,'#a5b19a');cpx(x+dx,y-76,.5,28,'#e6ddb9')}for(let i=0;i<5;i++)cpx(x-6,y-76+i*6,13,1,'#7d9482');cpx(x-17,y-78,35,2,'#abbfaa');cpx(x-12,y-68,25,1,'#b7cbb4');cpx(x,y-87,1,39,'#c3ccb1');cpx(x-1,y-89,3,3,built?'#a5f0d5':'#c8a367')}
 if(s.id==='garden'){for(let i=0;i<4;i++){cpx(x-27+i*12,y+10,8,5,'#7a6846');cpx(x-24+i*12,y+4,1,9,'#93b277');cpx(x-27+i*12,y+5,7,2,built?'#b0d18d':'#748e61')}}
 if(!built){for(const dx of [-28,27]){cpx(x+dx,y-33,1.5,42,'#81704e');cpx(x+dx+.5,y-33,.5,42,'#b19a66')}cpx(x-30,y-20,60,1.5,'#958156');campCrate(x+13,y+12)}
 campSign(s,x,y-32);
}
function renderCamp(){
 cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';cx.fillStyle='#101919';cx.fillRect(0,0,cv.width,cv.height);cx.imageSmoothingEnabled=false;
 const d=cv.width/innerWidth,scale=1;
 const viewW=cv.width/scale,viewH=cv.height/scale,top=$('campbar').offsetHeight/scale*d,bottom=innerWidth<700?105*d/scale:35*d/scale;
 const center={x:clamp(CAMP.x,Math.min(320,viewW/2-12),Math.max(320,640-viewW/2+12)),y:clamp(CAMP.y,Math.min(180,(viewH-top+bottom)/2-6),Math.max(180,360-(viewH+top-bottom)/2+6))};
 if(!CAMP.camera||S.set.reduced)CAMP.camera=center;else{CAMP.camera.x+=(center.x-CAMP.camera.x)*.12;CAMP.camera.y+=(center.y-CAMP.camera.y)*.12}
 const prompt=$('interact');if(CAMP.near&&!CAMP.menu){const feet=((cv.height+(top-bottom)*scale)/2+(CAMP.y-CAMP.camera.y)*scale)/d,ph=prompt.offsetHeight,low=innerHeight-(innerWidth<700?125:100);prompt.style.top=Math.max($('campbar').offsetHeight+10,feet+ph+24<low?feet+24:feet-30*scale/d-ph-12)+'px';prompt.style.bottom='auto'}
 cx.save();cx.translate(Math.round(cv.width/2-CAMP.camera.x),Math.round((cv.height+(top-bottom)*scale)/2-CAMP.camera.y*scale));cx.scale(scale,scale);
 if(!campTerrain)campTerrain=buildCampTerrain();cx.drawImage(campTerrain,0,0,640,360);
 const t=S.set.reduced?0:TT;
 for(const [x,y] of [[128,114],[226,214],[442,214],[562,114],[338,304],[32,304]])campLamp(x,y,t);
 const id=CAMP.destination||campNextStep().id;
 if(!CAMP.menu){const route=campRoute(id);for(let i=0;i<route.length;i++){const p=route[i];if(Math.hypot(p.x-CAMP.x,p.y-CAMP.y)<12)continue;cpx(p.x-1,p.y-1,2,2,'#e8cc8288')}const s=hubStations().find(s=>s.id===id);cx.strokeStyle='#ffe2a0';cx.lineWidth=.7;cx.beginPath();cx.ellipse(s.x,s.y+20,10,4,0,0,6.29);cx.stroke()}
 // Depth-sort roofs, people and foreground props together, including the player.
 const drawables=hubStations().map(s=>({y:s.y+7,draw:()=>campBuilding(s,t)}));campScenery(drawables,t);
 for(const s of hubStations()){
  if(!['marrow','forge','infirmary','fire','map','archive'].includes(s.id)||s.id==='archive'&&!S.exp.projects.archive)continue;
  const phase=(t+(s.x%17))%24,working=s.id==='forge'&&phase<12,walking=['map','infirmary'].includes(s.id)&&phase>14&&phase<22;
  const offset=walking?Math.round(phase<18?(phase-14)*3:(22-phase)*3):0;
  const x=s.x+22-offset,y=s.y+20;
  const role={marrow:'marrow',forge:'smith',infirmary:'medic',map:'surveyor',archive:'archivist',fire:'worker'}[s.id];
  drawables.push({y,draw:()=>{drawMiner(x,y,{role,hat:s.id==='forge',action:working?'mine':walking?'walk':phase<4?'interact':'idle',frame:working?Math.floor(phase*7)%6:walking?Math.floor(offset/2)%8:Math.floor(phase*2)%4,dir:working?'left':walking?(phase<18?'left':'right'):'down'});if(working){const f=Math.floor(phase*7)%6,up=f<3;cpx(x-7,y-(up?26:13),2,up?10:4,'#7d6240');cpx(x-10,y-(up?28:13),7,3,'#6c7570');if(f===3&&S.set.parts)cpx(x-11,y-12,1,1,'#d8a363')}}});
 }
 const courier=campCourier(t);drawables.push({y:courier.y,draw:()=>drawMiner(courier.x,courier.y,{role:'worker',pack:.6,hat:true,action:courier.moving?'walk':'idle',frame:courier.frame,dir:courier.dir})});
 const moving=!!CAMP.moving;CAMP.facing=minerDirection(CAMP.vx,CAMP.vy,CAMP.facing||'down');
 drawables.push({y:CAMP.y,draw:()=>drawMiner(CAMP.x,CAMP.y,{walk:CAMP.walk,moving,dir:CAMP.facing,pack:.3})});
 drawables.sort((a,b)=>a.y-b.y);for(const o of drawables)o.draw();
 // Warm lamp pools and sparse fireflies make the hub feel inhabited without obscuring paths.
 if(!S.set.reduced&&S.set.parts)for(let i=0;i<10;i++){const x=ih(i,2,80)*580+30+Math.sin(t*.3+i)*3,y=ih(i,4,80)*270+50;cpx(x,y, .6,.6,Math.sin(t+i)>0?'#dfdea48a':'#dfdea420')}
 cx.restore();fx.setTransform(1,0,0,1,0,0);fx.clearRect(0,0,fxc.width,fxc.height);
}

const CAMP_PROPS=[{id:'cart',x:119,y:275,w:12,h:6},{id:'ore',x:236,y:92,w:9,h:5},{id:'timber',x:222,y:184,w:11,h:5},{id:'well',x:443,y:134,w:8,h:5},{id:'stump',x:318,y:130,w:5,h:4},{id:'scrap',x:578,y:230,w:8,h:5}];
function campCourier(t){
 const phase=t%32,moving=(phase>=4&&phase<16)||phase>=20,p=phase<4?0:phase<16?(phase-4)/12:phase<20?1:1-(phase-20)/12;
 return {x:310+Math.round(p*125),y:238,moving,frame:Math.floor(p*125/4)%8,dir:phase<16?'right':'left'};
}
function campTree(x,y,seed,t){
 const wind=S.set.reduced?0:Math.floor(Math.sin(t*.6+seed)*1.3);
 cpx(x-2,y-22,4,24,'#282b24');cpx(x-1,y-18,1,18,'#544838');
 for(let i=0;i<5;i++){const w=6+i*4,yy=y-51+i*7,off=(i%2?1:-1)*(seed%3)+wind;for(let j=0;j<6;j++){cpx(x-w+off+j,yy+j,w*2-j*2,2,i%2?'#172722':'#1d3028');if(j===3)cpx(x-w+off+3,yy+j,w-3,1,'#314333')}}
}
function campScenery(drawables,t){
 for(const [x,y,seed] of [[12,142,1],[10,310,4],[626,178,2],[633,290,3],[113,35,5],[345,31,6],[590,37,7],[231,358,8],[590,364,9]])drawables.push({y,draw:()=>campTree(x,y,seed,t)});
 for(const p of CAMP_PROPS)drawables.push({y:p.y,draw:()=>{
  const {x,y}=p;
  if(p.id==='cart'){
   cpx(x-11,y-13,21,11,'#34392f');cpx(x-10,y-12,19,8,'#68543a');for(let i=0;i<5;i++)cpx(x-9+i*4,y-12,1,9,'#252f2a');cpx(x-12,y-14,23,2,'#8b7850');for(const off of [-8,7]){cpx(x+off-2,y-3,5,6,'#121c1c');cpx(x+off-1,y-2,3,4,'#676552');cpx(x+off,y-1,1,1,'#ac9871')}cpx(x+10,y-5,14,1,'#8c7550');for(let i=0;i<7;i++)cpx(x-8+i*2,y-17+i%3,4,4,['#3c4643','#626854','#777253'][i%3]);
  }else if(p.id==='timber'){
   for(let i=0;i<4;i++){cpx(x-12+i%2*3,y-3-i*3,22-i%2*4,3,'#594630');cpx(x-12+i%2*3,y-3-i*3,2,3,'#9a8052');cpx(x-8,y-3-i*3,13,1,'#776040')}cpx(x+4,y-15,1,10,'#836e4a');cpx(x+3,y-17,5,3,'#839083');
  }else if(p.id==='well'){
   for(let i=0;i<3;i++){cpx(x-9+i,y-7-i*3,18-i*2,4,'#515c51');cpx(x-7+i,y-7-i*3,13-i*2,1,'#8a8d73')}cpx(x-5,y-13,10,5,'#111d1d');cpx(x-11,y-26,2,25,'#6e6044');cpx(x+9,y-26,2,25,'#6e6044');cpx(x-11,y-26,22,2,'#9d865a');cpx(x,y-24,1,14,'#9c9275');cpx(x-3,y-12,7,6,'#655f47');
  }else if(p.id==='stump'){
   cpx(x-5,y-6,11,7,'#403c2b');cpx(x-4,y-8,9,3,'#8b7850');cpx(x-2,y-7,5,1,'#b49a60');cpx(x+1,y-15,1,8,'#816a40');cpx(x,y-18,5,4,'#7a8475');
  }else{
   for(let i=0;i<9;i++){const dx=Math.floor(ih(i,p.x,2)*16)-8,dy=Math.floor(ih(i,p.y,3)*6);cpx(x+dx,y-8+dy,5,4,i%2?'#565b51':'#35423c');cpx(x+dx,y-8+dy,3,1,'#878772')}
  }
 }});
 // Washing, patched canvas and a hand-cranked ventilator move on discrete pixel frames.
 drawables.push({y:138,draw:()=>{cpx(122,106,1,27,'#6c624c');cpx(216,115,1,25,'#6c624c');for(let i=0;i<94;i++)cpx(122+i,108+Math.floor(Math.sin(i/94*Math.PI)*4)+Math.floor(i/12),1,1,'#7b7960');for(let i=0;i<4;i++){const x=139+i*18,dy=S.set.reduced?0:Math.floor(Math.sin(t*2+i));cpx(x,112+i*2,9,12+dy,i%2?'#555e54':'#686357');cpx(x+1,112+i*2,1,11,'#818475');cpx(x+6,121+i*2,2,2,'#393f37')}}});
 drawables.push({y:244,draw:()=>{const f=Math.floor(t*5)%4;cpx(575,208,3,32,'#4c5a52');cpx(563,217,26,3,'#5d6b60');for(let i=0;i<4;i++){const a=(i+f*.25)*Math.PI/2;for(let r=2;r<12;r++)cpx(576+Math.cos(a)*r,219+Math.sin(a)*r,2,2,'#8b9580')}cpx(574,217,4,4,'#b09e6c')}});
}
function campSpecialBuilding(s,t,built){
 const x=s.x,y=s.y;
 if(s.id==='smelter'){
  for(let row=0;row<10;row++){const half=row<3?12+row*5:24;for(let i=-half;i<half;i+=8){cpx(x+i,y-35+row*4,7,3,row%2?'#604b39':'#715843');cpx(x+i,y-35+row*4,7,1,'#8b7351')}}
  cpx(x-24,y-24,48,2,'#29342f');cpx(x-24,y-8,48,2,'#29342f');cpx(x-7,y-12,14,17,'#121d1d');cpx(x-5,y-10,10,14,built?'#894529':'#31362d');if(built){const f=Math.floor(t*6)%3;for(let i=0;i<4;i++)cpx(x-4+i*2,y-4-(i+f)%3*2,2,8,'#d39648');cpx(x-3,y+1,6,2,'#efc276')}
  cpx(x+11,y-55,8,23,'#475049');cpx(x+9,y-57,12,3,'#737b69');if(built)for(let i=0;i<5;i++){const a=Math.floor((t*7+i*7)%35);cpx(x+11+Math.floor(a/10),y-57-a,3+Math.floor(a/10),3,'#64726c55')}
  campSign(s,x-18,y-11);campCrate(x+19,y+9);return true;
 }
 if(s.id==='map'){
  for(const off of [-28,26])cpx(x+off,y-27,2,34,'#7e7457');for(let i=0;i<13;i++)cpx(x-33+i,y-40+i,64-i*2,2,i%4?'#586356':'#798370');cpx(x-22,y-12,42,4,'#968765');cpx(x-20,y-8,2,18,'#635a43');cpx(x+15,y-8,2,18,'#635a43');cpx(x-15,y-15,25,3,'#bbb18a');cpx(x-11,y-15,5,1,'#5a6753');cpx(x-1,y-14,7,1,'#667258');cpx(x+12,y-17,3,5,'#303f39');campSign(s,x+18,y-23);return true;
 }
 if(s.id==='garden'){
  for(let i=0;i<7;i++){cpx(x-28+i*8,y-10,2,22,'#5b6245');cpx(x-28+i*8,y-10,1,15,'#8c8b5e')}cpx(x-29,y-5,57,2,'#696b4c');cpx(x-26,y-3,50,9,'#232b23');
  for(let i=0;i<5;i++){const xx=x-21+i*10,h=built?12+i%3*5:5;cpx(xx,y-h,2,h,'#69754d');cpx(xx-2,y-h,6,2,built?'#919d62':'#4b5840');cpx(xx+1,y-h-3,3,4,built?'#778556':'#384934')}
  cpx(x+24,y-21,1,24,'#8c7950');cpx(x+22,y+2,5,5,'#6b7c6b');campSign(s,x-15,y-22);return true;
 }
 if(s.id==='gallery'){
  for(const off of [-25,20])for(let j=0;j<7;j++){cpx(x+off,y-29+j*5,7,4,'#5d6657');cpx(x+off,y-29+j*5,6,1,'#858b72')}cpx(x-26,y-33,54,5,'#6b7360');cpx(x-24,y-33,49,1,'#989c7e');for(let i=0;i<3;i++){cpx(x-15+i*13,y-4,9,11,'#515c4b');cpx(x-16+i*13,y-5,11,2,'#8d9174');if(built){cpx(x-12+i*13,y-11,3,6,'#9f8e59');cpx(x-11+i*13,y-12,1,3,'#d8c17f')}}campSign(s,x,y-30);return true;
 }
 if(s.id==='workshop'){
  for(const off of [-29,26]){cpx(x+off,y-29,3,37,'#6b6146');cpx(x+off,y-29,1,37,'#8b7c54')}
  for(let i=0;i<9;i++){cpx(x-33+i*8,y-36+i%2,8,12,'#3d504e');cpx(x-32+i*8,y-36+i%2,1,11,'#718276')}cpx(x-34,y-25,71,2,'#8a8969');cpx(x-24,y-8,43,4,'#8c7851');cpx(x-23,y-4,2,13,'#5c583f');cpx(x+16,y-4,2,13,'#5c583f');for(let i=0;i<4;i++)cpx(x-19+i*8,y-12,5,4,['#9a8752','#7d8980','#5d6150','#8a5f40'][i]);campCrate(x+23,y+3);campSign(s,x-17,y-26);return true;
 }
 return false;
}
