'use strict';
// A self-contained arrival scene. Replay never writes to the player's character.
const INTRO_STEPS=[
 {id:'heater',x:98,y:163,label:'Light the kerosene heater',title:'Blackwood Mine · Appalachian Mountains',line:'Forty years after the collapse, rain still finds its way through the staging shed. The deed is finally yours. First, get some heat into this place.',after:'The match catches. Warmth creeps through the shed; your grandfather’s journal waits on the desk.'},
 {id:'journal',x:182,y:111,label:'Read your grandfather’s journal',title:'The pages they never read',line:'Ten years of scrapyard shifts bought back the mine that ruined your family. Your grandfather’s last entry is dated the morning the shaft fell.',after:'“Beyond the silver seam: a fissure, unworked geodes, and air rising from somewhere deeper. They say I am chasing ghosts.” His last sketch ends at a door.'},
 {id:'generator',x:287,y:158,label:'Start the old diesel generator',title:'Built back, piece by piece',line:'You hauled the winch up here yourself. Rewired the headlamp. Patched the cage. If the journal is right, there is enough below to rebuild everything.',after:'The engine turns over. The cage has power. Your lamp and backpack set the pace now: short trips, a useful haul, then back to the lift.'},
 {id:'radio',x:257,y:99,label:'Answer the radio',title:'An unexpected voice',line:'Three taps interrupt the engine’s rattle. Someone has been using your grandfather’s frequency.',after:'Marrow: “I worked with your grandfather. My niece Iona followed his sketch. Last night her relay tapped her name. Bring that signal home. Then I’ll tell you why we sealed the shaft.”'},
 {id:'lift',x:345,y:198,label:'Pull the cage lever',title:'The first descent',line:'A pick, a lamp, a little courage. Find copper beside the lift, follow the one blue relay signal, and bring Iona’s message back. The fortune can wait.',after:'The cable takes your weight. Rain becomes a whisper. Below, something knocks three times.'}
];
let INTRO=null;
function introStage(flags=S.exp.flags){const n=INTRO_STEPS.findIndex(s=>!flags['intro_'+s.id]);return n<0?4:n}
function beginIntro(replay=false){
 clearInputs();dialogue=null;paused=false;CAMP.active=false;CAMP.menu=null;state='intro';showPanel(null);$('hud').style.display='none';$('campbar').style.display='none';$('objective').style.display='none';$('interact').style.display='none';$('touch-controls').classList.add('on');
 const stage=replay?0:introStage(),previous=INTRO_STEPS[Math.max(0,stage-1)];
 INTRO={replay,stage,x:stage?previous.x:60,y:stage?previous.y+22:197,vx:0,vy:0,walk:0,dir:'right',t:0,sound:0,paused:false,reading:false,transition:0,done:INTRO_STEPS.map((s,i)=>i<stage),moving:false,actionTime:0};
 AU.init();MUS.set('camp',0,0);resize();refreshIntro();
}
function introBlocked(x,y){return x<42||x>375||y<82||y>227||[[159,202,93,112],[271,306,140,160],[243,272,82,100],[87,109,146,164]].some(([l,r,t,b])=>x>l&&x<r&&y>t&&y<b)}
function introNear(){if(!INTRO)return false;const s=INTRO_STEPS[INTRO.stage];return Math.hypot(INTRO.x-s.x,INTRO.y-(s.y+18))<27}
function introDirections(){if(!INTRO)return '';if(introNear())return innerWidth<700?'Tap the action below.':'Press E or click the action below.';const s=INTRO_STEPS[INTRO.stage],dx=s.x-INTRO.x,dy=s.y+18-INTRO.y,dir=['east','southeast','south','southwest','west','northwest','north','northeast'][(Math.round(Math.atan2(dy,dx)/(.25*Math.PI))+8)%8];return `Walk ${dir} · ${innerWidth<700?'use the direction pad':'WASD / arrows'}`}
function refreshIntro(){if(!INTRO)return;const i=INTRO,s=INTRO_STEPS[i.stage];$('intro-ui').innerHTML=`<header><div><span class='eyebrow'>PROLOGUE · ${i.stage+1} / 5</span><strong>${esc(s.title)}</strong></div><button data-intro='skip'>${i.replay?'EXIT REPLAY':'SKIP TO CAMP'}</button></header><section class='intro-caption' aria-live='polite'><p>${esc(i.transition?s.after:i.reading?s.after:s.line)}</p><div><small id='intro-directions'>${i.paused?'Paused while away.':i.transition?'The cage is descending…':i.reading?'Take a moment, then continue.':introDirections()}</small><button data-intro='act' ${!i.paused&&(i.transition||!i.reading&&!introNear())?'disabled':''}>${i.paused?'RESUME':i.reading?'CONTINUE':s.label.toUpperCase()} <kbd>E</kbd></button></div></section>`}
function interactIntro(){
 const i=INTRO;if(state!=='intro'||!i)return;if(i.paused){i.paused=false;clearInputs();refreshIntro();return}if(i.transition)return;
 if(i.reading){i.reading=false;i.stage++;clearInputs();refreshIntro();return}if(!introNear())return;
 clearInputs();i.vx=i.vy=0;i.moving=false;i.actionTime=.55;i.done[i.stage]=true;
 if(!i.replay){S.exp.flags['intro_'+INTRO_STEPS[i.stage].id]=1;if(i.stage===1)addJournal('inheritance');save()}
 if(i.stage===0){AU.nz(.18,{ft:'highpass',f:2400,v:.1});AU.tone(180,.2,{v:.04,f2:70})}
 else if(i.stage===2){AU.tone(46,1.4,{type:'sawtooth',v:.035,lp:140,f2:58});AU.nz(.5,{f:160,v:.09})}
 else if(i.stage===3){for(let n=0;n<3;n++)AU.tone(650,.06,{type:'triangle',v:.045,dl:n*.24})}
 else SND.ui();
 if(i.stage===4){i.transition=.001;AU.tone(60,2.8,{type:'triangle',v:.07,f2:32});AU.nz(1.4,{f:300,v:.04});}else i.reading=true;
 refreshIntro();
}
function finishIntro(descend){
 if(!INTRO)return;const replay=INTRO.replay;INTRO=null;clearInputs();$('intro-ui').innerHTML='';wrap.classList.remove('in-intro');
 if(replay){showMenu();resize();return}
 S.exp.flags.intro_done=1;S.exp.flags.briefed=1;S.exp.flags.arrival=1;addJournal('arrival');S.exp.visited.marrow=1;S.exp.visited.board=1;S.exp.visited.lift=1;S.exp.protected.copper=1;S.exp.protected.coal=1;save();
 if(descend){S.act=0;S.startL=0;S.exp.contract='relay';startRun(0,0);resize()}else enterCamp();
}
function updateIntro(dt){const i=INTRO;if(!i||i.paused)return;i.t+=dt;i.sound-=dt;if(i.sound<=0){i.sound=1.8;AU.nz(1.6,{ft:'lowpass',f:900,v:.014,rev:.05});if(i.done[2])AU.tone(52,1.5,{type:'triangle',v:.018,lp:130,rev:0})}
 if(i.transition){i.transition+=dt;if(i.transition>=3.6)finishIntro(true);return}
 i.actionTime=Math.max(0,i.actionTime-dt);if(i.reading)return;
 const before=introNear(),mx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),my=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0),len=Math.hypot(mx,my)||1,f=1-Math.exp(-dt*14),ox=i.x,oy=i.y;
 i.vx+=(mx/len*64-i.vx)*f;i.vy+=(my/len*64-i.vy)*f;
 if(!introBlocked(i.x+i.vx*dt,i.y))i.x+=i.vx*dt;if(!introBlocked(i.x,i.y+i.vy*dt))i.y+=i.vy*dt;
 const moved=Math.hypot(i.x-ox,i.y-oy);i.walk+=moved;i.moving=moved>.015;i.dir=minerDirection(i.vx,i.vy,i.dir);
 if(before!==introNear())refreshIntro();else{const e=$('intro-directions'),hint=introDirections();if(e&&e.textContent!==hint)e.textContent=hint}
}
function renderIntro(){
 const i=INTRO;if(!i)return;cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=1;cx.imageSmoothingEnabled=false;cx.fillStyle='#0c1216';cx.fillRect(0,0,cv.width,cv.height);fx.clearRect(0,0,fxc.width,fxc.height);
 const scale=innerWidth/cv.width,header=$('intro-ui').querySelector('header').offsetHeight/scale,footer=innerWidth<700?115:65;
 const camx=cv.width>390?196:clamp(i.x,cv.width/2,392-cv.width/2),camy=clamp(i.y,125,154),tx=Math.round(cv.width/2-camx),ty=Math.round((cv.height+header-footer)/2-camy);
 cx.save();cx.translate(tx,ty);const t=S.set.reduced?0:i.t;
 // Appalachian silhouettes, cold rain outside and a cutaway corrugated staging shed.
 for(let n=0;n<24;n++){const x=n*19,h=25+Math.floor(ih(n,2,2)*28);cpx(x,67-h,20,h,'#172327');for(let j=0;j<7;j++)cpx(x+8-j,45-h+j*4,j*2+3,2,'#253134')}
 cpx(26,74,359,166,'#1b2323');cpx(35,78,341,153,'#3c3b30');
 for(let y=84;y<230;y+=9){cpx(37,y,337,1,'#222a27');for(let x=41;x<372;x+=40){cpx(x+(y%3)*7,y-7,1,7,'#514d3b');cpx(x+2,y-5,1,1,'#70634a')}}
 cpx(25,65,362,18,'#26393a');for(let x=27;x<385;x+=5){cpx(x,62,2,21,'#4a5956');cpx(x,64,1,19,'#62716a')}cpx(25,82,362,3,'#7d7c63');
 for(const x of [34,375]){cpx(x,79,4,154,'#2c332d');cpx(x,79,1,151,'#7c7357')}cpx(217,79,4,15,'#5d5a43');campCrate(53,113);campCrate(64,111);campCrate(53,105);
 // Heater and warm pool.
 cpx(88,146,21,20,'#212b28');cpx(89,148,19,16,'#656957');cpx(92,144,13,3,'#8b8970');
 for(let n=0;n<5;n++)cpx(92+n*3,151,1,10,i.done[0]?'#df9d4c':'#292e27');
 if(i.done[0]){const glow=cx.createRadialGradient(98,158,2,98,158,70);glow.addColorStop(0,'#cf8b3635');glow.addColorStop(1,'#cf8b3600');cx.fillStyle=glow;cx.fillRect(28,88,140,140);cpx(94+Math.floor(t*7)%3,154,5,4,'#f0bd65')}
 // Desk, journal, deed and the unfinished map.
 cpx(155,94,53,17,'#574630');cpx(157,93,49,2,'#a48a5b');cpx(159,110,3,9,'#302b23');cpx(201,110,3,9,'#302b23');cpx(174,96,14,10,'#352a23');cpx(176,96,12,8,i.done[1]?'#c3b17f':'#806044');cpx(178,98,7,1,'#544931');
 cpx(190,97,12,6,'#c2b289');cpx(193,98,5,1,'#6d684d');for(let n=0;n<3;n++){cpx(121+n*20,85,16,12,'#85958b');cpx(123+n*20,88,10,1,'#344b4a');cpx(126+n*20,89,1,6,'#344b4a')}
 // Generator flywheel, patched fuel tank, cables to the lift.
 cpx(271,140,36,22,'#242e2b');cpx(273,141,32,17,'#59614e');cpx(276,138,15,6,'#787554');cpx(293,144,11,13,'#1d2726');for(let n=0;n<4;n++)cpx(277,148+n*3,12,1,'#252d26');
 if(i.done[2]){const f=Math.floor(t*9)%4;cpx(296+(f%2)*3,147+(f>1?5:0),3,3,'#9a9e78');cpx(281,144,2,2,'#c2b367');for(let n=0;n<4;n++){const v=Math.floor((t*8+n*6)%24);cpx(304+Math.floor(v/8),139-v,3,3,'#8d95803b')}}
 for(let x=306;x<356;x++)cpx(x,162+Math.floor((x-306)/6),1,1,'#8a7951');
 // Marrow's radio: a small warm dial, the one blue signal is still underground.
 cpx(240,87,34,14,'#6e6046');cpx(244,88,12,10,'#202c2b');for(let n=0;n<4;n++)cpx(246+n*2,90,1,6,'#4d5c4d');cpx(260,90,9,4,i.done[2]?'#c4a26a':'#4d4c38');cpx(265,76,1,11,'#a19a78');
 // Cage, rope and iron lever. The entire cage drops in the closing shot.
 const drop=i.transition?Math.floor(Math.min(1,i.transition/3)*65):0;
 cpx(313,176,60,54,'#090f12');cpx(309,169,4,61,'#64716b');cpx(374,169,3,61,'#64716b');cpx(309,167,68,4,'#8e9781');
 cx.save();cx.beginPath();cx.rect(312,172,61,60);cx.clip();cpx(342,165,1,70+drop,'#9a9474');cpx(318,193+drop,48,30,'#38463f');for(let x=318;x<368;x+=7)cpx(x,179+drop,1,45,'#8a9480');cpx(318,222+drop,49,3,'#a29973');if(i.transition)drawMiner(345,218+drop,{action:'idle',frame:0,dir:'down',pack:.2});cx.restore();
 cpx(364,189,6,12,'#76765b');cpx(366,182+(i.transition?5:0),2,10,'#b9aa7c');
 if(!i.transition){const reaching=i.actionTime>0;drawMiner(i.x,i.y,{moving:i.moving&&!i.reading,walk:i.walk,dir:i.dir,action:reaching?'interact':undefined,frame:reaching?Math.min(3,Math.floor((.55-i.actionTime)*7)):undefined,pack:.2,noBottle:true});if(i.reading&&i.stage===1){cpx(i.x+3,i.y-12,5,4,'#74513b');cpx(i.x+4,i.y-12,3,3,'#c8b68a')}if(i.stage===0&&reaching)cpx(i.x+5,i.y-12,1,2,'#edbc66')}
 if(!i.reading&&!i.transition){const s=INTRO_STEPS[i.stage];cpx(s.x-3,s.y-28,7,1,'#d2bd7b');cpx(s.x-2,s.y-27,5,1,'#d2bd7b');cpx(s.x-1,s.y-26,3,1,'#d2bd7b')}
 if(!S.set.reduced)for(let n=0;n<Math.floor(55*S.set.parts);n++){const x=Math.floor(ih(n,3,7)*400),y=Math.floor((ih(n,4,7)*260+t*105)%260);if(x<35||x>378||y<63||y>235)cpx(x,y,1,4,'#a1b0b03b')}
 cx.restore();if(i.transition){cx.fillStyle=`rgba(4,8,10,${clamp((i.transition-1.6)/2,0,1)})`;cx.fillRect(0,0,cv.width,cv.height)}
}
function setupIntroUI(){
 $('intro-ui').addEventListener('click',e=>{const b=e.target.closest('[data-intro]');if(!b||b.disabled)return;if(b.dataset.intro==='skip')finishIntro(false);else interactIntro()});
 $('b-intro').addEventListener('click',()=>beginIntro(true));
 addEventListener('keydown',e=>{if(state!=='intro'||e.repeat||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='Escape'){INTRO.paused=!INTRO.paused;clearInputs();refreshIntro();e.preventDefault()}else if(e.key.toLowerCase()==='e'||e.key===' '&&e.target.tagName!=='BUTTON'){e.preventDefault();interactIntro()}});
 addEventListener('blur',()=>{if(state==='intro'&&INTRO){INTRO.paused=true;clearInputs();refreshIntro()}});
}
