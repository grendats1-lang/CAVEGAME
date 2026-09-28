'use strict';
// DEEP BELOW v2 - world: generation, pixel painting, chunks, minimap, item icons
const I=(x,y)=>y*MW+x;
const inB=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
function tAt(x,y){return inB(x,y)?tiles[y*MW+x]:T.BEDROCK}
const layerOf=y=>clamp(Math.floor(y/LH),0,NL-1);
const sealReq=k=>ACTS[ACT].seal[k]||0;
const barHP=k=>ACT?[0,40,55][k]||40:BAR_HP[k]||14;
function tileHP(x,y){const t=tAt(x,y),k=layerOf(y);if(TI[t].ore)return TI[LAYERS[k].rock].hp+TI[t].extra;if(t===T.BARRIER)return barHP(k);return TI[t].hp}
function pickOre(k){const o=LAYERS[k].ores;let tot=0;for(const e of o)tot+=e[1];let r=Math.random()*tot;for(const e of o){r-=e[1];if(r<=0)return TI[e[0]].ore}return TI[o[0][0]].ore}
const isRock=t=>t===T.DIRT||t===T.STONE||t===T.SLATE||t===T.BASALT||t===T.ANCIENT||t===T.GRAVEL||t===T.ICE||t===T.MYCEL||t===T.VOIDR;

function genWorld(seed){
 const rng=mulberry(seed),R=()=>rng(),RI=(a,b)=>a+Math.floor(R()*(b-a+1));
 WSEED=Math.abs(seed)%9973;
 tiles=new Uint8Array(MW*MH);dmg=new Float32Array(MW*MH);decor=new Uint8Array(MW*MH);flg=new Uint8Array(MW*MH);expl=new Uint8Array(MW*MH);
 lifts=[];slights=[];gItems=[];gEnemies=[];vents=[];chunks={};bossSpawn=null;
 const opens=[];for(let k=0;k<NL;k++)opens.push(genLayer(k,R,RI));
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x===0||x===MW-1||y===0||y===MH-1)tiles[I(x,y)]=T.BEDROCK;
 for(let k=0;k<NL;k++)populate(k,opens[k],R,RI);
 mm=document.createElement('canvas');mm.width=MW;mm.height=MH;mmx=mm.getContext('2d');mmx.fillStyle='#000';mmx.fillRect(0,0,MW,MH);
}

function genLayer(k,R,RI){
 const L=LAYERS[k],y0=k*LH,top=y0+(k?4:2),w=MW,h=LH,g=new Uint8Array(w*h),s=k*101+WSEED+ACT*977;
 const inside=(x,y)=>x>=2&&x<w-2&&y0+y>=top&&y<h-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)g[y*w+x]=inside(x,y)?(R()>L.open+(fbm(x/9,(y0+y)/9,s)-.5)*.4?1:0):1;
 for(let it=0;it<5;it++){const n=new Uint8Array(g);for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!inside(x,y))continue;let c=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){if(!i&&!j)continue;const X=x+i,Y=y+j;if(X<0||Y<0||X>=w||Y>=h||g[Y*w+X])c++}n[y*w+x]=c>=5?1:c<=3?0:g[y*w+x]}g.set(n)}
 const carve=(x,y,r)=>{x=Math.round(x);y=Math.round(y);for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){if(i*i+j*j>r*r+.6)continue;if(inside(x+i,y+j))g[(y+j)*w+x+i]=0}};
 for(let n=RI(5,8);n>0;n--){let x=RI(4,w-5),y=RI(top-y0+2,h-4),a=R()*6.28;const r=R()<.3?1:0,len=RI(30,90);for(let st=0;st<len;st++){carve(x,y,r);a+=(R()-.5)*.9;x=clamp(x+Math.cos(a),3,w-4);y=clamp(y+Math.sin(a)*.8,top-y0+1,h-3)}}
 for(let n=RI(1,3);n>0;n--){const cx=RI(10,w-11),cy=RI(top-y0+8,h-9),rx=RI(5,9),ry=RI(4,7);for(let j=-ry-1;j<=ry+1;j++)for(let i=-rx-1;i<=rx+1;i++){const e=(i/rx)*(i/rx)+(j/ry)*(j/ry);if(e<1-vn((cx+i)/3,(cy+j)/3,s+4)*.35&&inside(cx+i,cy+j))g[(cy+j)*w+cx+i]=0}}
 const lx=k===0?(MW>>1)-1:RI(8,MW-10),ly=k===0?top+2:top+3;
 for(let j=-3;j<=4;j++)for(let i=-3;i<=4;i++){if(Math.hypot(i-.5,j-.5)<3.6&&inside(lx+i,ly-y0+j))g[(ly-y0+j)*w+lx+i]=0}
 const lab=new Int32Array(w*h).fill(-1),regs=[];
 for(let i0=0;i0<w*h;i0++){if(g[i0]||lab[i0]>=0)continue;const id=regs.length,q=[i0],cells=[];lab[i0]=id;while(q.length){const c=q.pop();cells.push(c);const X=c%w,Y=(c/w)|0;for(const d of D4){const nx=X+d[0],ny=Y+d[1];if(nx<0||ny<0||nx>=w||ny>=h)continue;const j=ny*w+nx;if(!g[j]&&lab[j]<0){lab[j]=id;q.push(j)}}}regs.push(cells)}
 let mi=0;for(let i=1;i<regs.length;i++)if(regs[i].length>regs[mi].length)mi=i;
 const main=regs[mi]||[],hidden=[];
 for(let r=0;r<regs.length;r++){if(r===mi)continue;const rc=regs[r];if(rc.length<9){hidden.push(rc);continue}
  const a=rc[Math.floor(R()*rc.length)],ax=a%w,ay=(a/w)|0;let best=-1,bd=1e9;for(let t=0;t<main.length;t+=2){const c=main[t],d=(c%w-ax)*(c%w-ax)+(((c/w)|0)-ay)*(((c/w)|0)-ay);if(d<bd){bd=d;best=c}}if(best<0)continue;
  const bx=best%w,by=(best/w)|0;let x=ax,y=ay;for(let st=0;st<400&&(x!==bx||y!==by);st++){const hx=Math.abs(bx-x)>Math.abs(by-y);if(x!==bx&&(R()<(hx?.7:.3)||y===by))x+=Math.sign(bx-x);else y+=Math.sign(by-y);carve(x,y,R()<.15?1:0)}}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const gy=y0+y,i=I(x,gy);let t=T.AIR;if(g[y*w+x]){if(k>0&&gy<y0+3)t=T.BARRIER;else if(k>0&&gy===y0+3&&vn(x/3,gy,s+2)>.45)t=T.BARRIER;else if(ACT===0&&k===0)t=fbm(x/7,gy/7,s+3)>.56?T.STONE:T.DIRT;else t=L.rock;if(ACT===0&&t!==T.BARRIER&&k<3&&fbm(x/5,gy/5,s+5)>.74)t=T.GRAVEL}tiles[i]=t}
 for(let j=0;j<2;j++)for(let i=0;i<2;i++)tiles[I(lx+i,ly+j)]=T.LIFT;
 lifts[k]={x:lx,y:ly};
 const list=[];for(const c of main){const X=c%w,Y=y0+((c/w)|0);if(tiles[I(X,Y)]===T.AIR)list.push(I(X,Y))}
 for(const rc of hidden)if(rc.length>=2&&R()<.4){const c=rc[0];tiles[I(c%w,y0+((c/w)|0))]=T.CHEST}
 return list;
}

function populate(k,list,R,RI){
 const L=LAYERS[k],y0=k*LH,top=y0+(k?4:2),y1=y0+LH,lf=lifts[k],last=k===NL-1,ax=MW>>1,ay=y1-16,AR=11;
 const inArena=i=>last&&Math.hypot(i%MW-ax,((i/MW)|0)-ay)<AR+3;
 const far=(i,d)=>Math.hypot(i%MW-lf.x,((i/MW)|0)-lf.y)>d;
 const rOpen=d=>{if(!list.length)return -1;for(let n=0;n<80;n++){const i=list[Math.floor(R()*list.length)];if(tiles[i]===T.AIR&&!decor[i]&&far(i,d)&&!inArena(i))return i}return -1};
 const setT=(x,y,t)=>{if(x<1||x>=MW-1||y<top||y>=y1-1)return;const q=tiles[I(x,y)];if(q===T.BEDROCK||q===T.BARRIER||q===T.LIFT)return;tiles[I(x,y)]=t};
 const blob=(n,t,a,b)=>{for(;n>0;n--){const s0=rOpen(9);if(s0<0)continue;const sz=RI(a,b),q=[s0],seen=new Set([s0]);let c=0;while(q.length&&c<sz){const i=q.splice(Math.floor(R()*q.length),1)[0];if(tiles[i]!==T.AIR)continue;tiles[i]=t;c++;const x=i%MW,y=(i/MW)|0;for(const d of D4){const ni=I(x+d[0],y+d[1]);if(y+d[1]>=top&&y+d[1]<y1&&!seen.has(ni)&&far(ni,6)){seen.add(ni);q.push(ni)}}}}};
 blob(L.lakes,L.ice?T.ICEFLOOR:T.WATER,L.ice?20:14,L.ice?60:45);
 if(L.lava)blob(L.lava,T.LAVA,6,22);
 if(k>=1||ACT)blob(RI(1,2),T.CHASM,5,14);
 for(const o of L.ores)for(let n=0;n<o[1];n++){let x=0,y=0,ok=false;for(let tr=0;tr<30&&!ok;tr++){x=RI(2,MW-3);y=RI(top+1,y1-2);const rel=(y-top)/(y1-top);if(!isRock(tiles[I(x,y)])||R()>.4+.6*rel)continue;if(n%2===0){let adj=false;for(const d of D4)if(!TI[tAt(x+d[0],y+d[1])].solid)adj=true;if(!adj)continue}ok=true}
  if(!ok)continue;for(let sz=RI(o[2],o[3]);sz>0;sz--){if(isRock(tiles[I(x,y)]))tiles[I(x,y)]=o[0];const d=D4[Math.floor(R()*4)];x=clamp(x+d[0],2,MW-3);y=clamp(y+d[1],top,y1-2)}}
 // abandoned mines (Old Mine only)
 if(ACT===0)for(let n=k===0?2:k<=2?1:0;n>0;n--){const len=RI(14,22),x0=RI(3,MW-4-len),yy=RI(top+6,y1-9);
  for(let x=x0;x<=x0+len;x++){setT(x,yy,T.AIR);setT(x,yy+1,T.AIR);decor[I(x,yy)]=0;if(tiles[I(x,yy+1)]===T.AIR){decor[I(x,yy+1)]=6;flg[I(x,yy+1)]|=2}if((x-x0)%5===0){setT(x,yy-1,T.WOOD);setT(x,yy+2,T.WOOD)}}
  const sx=x0+RI(3,len-3),dir=R()<.5?-1:1,sl=RI(4,8);for(let j=1;j<sl;j++)setT(sx,dir<0?yy-j:yy+1+j,T.AIR);
  const lxp=x0+RI(2,len-2);if(tiles[I(lxp,yy)]===T.AIR){decor[I(lxp,yy)]=7;slights.push({x:(lxp+.5)*TS,y:(yy+.3)*TS,r:4.2,c:[.9,.6,.3],fl:1})}
  setT(x0+len,yy,T.CHEST);
  if(R()<.6){const gx=x0+RI(4,len-4);if(gx!==lxp){setT(gx,yy,T.GRAVEL);setT(gx,yy+1,T.GRAVEL)}}
  if(R()<.6){const i=I(x0+RI(1,len-2),yy);if(tiles[i]===T.AIR&&!decor[i]){decor[i]=8;gItems.push({id:'oil',x:(i%MW+.5)*TS,y:(yy+.5)*TS})}}}
 // geodes
 if(ACT===1||k>=2)for(let n=k===2&&!ACT?1:2;n>0;n--){const gx=RI(6,MW-7),gy=RI(top+5,last?y1-32:y1-6),r=RI(2,3);for(let j=-r-2;j<=r+2;j++)for(let i=-r-2;i<=r+2;i++){const d=Math.hypot(i,j),q=tAt(gx+i,gy+j);if(d<=r)setT(gx+i,gy+j,T.AIR);else if(d<=r+1.3&&isRock(q))setT(gx+i,gy+j,ACT?T.FROSTITE:T.AMETHYST)}gItems.push({id:ACT?(R()<.5?'mythril':'diamond'):(k>=3&&R()<.5?'diamond':'geode'),x:(gx+.5)*TS,y:(gy+.5)*TS})}
 // sealed caches
 for(let n=RI(2,3);n>0;n--){for(let tr=0;tr<40;tr++){const x=RI(3,MW-6),y=RI(top+2,last?y1-32:y1-5);let ok=true;for(let j=-2;j<=3&&ok;j++)for(let i=-2;i<=4;i++)if(!isRock(tAt(x+i,y+j))){ok=false;break}if(!ok)continue;for(let j=0;j<2;j++)for(let i=0;i<3;i++)setT(x+i,y+j,T.AIR);setT(x+1,y,T.CHEST);break}}
 // fallen miners
 for(let n=RI(1,2);n>0;n--){const i=rOpen(10);if(i<0)continue;decor[i]=8;const x=(i%MW+.5)*TS,y=(((i/MW)|0)+.5)*TS;for(let m=RI(2,3);m>0;m--)gItems.push({id:pickOre(k),x:x+rnd(-6,6),y:y+rnd(-6,6)});if(R()<.5)gItems.push({id:'oil',x,y:y+4});if(R()<.3)gItems.push({id:'bolts',x:x+4,y})}
 // ancient shrine (Old Mine, bottom layer)
 if(ACT===0&&k===4){const sw=11,sh=9,sx=RI(6,MW-sw-6),sy=RI(top+8,top+16),mx=sx+(sw>>1),my=sy+(sh>>1);
  for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const e=i===0||j===0||i===sw-1||j===sh-1;setT(sx+i,sy+j,e?T.BRICK:T.AIR);if(!e)decor[I(sx+i,sy+j)]=0}
  for(const a of[[2,2],[sw-3,2],[2,sh-3],[sw-3,sh-3]])setT(sx+a[0],sy+a[1],T.BRICK);
  for(let d=0;d<14;d++){const q=tAt(mx,sy+sh-1+d);if(d>0&&!TI[q].solid)break;setT(mx,sy+sh-1+d,T.AIR)}
  for(let d=0;d<14;d++){const q=tAt(mx,sy-d);if(d>0&&!TI[q].solid)break;setT(mx,sy-d,T.AIR)}
  decor[I(mx,my)]=13;gItems.push({id:'relic',x:(mx+.5)*TS,y:(my+.5)*TS});
  for(const a of[1,sw-2]){decor[I(sx+a,sy+1)]=14;slights.push({x:(sx+a+.5)*TS,y:(sy+1.5)*TS,r:4.5,c:[1,.5,.2],fl:1})}
  for(let m=0;m<2;m++)gEnemies.push({type:'stalker',x:(mx+.5)*TS,y:(sy+2.5)*TS})}
 // boss arena (bottom of each act)
 if(last){for(let j=-AR-2;j<=AR+2;j++)for(let i=-AR-2;i<=AR+2;i++){const X=ax+i,Y=ay+j,d=Math.hypot(i,j);if(X<2||X>=MW-2||Y<top||Y>=y1-1)continue;const ii=I(X,Y);
   if(d<=AR){tiles[ii]=T.AIR;decor[ii]=R()<.05?4:0;flg[ii]=0}else if(d<=AR+1.6){const gate=Math.abs(Math.atan2(j,i)+Math.PI/2)<.3;tiles[ii]=gate?T.AIR:T.BRICK;if(gate)decor[ii]=0}}
  for(let n=0;n<6;n++){const a=n/6*6.283+.3;tiles[I(Math.round(ax+Math.cos(a)*6.5),Math.round(ay+Math.sin(a)*6.5))]=T.BRICK}
  for(let d=AR+1;d<AR+22;d++){const Y=ay-d;if(Y<top)break;let open=true;for(const X of[ax,ax+1]){const q=tiles[I(X,Y)];if(TI[q].solid)open=false;if(q!==T.BARRIER&&q!==T.BEDROCK&&q!==T.LIFT&&q!==T.CHASM)tiles[I(X,Y)]=T.AIR}if(open&&d>AR+3)break}
  for(let n=0;n<4;n++){const a=n/4*6.283+.78,X=Math.round(ax+Math.cos(a)*9.5),Y=Math.round(ay+Math.sin(a)*9.5);if(tiles[I(X,Y)]===T.AIR){decor[I(X,Y)]=14;slights.push({x:(X+.5)*TS,y:(Y+.5)*TS,r:4,c:ACT?[.45,.35,.8]:[1,.45,.2],fl:1})}}
  bossSpawn={x:(ax+.5)*TS,y:(ay+.5)*TS,type:ACTS[ACT].boss}}
 // unstable ceilings
 if(k>=1||ACT)for(let n=RI(2,4);n>0;n--){const i=rOpen(12);if(i<0)continue;const X=i%MW,Y=(i/MW)|0,r=RI(2,4);for(let j=-r;j<=r;j++)for(let q=-r;q<=r;q++){if(q*q+j*j>r*r||!inB(X+q,Y+j))continue;const ii=I(X+q,Y+j);if(tiles[ii]===T.AIR&&!inArena(ii)){flg[ii]|=1;if(R()<.5&&!decor[ii])decor[ii]=11}}}
 // gas vents
 if((ACT===0&&(k===2||k===3))||(ACT===1&&k>=1))for(let n=RI(3,5);n>0;n--){const i=rOpen(12);if(i<0)continue;decor[i]=10;vents.push({x:(i%MW+.5)*TS,y:(((i/MW)|0)+.5)*TS,t:R()*6,on:0})}
 // decor
 for(let y=top;y<y1;y++)for(let x=1;x<MW-1;x++){const i=I(x,y);if(tiles[i]!==T.AIR||decor[i]||inArena(i))continue;const hh=R();let nearW=false;for(const d of D4)if(TI[tAt(x+d[0],y+d[1])].solid)nearW=true;
  if(nearW&&L.moss&&fbm(x/4,y/4,WSEED+k)>.62-L.moss*.3&&R()<.6)decor[i]=2;
  else if(hh<.06)decor[i]=1;else if(hh<.08&&Math.hypot(x-lf.x,y-lf.y)>4)decor[i]=3;else if(hh<.086)decor[i]=4;
  else if((L.shroom||(ACT===0&&(k===2||k===3)))&&fbm(x/5,y/5,WSEED+9)>(L.shroom?.55:.66)&&R()<.4){decor[i]=5;if(R()<.3)slights.push({x:(x+.5)*TS,y:(y+.5)*TS,r:2.2,c:L.shroom?[.24,.16,.24]:[.14,.22,.2],fl:0})}}
 for(const type in L.en)for(let n=0;n<L.en[type];n++){const i=rOpen(14);if(i>=0)gEnemies.push({type,x:(i%MW+.5)*TS,y:(((i/MW)|0)+.5)*TS})}
}

// ---------- pixel painter ----------
const C3=[0,0,0],D3=[0,0,0];
const wallish=t=>TI[t].solid&&t!==T.CHASM&&t!==T.CHEST;
function qz(s,px,py){return Math.round((s+BAYER[(py&3)*4+(px&3)]*.1)*8)/8}
function dp(r,g,b){D3[0]=r;D3[1]=g;D3[2]=b;return D3}
function wallBase(t,k){switch(t){case T.DIRT:return[112,88,64];case T.STONE:return ACT===0&&k===0?[110,104,96]:[104,100,94];case T.GRAVEL:return[104,94,82];case T.BARRIER:return ACT?[40,44,54]:[52,52,58];case T.BEDROCK:return[24,22,23];case T.WOOD:return[106,76,46];case T.BRICK:return ACT?[70,64,84]:[92,74,62];default:return LAYERS[k].wall}}
function wallPx(t,k,wx,wy,px,py,nb){
 const L=LAYERS[k];let b=wallBase(t,k),s=.8+fbm(wx/7,wy/7,31)*.36+(ih(wx,wy,3)-.5)*.1;
 const natural=t!==T.WOOD&&t!==T.BRICK&&t!==T.BEDROCK&&t!==T.GRAVEL;
 if(natural&&L.alt){const m=clamp((fbm(wx/24,wy/24,61)-.35)*1.6,0,1);b=[lerp(b[0],L.alt[0],m),lerp(b[1],L.alt[1],m),lerp(b[2],L.alt[2],m)]}
 if(t===T.STONE||t===T.SLATE||t===T.BASALT||t===T.BARRIER||t===T.ANCIENT||t===T.VOIDR)s+=Math.sin((wy+fbm(wx/13,wy/13,5)*14)*.45)*.05;
 if(t===T.DIRT&&ih(wx>>1,wy>>1,8)>.92)s-=.16;
 if(natural){const vv=Math.abs(vn(wx/7,wy/7,91)-.5);if(vv<.02)s+=.13;else if(vv<.035)s-=.05;if(Math.abs(vn(wx/5,wy/11,92)-.5)<.014)s*=.62;if(ih(wx>>2,wy>>2,93)>.93){const ddx=(wx&3)-1.5,ddy=(wy&3)-1.5;if(ddx*ddx+ddy*ddy<2.3)s+=ddx+ddy<0?.12:-.1}}
 if(t===T.ICE){if((wx+wy*2)%11===0)s+=.14;if((wx*2+wy)%17===0)s+=.08}
 if(t===T.GRAVEL){const h=ih(wx>>2,wy>>2,4),ddx=(wx&3)-1.5,ddy=(wy&3)-1.5;s=.72+h*.38-(ddx*ddx+ddy*ddy)*.035+(ddx<0&&ddy<0?.08:0)}
 else if(t===T.WOOD){s=.86+(ih(wx>>3,wy>>1,6)-.5)*.12;if((wy&7)===0)s=.58;if((wx&15)===3&&(wy&7)===4)s=1.3}
 else if(t===T.BRICK){const row=wy>>2,off=(row&1)*4;s=((wy&3)===0||((wx+off)&7)===0)?.55:.78+ih((wx+off)>>3,row,9)*.3}
 else if(t===T.BARRIER&&fbm(wx/4,wy/4,77)>.64)b=ACT?[80,96,120]:[92,100,110];
 else if(t===T.BEDROCK)s=.7+ih(wx>>1,wy>>1,2)*.5;
 const rim=!nb.U&&py<2;
 if(!nb.D&&py>=11)s*=py===11?1.15:.6-(py-12)*.04;else if(rim)s*=1.18;
 if((!nb.L&&px===0)||(!nb.R&&px===15))s*=.72;
 s=qz(s,px,py);let r=b[0]*s,g=b[1]*s,bl=b[2]*s;
 if(t===T.MYCEL&&ih(wx>>1,wy>>1,95)>.94){r=168*s;g=146*s;bl=150*s}
 if(t===T.VOIDR&&ih(wx,wy,96)>.992){r=150;g=122;bl=190}
 if(rim&&natural&&L.moss&&fbm(wx/3,wy/3,97)>.56){r=64*s;g=80*s;bl=50*s}
 if(rim&&t===T.ICE){r=Math.min(255,r*1.15);g=Math.min(255,g*1.15);bl=Math.min(255,bl*1.12)}
 const it=TI[t].ore;
 if(it){const oc=ITEMS[it].c,cr=t===T.AMETHYST||t===T.DIAMOND||t===T.FROSTITE||t===T.VOIDSTONE,cs=cr?5:4,cxl=Math.floor(wx/cs),cyl=Math.floor(wy/cs),h=ih(cxl,cyl,50+t),rare=t===T.DIAMOND||t===T.STARMETAL||t===T.VOIDSTONE||t===T.MYTHRIL;
  if(h<(rare?.42:.62)&&px>0&&px<15&&py>0&&py<15){const ddx=wx-cxl*cs-(cs-1)/2+(ih(cxl,cyl,7)-.5)*1.4,ddy=wy-cyl*cs-(cs-1)/2+(ih(cxl,cyl,8)-.5)*1.4,dd=cr?Math.abs(ddx)+Math.abs(ddy)*.7:ddx*ddx+ddy*ddy;
   if(dd<(cr?1.9:2.3)){let m=1;if(ddx+ddy<-.8)m=1.4;else if(ddx+ddy>.9)m=.62;if(!nb.D&&py>=12)m*=.7;if(rare&&ddx+ddy<-1.2)m=1.8;r=Math.min(255,oc[0]*m);g=Math.min(255,oc[1]*m);bl=Math.min(255,oc[2]*m)}}}
 C3[0]=r;C3[1]=g;C3[2]=bl;return C3}
function decorPx(dc,k,wx,wy,px,py){const w=LAYERS[k].wall;
 switch(dc){
 case 1:{const h=ih(wx>>1,wy>>1,21);if(h>.86){const m=.9+((wx&1)?0:.15)-((wy&1)?.15:0);return dp(w[0]*m,w[1]*m,w[2]*m)}if(h>.8&&(wy&1))return dp(w[0]*.3,w[1]*.3,w[2]*.3);return null}
 case 2:{const n=fbm(wx/3,wy/3,22);if(n>.5){const m=.7+n*.5;return LAYERS[k].shroom?dp(92*m,70*m,90*m):dp(62*m,76*m,48*m)}return null}
 case 3:{const hw=(py-3)*.42;if(py>=3&&py<=13&&Math.abs(px-8)<=hw){const m=(px<8?1.1:px>9?.72:.92)*(.8+py*.02);return dp(w[0]*m,w[1]*m,w[2]*m)}if(py===14&&px>=5&&px<=12)return dp(12,10,9);return null}
 case 4:{if((py===9&&px>=4&&px<=11)||((px===4||px===11)&&(py===8||py===10)))return dp(168,158,138);return null}
 case 5:{const ms=[[5,9],[10,6],[11,11]],sh=LAYERS[k].shroom;for(const q of ms){if(px===q[0]&&py>q[1]&&py<=q[1]+2)return dp(120,118,104);const dx=px-q[0],dy=py-q[1];if(dx*dx+dy*dy*2<(sh?6:4))return sh?dp(150-dy*14,100-dy*8,130-dy*8):dp(96-dy*12,132-dy*8,120-dy*8)}return null}
 case 6:{if(py===5||py===10)return dp(90,86,82);if(px%5===0&&py>=4&&py<=11)return dp(66,48,30);return null}
 case 7:{if(px>=7&&px<=8&&py>=6&&py<=14)return dp(58,42,28);if(px>=6&&px<=9&&py>=2&&py<=5)return(py===2||px===6||px===9)?dp(50,44,38):dp(210,160,90);return null}
 case 8:{if(Math.hypot(px-5,py-5)<2.2)return(px===5&&py===5)?dp(40,34,30):dp(176,166,146);if((py===9||py===11)&&px>=4&&px<=9)return dp(160,150,130);if(px===6&&py>=7&&py<=12)return dp(150,140,120);if(px-py===-1&&px>=9&&px<=13)return dp(90,70,50);if(px>=11&&px<=13&&py===10)return dp(120,120,124);return null}
 case 9:{if(px>=2&&px<=13&&py>=6&&py<=13){if(px===2||px===13||py===13||py===6)return dp(100,70,38);return dp(28,20,14)}return null}
 case 10:{const d=Math.hypot(px-7.5,py-7.5);if(d<2.5)return dp(10,10,8);if(d<3.8)return dp(92,90,58);return null}
 case 11:{const n=Math.abs(vn(wx/2.5,wy/2.5,80)-.5);if(n<.04)return dp(18,15,13);return null}
 case 13:{if(px>=3&&px<=12&&py>=5&&py<=12){const m=(py===5?1.25:py===12?.6:1)*(.9+ih(wx,wy,5)*.15);return dp(110*m,96*m,82*m)}return null}
 case 14:{if(px>=4&&px<=11&&py>=7&&py<=11)return py===7?(ACT?dp(130,100,190):dp(190,90,36)):dp(84,66,48);return null}}
 return null}
function floorPx(k,wx,wy,px,py,nb,t,dc,fl){
 const L=LAYERS[k];let b=L.floor,s=.84+fbm(wx/9,wy/9,11)*.32+(ih(wx,wy,12)-.5)*.08;
 if(ih(wx>>1,wy>>1,13)>.965)s+=.2;else if(ih(wx>>1,wy>>1,14)>.97)s-=.2;
 if(Math.abs(vn(wx/6,wy/6,120)-.5)<.012)s*=.7;
 const pc=ih(Math.floor(wx/3),Math.floor(wy/3),121);if(pc>.9){const ox=wx%3,oy=wy%3;if(ox<2&&oy<2)s+=.15;else if(oy===2&&ox>0)s-=.12}
 s-=Math.max(0,fbm(wx/2.5,wy/2.5,122)-.7)*.5;
 if(nb){if(nb.U&&py<6)s*=.5+py*.08;if(nb.L&&px<3)s*=.72+px*.09;if(nb.R&&px>12)s*=.72+(15-px)*.09;if(nb.D&&py>13)s*=.85;if(!nb.U&&!nb.L&&nb.UL&&px<3&&py<4)s*=.78;if(!nb.U&&!nb.R&&nb.UR&&px>12&&py<4)s*=.78}else s*=.55;
 if(t===T.WATER){b=[26,38,46];s=.8+fbm(wx/6,wy/6,40)*.3;if(nb&&nb.U&&py<4)s*=.6}
 else if(t===T.ICEFLOOR){b=[104,124,136];s=.85+fbm(wx/10,wy/10,123)*.25;if(((wx-wy)%13+13)%13===0)s+=.2;if(Math.abs(vn(wx/5,wy/5,124)-.5)<.015)s*=.75;if(nb&&nb.U&&py<4)s*=.7}
 else if(t===T.LAVA){const n=fbm(wx/5,wy/5,41);if(n>.62){b=[46,30,26];s=.9}else{b=[168,62,22];s=.75+n*.5}}
 else if(t===T.LIFT){b=[78,72,62];const e=px<2||px>13||py<2||py>13;s=e?1.1:((px&3)===0||(py&3)===0)?.55:.9;if(nb&&nb.U&&py<6)s*=.8}
 s=qz(s,px,py);let r=b[0]*s,g=b[1]*s,bl=b[2]*s;
 if(t===T.AIR&&L.shroom&&ih(wx>>1,wy>>1,125)>.95){r=120*s;g=94*s;bl=110*s}
 if(t===T.CHEST){if(px>=2&&px<=13&&py>=4&&py<=13){let m=.85+(ih(wx>>2,wy,3)-.5)*.1,cc=[112,78,42];if(py<=5)m=1.1;if(py===8||px===2||px===13||py===13)cc=[62,58,54];if((py===8||py===9)&&(px===7||px===8))cc=[190,156,72];if(py===4||py===13)m*=.7;r=cc[0]*m;g=cc[1]*m;bl=cc[2]*m}else if(py===14&&px>=2&&px<=13){r*=.5;g*=.5;bl*=.5}}
 if(dc){const d=decorPx(dc,k,wx,wy,px,py);if(d){r=d[0];g=d[1];bl=d[2]}}
 if((fl&1)&&ih(wx,wy>>1,70)>.985){r*=.5;g*=.5;bl*=.5}
 C3[0]=r;C3[1]=g;C3[2]=bl;return C3}
function chasmPx(k,wx,wy,px,py,X,Y){const w=LAYERS[k].wall;let s;if(tAt(X,Y-1)!==T.CHASM&&py<10)s=(.6-py*.055)*(.8+fbm(wx/3,wy/2,33)*.4);else{s=.08+ih(wx>>1,wy>>1,34)*.05;if(tAt(X-1,Y)!==T.CHASM&&px<2)s+=.12;if(tAt(X+1,Y)!==T.CHASM&&px>13)s+=.08}s=qz(Math.max(0,s),px,py);C3[0]=w[0]*s;C3[1]=w[1]*s;C3[2]=w[2]*s;return C3}
function paintTile(d,stride,ox,oy,X,Y){
 const t=tiles[I(X,Y)],k=layerOf(Y),W=wallish(t);
 const nb={U:wallish(tAt(X,Y-1)),D:wallish(tAt(X,Y+1)),L:wallish(tAt(X-1,Y)),R:wallish(tAt(X+1,Y)),UL:wallish(tAt(X-1,Y-1)),UR:wallish(tAt(X+1,Y-1))};
 const dc=decor[I(X,Y)],fl=flg[I(X,Y)];
 for(let py=0;py<TS;py++)for(let px=0;px<TS;px++){const wx=X*TS+px,wy=Y*TS+py;let c;
  if(W){const cut=(!nb.U&&!nb.L&&px+py<3)||(!nb.U&&!nb.R&&15-px+py<3)||(!nb.D&&!nb.L&&px+15-py<3)||(!nb.D&&!nb.R&&30-px-py<3);c=cut?floorPx(k,wx,wy,px,py,null,T.AIR,0,0):wallPx(t,k,wx,wy,px,py,nb)}
  else if(t===T.CHASM)c=chasmPx(k,wx,wy,px,py,X,Y);
  else c=floorPx(k,wx,wy,px,py,nb,t,dc,fl);
  const i=((oy+py)*stride+ox+px)<<2;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255}}
function getChunk(cx0,cy0){const key=cy0*16+cx0;let c=chunks[key];if(c)return c;c=document.createElement('canvas');c.width=c.height=CH*TS;const g=c.getContext('2d'),img=g.createImageData(CH*TS,CH*TS);
 for(let ty=0;ty<CH;ty++)for(let tx=0;tx<CH;tx++){const X=cx0*CH+tx,Y=cy0*CH+ty;if(inB(X,Y))paintTile(img.data,CH*TS,tx*TS,ty*TS,X,Y)}g.putImageData(img,0,0);chunks[key]=c;return c}
let tileImg=null;
function redraw(x,y){if(!tileImg)tileImg=new ImageData(TS,TS);for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const X=x+i,Y=y+j;if(!inB(X,Y))continue;const c=chunks[((Y/CH)|0)*16+((X/CH)|0)];if(!c)continue;paintTile(tileImg.data,TS,0,0,X,Y);c.getContext('2d').putImageData(tileImg,(X%CH)*TS,(Y%CH)*TS)}}
function tileCol(t,k){const it=TI[t].ore;if(it&&Math.random()<.5)return ITEMS[it].c;return wallBase(t,k)}
function miniTile(x,y){if(!mmx||!inB(x,y)||!expl[I(x,y)])return;const t=tiles[I(x,y)];let c;if(t===T.AIR)c='#2a241f';else if(t===T.WATER)c='#2c4452';else if(t===T.ICEFLOOR)c='#6a8290';else if(t===T.LAVA)c='#a4461c';else if(t===T.LIFT)c='#e0b860';else if(t===T.CHASM)c='#050404';else if(t===T.CHEST)c='#c8a050';else if(TI[t].ore)c=css(ITEMS[TI[t].ore].c);else if(t===T.BARRIER)c='#4a4a58';else if(t===T.BRICK)c='#8a6a50';else c='#6e6256';mmx.fillStyle=c;mmx.fillRect(x,y,1,1)}

// ---------- crack overlays ----------
const CRACK=[];
(function(){const r=mulberry(99),paths=[];for(let n=0;n<8;n++){let x=8+(r()-.5)*5,y=8+(r()-.5)*5,a=r()*6.28;const pts=[];for(let i=0;i<8;i++){pts.push([x|0,y|0]);a+=(r()-.5)*1.2;x+=Math.cos(a);y+=Math.sin(a);if(x<1||y<1||x>14||y>14)break}paths.push(pts)}
 for(let s=0;s<4;s++){const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');for(let n=0;n<2*(s+1);n++)for(const p of paths[n]){g.fillStyle='rgba(8,6,5,.8)';g.fillRect(p[0],p[1],1,1);g.fillStyle='rgba(255,240,220,.14)';g.fillRect(p[0]+1,p[1]+1,1,1)}CRACK.push(c)}})();

// ---------- item icons (8x8 world sprites) ----------
const ICON={},ICONURL={};
(function(){for(const id in ITEMS){const c=document.createElement('canvas');c.width=c.height=8;const g=c.getContext('2d'),col=ITEMS[id].c,rr=mulberry(id.length*31+id.charCodeAt(0));
 const Q=(x,y,m)=>{g.fillStyle=css([clamp(col[0]*m,0,255),clamp(col[1]*m,0,255),clamp(col[2]*m,0,255)]);g.fillRect(x,y,1,1)};
 if(id==='oil'){g.fillStyle='#5a4a3a';g.fillRect(3,0,2,2);for(let y=2;y<8;y++)for(let x=1;x<7;x++)Q(x,y,x<3?1.3:x>5?.7:1);g.fillStyle='#3a2a1a';g.fillRect(1,7,6,1)}
 else if(id==='dyn'){for(let y=2;y<8;y++)for(let x=2;x<6;x++)Q(x,y,x===2?1.3:x===5?.7:1);g.fillStyle='#cfc2a0';g.fillRect(4,0,1,2);g.fillStyle='#2a1a10';g.fillRect(2,4,4,1)}
 else if(id==='flare'){for(let i=0;i<6;i++){Q(1+i,6-i,1);Q(2+i,6-i,.7)}g.fillStyle='#ffd890';g.fillRect(6,0,2,2)}
 else if(id==='bolts'){for(const o of[0,3]){for(let i=0;i<6;i++)Q(1+o+i*.5|0,7-i,1.1)}g.fillStyle='#ddd';g.fillRect(3,1,1,1);g.fillRect(6,1,1,1)}
 else if(id==='tonic'){g.fillStyle='#8a7a6a';g.fillRect(3,0,2,2);for(let y=2;y<8;y++)for(let x=1;x<7;x++){const dx=x-3.5,dy=y-4.8;if(dx*dx+dy*dy<8)Q(x,y,dx+dy<-1?1.4:1)}}
 else if(id==='relic'||id==='crown'){for(let y=0;y<8;y++)for(let x=0;x<8;x++){const dx=Math.abs(x-3.5);if(id==='crown'?(y>=3&&y<7&&dx<3.6)||(y<3&&(x===0||x===3||x===4||x===7)):(y<3&&dx<1.6)||(y>=3&&y<6&&dx<2.6)||(y>=6&&dx<3.6))Q(x,y,x<4?1.35:.8)}}
 else if(id==='heart'){for(let y=0;y<8;y++)for(let x=0;x<8;x++){const dx=(x-3.5)/3.4,dy=(y-3.8)/3.2;if(dx*dx+dy*dy<1)Q(x,y,Math.sin(x*1.7+y)>.3?1.3:.8)}}
 else{const cr=id==='amethyst'||id==='diamond'||id==='frostite'||id==='voidstone';for(let y=0;y<8;y++)for(let x=0;x<8;x++){const dx=(x-3.5)/3.4,dy=(y-3.8)/3.2,d=cr?Math.abs(dx)*1.2+Math.abs(dy):dx*dx+dy*dy+(rr()-.5)*.3;if(d<1)Q(x,y,dx+dy<-.5?1.45:dx+dy>.6?.65:1)}}
 ICON[id]=c;ICONURL[id]=c.toDataURL()}})();
