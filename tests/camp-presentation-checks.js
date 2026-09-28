(async()=>{
 const originalS=S,locked=storageLocked,originalState=state,results=[];
 const check=(name,ok)=>{results.push({name,pass:!!ok});if(!ok)throw Error(name)};
 const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 try{
  // This page never writes synthetic progress into the shared player's storage.
  storageLocked=true;S=defSave();S.exp.flags.briefed=1;S.exp.flags.arrival=1;enterCamp();await frame();
  check('camp uses a low-resolution pixel canvas',cv.width===Math.ceil(innerWidth/campPixelScale())&&cv.height===Math.ceil(innerHeight/campPixelScale())&&!cx.imageSmoothingEnabled);
  check('fresh guide targets the lift',campNextStep().id==='lift');
  const spawn={x:CAMP.x,y:CAMP.y};
  for(const s of hubStations()){
   CAMP.x=spawn.x;CAMP.y=spawn.y;CAMP.route=null;const path=campRoute(s.id);
   check('reachable guide trail: '+s.id,path.length>0&&path.every(p=>!hubBlocked(p.x,p.y))&&Math.hypot(path.at(-1).x-s.x,path.at(-1).y-s.y-19)<7);
   for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let j=0;j<=8;j++)if(hubBlocked(a.x+(b.x-a.x)*j/8,a.y+(b.y-a.y)*j/8))throw Error('Trail crosses building: '+s.id)}
  }
  CAMP.x=spawn.x;CAMP.y=spawn.y;CAMP.route=null;const originalTrail=campRoute('lift').map(p=>({...p})),middle=originalTrail[Math.floor(originalTrail.length/2)];
  CAMP.x=middle.x;CAMP.y=middle.y;const advanced=campRoute('lift');
  check('guide discards walked trail',advanced.length<originalTrail.length&&!advanced.some(p=>p.x===originalTrail[0].x&&p.y===originalTrail[0].y));
  check('guide starts at current position',Math.hypot(advanced[0].x-CAMP.x,advanced[0].y-CAMP.y)<12);
  const end=originalTrail.at(-1);CAMP.x=end.x;CAMP.y=end.y;check('guide clears on arrival',campRoute('lift').length===0);
  CAMP.x=320;CAMP.y=248;const detour=campRoute('lift');check('guide recovers when leaving route',detour.length>0&&Math.hypot(detour[0].x-CAMP.x,detour[0].y-CAMP.y)<12);
  CAMP.x=243;CAMP.y=124;const trunkTrail=campRoute('lift');check('guide connects safely beside a trunk',trunkTrail.length>0&&trunkTrail.every((p,i)=>{const a=i?trunkTrail[i-1]:CAMP;for(let j=0;j<=16;j++)if(hubBlocked(a.x+(p.x-a.x)*j/16,a.y+(p.y-a.y)*j/16))return false;return true}));
  CAMP.x=spawn.x;CAMP.y=spawn.y;const changed=campRoute('forge'),forge=hubStations().find(s=>s.id==='forge');check('guide changes destination',Math.hypot(changed.at(-1).x-forge.x,changed.at(-1).y-forge.y-19)<7);
  check('unknown guide destination is harmless',campRoute('missing').length===0);
  CAMP.x=76;CAMP.y=94;CAMP.vx=CAMP.vy=0;const beforeWalk=CAMP.walk;clearInputs();K.w=true;for(let i=0;i<90;i++)updateCamp(1/60);clearInputs();
  check('movement stops at forge wall',CAMP.y>=89&&CAMP.y<94);check('blocked walking does not advance animation',CAMP.walk-beforeWalk<6&&!CAMP.moving);
  CAMP.x=76;CAMP.y=102;CAMP.vx=CAMP.vy=0;updateCamp(.016);campInteract();
  check('forge discovery and readable station panel',CAMP.menu==='forge'&&S.exp.visited.forge&&parseFloat(getComputedStyle($('surf')).fontSize)>=15);
  closeCamp();CAMP.x=hubStations().find(s=>s.id==='fire').x;CAMP.y=hubStations().find(s=>s.id==='fire').y+19;updateCamp(.016);$('interact').click();check('fire prompt still starts dialogue',!!dialogue);closeStory();
  openCamp('guide');check('guide includes first-trip instructions and progress', $('surf').textContent.includes('two copper')&&$('surf').querySelectorAll('.guide-checklist li').length===4);
  $('surf').querySelector('[data-route="lift"]').click();check('route button closes menu and sets destination',!CAMP.menu&&CAMP.destination==='lift');
  openCamp('quick');check('all places have matching symbols and route buttons',$('surf').querySelectorAll('.place-card').length===15&&$('surf').querySelectorAll('[data-route]').length===15);
  check('undiscovered buildings can be guided but not opened',!$('surf').querySelector('[data-station="tower"]')&&!!$('surf').querySelector('[data-route="tower"]'));
  closeCamp();CAMP.x=320;CAMP.y=224;CAMP.vx=CAMP.vy=0;
  const touch=document.querySelector('[data-touch-key="d"]');touch.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:99}));for(let i=0;i<20;i++)updateCamp(1/60);touch.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:99}));check('touch movement and cancel',CAMP.x>330&&!K.d);
  S.exp.flags.extraction=1;check('return guide suggests first upgrade',campNextStep().id==='forge');S.gear.pick=1;check('upgraded miner is directed to archive',campNextStep().id==='archive');S.exp.visited.archive=1;check('experienced miner gets a contract goal',campNextStep().id==='board');
  S.exp.projects.forge=1;S.exp.projects.smelter=1;S.exp.projects.tower=1;renderCamp();check('restored buildings render without errors',true);
  for(const dir of ['up','down','left','right']){const hashes=new Set();for(let f=0;f<8;f++){const c=minerFrame({action:'walk',frame:f,dir,pack:.5});hashes.add(c.toDataURL())}check('eight distinct walking frames: '+dir,hashes.size===8)}
  for(const action of ['mine','melee','shoot','hurt','death']){const frames=new Set(Array.from({length:action==='mine'||action==='melee'?6:4},(_,frame)=>minerFrame({action,frame,dir:'right'}).toDataURL()));check('distinct action silhouettes: '+action,frames.size>=3)}
  const residents=Array.from({length:320},(_,i)=>campCourier(i/10));check('courier route stays outside camp obstacles',residents.every(p=>!hubBlocked(p.x,p.y)));check('courier walks and rests',residents.some(p=>p.moving)&&residents.some(p=>!p.moving));
  check('sprite cache is bounded',MINER_CACHE.size<=512);
  S.exp.seedText='91028';startRun(0,0);paused=true;await frame();check('cave resets canvas and hides camp overlays',cv.width===640&&cv.height===360&&!wrap.classList.contains('in-camp')&&getComputedStyle($('camp-guide')).display==='none');
  for(const gear of ['pick','sword','bow']){S.gear[gear]=1;P.slot=['pick','sword','bow'].indexOf(gear);P.sw=0;drawPlayer(cam.x-320,cam.y-180);P.sw=0.5;drawPlayer(cam.x-320,cam.y-180)}P.inv=1;drawPlayer(cam.x-320,cam.y-180);
  check('larger miner renders tools, attacks and hurt state',true);
  $('interact').style.display='none';togglePause();togglePause();$('b-pcamp').click();check('pause guide does not expose camp travel actions',paused&&!$('info').querySelector('[data-route]'));$('b-info-close').click();
  endRun(false);enterCamp('death');await frame();check('death restores full camp viewport',wrap.classList.contains('in-camp')&&CAMP.x===76&&CAMP.y===215);
  S.set.reduced=1;renderCamp();check('reduced motion camera is immediate',Number.isFinite(CAMP.camera.x)&&Number.isFinite(CAMP.camera.y));
  return {passed:results.length,results};
 }catch(e){return {error:e.stack,results}}finally{
  clearInputs();dialogue=null;S=originalS;storageLocked=locked;P=null;RUN=null;CAMP.active=false;CAMP.menu=null;state=originalState==='run'?'menu':originalState;showMenu();resize();
 }
})()
