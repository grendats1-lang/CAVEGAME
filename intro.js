'use strict';
// A self-contained arrival scene. Replay never writes to the player's character.
const INTRO_STEPS=[
 {id:'heater',x:CAMP_LAYOUT.fire[0],y:CAMP_LAYOUT.fire[1],label:'Light the campfire',title:'Blackwood Mine · Appalachian Mountains',line:'The forest has swallowed Blackwood Mine. You clear the old fire ring beside your grandfather’s trail. Walk to the gold marker and strike a match.',after:'The kindling catches. For the first time in forty years, someone is keeping this place warm. Your grandfather’s journal waits on the camp table.'},
 {id:'journal',x:189,y:194,label:'Read your grandfather’s journal',title:'The pages they never read',line:'Ten years of scrapyard shifts bought back the mine that ruined your family. Your grandfather’s last entry is dated the morning the shaft fell.',after:'“Beyond the silver seam: a fissure, unworked geodes, and air rising from somewhere deeper. They say I am chasing ghosts.” His last sketch ends at a door.'},
 {id:'generator',x:496,y:249,label:'Start the old diesel generator',title:'Built back, piece by piece',line:'You hauled the winch up here yourself. Rewired the headlamp. Patched the cage. If the journal is right, there is enough below to rebuild everything.',after:'The engine turns over. The cage has power. Your lamp and backpack set the pace now: short trips, a useful haul, then back to the lift.'},
 {id:'radio',x:144,y:194,label:'Answer the radio',title:'An unexpected voice',line:'Three taps interrupt the engine’s rattle. Someone has been using your grandfather’s frequency.',after:'Marrow: “I worked with your grandfather. My niece Iona followed his sketch. Last night her relay tapped her name. Bring that signal home. Then I’ll tell you why we sealed the shaft.”'},
 {id:'lift',x:CAMP_LAYOUT.lift[0],y:CAMP_LAYOUT.lift[1],label:'Pull the cage lever',title:'The first descent',line:'A pick, a lamp, a little courage. Find copper beside the lift, follow the one blue relay signal, and bring Iona’s message back. The fortune can wait.',after:'The cable takes your weight. The wind in the trees fades. Below, something knocks three times.'}
];
const INTRO_CARDS=[
 {title:'Forty years after…',line:'The collapse took your grandfather. The valley called him a liar. You kept his journal.'},
 {title:'Tonight, you go back.',line:'Ten years of scrapyard shifts bought back Blackwood Mine. You rebuilt the cage yourself. Now his last sketch is in your hands.'}
];
let INTRO=null;
function needsIntro(){return !S.exp.flags.briefed&&!S.exp.flags.intro_done&&S.stats.runs===0&&!S.ng&&S.gear.pick===0&&S.money===0&&!S.unl[1]}

function introStage(flags=S.exp.flags){const n=INTRO_STEPS.findIndex(s=>!flags['intro_'+s.id]);return n<0?4:n}
function beginIntro(replay=false){
 clearInputs();dialogue=null;paused=false;CAMP.active=false;CAMP.menu=null;state='intro';showPanel(null);$('hud').style.display='none';$('campbar').style.display='none';$('objective').style.display='none';$('interact').style.display='none';$('touch-controls').classList.add('on');
 const stage=replay?0:introStage(),previous=INTRO_STEPS[Math.max(0,stage-1)];
 INTRO={replay,stage,card:stage===0?0:-1,x:stage?previous.x:320,y:stage?previous.y+22:224,vx:0,vy:0,walk:0,dir:'right',t:0,sound:0,paused:false,reading:false,transition:0,done:INTRO_STEPS.map((s,i)=>i<stage),moving:false,actionTime:0};
 AU.init();MUS.set('camp',0,0);resize();refreshIntro();
}
function introBlocked(x,y){return x<20||x>620||y<48||y>338||campTreeBlocked(x,y)||[[128,198,128,179],[124,206,178,199],[476,515,227,254],[502,566,240,293],[354,376,195,208]].some(([l,r,t,b])=>x>l&&x<r&&y>t&&y<b)}
function introNear(){if(!INTRO)return false;const s=INTRO_STEPS[INTRO.stage];return Math.hypot(INTRO.x-s.x,INTRO.y-(s.y+18))<27}
function introDirections(){if(!INTRO)return '';if(introNear())return innerWidth<700?'Tap the action below.':'Press E or click the action below.';const s=INTRO_STEPS[INTRO.stage],dx=s.x-INTRO.x,dy=s.y+18-INTRO.y,dir=['east','southeast','south','southwest','west','northwest','north','northeast'][(Math.round(Math.atan2(dy,dx)/(.25*Math.PI))+8)%8];return `Walk ${dir} · ${innerWidth<700?'use the direction pad':'WASD / arrows'}`}
function refreshIntro(){if(!INTRO)return;const i=INTRO,s=INTRO_STEPS[i.stage];
 wrap.classList.toggle('intro-narrating',i.card>=0||i.reading);
 if(i.card>=0){const card=INTRO_CARDS[i.card];$('intro-ui').innerHTML=`<header hidden></header><section class='intro-title-card' aria-live='polite'><div><span class='eyebrow'>BLACKWOOD MINE · YOUR STORY</span><h1>${esc(card.title)}</h1><p>${esc(card.line)}</p><button data-intro='act'>${i.paused?'RESUME':i.card===0?'CONTINUE':'ENTER THE CLEARING'} <kbd>↵</kbd></button><small>Click / tap to continue · Enter or E</small></div></section>`;return}
$('intro-ui').innerHTML=`<header><div><span class='eyebrow'>PROLOGUE · ${i.stage+1} / 5</span><strong>${esc(s.title)}</strong></div>${i.replay?"<button data-intro='skip'>EXIT REPLAY</button>":"<small>FOLLOW THE GOLD MARKER</small>"}</header><section class='intro-caption' aria-live='polite'><p>${esc(i.transition?s.after:i.reading?s.after:s.line)}</p><div><small id='intro-directions'>${i.paused?'Paused while away.':i.transition?'The cage is descending…':i.reading?'Take a moment, then continue.':introDirections()}</small><button data-intro='act' ${!i.paused&&(i.transition||!i.reading&&!introNear())?'disabled':''}>${i.paused?'RESUME':i.reading?'CONTINUE':s.label.toUpperCase()} <kbd>E</kbd></button></div></section>`}
function interactIntro(){
 const i=INTRO;if(state!=='intro'||!i)return;if(i.paused){i.paused=false;clearInputs();refreshIntro();return}if(i.transition)return;
 if(i.card>=0){AU.init();AU.nz(.3,{ft:'lowpass',f:700,v:.025});AU.tone(i.card===0?110:82,.7,{type:'triangle',v:.025,f2:55});i.card++;if(i.card>=INTRO_CARDS.length)i.card=-1;clearInputs();refreshIntro();return}
 if(i.reading){i.reading=false;i.stage++;clearInputs();refreshIntro();return}if(!introNear())return;
 clearInputs();i.vx=i.vy=0;i.moving=false;i.actionTime=.55;i.done[i.stage]=true;
 if(!i.replay){S.exp.flags['intro_'+INTRO_STEPS[i.stage].id]=1;if(i.stage===1)addJournal('inheritance');save()}
 if(i.stage===0){AU.nz(.18,{ft:'highpass',f:2400,v:.1});AU.tone(180,.2,{v:.04,f2:70})}
 else if(i.stage===1){AU.nz(.25,{ft:'highpass',f:1200,v:.04})}
 else if(i.stage===2){AU.tone(46,1.4,{type:'sawtooth',v:.035,lp:140,f2:58});AU.nz(.5,{f:160,v:.09})}
 else if(i.stage===3){for(let n=0;n<3;n++)AU.tone(650,.06,{type:'triangle',v:.045,dl:n*.24})}
 else SND.ui();
 if(i.stage===4){i.transition=.001;AU.tone(60,2.8,{type:'triangle',v:.07,f2:32});AU.nz(1.4,{f:300,v:.04});}else i.reading=true;
 refreshIntro();
}
function finishIntro(descend){
 if(!INTRO||!INTRO.replay&&(!descend||!INTRO.done.every(Boolean)))return;const replay=INTRO.replay;INTRO=null;clearInputs();$('intro-ui').innerHTML='';wrap.classList.remove('in-intro','intro-narrating');
 if(replay){showMenu();resize();return}
 S.exp.flags.intro_done=1;S.exp.flags.briefed=1;S.exp.flags.arrival=1;addJournal('arrival');S.exp.visited.marrow=1;S.exp.visited.board=1;S.exp.visited.lift=1;S.exp.protected.copper=1;S.exp.protected.coal=1;save();
 if(descend){S.act=0;S.startL=0;S.exp.contract='relay';startRun(0,0);resize()}else enterCamp();
}
function updateIntro(dt){const i=INTRO;if(!i||i.paused)return;i.t+=dt;i.sound-=dt;if(i.sound<=0){i.sound=3.2;AU.nz(2.8,{ft:'lowpass',f:650,v:.014,at:.7,rev:.08});if(i.done[0])AU.nz(.06,{ft:'highpass',f:1700,v:.025});if(i.done[2])AU.tone(52,1.5,{type:'triangle',v:.018,lp:130,rev:0})}
 if(i.transition){i.transition+=dt;if(i.transition>=3.6)finishIntro(true);return}
 i.actionTime=Math.max(0,i.actionTime-dt);if(i.reading||i.card>=0)return;
 const before=introNear(),mx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),my=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0),len=Math.hypot(mx,my)||1,f=1-Math.exp(-dt*14),ox=i.x,oy=i.y;
 i.vx+=(mx/len*64-i.vx)*f;i.vy+=(my/len*64-i.vy)*f;
 if(!introBlocked(i.x+i.vx*dt,i.y))i.x+=i.vx*dt;if(!introBlocked(i.x,i.y+i.vy*dt))i.y+=i.vy*dt;
 const moved=Math.hypot(i.x-ox,i.y-oy);i.walk+=moved;i.moving=moved>.015;i.dir=minerDirection(i.vx,i.vy,i.dir);
 if(before!==introNear())refreshIntro();else{const e=$('intro-directions'),hint=introDirections();if(e&&e.textContent!==hint)e.textContent=hint}
}
function renderIntro(){
 const i=INTRO;if(!i)return;cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=1;cx.imageSmoothingEnabled=false;cx.fillStyle='#14231d';cx.fillRect(0,0,cv.width,cv.height);fx.clearRect(0,0,fxc.width,fxc.height);if(i.card>=0)return;
 const d=cv.width/innerWidth,header=$('intro-ui').querySelector('header').offsetHeight*d,footer=(innerWidth<700?270:190)*d;
 const camx=clamp(i.x,cv.width/2,640-cv.width/2),camy=clamp(i.y,110,310),tx=Math.round(cv.width/2-camx),ty=Math.round((cv.height+header-footer)/2-camy);
 cx.save();cx.translate(tx,ty);const t=S.set.reduced?0:i.t;
 if(!introTerrain)introTerrain=buildCampGround(true);cx.drawImage(introTerrain,0,0);campTreeShadows();
 // A few old stumps mark land that later becomes workshops, rather than finished foundations.
 for(const id of ['workshop','map','archive']){const [x,y]=CAMP_LAYOUT[id];groundShadow(x,y,5,4);cpx(x-5,y-4,10,6,'#493b2a');cpx(x-4,y-5,8,3,'#8a7650');cpx(x-2,y-4,4,1,'#b19b69')}

 groundShadow(163,177,32,17);groundShadow(171,197,38,7);groundShadow(496,253,19,9);groundShadow(534,291,31,14);
 const drawables=CAMP_TREES.map(([x,y,seed])=>({y,draw:()=>campTree(x,y,seed,t)}));
 drawables.push({y:180,draw:()=>introShelter(t)},{y:199,draw:()=>introTable(i)},{y:207,draw:()=>forestFire(...CAMP_LAYOUT.fire,t,i.done[0])},{y:255,draw:()=>introGenerator(i,t)},{y:292,draw:()=>introMine(i)});
 if(!i.transition)drawables.push({y:i.y,draw:()=>{const reaching=i.actionTime>0;drawMiner(i.x,i.y,{moving:i.moving&&!i.reading,walk:i.walk,dir:i.dir,action:reaching?'interact':undefined,frame:reaching?Math.min(3,Math.floor((.55-i.actionTime)*7)):undefined,pack:.2,noBottle:true})}});
 drawables.sort((a,b)=>a.y-b.y);for(const o of drawables)o.draw();
 if(!i.reading&&!i.transition){const s=INTRO_STEPS[i.stage];cpx(s.x-3,s.y-32,7,1,'#e6cf8e');cpx(s.x-2,s.y-31,5,1,'#e6cf8e');cpx(s.x-1,s.y-30,3,1,'#e6cf8e')}
 forestLeaves(t,640,360,7);cx.restore();if(i.transition){cx.fillStyle=`rgba(4,8,10,${clamp((i.transition-1.6)/2,0,1)})`;cx.fillRect(0,0,cv.width,cv.height)}
}
function introShelter(t){
 const [x,y]=CAMP_LAYOUT.marrow;
 // The same tent site as the later camp: a patched flysheet, bedroll and one supply pile.
 for(let row=0;row<32;row++){const w=8+row*.8;cpx(x-w,y-45+row,w,1,'#73775a');cpx(x,y-45+row,w,1,'#464f3d');if(row%9===0)cpx(x-w+2,y-45+row,w-3,1,'#838265')}
 cpx(x-33,y-13,65,18,'#3c4936');cpx(x-12,y-13,22,18,'#16251e');cpx(x-13,y-13,2,18,'#a59b73');cpx(x+11,y-13,2,18,'#696c50');cpx(x-1,y-46,2,36,'#baa77a');
 cpx(x-9,y-2,17,5,'#696950');cpx(x-8,y-2,4,4,'#a59b78');cpx(x+3,y-2,1,4,'#343c2d');
 for(const side of [-1,1]){cx.strokeStyle='#8e8561';cx.beginPath();cx.moveTo(x+side*27,y-14);cx.lineTo(x+side*39,y+7);cx.stroke();cpx(x+side*39,y+5,1,5,'#927b51')}
 campCrate(x-37,y+4);campCrate(x-28,y+7);campLamp(x+43,y+9,t);
}
function introTable(i){
 const x=166,y=194;
 cpx(x-40,y-15,79,13,'#4a3927');for(let n=0;n<4;n++){cpx(x-39,y-15+n*3,77,2,n%2?'#796141':'#836b49');cpx(x-36,y-14+n*3,30,1,'#a0845545')}
 cpx(x-40,y-16,79,1,'#b09a6b');cpx(x-38,y-2,3,7,'#453a28');cpx(x+34,y-2,3,7,'#453a28');
 cpx(181,181,13,10,'#39291d');cpx(183,181,10,8,i.done[1]?'#cab88b':'#875c37');cpx(184,182,1,7,'#b89c69');cpx(166,182,11,6,'#aca687');cpx(168,184,6,1,'#6c7151');
 cpx(134,178,24,12,'#494b38');cpx(135,178,22,1,'#98906a');for(let n=0;n<5;n++)cpx(137+n*2,181,1,6,'#1a2a23');cpx(149,181,6,3,i.done[2]?'#e1ba71':'#7c7856');cpx(154,164,1,14,'#9a9e80');
}
function introGenerator(i,t){
 const x=496,y=249;
 cpx(x-20,y,40,5,'#202a24');cpx(x-18,y-19,36,20,'#444e3b');cpx(x-18,y-19,36,3,'#81866b');cpx(x+14,y-16,4,17,'#29382d');cpx(x-15,y-22,17,5,'#6a6c4d');cpx(x-10,y-24,6,2,'#9a9170');
 for(let n=0;n<4;n++){cpx(x-14,y-12+n*3,14,1,'#192c24');cpx(x-14,y-11+n*3,14,1,'#6b7659')}
 cpx(x+4,y-12,8,10,'#1b2a23');cpx(x+6,y-10,4,5,'#727964');cpx(x+17,y-26,3,11,'#535b4a');
 if(i.done[2]){cpx(x+6+Math.floor(t*8)%2,y-9,2,3,'#b7ad7c');cpx(x-4,y-17,2,2,'#d8b975');if(!S.set.reduced&&S.set.parts)for(let n=0;n<3;n++){const a=(t*5+n*8)%25;cpx(x+18+a*.2,y-28-a,3,2,'#a7ad8c33')}}
 // Fuel and repair timber stay beside the engine; its cable runs directly to the winch.
 cpx(470,243,7,10,'#65523a');cpx(471,241,4,2,'#978363');for(let n=0;n<3;n++){cpx(470,258+n*3,23,2,'#72583a');cpx(470,258+n*3,3,2,'#ae9160')}
 for(let n=0;n<32;n++)cpx(513+n,251+Math.floor(n*.4),1,1,'#9b8351');
}
function introMine(i){
 const [x,y]=CAMP_LAYOUT.lift,drop=i.transition?Math.floor(Math.min(1,i.transition/3)*65):0;
 // A compact rock cut supports the old timber frame; its footprint matches the later lift.
 for(let row=0;row<8;row++){const half=35+(row<3?row:6-row)*3;for(let k=-half;k<half;k+=10){cpx(x+k,y-42+row*6,10,6,row%2?'#3d473b':'#465043');cpx(x+k,y-42+row*6,9,1,'#65705a')}}
 cpx(x-26,y-31,52,45,'#091714');
 for(const dx of [-30,27]){cpx(x+dx,y-37,5,53,'#59452e');cpx(x+dx,y-37,1,53,'#aa8d5f');for(let n=0;n<4;n++)cpx(x+dx+2,y-31+n*11,1,5,'#3e3827')}
 cpx(x-32,y-39,64,6,'#756043');cpx(x-32,y-39,64,1,'#b29c70');
 cx.save();cx.beginPath();cx.rect(x-26,y-32,52,47);cx.clip();cpx(x,y-32,1,57+drop,'#a7966b');cpx(x-21,y-21+drop,42,34,'#23362e');for(let dx=-21;dx<23;dx+=7)cpx(x+dx,y-24+drop,1,37,'#84927b');cpx(x-22,y+12+drop,45,3,'#b5a270');if(i.transition)drawMiner(x,y+9+drop,{action:'idle',frame:0,dir:'down',pack:.2});cx.restore();
 cpx(x+30,y-8,6,12,'#6f7255');cpx(x+33,y-16+(i.transition?5:0),1,12,'#c3ad76');
}
function setupIntroUI(){
 $('intro-ui').addEventListener('click',e=>{const b=e.target.closest('[data-intro]');if(!b||b.disabled)return;if(b.dataset.intro==='skip')finishIntro(false);else interactIntro()});
 $('b-intro').addEventListener('click',()=>beginIntro(true));
 addEventListener('keydown',e=>{if(state!=='intro'||e.repeat||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='Escape'){INTRO.paused=!INTRO.paused;clearInputs();refreshIntro();e.preventDefault()}else if(e.key.toLowerCase()==='e'||(e.key===' '||e.key==='Enter')&&e.target.tagName!=='BUTTON'){e.preventDefault();interactIntro()}});
 addEventListener('blur',()=>{if(state==='intro'&&INTRO){INTRO.paused=true;clearInputs();refreshIntro()}});
}

let introTerrain=null;
