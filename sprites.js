'use strict';
// Authored poses are baked into small pixel frames. No limb interpolation or sprite stretching.
const MINER_WALK=[
 {l:0,r:3,arm:2,bob:0,lean:0},{l:1,r:4,arm:1,bob:1,lean:0},
 {l:2,r:5,arm:0,bob:1,lean:0},{l:3,r:1,arm:0,bob:0,lean:0},
 {l:3,r:0,arm:0,bob:0,lean:0},{l:4,r:1,arm:1,bob:1,lean:0},
 {l:5,r:2,arm:2,bob:1,lean:0},{l:1,r:3,arm:2,bob:0,lean:0}
];
const MINER_STRIKE=[
 {arm:3,lean:-2,bob:0,l:0,r:3,tool:-1.8},
 {arm:4,lean:-2,bob:-1,l:0,r:3,tool:-1.5},
 {arm:4,lean:-1,bob:-1,l:1,r:3,tool:-1.1},
 {arm:5,lean:2,bob:2,l:3,r:0,tool:.25},
 {arm:5,lean:2,bob:2,l:3,r:0,tool:.8},
 {arm:2,lean:1,bob:1,l:1,r:4,tool:.5}
];
const MINER_LEGS=[
 ['.ii.','.pp.','.ps.','.ps.','.ps.','.ii.','ibbb'],
 ['.ii.','.pp.','.ps.','.ii.','ibb.'],
 ['.ii.','.ps.','.psi','..ps','..ib','..bb'],
 ['.ii.','.pp.','.sp.','.sp.','.sp.','.ii.','bbbi'],
 ['.ii.','.pp.','.sp.','.ii.','.bbi'],
 ['.ii.','.sp.','isp.','sp..','bi..','bb..']
];
const MINER_ARMS=[
 ['ii.','csi','csi','.si','.ki','.ki'],
 ['.ii','ics','ics','.sk','.ik'],
 ['ii..','ics.','.csi','..ki','..ik'],
 ['..ki','.ki.','ics.','cs..','ii..'],
 ['.kk.','ikki','.cs.','.cs.','.ii.'],
 ['ii.....','ccsskii','.ccskki','..iii..']
];
const MINER_PALETTES={miner:'#7e6845',marrow:'#59645b',medic:'#93957e',smith:'#80563c',surveyor:'#596f74',archivist:'#6c5e70',worker:'#696754'};
const MINER_CACHE=new Map();
function minerFrame(o={}){
 const action=o.action||'idle',n=action==='walk'?8:action==='mine'||action==='melee'?6:4,frame=Math.max(0,Math.floor(o.frame||0))%n,dir=o.dir||'down',role=o.role||'miner';
 const color=o.color||MINER_PALETTES[role]||MINER_PALETTES.miner;
 const key=[action,frame,dir,role,color,o.hat===false?0:1,o.lamp===false?0:1,o.pack===undefined?0:1,!!o.flash,!!o.noBottle].join(':');
 if(MINER_CACHE.has(key))return MINER_CACHE.get(key);
 const c=document.createElement('canvas');c.width=32;c.height=36;const g=c.getContext('2d');
 const palette={i:'#10181c',p:'#394247',s:'#3c3c32',c:color,k:'#ad8568',b:'#66513d',h:'#a09068',l:'#d2b389',w:'#aeb4a7',e:'#ead6a0'};
 const dot=(x,y,w,h,col)=>{g.fillStyle=o.flash||col;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const mask=(rows,x,y,flip=false)=>rows.forEach((row,j)=>[...row].forEach((v,i)=>{if(palette[v])dot(x+(flip?row.length-1-i:i),y+j,1,1,palette[v])}));
 let pose={arm:0,l:0,r:0,bob:0,lean:0};
 if(action==='walk')pose=MINER_WALK[frame];
 else if(action==='mine'||action==='melee')pose=MINER_STRIKE[frame];
 else if(action==='shoot')pose=[{arm:2,lean:-1},{arm:5,lean:-1},{arm:5,lean:1},{arm:2,lean:0}][frame];
 else if(action==='hurt')pose=[{arm:2,lean:-2,bob:2},{arm:5,lean:-1,bob:3},{arm:1,lean:0,bob:1},{arm:0,lean:0,bob:0}][frame];
 else if(action==='interact')pose=[{arm:0,lean:0},{arm:2,lean:0},{arm:3,lean:1},{arm:2,lean:0}][frame];
 else if(action==='climb')pose={arm:frame%2?3:4,l:frame%2?1:0,r:frame%2?0:1,bob:frame%2};
 else if(action==='idle')pose={arm:0,l:0,r:0,bob:frame===2?1:0,lean:0};
 else if(action==='death')pose={arm:2,l:1,r:4,bob:frame*2,lean:frame};
 const side=dir==='left'||dir==='right',back=dir==='up',flip=dir==='left',ox=16+(pose.lean||0),oy=pose.bob||0;
 // Mirroring is done on the source canvas, preserving a common integer pixel grid.
 if(flip){g.translate(32,0);g.scale(-1,1)}
 if(action==='death'&&frame>=2){mask(['..iii........','iisssiii.....','iccccsspppi..','ihhccssppbbbi','ikkhhiiiiiii.','..iii........'],8,27);}
 else{
  mask(MINER_LEGS[pose.l||0],side?14:12,26);
  mask(MINER_LEGS[pose.r||0],side?16:17,26+(side?1:0),true);
  if(side&&o.pack!==undefined){mask(['.iii.','ihssi','ihssi','isssi','ihhhi','isssi','.iii.'],ox-7,18+oy)}
  mask(MINER_ARMS[action==='walk'?(2-(pose.arm||0)):0],ox-6,19+oy);
  mask(back?['.iiiiii.','icccccci','icshhsci','icsccsci','icsccsci','icshhsci','issssssi','.ihhhi..']:
   side?['.iiiii.','icccssi','ichcssi','icccssi','icchssi','icccssi','isssssi','.ihhi..']:
   ['.iiiiii.','icccccci','icchccci','iccccsci','iccccsci','icchccci','isshsssi','.ihhhi..'],ox-4,19+oy);
  // A small face, neck scarf and heavy brow keep the miner's proportions grounded.
  mask(back?['.iiiii.','ihhhhhi','ihhhhhi','ishhssi','.isssi.','.isssi.']:
   side?['.iiiii.','ihhhhhi','isklkki','iskikki','iskkki.','.isski.']:
   ['.iiiii.','ihhhhhi','iskkksi','isikisi','iskkksi','.isssi.'],ox-3,13+oy);
  if(!back){dot(ox-2,19+oy,4,1,'#79503c');dot(ox+1,20+oy,1,2,'#79503c')}
  if(role==='marrow'){mask(['wssw','wwww','.ww.'],ox-2,17+oy)}
  if(o.hat!==false){mask(['..iiii..','.ihhhhi.','ihhllhhi','ihhhhssi','issssssi'],ox-4,10+oy);if(!back)dot(ox+2,12+oy,2,2,o.lamp===false?'#7a8171':'#e4d3a0')}
  else{mask(['.iiiii.','isssssi','isssssi'],ox-3,12+oy);if(role==='marrow')dot(ox-3,15+oy,1,3,'#8b9081')}
  mask(MINER_ARMS[pose.arm||0],ox+(side?1:3),19+oy,back);
  if(back&&o.pack!==undefined){mask(['.iiiii.','ihhhssi','ishhssi','isssssi','ihhhhsi','.iiiii.'],ox-3,20+oy)}
  if(role==='medic'&&!back){dot(ox-1,19+oy,1,4,'#8a4939');dot(ox-2,20+oy,3,1,'#8a4939')}
  if(action==='interact'&&frame===2&&!o.noBottle){dot(ox+3,14+oy,2,3,'#758c75');dot(ox+3,13+oy,2,1,'#b1baa1')}
 }
 if(MINER_CACHE.size>=512)MINER_CACHE.delete(MINER_CACHE.keys().next().value);
 MINER_CACHE.set(key,c);return c;
}
function minerDirection(vx,vy,fallback='down'){if(Math.hypot(vx,vy)<5)return fallback;const x=Math.abs(vx),y=Math.abs(vy);if(x>y*1.15)return vx<0?'left':'right';if(y>x*1.15)return vy<0?'up':'down';return fallback==='left'||fallback==='right'?(vx<0?'left':'right'):(vy<0?'up':'down')}
function drawMiner(x,y,o={}){
 const action=o.action||(o.moving?'walk':'idle');
 const frame=o.frame??(action==='walk'?Math.floor((o.walk||0)/7):S.set.reduced?0:Math.floor(TT*1.2)%4);
 const sprite=minerFrame({...o,action,frame,dir:o.dir||(o.face<0?'left':'down')});
 px(Math.round(x)-5,Math.round(y)+1,11,3,'#05080b88');
 cx.drawImage(sprite,Math.round(x)-16,Math.round(y)-31);
}
