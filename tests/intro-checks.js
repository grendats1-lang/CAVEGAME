(async()=>{
 const old=S,locked=storageLocked,results=[],check=(n,v)=>{results.push({name:n,pass:!!v});if(!v)throw Error(n)};
 const step=dt=>updateIntro(dt),tick=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const walkTo=(x,y)=>{let count=0;while(Math.hypot(INTRO.x-x,INTRO.y-y)>3&&count++<900){K.d=INTRO.x<x-1;K.a=INTRO.x>x+1;K.s=INTRO.y<y-1;K.w=INTRO.y>y+1;step(1/60)}clearInputs();if(count>=900)throw Error('Intro route stuck');return count/60};
 try{
  storageLocked=true;S=defSave();enterCamp();check('fresh player enters playable arrival',state==='intro'&&INTRO.stage===0&&!P);await tick();
  check('opening starts with narrative card',INTRO.card===0);K.d=true;const openingX=INTRO.x;step(.1);check('opening blocks movement',INTRO.x===openingX);clearInputs();finishIntro(false);check('mandatory intro cannot be skipped',state==='intro'&&!S.exp.flags.intro_done);interactIntro();check('first click reveals second card',INTRO.card===1);interactIntro();check('second click reveals guided scene',INTRO.card===-1);check('no first-play skip button',!document.querySelector('[data-intro=skip]'));
  check('fire and lift match established camp',INTRO_STEPS[0].x===CAMP_LAYOUT.fire[0]&&INTRO_STEPS[0].y===CAMP_LAYOUT.fire[1]&&INTRO_STEPS[4].x===CAMP_LAYOUT.lift[0]&&INTRO_STEPS[4].y===CAMP_LAYOUT.lift[1]);
  const runStart=S.stats.runs;interactIntro();check('interaction requires proximity',INTRO.stage===0&&!INTRO.done[0]);
  let seconds=0;for(let stage=0;stage<5;stage++){
   const target=INTRO_STEPS[stage];
   // Independently flood-fill walkable space, then physically walk the resulting route.
   const cell=4,W=161,H=91,start=Math.round(INTRO.y/cell)*W+Math.round(INTRO.x/cell),goal=Math.round((target.y+20)/cell)*W+Math.round(target.x/cell),queue=[start],prev=new Int32Array(W*H).fill(-1);prev[start]=start;
   for(let q=0;q<queue.length&&prev[goal]<0;q++){const at=queue[q],x=at%W,y=Math.floor(at/W);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,id=Y*W+X;if(X<0||X>=W||Y<0||Y>=H||prev[id]>=0||introBlocked(X*cell,Y*cell))continue;prev[id]=at;queue.push(id)}}
   check('reachable in shared clearing '+target.id,prev[goal]>=0);const route=[];for(let n=goal;n!==start;n=prev[n])route.push([n%W*cell,Math.floor(n/W)*cell]);route.reverse();
   // Merge straight segments so the movement controller does not stop at every grid cell.
   for(let n=0;n<route.length;n++){const a=route[n-1],b=route[n],c=route[n+1];if(a&&c&&b[0]-a[0]===c[0]-b[0]&&b[1]-a[1]===c[1]-b[1])continue;seconds+=walkTo(...b)}
   check('walk reaches '+target.id,introNear());interactIntro();check('persistent beat '+target.id,!!S.exp.flags['intro_'+target.id]);
   if(stage<4){check('reading stops movement '+target.id,INTRO.reading&&!INTRO.moving);interactIntro();check('continue advances '+target.id,INTRO.stage===stage+1)}
  }
  check('cage transition begins',INTRO.transition>0);const transition=INTRO.transition;INTRO.paused=true;step(1);check('pause freezes cage transition',INTRO.transition===transition);refreshIntro();document.querySelector('[data-intro=act]').click();check('touch resumes paused cage transition',!INTRO.paused);for(let i=0;i<220;i++)if(state==='intro')step(1/60);
  check('cage leads directly into first expedition',state==='run'&&S.stats.runs===runStart+1&&ACT===0&&RUN.x.contract==='relay');
  check('intro completes and journal survives',S.exp.flags.intro_done&&S.exp.flags.briefed&&S.exp.journal.includes('inheritance'));
  check('playable route is comfortably under five minutes',seconds+3.6<90);
  endRun(false);enterCamp('death');check('death returns to normal camp',state==='surface'&&!INTRO);
  const saved=JSON.stringify(S);beginIntro(true);interactIntro();interactIntro();INTRO.x=INTRO_STEPS[0].x;INTRO.y=INTRO_STEPS[0].y+20;interactIntro();finishIntro(false);check('replay does not change character or checkpoints',JSON.stringify(S)===saved&&state==='menu');
  S=defSave();S.exp.flags.intro_heater=1;S.exp.flags.intro_journal=1;S.exp.journal=['inheritance'];applySaveData(JSON.parse(JSON.stringify(S)));beginIntro(false);check('reload and migration resume next intro beat',INTRO.stage===2&&INTRO.done[0]&&INTRO.done[1]);
  window.dispatchEvent(new Event('blur'));check('focus loss pauses and releases input',INTRO.paused&&!K.d);document.querySelector('[data-intro="act"]').click();check('touch/click resumes intro',!INTRO.paused);
  finishIntro(false);check('resumed intro cannot be skipped',state==='intro'&&!S.exp.flags.intro_done);
  S.exp.flags.intro_done=1;enterCamp();check('completed intro never repeats automatically',state==='surface');
  S=defSave();S.money=250;enterCamp();check('established older character avoids automatic prologue',state==='surface');if(dialogue)closeStory();
  const a=minerFrame({action:'idle',dir:'down',frame:0}),d=a.getContext('2d').getImageData(0,0,32,36).data,ys=[];for(let y=0;y<36;y++)for(let x=0;x<32;x++)if(d[(y*32+x)*4+3])ys.push(y);check('miner is shorter without scaling or cropping',Math.max(...ys)-Math.min(...ys)+1<=24&&Math.max(...ys)>=31);
  check('diagonal direction is stable',minerDirection(50,50.01,'right')==='right'&&minerDirection(50.01,50,'down')==='down');
  return {passed:results.length,walkingSeconds:seconds,estimatedReadingSeconds:INTRO_STEPS.reduce((n,s)=>n+(s.line+' '+s.after).split(/\s+/).length,0)/3.3,results};
 }catch(e){return {error:e.stack,results}}finally{INTRO=null;dialogue=null;clearInputs();S=old;storageLocked=locked;P=null;RUN=null;CAMP.active=false;showMenu();resize()}
})()
