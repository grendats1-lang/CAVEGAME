(async()=>{
 const old=S,locked=storageLocked,results=[],check=(n,v)=>{results.push({name:n,pass:!!v});if(!v)throw Error(n)};
 const step=dt=>updateIntro(dt),tick=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const walkTo=(x,y)=>{let count=0;while(Math.hypot(INTRO.x-x,INTRO.y-y)>3&&count++<900){K.d=INTRO.x<x-1;K.a=INTRO.x>x+1;K.s=INTRO.y<y-1;K.w=INTRO.y>y+1;step(1/60)}clearInputs();if(count>=900)throw Error('Intro route stuck');return count/60};
 try{
  storageLocked=true;S=defSave();enterCamp();check('fresh player enters playable arrival',state==='intro'&&INTRO.stage===0&&!P);await tick();
  const runStart=S.stats.runs;interactIntro();check('interaction requires proximity',INTRO.stage===0&&!INTRO.done[0]);
  let seconds=0;for(let stage=0;stage<5;stage++){
   const target=INTRO_STEPS[stage];
   // Cross the lower aisle to avoid the generator, desk and heater furniture.
   seconds+=walkTo(INTRO.x,211);seconds+=walkTo(target.x,211);seconds+=walkTo(target.x,target.y+20);
   check('walk reaches '+target.id,introNear());interactIntro();check('persistent beat '+target.id,!!S.exp.flags['intro_'+target.id]);
   if(stage<4){check('reading stops movement '+target.id,INTRO.reading&&!INTRO.moving);interactIntro();check('continue advances '+target.id,INTRO.stage===stage+1)}
  }
  check('cage transition begins',INTRO.transition>0);const transition=INTRO.transition;INTRO.paused=true;step(1);check('pause freezes cage transition',INTRO.transition===transition);refreshIntro();document.querySelector('[data-intro=act]').click();check('touch resumes paused cage transition',!INTRO.paused);for(let i=0;i<220;i++)if(state==='intro')step(1/60);
  check('cage leads directly into first expedition',state==='run'&&S.stats.runs===runStart+1&&ACT===0&&RUN.x.contract==='relay');
  check('intro completes and journal survives',S.exp.flags.intro_done&&S.exp.flags.briefed&&S.exp.journal.includes('inheritance'));
  check('playable route is comfortably under five minutes',seconds+3.6<90);
  endRun(false);enterCamp('death');check('death returns to normal camp',state==='surface'&&!INTRO);
  const saved=JSON.stringify(S);beginIntro(true);INTRO.x=98;INTRO.y=181;interactIntro();finishIntro(false);check('replay does not change character or checkpoints',JSON.stringify(S)===saved&&state==='menu');
  S=defSave();S.exp.flags.intro_heater=1;S.exp.flags.intro_journal=1;S.exp.journal=['inheritance'];applySaveData(JSON.parse(JSON.stringify(S)));beginIntro(false);check('reload and migration resume next intro beat',INTRO.stage===2&&INTRO.done[0]&&INTRO.done[1]);
  window.dispatchEvent(new Event('blur'));check('focus loss pauses and releases input',INTRO.paused&&!K.d);document.querySelector('[data-intro="act"]').click();check('touch/click resumes intro',!INTRO.paused);
  finishIntro(false);check('skip gives context and returns to camp',state==='surface'&&S.exp.flags.briefed&&S.exp.flags.intro_done&&S.stats.runs===0);
  enterCamp();check('intro never repeats automatically',state==='surface');
  S=defSave();S.money=250;enterCamp();check('established older character avoids automatic prologue',state==='surface');if(dialogue)closeStory();
  const a=minerFrame({action:'idle',dir:'down',frame:0}),d=a.getContext('2d').getImageData(0,0,32,36).data,ys=[];for(let y=0;y<36;y++)for(let x=0;x<32;x++)if(d[(y*32+x)*4+3])ys.push(y);check('miner is shorter without scaling or cropping',Math.max(...ys)-Math.min(...ys)+1<=24&&Math.max(...ys)>=31);
  check('diagonal direction is stable',minerDirection(50,50.01,'right')==='right'&&minerDirection(50.01,50,'down')==='down');
  return {passed:results.length,walkingSeconds:seconds,estimatedReadingSeconds:INTRO_STEPS.reduce((n,s)=>n+(s.line+' '+s.after).split(/\s+/).length,0)/3.3,results};
 }catch(e){return {error:e.stack,results}}finally{INTRO=null;dialogue=null;clearInputs();S=old;storageLocked=locked;P=null;RUN=null;CAMP.active=false;showMenu();resize()}
})()
