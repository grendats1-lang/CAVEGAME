(()=>{
 const before=S,results=[],check=(name,value)=>{results.push({name,pass:!!value});if(!value)throw Error(name)};
 const hash=arr=>{let h=2166136261;for(const n of arr)h=Math.imul(h^n,16777619);return h>>>0};
 try{
  S=defSave();S.exp.flags.extraction=1;S.exp.flags.briefed=1;
  for(let act=0;act<3;act++)for(let seed=1;seed<=12;seed++){
   S.act=act;S.startL=0;S.exp.contract=act===2?'memory':act===1?'cold':'relay';setAct(act);genWorld(seed);
   const original=[hash(tiles),hash(decor),JSON.stringify(POIS),JSON.stringify(slights),JSON.stringify(gItems)].join('|');genWorld(seed);
   check(`deterministic world/lights act ${act} seed ${seed}`,original===[hash(tiles),hash(decor),JSON.stringify(POIS),JSON.stringify(slights),JSON.stringify(gItems)].join('|'));
   const seen=new Uint8Array(tiles.length),q=[I(lifts[0].x,lifts[0].y)];seen[q[0]]=1;for(let h=0;h<q.length;h++){const a=q[h],x=a%MW,y=Math.floor(a/MW);for(const [dx,dy] of D4){const X=x+dx,Y=y+dy;if(!inB(X,Y))continue;const b=I(X,Y);if(!seen[b]&&(!TI[tiles[b]].solid||tiles[b]===T.BARRIER)){seen[b]=1;q.push(b)}}}
   check(`all landmarks and boss reachable act ${act} seed ${seed}`,POIS.every(p=>seen[I(p.x/TS|0,p.y/TS|0)])&&seen[I(bossSpawn.x/TS|0,bossSpawn.y/TS|0)]);
   check(`only mission prop has blue light act ${act} seed ${seed}`,POIS.filter(p=>!p.contract).every(p=>!slights.some(l=>l.x===p.x&&l.y===p.y&&l.c[2]>l.c[0]))&&POIS.filter(p=>p.contract).length===1);
   if(act===0)check(`one optional landmark per Mine layer seed ${seed}`,POIS.filter(p=>!p.contract).length===5);
  }
  return {passed:results.length,worlds:36,results};
 }catch(e){return {error:e.stack,results}}finally{S=before;setAct(0);genWorld(4242)}
})()
