'use strict';
// DEEP BELOW v2 - procedural pixel icons for gear, upgrades, items, NPC
const MATC={rust:[128,96,72],copper:[184,112,66],iron:[168,168,174],gold:[218,178,72],diamond:[186,226,232],star:[150,178,214],frost:[160,206,220],mythril:[140,200,180],void:[128,96,160],chitin:[124,96,64],wood:[118,82,48]};
const PICK_M=['rust','copper','iron','gold','diamond','star','frost','mythril','void'];
const SWORD_M=['copper','iron','gold','diamond','star','frost','void'];
const BOW_M=['wood','iron','gold','diamond','frost'];
const ARMOR_M=['chitin','copper','iron','gold','diamond','star','frost'];
const IC={};
function mkIcon(draw){const c=document.createElement('canvas');c.width=c.height=12;const g=c.getContext('2d');
 const P=(x,y,col,m)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>11||y>11)return;const k=m||1;g.fillStyle=css([clamp(col[0]*k,0,255),clamp(col[1]*k,0,255),clamp(col[2]*k,0,255)]);g.fillRect(x,y,1,1)};
 const L=(x0,y0,x1,y1,col,m)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)P(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,col,m)};
 const R=(x,y,w,h,col,m)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(x+i,y+j,col,m)};
 const C=(cx,cy,r,col,sh)=>{for(let y=0;y<12;y++)for(let x=0;x<12;x++){const dx=x-cx,dy=y-cy;if(dx*dx+dy*dy<=r*r)P(x,y,col,sh?(dx+dy<-r*.4?1.3:dx+dy>r*.5?.7:1):1)}};
 draw(P,L,R,C);
 const d=g.getImageData(0,0,12,12),a=d.data,o=new Uint8ClampedArray(a);
 for(let y=0;y<12;y++)for(let x=0;x<12;x++){const i=(y*12+x)*4;if(a[i+3])continue;let n=false;for(const q of D4){const X=x+q[0],Y=y+q[1];if(X>=0&&Y>=0&&X<12&&Y<12&&a[(Y*12+X)*4+3])n=true}if(n){o[i]=14;o[i+1]=11;o[i+2]=9;o[i+3]=255}}
 d.data.set(o);g.putImageData(d,0,0);return c.toDataURL()}
const WD=MATC.wood;
function icPick(c){return mkIcon((P,L)=>{L(7,4,1,10,WD);L(8,5,2,11,WD,.65);[[2,3],[3,2],[4,1],[5,1],[6,1],[7,1],[8,1],[9,2],[10,3],[10,4]].forEach(p=>{P(p[0],p[1],c,1.3);P(p[0],p[1]+1,c,.85)});P(2,5,c,.6);P(10,6,c,.6)})}
function icSword(c){return mkIcon((P,L)=>{L(10,1,4,7,c,1.35);L(11,2,5,8,c,.8);L(11,1,11,1,c,1.5);L(2,5,6,9,[96,80,60]);L(3,8,1,10,WD);P(0,11,c,.9);P(2,9,WD,.7)})}
function icBow(i,c){return mkIcon((P,L)=>{if(i===0){L(6,11,6,6,WD);L(6,6,3,2,WD);L(6,6,9,2,WD);L(3,2,9,2,[150,110,76],.9);P(6,3,[120,120,120])}
 else{L(6,4,6,11,WD);L(5,5,5,10,WD,.7);[[1,5],[2,3],[3,2],[5,1],[7,1],[9,2],[10,3],[11,5]].forEach(p=>P(p[0],p[1],c,1.2));L(1,5,11,5,[210,200,180],.8);L(6,0,6,4,i>=3?c:[160,160,166],1.2);if(i>=3){P(5,0,c,1.5);P(7,0,c,1.5)}}})}
function icArmor(c){return mkIcon((P,L,R)=>{R(3,3,6,8,c);R(1,3,2,3,c,.85);R(9,3,2,3,c,.85);R(4,2,1,1,c,1.2);R(7,2,1,1,c,1.2);L(6,4,6,9,c,.7);R(4,4,1,5,c,1.3);R(3,10,6,1,c,.7)})}
IC.dyn=mkIcon((P,L,R)=>{R(2,5,2,6,[170,60,40]);R(5,5,2,6,[160,56,38]);R(8,5,2,6,[170,60,40]);R(2,5,1,6,[200,90,60]);R(2,7,8,1,[60,40,30]);L(6,5,8,1,[200,190,160]);P(9,0,[255,220,130])});
IC.flare=mkIcon((P,L,R)=>{L(2,10,8,4,[170,70,40]);L(3,10,9,4,[130,50,30]);R(8,1,3,3,[255,190,100]);P(9,2,[255,248,220])});
IC.bolts=mkIcon((P,L)=>{for(const o of[0,3,6]){L(1+o,11,5+o,3,[150,150,156]);P(5+o,2,[200,200,206]);P(1+o,10,[180,150,110]);P(2+o,11,[180,150,110])}});
IC.tonic=mkIcon((P,L,R,C)=>{R(5,0,2,2,[140,120,100]);R(4,2,4,1,[180,170,160]);C(6,7,3.6,[150,50,50],1);P(4,5,[230,200,200])});
IC.rope=mkIcon((P,L,R,C)=>{C(6,6,5,[140,106,70],1);C(6,6,3,[0,0,0]);C(6,6,2.2,[120,90,60])});
IC.oil=mkIcon((P,L,R)=>{R(2,4,8,7,[150,110,60]);R(2,4,2,7,[180,140,80]);L(9,4,11,1,[120,90,50]);R(4,2,4,2,[90,70,50])});
IC.up_swing=mkIcon((P,L,R)=>{R(3,5,6,6,[150,110,80]);for(const x of[3,5,7])R(x,2,1,3,[150,110,80]);R(9,5,2,2,[150,110,80]);R(3,9,6,1,[110,80,56]);R(4,6,1,3,[180,140,110])});
IC.up_boots=mkIcon((P,L,R)=>{R(3,1,4,7,[112,82,52]);R(3,7,7,3,[112,82,52]);R(3,10,8,1,[50,40,30]);R(4,2,1,5,[140,104,70]);R(3,3,4,1,[70,52,36])});
IC.up_pack=mkIcon((P,L,R)=>{R(2,3,8,8,[110,84,56]);R(2,3,8,3,[134,104,70]);R(5,5,2,2,[190,160,90]);R(3,1,6,2,[80,60,40]);R(2,8,8,1,[80,60,40])});
IC.up_hp=mkIcon((P,L,R,C)=>{C(3.5,4,2.6,[170,50,46],1);C(8.5,4,2.6,[170,50,46],1);for(let y=5;y<11;y++){const w=Math.max(0,5-(y-5));R(6-w,y,w*2,1,[150,40,38])}P(3,3,[230,150,140])});
IC.up_lamp=mkIcon((P,L,R)=>{R(4,0,4,1,[90,80,70]);R(3,2,6,8,[86,74,60]);R(4,3,4,6,[240,190,110]);R(5,4,2,3,[255,240,200]);R(3,10,6,1,[60,52,44])});
IC.up_oil=IC.oil;
IC.up_scan=mkIcon((P,L,R)=>{R(2,2,8,9,[90,90,96]);R(3,3,6,4,[80,140,116]);P(6,5,[190,230,200]);P(4,4,[120,180,150]);R(3,8,2,2,[150,60,50]);R(7,8,2,2,[60,60,66]);L(9,0,9,2,[120,120,126])});
IC.up_luck=mkIcon((P,L,R,C)=>{C(4,4,2.2,[96,140,80],1);C(8,4,2.2,[96,140,80],1);C(4,8,2.2,[96,140,80],1);C(8,8,2.2,[96,140,80],1);L(6,6,9,11,[70,100,56])});
IC.up_suit=mkIcon((P,L,R,C)=>{C(6,6,5,[150,140,120],1);R(3,4,6,3,[60,90,110]);R(4,4,2,1,[140,180,200]);R(2,10,8,2,[110,100,86])});
IC.up_salv=mkIcon((P,L,R,C)=>{C(6,7,4,[130,100,70],1);R(4,2,4,2,[110,84,58]);R(3,3,6,1,[70,52,36]);P(6,7,[210,180,90])});
IC.npc=mkIcon((P,L,R,C)=>{R(2,1,8,3,[150,122,60]);R(1,3,10,1,[112,92,48]);P(6,2,[255,230,170]);R(3,4,6,4,[180,140,110]);P(4,5,[40,30,24]);P(7,5,[40,30,24]);R(2,7,8,4,[200,196,186]);R(4,8,4,1,[120,80,70]);R(3,11,6,1,[100,80,60])});
IC.brood=mkIcon((P,L,R,C)=>{C(6,7,4.5,[74,58,48],1);for(const x of[1,3,9,11]){L(x,4,x,10,[40,32,26])}P(4,6,[200,80,50]);P(8,6,[200,80,50]);P(5,6,[200,80,50]);P(7,6,[200,80,50])});
IC.king=mkIcon((P,L,R,C)=>{C(6,7,4.5,[60,50,76],1);R(3,1,6,2,[222,190,110]);for(const x of[3,6,8])P(x,0,[222,190,110]);P(4,6,[230,220,255]);P(8,6,[230,220,255])});
function gearIcon(g,i){if(i<0)return IC.none;const k=g+i;if(!IC[k]){if(g==='pick')IC[k]=icPick(MATC[PICK_M[i]]);else if(g==='sword')IC[k]=icSword(MATC[SWORD_M[i]]);else if(g==='bow')IC[k]=icBow(i,MATC[BOW_M[i]]);else IC[k]=icArmor(MATC[ARMOR_M[i]])}return IC[k]}
IC.none=mkIcon((P,L)=>{L(3,3,8,8,[70,60,50]);L(8,3,3,8,[70,60,50])});
