'use strict';
// DEEP BELOW v2 - lighting and rendering
const LW=Math.ceil(VW/TS)+3,LHh=Math.ceil(VH/TS)+3;
const lr=new Float32Array(LW*LHh),lg=new Float32Array(LW*LHh),lb=new Float32Array(LW*LHh);
const lcv=document.createElement('canvas');lcv.width=LW;lcv.height=LHh;const lctx=lcv.getContext('2d'),limg=lctx.createImageData(LW,LHh);
let LX0=0,LY0=0;
function addLight(x,y,rad,r,g,b){if(rad<=0)return;const cx0=Math.floor(x/TS),cy0=Math.floor(y/TS),R=Math.ceil(rad);for(let ty=cy0-R;ty<=cy0+R;ty++){const j=ty-LY0;if(j<0||j>=LHh)continue;for(let tx=cx0-R;tx<=cx0+R;tx++){const i=tx-LX0;if(i<0||i>=LW)continue;const d=Math.hypot((tx+.5)*TS-x,(ty+.5)*TS-y)/TS;if(d>=rad)continue;if(!los(cx0,cy0,tx,ty))continue;let f=1-(d/rad)*(d/rad);f=f*Math.sqrt(f);const q=j*LW+i;lr[q]+=r*f;lg[q]+=g*f;lb[q]+=b*f}}}
function lightAt(x,y){const i=Math.floor(x/TS)-LX0,j=Math.floor(y/TS)-LY0;if(i<0||j<0||i>=LW||j>=LHh)return 0;const q=j*LW+i;return(lr[q]+lg[q]+lb[q])/3}
function computeLight(camx,camy){LX0=Math.floor(camx/TS)-1;LY0=Math.floor(camy/TS)-1;const run=state==='run'&&P,k=run?curLayer:layerOf(Math.floor(cam.y/TS)),a=LAYERS[k].amb;
 for(let j=0;j<LHh;j++)for(let i=0;i<LW;i++){const X=LX0+i,Y=LY0+j,q=j*LW+i,e=inB(X,Y)&&expl[I(X,Y)]?2.2:1;lr[q]=a[0]*e+S.set.contrast*.10;lg[q]=a[1]*e+S.set.contrast*.10;lb[q]=a[2]*e+S.set.contrast*.10}
 if(run){const fl=1+Math.sin(TT*13)*.015+(Math.random()-.5)*.035;let rad,I0;if(P.oil>0){rad=lampR()*fl;I0=1.05;if(P.oil<P.moil*.15){if(Math.random()<.06)I0*=.55;rad*=.85+.15*(P.oil/(P.moil*.15))}}else{rad=2+Math.sin(TT*3)*.2;I0=.45}
  if(RUN.dark>0){rad*=.45;I0*=.7}if(P.dead)I0*=Math.max(0,1-RUN.deathT/1.5);const cw=ACT?[.92,.86,.8]:[1,.8,.55];addLight(P.x,P.y-4,rad,I0*cw[0],I0*cw[1],I0*cw[2]);addLight(P.x,P.y,1.6,.22,.18,.13)}
 else addLight(cam.x,cam.y,6.5,.9,.72,.5);
 for(const s of slights)if(Math.abs(s.x-camx-VW/2)<VW&&Math.abs(s.y-camy-VH/2)<VH){const f=s.fl?1+(Math.random()-.5)*.12+Math.sin(TT*7+s.x)*.05:1;addLight(s.x,s.y,s.r*f,s.c[0]*f,s.c[1]*f,s.c[2]*f)}
 for(let j=0;j<LHh;j++)for(let i=0;i<LW;i++){const X=LX0+i,Y=LY0+j,t=tAt(X,Y),px=(X+.5)*TS,py=(Y+.5)*TS;
  if(t===T.AMETHYST)addLight(px,py,2.6,.3,.2,.4);else if(t===T.DIAMOND)addLight(px,py,1.8,.22,.28,.32);else if(t===T.STARMETAL)addLight(px,py,2.2,.22,.28,.4);else if(t===T.FROSTITE)addLight(px,py,2.2,.18,.3,.36);else if(t===T.VOIDSTONE)addLight(px,py,2.4,.3,.16,.42);else if(t===T.MYTHRIL)addLight(px,py,1.8,.16,.3,.26);
  else if(t===T.LAVA&&((X+Y)&1))addLight(px,py,3.2,.55+Math.sin(TT*2+X)*.05,.22,.06);else if(t===T.LIFT&&run&&RUN.act.has(layerOf(Y))&&!((X+Y)&1))addLight(px,py,3.5,.45,.36,.2)}
 if(run&&boss&&!boss.dead&&boss.st!=='sleep'&&Math.hypot(boss.x-P.x,boss.y-P.y)<TS*22)addLight(boss.x,boss.y,6,ACT===2?.65:.42,ACT===2?.5:.32,ACT===1?.65:.25);
 for(const d of dlights){const f=d.life/d.max;addLight(d.x,d.y,d.r*f,d.c[0]*f*1.5,d.c[1]*f*1.5,d.c[2]*f*1.5)}
 for(const d of dyns)addLight(d.x,d.y,2.5,.6,.35,.15);
 for(const f of flares){const fl=1+(Math.random()-.5)*.15;addLight(f.x,f.y,5.5*fl*Math.min(1,f.life/3),.95*fl,.5,.3)}
 let pc=0;for(const p of projs){if(pc++>24)break;if(p.kind!=='stone'&&p.kind!=='bolt'&&p.kind!=='boulder'){const c=PCOL[p.kind];addLight(p.x,p.y,1.6,c[0]/400,c[1]/400,c[2]/400)}}
 const D=limg.data;for(let q=0;q<LW*LHh;q++){const o=q*4;D[o]=Math.min(255,lr[q]*255);D[o+1]=Math.min(255,lg[q]*255);D[o+2]=Math.min(255,lb[q]*255);D[o+3]=255}lctx.putImageData(limg,0,0);
 for(let j=0;j<LHh;j++)for(let i=0;i<LW;i++){const q=j*LW+i;if(lr[q]+lg[q]>.3){const X=LX0+i,Y=LY0+j;if(inB(X,Y)&&!expl[I(X,Y)]){expl[I(X,Y)]=1;miniTile(X,Y)}}}}

const VIG=document.createElement('canvas');VIG.width=VW;VIG.height=VH;(function(){const g=VIG.getContext('2d'),gr=g.createRadialGradient(VW/2,VH/2,VH*.3,VW/2,VH/2,VW*.62);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.7)');g.fillStyle=gr;g.fillRect(0,0,VW,VH)})();
function px(x,y,w,h,c){cx.fillStyle=c;cx.fillRect(x,y,w,h)}
function plot(x,y,c){cx.fillStyle=c;cx.fillRect(Math.round(x),Math.round(y),1,1)}
function drawPlayer(camx,camy){const x=Math.round(P.x-camx),y=Math.round(P.y-camy),f=P.face,bob=(Math.floor(P.walk/8)%2)&&Math.hypot(P.vx,P.vy)>10?1:0,fl=(P.inv>0&&Math.floor(TT*20)%2)||P.dead;
 const W=fl?'#e8e0d0':null;if(P.dead)cx.globalAlpha=Math.max(0,1-RUN.deathT/2);
 const ar=S.gear.armor>=0?MATC[ARMOR_M[S.gear.armor]]:null;
 const moving=P.renderMoving??(Math.hypot(P.vx,P.vy)>10),active=P.sw>0,held=active?P.swk:SLOTS[P.slot];
 const dir=active?minerDirection(Math.cos(P.aim)*10,Math.sin(P.aim)*10):minerDirection(P.vx,P.vy,P.renderDir||'down');P.renderDir=dir;
 const action=P.dead?'death':P.inv>.32?'hurt':P.rope>=0?'climb':active?(held==='sword'?'melee':held==='bow'?'shoot':'mine'):moving?'walk':'idle';
 const frame=P.dead?Math.min(3,Math.floor(RUN.deathT*5)):action==='hurt'?Math.min(3,Math.floor((.55-P.inv)*16)):active?(held==='bow'?Math.min(3,Math.floor((1-P.sw/.5)*4)):Math.min(5,Math.floor((1-P.sw)*6))):action==='climb'?Math.floor(P.rope*8)%4:moving?Math.floor(P.walk/7)%8:S.set.reduced?0:Math.floor(RUN.t*1.2)%4;
 drawMiner(x,y,{color:ar?css(ar.map(v=>v*.6)):'#7e6845',action,frame,dir,lamp:P.oil>0,flash:W,pack:P.pack.length/P.cap});
 if(P.dead){cx.globalAlpha=1;return}
 const hx=x+f*3,hy=y-7-(moving?MINER_WALK[frame%8].bob:0),toolFrame=active?MINER_STRIKE[clamp(frame,0,5)]:null;
 if(held==='sword'&&S.gear.sword>=0){const c=css(MATC[SWORD_M[S.gear.sword]]),off=P.sw>0?(toolFrame.tool):-.7,a=P.aim+off*f,ca=Math.cos(a),sa=Math.sin(a);for(let i=1;i<14;i++)plot(hx+ca*i,hy+sa*i,W||(i<4?'#5a4030':c));for(let j=-2;j<=2;j++)plot(hx+ca*4-sa*j,hy+sa*4+ca*j,W||'#8a7050')}
 else if(held==='bow'&&S.gear.bow>=0){const c=css(MATC[BOW_M[S.gear.bow]]),a=P.aim,ca=Math.cos(a),sa=Math.sin(a);for(let j=-5;j<=5;j++){const bk=Math.abs(j)*Math.abs(j)*.1;plot(hx+ca*(6-bk)-sa*j,hy+sa*(6-bk)+ca*j,W||c)}for(let j=-4;j<=4;j++)plot(hx+ca*3.5-sa*j,hy+sa*3.5+ca*j,'rgba(220,210,190,.6)');for(let i=0;i<7;i++)plot(hx+ca*i,hy+sa*i,W||'#6a5038')}
 else{const off=P.sw>0?(toolFrame.tool):-1.1,a=P.aim+off*f,ca=Math.cos(a),sa=Math.sin(a),hc=css(MATC[PICK_M[S.gear.pick]]);for(let i=0;i<10;i++)plot(hx+ca*i,hy+sa*i,W||'#7a5a38');const ex=hx+ca*9,ey=hy+sa*9;for(let j=-3;j<=3;j++)plot(ex-sa*j,ey+ca*j,W||(Math.abs(j)===3?'#5a5a60':hc))}
 cx.globalAlpha=1}
function render(){
 cx.imageSmoothingEnabled=false;cx.globalCompositeOperation='source-over';cx.globalAlpha=1;cx.fillStyle='#000';cx.fillRect(0,0,VW,VH);if(!tiles)return;
 const run=state==='run'&&P,sa=shakeT*shakeT*7*S.set.shake*(S.set.reduced?0:1),camx=Math.round(cam.x-VW/2+(Math.random()-.5)*2*sa),camy=Math.round(cam.y-VH/2+(Math.random()-.5)*2*sa);camX0=camx;camY0=camy;
 const cs=CH*TS;for(let cy=Math.floor(camy/cs);cy<=Math.floor((camy+VH)/cs);cy++)for(let cxx=Math.floor(camx/cs);cxx<=Math.floor((camx+VW)/cs);cxx++){if(cxx<0||cy<0||cxx*CH>=MW||cy*CH>=MH)continue;cx.drawImage(getChunk(cxx,cy),cxx*cs-camx,cy*cs-camy)}
 const tx0=Math.floor(camx/TS),ty0=Math.floor(camy/TS),tx1=tx0+Math.ceil(VW/TS),ty1=ty0+Math.ceil(VH/TS);
 for(let Y=ty0;Y<=ty1;Y++)for(let X=tx0;X<=tx1;X++){if(!inB(X,Y))continue;const i=I(X,Y),t=tiles[i],sx=X*TS-camx,sy=Y*TS-camy;
  if(t===T.WATER||t===T.SAP||t===T.ICEFLOOR){const h=ih(X,Y,5),o=(TT*(t===T.WATER?6:1.5)+h*16)%16;cx.fillStyle=t===T.WATER?'rgba(160,180,190,.12)':'rgba(230,240,245,.1)';cx.fillRect(sx+Math.floor(o),sy+2+Math.floor(h*11),3,1);cx.fillRect(sx+Math.floor((o+8)%14),sy+1+Math.floor(h*97)%14,2,1)}
  else if(t===T.LAVA){cx.fillStyle='rgba(255,140,50,'+(.08+.06*Math.sin(TT*2+X*.7+Y)).toFixed(3)+')';cx.fillRect(sx,sy,TS,TS);if(Math.random()<.004)part({x:(X+.5)*TS+rnd(-5,5),y:(Y+.5)*TS,vy:-12,life:.8,col:[255,150,60],type:'spark'})}
  if(dmg[i]>0&&TI[t].solid){const w=wob.get(i)||0,ox=w>0?ri(-1,1):0,oy=w>0?ri(-1,1):0;if(w>0){const ch=chunks[((Y/CH)|0)*16+((X/CH)|0)];if(ch)cx.drawImage(ch,(X%CH)*TS,(Y%CH)*TS,TS,TS,sx+ox,sy+oy,TS,TS)}cx.drawImage(CRACK[Math.min(3,Math.floor(dmg[i]/tileHP(X,Y)*4))],sx+ox,sy+oy)}}
 for(const r of rocks){const p=r.t/r.T,x=r.x-camx,y=r.y-camy,s=2+p*5;cx.fillStyle='rgba(0,0,0,'+(.2+p*.4).toFixed(2)+')';cx.fillRect(Math.round(x-s),Math.round(y-s/3),Math.round(s*2),Math.max(1,Math.round(s*.66)));if(p>.55){const h=(1-(p-.55)/.45)*70;px(Math.round(x-2),Math.round(y-3-h),5,4,'#6a625a');px(Math.round(x-2),Math.round(y-3-h),3,1,'#8a8278')}}
 for(const o of items){const x=Math.round(o.x-camx-ICON[o.id].width/2),y=Math.round(o.y-camy-ICON[o.id].height/2-o.z-(o.vx||o.vy||o.z?0:Math.sin(TT*3+o.x)));if(x<-10||y<-10||x>VW||y>VH)continue;px(x+1,Math.round(o.y-camy+3),6,2,'rgba(0,0,0,.3)');cx.drawImage(ICON[o.id],x,y)}
 if(run)for(const e of enemies)drawEnemy(e,camx,camy);
 for(const d of dyns){const x=Math.round(d.x-camx),y=Math.round(d.y-camy-d.z);px(x-2,Math.round(d.y-camy)+1,4,2,'rgba(0,0,0,.3)');px(x-2,y-1,4,2,'#a8402c');px(x-2,y-1,4,1,'#c85a40')}
 for(const f of flares){const x=Math.round(f.x-camx),y=Math.round(f.y-camy-f.z);px(x-2,y,4,1,'#8a3a24');px(x+1,y-1,1,1,'#ffd890')}
 if(run){drawPlayer(camx,camy);drawPOIs(camx,camy);if(S.exp.ench.pick||S.exp.ench.sword){px(Math.round(P.x-camx)-2,Math.round(P.y-camy)-8,1,3,ench('sword','frostbrand')?'#9ae6fa':ench('pick','prospector')?'#f8d56e':'#a6e0ce')}}
 drawParts(camx,camy,false);
 computeLight(camx,camy);
 if(run)drawCaveAir(camx,camy);
 cx.imageSmoothingEnabled=true;cx.globalCompositeOperation='multiply';cx.drawImage(lcv,LX0*TS-camx,LY0*TS-camy,LW*TS,LHh*TS);cx.globalCompositeOperation='source-over';cx.imageSmoothingEnabled=false;
 drawParts(camx,camy,true);
 for(let Y=ty0;Y<=ty1;Y++)for(let X=tx0;X<=tx1;X++){if(!inB(X,Y))continue;const i=I(X,Y),t=tiles[i],dc=decor[i],sx=X*TS-camx,sy=Y*TS-camy;
  if(dc===7&&t===T.AIR)px(sx+7,sy+3,2,2,Math.random()<.5?'#ffd890':'#f0a850');else if(dc===14&&t===T.AIR){const c1=ACT?'#b8a0f0':'#f0a050',c2=ACT?'#8a70d0':'#e07030';px(sx+5+ri(0,1),sy+5,2,2,c1);px(sx+8+ri(0,1),sy+4,2,3,Math.random()<.5?c1:c2)}
  if((t===T.DIAMOND||t===T.STARMETAL||t===T.VOIDSTONE||t===T.MYTHRIL)&&lightAt((X+.5)*TS,(Y+.5)*TS)>.08&&ih(X,Y,Math.floor(TT*3))>.75){const ox=2+Math.floor(ih(X,Y,9)*11),oy=2+Math.floor(ih(Y,X,9)*11);cx.fillStyle='rgba(255,255,255,.85)';cx.fillRect(sx+ox,sy+oy,1,1);cx.fillStyle='rgba(255,255,255,.4)';cx.fillRect(sx+ox-1,sy+oy,3,1);cx.fillRect(sx+ox,sy+oy-1,1,3)}}
 if(run){
  for(const z of zones){const p=z.t/z.T,x=z.x-camx,y=z.y-camy;cx.globalAlpha=.25+p*.45;cx.strokeStyle=ACT?'#b090f0':'#e06a40';cx.lineWidth=1;cx.beginPath();cx.arc(x,y,z.r,0,6.283);cx.stroke();cx.globalAlpha=.12+p*.25;cx.fillStyle=ACT?'#6040a0':'#a03a20';cx.beginPath();cx.arc(x,y,z.r*p,0,6.283);cx.fill();cx.globalAlpha=1}
  for(const e of enemies){if(e.type==='burrower'&&e.st==='rise'||(e.boss&&e.st==='rise')){const x=e.x-camx,y=e.y-camy;cx.globalAlpha=.5+.3*Math.sin(TT*20);cx.strokeStyle='#c06a40';cx.beginPath();cx.arc(x,y,e.boss?14:9,0,6.283);cx.stroke();cx.globalAlpha=1;if(Math.random()<.5)part({x:e.x+rnd(-8,8),y:e.y+rnd(-8,8),vx:rnd(-20,20),vy:rnd(-20,20),z:1,vz:rnd(20,50),life:.4,col:[104,94,82]})}
   if(e.type==='crawler'&&e.st==='wind'){cx.globalAlpha=.6;px(Math.round(e.x-camx)-1,Math.round(e.y-camy)-9,2,2,'#e06a40');cx.globalAlpha=1}
   enemyEyes(e,camx,camy)}
  for(const p of projs){const x=Math.round(p.x-camx),y=Math.round(p.y-camy),c=PCOL[p.kind];if(x<-5||y<-5||x>VW+5||y>VH+5)continue;const s=p.kind==='boulder'?4:p.kind==='orb'||p.kind==='glob'?3:2;cx.fillStyle=css(c);cx.fillRect(x-(s>>1),y-(s>>1),s,s);if(p.kind==='bolt'||p.kind==='stone'){const l=Math.hypot(p.vx,p.vy)||1;cx.fillStyle='rgba(200,190,170,.5)';cx.fillRect(Math.round(x-p.vx/l*3),Math.round(y-p.vy/l*3),1,1)}else{cx.globalAlpha=.35;cx.fillRect(x-s,y-s,s*2,s*2);cx.globalAlpha=1}}
  for(const f of flares){px(Math.round(f.x-camx),Math.round(f.y-camy-f.z)-1,1,1,Math.random()<.5?'#fff0c0':'#ffb060')}
  for(const o of items)if((ITEMS[o.id].r||0)>=2&&Math.floor(TT*2+o.x)%3===0){cx.fillStyle='rgba(255,250,230,.7)';cx.fillRect(Math.round(o.x-camx),Math.round(o.y-camy-o.z-6),1,1)}
  if(RUN.scanT>0){const a=Math.min(1,RUN.scanT/1.5);for(const s of RUN.scan){const t=tAt(s.x,s.y);if(!(TI[t].ore||t===T.CHEST))continue;const c=t===T.CHEST?[230,180,80]:ITEMS[TI[t].ore].c;cx.globalAlpha=a*(.55+.25*Math.sin(TT*6));cx.strokeStyle=css(c.map(v=>Math.min(255,v*1.3)));cx.strokeRect(s.x*TS-camx+.5,s.y*TS-camy+.5,15,15)}cx.globalAlpha=1;
   if(RUN.scanT>4){cx.strokeStyle='rgba(200,220,210,'+((RUN.scanT-4)*.6).toFixed(2)+')';cx.beginPath();cx.arc(RUN.scanX-camx,RUN.scanY-camy,(5-RUN.scanT)*RUN.scanR*TS,0,6.283);cx.stroke()}}
  if(target&&!P.dead){const sx=target.x*TS-camx,sy=target.y*TS-camy,bad=tAt(target.x,target.y)===T.BARRIER&&S.gear.pick<sealReq(layerOf(target.y));cx.fillStyle=bad?'rgba(220,110,90,.6)':'rgba(240,220,180,.5)';for(const q of[[0,0,3,1],[0,0,1,3],[13,0,3,1],[15,0,1,3],[0,15,3,1],[0,13,1,3],[13,15,3,1],[15,13,1,3]])cx.fillRect(sx+q[0],sy+q[1],q[2],q[3])}
  if(P.rope>=0){cx.strokeStyle='rgba(230,210,160,.9)';cx.lineWidth=1;cx.beginPath();cx.arc(Math.round(P.x-camx),Math.round(P.y-camy-5),12,-1.57,-1.57+6.283*P.rope/3);cx.stroke()}}
 cx.drawImage(VIG,0,0);
 if(run){if(RUN.dark>0){cx.globalAlpha=Math.min(1,RUN.dark)*.35;cx.drawImage(VIG,0,0);cx.globalAlpha=1}if(flashT>0){cx.fillStyle='rgba(140,20,10,'+(flashT*.8).toFixed(3)+')';cx.fillRect(0,0,VW,VH)}if(P.hp/P.mhp<.25&&!P.dead){cx.globalAlpha=.35+.25*Math.sin(TT*6);cx.drawImage(VIG,0,0);cx.fillStyle='rgba(90,0,0,.12)';cx.fillRect(0,0,VW,VH);cx.globalAlpha=1}if(P.dead){cx.fillStyle='rgba(0,0,0,'+Math.min(1,RUN.deathT/2.2).toFixed(3)+')';cx.fillRect(0,0,VW,VH)}}
 drawFX(camx,camy)}
function drawParts(camx,camy,post){for(const p of parts){const gl=p.type==='spark';if(gl!==post)continue;const a=p.type==='chip'?Math.min(1,p.life/p.max*3):p.life/p.max,x=p.x-camx,y=p.y-p.z-camy;if(x<-8||y<-8||x>VW+8||y>VH+8)continue;
  if(p.type==='dust'||p.type==='gas'){cx.globalAlpha=a*(p.type==='gas'?.28:.3);const s=p.sz*(1.6-a*.6);cx.fillStyle=p.cs;cx.fillRect(Math.round(x-s/2),Math.round(y-s/2),Math.ceil(s),Math.ceil(s))}
  else if(p.type==='mote'){cx.globalAlpha=Math.min(1,a*2)*.5;cx.fillStyle=p.cs;cx.fillRect(Math.round(x),Math.round(y),1,1)}
  else{cx.globalAlpha=gl?a:Math.min(1,a+.2);cx.fillStyle=p.cs;cx.fillRect(Math.round(x),Math.round(y),p.sz,p.sz)}}cx.globalAlpha=1}
function drawFX(camx,camy){fx.setTransform(1,0,0,1,0,0);fx.clearRect(0,0,fxc.width,fxc.height);const s=fxc.width/VW;fx.textAlign='center';fx.textBaseline='middle';
 for(const t of texts){const a=clamp(t.life/t.max*2,0,1),sz=(t.big?11:5.5)*s*(t.big?1+Math.max(0,.3-(t.max-t.life))*2:1);fx.font='bold '+(sz|0)+'px Courier New, monospace';fx.globalAlpha=a;fx.lineWidth=Math.max(2,s*1.2);fx.strokeStyle='#000';const X=(t.x-camx)*s,Y=(t.y-camy)*s;fx.strokeText(t.s,X,Y);fx.fillStyle=t.c;fx.fillText(t.s,X,Y)}
 fx.globalAlpha=1;
 if(state==='run'&&P&&!P.dead){let best=null,bd=1e9;for(const i of RUN.act){const l=lifts[i];if(!l)continue;const lx=(l.x+1)*TS,ly=(l.y+1)*TS,d=Math.hypot(lx-P.x,ly-P.y);if(d<bd){bd=d;best=[lx,ly]}}
  if(best){const sx=best[0]-camx,sy=best[1]-camy;if(sx<10||sy<10||sx>VW-10||sy>VH-10){const a=Math.atan2(sy-VH/2,sx-VW/2),mx=VW/2-22,my=VH/2-22,k=Math.min(mx/Math.abs(Math.cos(a)||1e-6),my/Math.abs(Math.sin(a)||1e-6)),ax=(VW/2+Math.cos(a)*k)*s,ay=(VH/2+Math.sin(a)*k)*s;
   fx.save();fx.translate(ax,ay);fx.rotate(a);fx.globalAlpha=.6+.3*Math.sin(TT*4);fx.fillStyle='#e0b860';fx.beginPath();fx.moveTo(8*s,0);fx.lineTo(-4*s,-5*s);fx.lineTo(-4*s,5*s);fx.closePath();fx.fill();fx.restore();fx.globalAlpha=.85;fx.font='bold '+((5*s)|0)+'px Courier New, monospace';fx.fillStyle='#e0c890';fx.strokeStyle='#000';const lab='LIFT '+Math.round(bd/TS*1.5)+'m';fx.strokeText(lab,ax-Math.cos(a)*14*s,ay-Math.sin(a)*10*s);fx.fillText(lab,ax-Math.cos(a)*14*s,ay-Math.sin(a)*10*s);fx.globalAlpha=1}}}}

// Sparse world-anchored motes inherit cave lighting instead of glowing through walls.
function drawCaveAir(camx,camy){
 if(S.set.reduced||!S.set.parts)return;
 const size=72,x0=Math.floor(camx/size),y0=Math.floor(camy/size);
 for(let yy=y0;yy<=y0+Math.ceil(VH/size);yy++)for(let xx=x0;xx<=x0+Math.ceil(VW/size);xx++){
  if(ih(xx,yy,71)>S.set.parts*.55)continue;
  const seed=ih(xx,yy,72),x=xx*size+seed*size+Math.sin(TT*.25+seed*20)*5,y=yy*size+(seed*size+TT*(ACT===1?2:1))%size;
  if(tAt(Math.floor(x/TS),Math.floor(y/TS))!==T.AIR)continue;
  cx.fillStyle=ACT===2?'#89876866':ACT===1?'#9da9af66':'#9c917655';cx.fillRect(Math.round(x-camx),Math.round(y-camy),1,1);
 }
}
