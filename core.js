'use strict';
// DEEP BELOW v2 - core: constants, data, save, procedural audio and music
const VW=480,VH=270,TS=16,MW=72,LH=64,CH=16;
let NL=5,MH=LH*5;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const fmt=n=>Math.round(n).toLocaleString('en-US');
const css=c=>`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function ih(x,y,s){let h=Math.imul(x|0,73856093)^Math.imul(y|0,19349663)^Math.imul(s|0,83492791);h=Math.imul(h^(h>>>13),0x5bd1e995);h^=h>>>15;return(h>>>0)/4294967296}
function vn(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),a=ih(xi,yi,s),b=ih(xi+1,yi,s),c=ih(xi,yi+1,s),d=ih(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,s){return vn(x,y,s)*.55+vn(x*2.03,y*2.03,s+9)*.3+vn(x*4.1,y*4.1,s+17)*.15}
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>v/16-.5);
const D4=[[1,0],[-1,0],[0,1],[0,-1]];

// ---------- tiles ----------
const T={AIR:0,DIRT:1,STONE:2,SLATE:3,BASALT:4,ANCIENT:5,GRAVEL:6,BARRIER:7,WOOD:8,BEDROCK:9,BRICK:10,CHEST:11,ICE:12,MYCEL:13,VOIDR:14,COAL:20,COPPER:21,IRON:22,GOLD:23,AMETHYST:24,DIAMOND:25,STARMETAL:26,FROSTITE:27,MYTHRIL:28,VOIDSTONE:29,WATER:40,LAVA:41,CHASM:42,LIFT:43,ICEFLOOR:44};
const TI=[];
function dT(id,o){TI[id]=Object.assign({solid:true,opaque:true,hp:3,mat:'stone',ore:null,extra:0},o)}
for(let i=0;i<64;i++)dT(i,{});
dT(T.AIR,{solid:false,opaque:false,hp:0});dT(T.DIRT,{hp:2,mat:'dirt'});dT(T.STONE,{hp:3.5});dT(T.SLATE,{hp:5.5});dT(T.BASALT,{hp:8});dT(T.ANCIENT,{hp:11});
dT(T.GRAVEL,{hp:1.2,mat:'gravel'});dT(T.BARRIER,{hp:14,mat:'hard'});dT(T.WOOD,{hp:2.2,mat:'wood'});dT(T.BEDROCK,{hp:Infinity,mat:'hard'});dT(T.BRICK,{hp:12});dT(T.CHEST,{hp:1,mat:'wood',opaque:false});
dT(T.ICE,{hp:12,mat:'ice'});dT(T.MYCEL,{hp:15,mat:'soft'});dT(T.VOIDR,{hp:22,mat:'hard'});
dT(T.COAL,{ore:'coal',extra:.5,mat:'ore'});dT(T.COPPER,{ore:'copper',extra:1,mat:'ore'});dT(T.IRON,{ore:'iron',extra:1.5,mat:'ore'});dT(T.GOLD,{ore:'gold',extra:2,mat:'ore'});
dT(T.AMETHYST,{ore:'amethyst',extra:2,mat:'crystal'});dT(T.DIAMOND,{ore:'diamond',extra:4,mat:'crystal'});dT(T.STARMETAL,{ore:'starmetal',extra:6,mat:'ore'});
dT(T.FROSTITE,{ore:'frostite',extra:4,mat:'crystal'});dT(T.MYTHRIL,{ore:'mythril',extra:7,mat:'ore'});dT(T.VOIDSTONE,{ore:'voidstone',extra:10,mat:'crystal'});
dT(T.WATER,{solid:false,opaque:false,hp:0});dT(T.LAVA,{solid:false,opaque:false,hp:0});dT(T.CHASM,{solid:true,opaque:false,hp:Infinity});dT(T.LIFT,{solid:false,opaque:false,hp:0});dT(T.ICEFLOOR,{solid:false,opaque:false,hp:0});

// ---------- acts & layers ----------
// ores: [tile, veins, minSize, maxSize]
const ACTS=[
{name:'The Old Mine',boss:'brood',seal:[0,1,2,3,4],layers:[
{name:'Shallow Caves',rock:T.DIRT,wall:[112,88,64],alt:[92,68,50],floor:[66,54,43],amb:[.045,.04,.035],open:.47,ores:[[T.COAL,24,3,6],[T.COPPER,12,2,4],[T.IRON,3,2,3]],en:{crawler:6,bat:2},lakes:2,moss:.25},
{name:'Stone Hollows',rock:T.STONE,wall:[104,100,94],alt:[88,90,98],floor:[56,54,51],amb:[.035,.035,.04],open:.46,ores:[[T.COAL,10,3,5],[T.COPPER,16,2,4],[T.IRON,13,2,4],[T.GOLD,4,1,3]],en:{crawler:7,bat:6,spitter:3},lakes:2,moss:.2},
{name:'Flooded Caverns',rock:T.SLATE,wall:[78,86,92],alt:[64,82,80],floor:[42,49,54],amb:[.025,.03,.042],open:.5,ores:[[T.COPPER,6,2,3],[T.IRON,14,2,4],[T.GOLD,9,1,3],[T.AMETHYST,4,2,3]],en:{crawler:6,bat:7,spitter:4,burrower:2,stalker:1},lakes:7,moss:.45},
{name:'Crystal Depths',rock:T.BASALT,wall:[70,64,72],alt:[82,62,80],floor:[42,38,45],amb:[.028,.022,.04],open:.47,ores:[[T.IRON,5,2,3],[T.GOLD,12,1,3],[T.AMETHYST,13,2,4],[T.DIAMOND,5,1,2]],en:{crawler:5,bat:6,spitter:4,burrower:3,stalker:4,golem:1},lakes:3,moss:.1},
{name:'The Deep Hollow',rock:T.ANCIENT,wall:[80,58,50],alt:[98,64,44],floor:[44,33,30],amb:[.045,.025,.02],open:.46,ores:[[T.GOLD,9,1,3],[T.AMETHYST,7,2,3],[T.DIAMOND,9,1,2],[T.STARMETAL,3,1,2]],en:{crawler:5,spitter:5,burrower:3,stalker:5,golem:3},lakes:0,lava:5,moss:0}],
hints:['','The <b>Stone Hollows</b>. Bats nest here, and <b>spitters</b> keep their distance.','The <b>Flooded Caverns</b>. Water slows you. Something moves <b>inside the rock</b>. Pressure hurts without a suit.','The <b>Crystal Depths</b>. Amethyst glows... and pale things hunt in the dark.','<b>The Deep Hollow</b>. Lava, ruins, golems. Somewhere below, the <b>Brood Mother</b> waits.']},
{name:'The Frozen Deep',boss:'king',seal:[5,6,7],layers:[
{name:'Frost Grotto',rock:T.ICE,wall:[138,156,166],alt:[168,176,182],floor:[64,74,82],amb:[.034,.04,.05],open:.48,ores:[[T.IRON,6,2,3],[T.DIAMOND,6,1,2],[T.FROSTITE,15,2,4]],en:{crawler:6,bat:6,wraith:4,spitter:3},lakes:5,ice:1,moss:0},
{name:'Mycelium Wilds',rock:T.MYCEL,wall:[98,76,88],alt:[80,66,58],floor:[46,36,44],amb:[.036,.026,.036],open:.5,ores:[[T.GOLD,8,1,3],[T.FROSTITE,8,2,3],[T.MYTHRIL,10,1,3],[T.AMETHYST,6,2,3]],en:{sporeling:9,spitter:5,burrower:4,stalker:4},lakes:2,moss:.5,shroom:1},
{name:'Abyssal Core',rock:T.VOIDR,wall:[58,50,66],alt:[40,36,56],floor:[30,26,34],amb:[.03,.02,.042],open:.47,ores:[[T.MYTHRIL,9,1,3],[T.DIAMOND,6,1,2],[T.VOIDSTONE,5,1,2],[T.STARMETAL,3,1,2]],en:{wraith:6,golem:4,stalker:6,burrower:4,sporeling:3},lakes:0,lava:4,moss:0}],
hints:['The <b>Frost Grotto</b>. The floor is <b>ice</b>. Wraiths drift between the pillars.','The <b>Mycelium Wilds</b>. Spores fill the air. Sporelings <b>explode</b>.','The <b>Abyssal Core</b>. The Hollow King sleeps below. Nothing here wants you alive.']}];
let ACT=0,LAYERS=ACTS[0].layers;
function setAct(a){ACT=a;LAYERS=ACTS[a].layers;NL=LAYERS.length;MH=LH*NL}
const BAR_HP=[0,10,15,22,30];

// ---------- items ----------
const ITEMS={
coal:{n:'Coal',v:3,c:[46,42,40],r:0},copper:{n:'Copper Ore',v:8,c:[176,102,62],r:0},iron:{n:'Iron Ore',v:18,c:[172,150,132],r:1},gold:{n:'Gold Nugget',v:45,c:[214,170,64],r:1},
amethyst:{n:'Amethyst',v:70,c:[138,106,166],r:2},diamond:{n:'Diamond',v:180,c:[200,228,232],r:3},starmetal:{n:'Starmetal',v:650,c:[146,176,206],r:4},
frostite:{n:'Frostite',v:95,c:[150,196,210],r:2},mythril:{n:'Mythril',v:320,c:[140,196,178],r:3},voidstone:{n:'Voidstone',v:1100,c:[124,92,156],r:4},
fossil:{n:'Fossil',v:55,c:[200,186,154],r:2},geode:{n:'Geode',v:120,c:[130,122,142],r:3},relic:{n:'Ancient Relic',v:1500,c:[204,166,92],r:4},chitin:{n:'Chitin Shard',v:6,c:[98,84,66],r:0},
heart:{n:'Brood Heart',v:3000,c:[170,70,60],r:5},crown:{n:'Hollow Crown',v:10000,c:[222,190,110],r:5},
oil:{n:'Oil Flask',use:1,c:[186,134,62]},dyn:{n:'Dynamite',use:1,c:[168,58,40]},tonic:{n:'Tonic',use:1,c:[150,62,58]},flare:{n:'Flare',use:1,c:[196,90,50]},bolts:{n:'Bolts',use:1,c:[160,160,166]}};

// ---------- gear (crafted at the Forge) ----------
const PICKS=[
{n:'Rusty Pick',pw:1},
{n:'Copper Pick',pw:1.6,c:{copper:8,coal:6},m:60},
{n:'Iron Pick',pw:2.4,c:{iron:10,coal:8},m:220},
{n:'Gilded Pick',pw:3.4,c:{gold:8,iron:8},m:650},
{n:'Diamond Pick',pw:4.8,c:{diamond:4,gold:6},m:1800},
{n:'Starmetal Pick',pw:6.5,c:{starmetal:3,diamond:4},m:4500},
{n:'Frostite Pick',pw:9,c:{frostite:10,starmetal:2},m:9000},
{n:'Mythril Pick',pw:12,c:{mythril:7,frostite:8},m:18000},
{n:'Void Pick',pw:16,c:{voidstone:3,mythril:6},m:35000}];
const SWORDS=[
{n:'Copper Sword',dmg:3.5,c:{copper:10,coal:4},m:80},
{n:'Iron Sword',dmg:6,c:{iron:12,coal:6},m:300},
{n:'Gold Saber',dmg:9,c:{gold:10,iron:6},m:800},
{n:'Diamond Blade',dmg:14,c:{diamond:5,gold:6},m:2200},
{n:'Starmetal Edge',dmg:20,c:{starmetal:3,diamond:3},m:5500},
{n:'Frostbrand',dmg:28,slow:1,c:{frostite:12,starmetal:2},m:11000},
{n:'Void Reaver',dmg:40,c:{voidstone:3,mythril:6},m:30000}];
const BOWS=[
{n:'Sling',dmg:2.2,rate:.6,ammo:0,spd:230,kind:'stone',c:{chitin:4,coal:4},m:50},
{n:'Crossbow',dmg:7,rate:.75,ammo:1,spd:330,kind:'bolt',c:{iron:10,chitin:6},m:350},
{n:'Repeater',dmg:8,rate:.32,ammo:1,spd:350,kind:'bolt',c:{gold:8,iron:10},m:1100},
{n:'Arc Caster',dmg:12,rate:.55,ammo:0,spd:300,pierce:2,kind:'crystal',c:{amethyst:8,diamond:3},m:3000},
{n:'Frost Bow',dmg:20,rate:.5,ammo:0,spd:370,pierce:2,slow:1,kind:'frost',c:{frostite:12,mythril:2},m:12000}];
const ARMORS=[
{n:'Chitin Jerkin',dr:.1,c:{chitin:8},m:60},
{n:'Copper Mail',dr:.18,c:{copper:14,coal:4},m:200},
{n:'Iron Plate',dr:.26,c:{iron:16,coal:6},m:600},
{n:'Gilded Plate',dr:.33,c:{gold:12,iron:8},m:1600},
{n:'Diamond Scale',dr:.4,c:{diamond:6,gold:4},m:3800},
{n:'Starmetal Aegis',dr:.48,c:{starmetal:4,diamond:4},m:8000},
{n:'Frost Plate',dr:.56,c:{frostite:14,mythril:3},m:16000}];
const GEAR={pick:PICKS,sword:SWORDS,bow:BOWS,armor:ARMORS};
const GEARN={pick:'Pickaxe',sword:'Sword',bow:'Ranged',armor:'Armor'};
const SUP=[
{id:'dyn',n:'Dynamite',d:'Blasts rock and creatures.',m:45,c:{coal:3},max:6,q:1},
{id:'flare',n:'Flare',d:'Throwable light. Stalkers and wraiths flee it.',m:30,c:{coal:2,copper:1},max:5,q:1},
{id:'bolts',n:'Bolts x10',d:'Ammo for the Crossbow and Repeater.',m:35,c:{iron:2},max:80,q:10},
{id:'tonic',n:'Tonic',d:'Heals 45 HP.',m:55,c:{amethyst:1},max:4,q:1},
{id:'rope',n:'Escape Rope',d:'Channel 3s to escape from anywhere.',m:260,max:1,q:1}];

// ---------- upgrades (harder economy) ----------
const SWING=[.42,.37,.33,.29,.26,.23],PACK=[10,14,19,26,34,44],SCANR=[0,11,17,26],SCANCD=[0,24,18,12],SALV=[0,2,4,7];
const SPEED=l=>62+9*l,LAMP=l=>5.5+1.1*l,OILM=l=>110+28*l;
const UPG=[
{id:'swing',n:'Grip',d:'Swing, slash and reload faster.',max:5,b:120,g:2.6,v:l=>(1/SWING[l]).toFixed(1)+'/s'},
{id:'boots',n:'Boots',d:'Move faster.',max:4,b:100,g:2.7,v:l=>SPEED(l)+' spd'},
{id:'pack',n:'Backpack',d:'Carry more loot.',max:5,b:130,g:2.6,v:l=>PACK[l]+' slots'},
{id:'hp',n:'Vitality',d:'More health.',max:6,b:150,g:2.5,v:l=>(100+25*l)+' HP'},
{id:'lamp',n:'Lantern Lens',d:'Wider light. Stalkers hate it.',max:4,b:140,g:2.8,v:l=>LAMP(l).toFixed(1)+'r'},
{id:'oil',n:'Oil Tank',d:'Longer expeditions.',max:5,b:120,g:2.5,v:l=>OILM(l)+'s'},
{id:'scan',n:'Cave Scanner',d:'[E] reveals ore. Lv2+ shows chests.',max:3,b:400,g:3,v:l=>l?'radius '+SCANR[l]:'none'},
{id:'luck',n:'Prospector Luck',d:'Double drops, crits, rare finds in plain rock.',max:5,b:300,g:2.6,v:l=>'+'+l*8+'% dbl'},
{id:'suit',n:'Pressure Suit',d:'Resist crushing depth and lava. Act 2 needs more.',max:5,b:600,g:2.4,v:l=>'Lv '+l},
{id:'salv',n:'Salvage Pouch',d:'Keep your best items if you die.',max:3,b:500,g:2.8,v:l=>SALV[l]+' kept'}];

// ---------- quests (Old Marrow) ----------
const QUESTS=[
{n:'First Haul',d:'Sell $150 worth of materials at the Market.',t:'sold',goal:150,rw:{m:100,dyn:2},say:'Welcome to camp, greenhorn. Ore is worth nothing in your pack. Bring it up, sell it, and we will talk.'},
{n:'Arms of Copper',d:'Forge a Copper Sword or a Sling.',t:'craftw',goal:1,rw:{m:120},say:'The things down there bite. A pickaxe is a tool, not a weapon. Visit the Forge.'},
{n:'Pest Control',d:'Defeat 12 cave creatures.',t:'kills',goal:12,rw:{m:250,bolts:20},say:'Crawlers keep dragging off my supply crates. Thin them out.'},
{n:'Break the Seal',d:'Reach the Stone Hollows.',t:'reach',a:0,l:1,rw:{m:300},say:'Below the shallows is a seal of hard rock. A Copper Pick should crack it.'},
{n:'Iron Will',d:'Deliver 15 Iron Ore.',t:'deliver',item:'iron',goal:15,rw:{m:700,tonic:2},say:'I need iron to shore up the lift shafts. Fifteen chunks. Hand them over when you have them.'},
{n:'Into the Flood',d:'Reach the Flooded Caverns.',t:'reach',a:0,l:2,rw:{m:600},say:'My brother went into the flooded caves and never came up. Find out what is down there.'},
{n:'Spitting Distance',d:'Defeat 6 Spitters.',t:'kt',et:'spitter',goal:6,rw:{m:900},say:'Those acid spitters are ruining my best diggers. Something with range would help.'},
{n:'Crystal Tribute',d:'Deliver 8 Amethyst.',t:'deliver',item:'amethyst',goal:8,rw:{m:1500,flare:3},say:'Amethyst hums in the dark. Collectors up top pay well. Bring me eight.'},
{n:'Heart of Stone',d:'Defeat 3 Golems.',t:'kt',et:'golem',goal:3,rw:{m:2500},say:'Walking rock. I would not have believed it. Break three of them.'},
{n:'The Deep Hollow',d:'Reach The Deep Hollow.',t:'reach',a:0,l:4,rw:{m:2000},say:'The old maps end at the Hollow. The miners called it the Mother of Crawlers.'},
{n:'The Brood Mother',d:'Slay the Brood Mother at the bottom of The Deep Hollow.',t:'boss',b:'brood',rw:{m:6000},say:'She birthed every crawler in these tunnels. Kill her, and the way deeper opens.'},
{n:'Cold Descent',d:'Reach the Mycelium Wilds in the Frozen Deep.',t:'reach',a:1,l:1,rw:{m:6000},say:'Ice and mushrooms and worse. Watch your footing and your lungs.'},
{n:'Mythril Oath',d:'Deliver 8 Mythril.',t:'deliver',item:'mythril',goal:8,rw:{m:15000},say:'Mythril can be forged into something that might hurt a king. Bring me eight.'},
{n:'The Hollow King',d:'Descend to the Abyssal Core and slay the Hollow King.',t:'boss',b:'king',rw:{m:25000},say:'This is it. The thing at the bottom of the world. Come back alive.'}];
for(const q of QUESTS)for(const k in q.rw)q.rw[k]=Math.max(1,Math.round(q.rw[k]*.5));

// ---------- challenge modifiers (New Game+) ----------
const MODS=[
{id:'glass',n:'Glass Bones',d:'-40% max health.'},
{id:'wick',n:'Short Wick',d:'-35% lamp oil.'},
{id:'dim',n:'Dim Lantern',d:'-30% light radius.'},
{id:'rav',n:'Ravenous Deep',d:'Creatures have +60% health and damage.'},
{id:'heavy',n:'Heavy Pockets',d:'-30% backpack space.'},
{id:'brittle',n:'Brittle Tools',d:'-25% mining power.'},
{id:'cursed',n:'Cursed Luck',d:'No rare finds in plain rock, no double drops.'}];
const mod=id=>!!(S.mods&&S.mods.includes(id));
const modBonus=()=>1+(S.mods?S.mods.length:0)*.15;

const ACH=[
{id:'first',n:'First Strike',d:'Mine your first ore.'},{id:'escape',n:'Daylight',d:'Escape the cave with loot.'},
{id:'l2',n:'Into the Stone',d:'Reach the Stone Hollows.'},{id:'l3',n:'Waterlogged',d:'Reach the Flooded Caverns.'},
{id:'l4',n:'Crystal Clear',d:'Reach the Crystal Depths.'},{id:'l5',n:'Deep Below',d:'Reach The Deep Hollow.'},
{id:'diamond',n:'Under Pressure',d:'Find a diamond.'},{id:'star',n:'Fallen Star',d:'Find Starmetal.'},
{id:'relic',n:'Relic Hunter',d:'Recover an Ancient Relic.'},{id:'haul1k',n:'Heavy Pockets',d:'Bring up a single haul worth $1,000.'},
{id:'close',n:'Close Call',d:'Escape with under 15% health.'},{id:'dark',n:'Lights Out',d:'Escape after your lamp ran dry.'},
{id:'full',n:'Pack Mule',d:'Escape with a full backpack.'},{id:'kills',n:'Exterminator',d:'Defeat 100 cave creatures.'},
{id:'boom',n:'Demolitionist',d:'Throw 15 dynamite.'},{id:'rich',n:'Mining Magnate',d:'Earn $50,000 in total.'},
{id:'smith',n:'Smith',d:'Forge your first piece of gear.'},{id:'arsenal',n:'Arsenal',d:'Own a pickaxe, sword, ranged weapon and armor.'},
{id:'brood',n:'Matricide',d:'Slay the Brood Mother.'},{id:'act2',n:'Cold Feet',d:'Enter the Frozen Deep.'},
{id:'king',n:'Kingslayer',d:'Slay the Hollow King.'},{id:'quests',n:'Marrow’s Favorite',d:'Complete 7 quests.'},
{id:'ng',n:'Glutton for Punishment',d:'Start a New Game+ with a challenge.'},{id:'maxpick',n:'Void Touched',d:'Forge the Void Pick.'}];

// ---------- save ----------
const SKEY='deepbelow_save_v1';
function defSave(){return{v:2,money:0,up:{},gear:{pick:0,sword:-1,bow:-1,armor:-1},mats:{},cons:{dyn:2,flare:1,bolts:0,tonic:1,rope:0},unl:[1,0],act:0,startL:0,reached:[0,-1],boss:{},q:0,qb:0,
 stats:{runs:0,escapes:0,deaths:0,earned:0,sold:0,mined:0,ores:0,deepest:0,kills:0,best:0,time:0,dyn:0,rares:0,crafted:0,craftw:0,kt:{}},ach:{},set:{master:.8,music:.55,sfx:.85,shake:1,parts:1},tut:false,seen:{},mods:[],ng:0,wins:0,won:false}}
let S=defSave();
function applySaveData(d){const b=defSave();
 S=Object.assign(b,d);S.stats=Object.assign(defSave().stats,d.stats||{});S.stats.kt=S.stats.kt||{};S.set=Object.assign(defSave().set,d.set||{});S.cons=Object.assign(defSave().cons,d.cons||{});
 S.gear=Object.assign(defSave().gear,d.gear||{});S.up=d.up||{};S.ach=d.ach||{};S.seen=d.seen||{};S.boss=d.boss||{};S.mats=d.mats||{};S.mods=d.mods||[];
 if(!d.v){S.gear.pick=Math.min(5,(d.up&&d.up.pick)||0);delete S.up.pick;S.unl=[d.unlocked||1,0];S.reached=[Math.max(0,(d.unlocked||1)-1),-1];S.v=2}
 if(!Array.isArray(S.unl))S.unl=[1,0];if(!Array.isArray(S.reached))S.reached=[0,-1]}
function load(){try{const d=JSON.parse(localStorage.getItem(SKEY)||'null');if(!d)return;applySaveData(d)}catch(e){S=defSave()}}
function save(){try{localStorage.setItem(SKEY,JSON.stringify(S))}catch(e){}}
function downloadSave(){save();const blob=new Blob([JSON.stringify({format:'deep-below-character',version:1,save:S},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='deep-below-character.json';a.click();URL.revokeObjectURL(url)}
function importSaveFile(file,done){if(!file){done(new Error('No file selected'));return}const reader=new FileReader();reader.onload=()=>{try{const packet=JSON.parse(reader.result),d=packet&&packet.format==='deep-below-character'?packet.save:packet;if(!d||typeof d!=='object'||!d.gear||!d.stats||!d.set)throw new Error('This is not a valid DEEP BELOW character file');applySaveData(d);save();done(null)}catch(e){done(e)}};reader.onerror=()=>done(new Error('Could not read that file'));reader.readAsText(file)}
const lv=id=>S.up[id]||0;
const cost=u=>Math.round(u.b*Math.pow(u.g,lv(u.id))/5)*5;

// ---------- shared state ----------
let tiles=null,dmg,decor,flg,expl,lifts=[],slights=[],gItems=[],gEnemies=[],vents=[],chunks={},WSEED=1,mm=null,mmx=null,bossSpawn=null;
let state='menu',paused=false,RUN=null,P=null,enemies=[],items=[],parts=[],texts=[],rocks=[],dyns=[],dlights=[],projs=[],flares=[],boss=null,target=null;
let cam={x:MW*TS/2,y:20*TS},camX0=0,camY0=0,shakeT=0,hitstop=0,flashT=0,TT=0,curLayer=0,packDirty=true;
const wob=new Map(),M={x:VW/2,y:VH/2,l:false,r:false,lp:false},K={};

// ---------- audio engine ----------
const AU={ctx:null,
init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const a=this.ctx=new C();
 this.comp=a.createDynamicsCompressor();this.comp.threshold.value=-14;this.comp.connect(a.destination);
 this.master=a.createGain();this.master.connect(this.comp);this.sfx=a.createGain();this.sfx.connect(this.master);this.mus=a.createGain();this.mus.connect(this.master);
 this.rev=a.createConvolver();this.rev.buffer=this.ir(3.4);this.rev.connect(this.master);
 const n=a.createBuffer(1,a.sampleRate*4,a.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=n;
 const bn=a.createBuffer(1,a.sampleRate*6,a.sampleRate),bd=bn.getChannelData(0);let l=0;for(let i=0;i<bd.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;bd[i]=l*3.5}
 const s=a.createBufferSource();s.buffer=bn;s.loop=true;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=240;this.amb=a.createGain();this.amb.gain.value=0;s.connect(f);f.connect(this.amb);this.amb.connect(this.sfx);s.start();
 this.dr=[a.createOscillator(),a.createOscillator()];this.dr[1].type='triangle';const df=a.createBiquadFilter();df.type='lowpass';df.frequency.value=260;this.drG=a.createGain();this.drG.gain.value=0;
 this.dr.forEach((o,i)=>{o.frequency.value=55+i*.35;o.connect(df);o.start()});df.connect(this.drG);this.drG.connect(this.mus);
 this.vol();MUS.set(MUS.mode,MUS.layer,MUS.act,true)},
ir(len){const a=this.ctx,r=a.sampleRate,b=a.createBuffer(2,Math.floor(r*len),r);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){const t=i/r;let v=(Math.random()*2-1)*Math.pow(1-t/len,4)*.5;for(const e of[.11,.23,.41,.62])if(Math.abs(t-e-c*.019)<.006)v+=(Math.random()*2-1)*.5*(1-e);d[i]=v}}return b},
vol(){if(!this.ctx)return;this.master.gain.value=S.set.master;this.sfx.gain.value=S.set.sfx;this.mus.gain.value=S.set.music},
route(g,pan,rev,bus){const a=this.ctx;let n=g;if(pan&&a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=clamp(pan,-1,1);n.connect(p);n=p}n.connect(bus==='mus'?this.mus:this.sfx);if(rev>0){const r=a.createGain();r.gain.value=rev*(bus==='mus'?S.set.music:S.set.sfx)*.6;n.connect(r);r.connect(this.rev)}},
tone(f,dur,o={}){if(!this.ctx)return;const a=this.ctx,t=a.currentTime+(o.dl||0),os=a.createOscillator(),g=a.createGain(),v=o.v||.2,at=o.at||.004,e=Math.max(dur,at+.02);os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);g.gain.exponentialRampToValueAtTime(.0001,t+e);if(o.lp){const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;os.connect(fl);fl.connect(g)}else os.connect(g);this.route(g,o.pan,o.rev==null?.25:o.rev,o.bus);os.start(t);os.stop(t+e+.1)},
nz(dur,o={}){if(!this.ctx)return;const a=this.ctx,t=a.currentTime+(o.dl||0),s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),v=o.v||.2,at=o.at||.003,e=Math.max(dur,at+.02);s.buffer=this.nb;f.type=o.ft||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+dur);f.Q.value=o.q||1;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);g.gain.exponentialRampToValueAtTime(.0001,t+e);s.connect(f);f.connect(g);this.route(g,o.pan,o.rev==null?.2:o.rev,o.bus);s.start(t,Math.random()*Math.max(0,3.8-e));s.stop(t+e+.1)}};

function panOf(x){return P&&state==='run'?clamp((x-P.x)/220,-1,1):0}
const SND={
hit(mat,val,x){const p=panOf(x),r=1+rnd(-.08,.08);
 if(mat==='dirt'||mat==='soft'){AU.nz(.12,{ft:'lowpass',f:(mat==='soft'?450:700)*r,v:.35,pan:p,rev:.15});AU.tone(95*r,.09,{v:.25,f2:60,pan:p,rev:.1})}
 else if(mat==='gravel'){AU.nz(.16,{f:2400*r,q:.7,v:.3,pan:p})}
 else if(mat==='wood'){AU.tone(190*r,.12,{type:'triangle',v:.22,f2:140,pan:p});AU.nz(.08,{f:800,v:.2,pan:p})}
 else if(mat==='ice'){AU.nz(.06,{ft:'highpass',f:5000,v:.18,pan:p});AU.tone(1800*r,.25,{v:.05,f2:1500,pan:p,rev:.6});AU.nz(.1,{f:3000,q:2,v:.2,pan:p,rev:.4})}
 else{AU.nz(.05,{ft:'highpass',f:3500,v:.16,pan:p});AU.nz(.09,{f:1600*r,q:1.4,v:.3,pan:p,rev:.3});AU.tone(260*r,.07,{type:'triangle',v:.16,f2:130,pan:p,rev:.3});
  if(mat==='ore'){const f=(420+Math.min(val,600)*2)*r;AU.tone(f,.45,{v:.07,pan:p,rev:.5});AU.tone(f*1.51,.3,{v:.04,pan:p,rev:.5})}
  if(mat==='crystal'){AU.tone(1400*r,.8,{v:.06,pan:p,rev:.8});AU.tone(2100*r,.6,{v:.04,pan:p,rev:.8})}
  if(mat==='hard'){AU.tone(900*r,.12,{type:'square',v:.035,pan:p})}}},
brk(mat,x){const p=panOf(x);if(mat==='dirt'||mat==='gravel'||mat==='soft')AU.nz(.35,{ft:'lowpass',f:900,f2:200,v:.4,pan:p,rev:.3});else if(mat==='ice'){AU.nz(.4,{f:4000,f2:1500,q:.8,v:.35,pan:p,rev:.5});AU.tone(2400,.4,{v:.05,f2:1200,pan:p,rev:.7})}else{AU.nz(.4,{f:1400,f2:300,q:.8,v:.4,pan:p,rev:.4});AU.tone(80,.25,{v:.3,f2:45,pan:p})}},
whoosh(){AU.nz(.09,{ft:'highpass',f:1800,f2:900,v:.05,rev:.05})},
slash(){AU.nz(.14,{ft:'highpass',f:2600,f2:1200,v:.12,rev:.1});AU.tone(900,.08,{type:'triangle',v:.03,f2:500})},
shoot(k){if(k==='stone'){AU.nz(.06,{f:900,v:.15});AU.tone(300,.06,{type:'triangle',v:.06,f2:200})}else if(k==='bolt'){AU.tone(220,.12,{type:'triangle',v:.12,f2:90});AU.nz(.05,{ft:'highpass',f:3000,v:.08})}else{AU.tone(k==='frost'?1600:1100,.25,{v:.07,f2:k==='frost'?900:600,rev:.5});AU.nz(.1,{ft:'highpass',f:4000,v:.06,rev:.3})}},
thunk(x){AU.nz(.05,{f:1200,v:.12,pan:panOf(x)})},
pick(v){const f=500+Math.min(v,700)*1.1;AU.tone(f,.12,{type:'triangle',v:.1,f2:f*1.5,rev:.2});if(v>=45)AU.tone(f*1.5,.25,{v:.07,dl:.07,rev:.4})},
rare(r){const n=[587,740,880,1175,1480,1760];for(let i=0;i<3+Math.min(r,3);i++)AU.tone(n[i%6],1.6,{v:.09,dl:i*.09,rev:.9});AU.tone(293,2.4,{type:'triangle',v:.08,rev:.9,at:.05})},
hurt(){AU.nz(.22,{ft:'lowpass',f:900,v:.45});AU.tone(160,.25,{type:'sawtooth',v:.08,f2:70,rev:.2})},
ehit(x){const p=panOf(x);AU.nz(.08,{f:700,v:.3,pan:p});AU.tone(220,.08,{type:'square',v:.04,f2:120,pan:p})},
armor(x){AU.tone(1300,.1,{type:'square',v:.03,f2:900,pan:panOf(x)});AU.nz(.05,{ft:'highpass',f:4000,v:.1,pan:panOf(x)})},
edie(x){const p=panOf(x);AU.nz(.35,{ft:'lowpass',f:1200,f2:200,v:.35,pan:p,rev:.4});AU.tone(300,.3,{type:'triangle',v:.1,f2:60,pan:p})},
chit(x){const p=panOf(x);for(let i=0;i<4;i++)AU.nz(.025,{ft:'highpass',f:3000,v:.1,dl:i*.05,pan:p,rev:.3})},
bat(x){const p=panOf(x);AU.tone(2800,.07,{v:.035,f2:2000,pan:p,rev:.4});AU.tone(3100,.06,{v:.025,f2:2300,dl:.09,pan:p,rev:.4})},
spit(x){const p=panOf(x);AU.nz(.12,{f:600,f2:1400,q:2,v:.2,pan:p,rev:.2});AU.tone(180,.1,{type:'triangle',v:.06,f2:300,pan:p})},
splat(x){AU.nz(.15,{ft:'lowpass',f:800,v:.18,pan:panOf(x),rev:.2})},
burrow(x){AU.nz(.5,{ft:'lowpass',f:200,v:.12,at:.1,pan:panOf(x),rev:.3})},
emerge(x){const p=panOf(x);AU.nz(.5,{ft:'lowpass',f:900,f2:150,v:.5,pan:p,rev:.5});AU.tone(70,.4,{v:.3,f2:40,pan:p})},
slam(x){const p=panOf(x);AU.nz(.7,{ft:'lowpass',f:500,f2:60,v:.6,pan:p,rev:.7});AU.tone(55,.6,{v:.45,f2:30,pan:p})},
gwind(x){AU.tone(80,1,{type:'sawtooth',v:.04,f2:140,at:.5,pan:panOf(x),lp:400})},
wraith(x){const p=panOf(x);AU.tone(700,.8,{v:.04,f2:350,at:.2,pan:p,rev:1});AU.tone(705,.8,{type:'triangle',v:.03,f2:360,at:.2,pan:p,rev:1})},
fuseS(x){for(let i=0;i<4;i++)AU.tone(900,.05,{type:'square',v:.03,dl:i*.2,pan:panOf(x)})},
pop(x){const p=panOf(x);AU.nz(.5,{ft:'lowpass',f:1200,f2:200,v:.5,pan:p,rev:.6});AU.tone(90,.3,{v:.3,f2:40,pan:p})},
growl(x){const p=panOf(x);AU.tone(62,1.2,{type:'sawtooth',v:.035,f2:48,at:.3,pan:p,rev:.9,lp:500});AU.nz(1,{f:200,q:3,v:.06,at:.3,pan:p,rev:.9})},
roar(){AU.tone(70,2.2,{type:'sawtooth',v:.12,f2:40,at:.3,rev:1,lp:700});AU.nz(2,{f:300,f2:120,q:1.5,v:.3,at:.3,rev:1});AU.tone(105,2,{type:'sawtooth',v:.06,f2:60,at:.4,rev:1,lp:600})},
bossDie(){AU.nz(3,{ft:'lowpass',f:1200,f2:50,v:.8,rev:1.2});AU.tone(80,3,{type:'sawtooth',v:.12,f2:25,rev:1.2,lp:600})},
boom(){AU.nz(1.5,{ft:'lowpass',f:900,f2:60,v:.9,rev:.9});AU.tone(70,1,{v:.5,f2:28})},
fuse(){AU.nz(1.6,{ft:'highpass',f:5000,v:.05})},
flare(){AU.nz(1.2,{ft:'highpass',f:3000,v:.08,at:.05});AU.tone(400,.2,{type:'triangle',v:.05,f2:800})},
drip(p){const f=rnd(900,1600);AU.tone(f,.08,{v:.045,f2:f*1.9,pan:p,rev:1.3})},
moan(){const p=rnd(-1,1);AU.tone(rnd(70,120),2.2,{type:'triangle',v:.04,f2:rnd(45,70),at:.6,pan:p,rev:1.3});AU.nz(1.8,{f:260,f2:140,q:5,v:.04,at:.6,rev:1.2,pan:p})},
rumble(v){AU.nz(2.6,{ft:'lowpass',f:170,v:v||.25,at:.7,rev:.8})},
trickle(x){const p=panOf(x);for(let i=0;i<5;i++)AU.nz(.03,{f:rnd(2500,4500),v:.07,dl:i*rnd(.04,.1),pan:p,rev:.4})},
impact(x){const p=panOf(x);AU.nz(.4,{ft:'lowpass',f:700,f2:150,v:.5,pan:p,rev:.5});AU.tone(90,.3,{v:.3,f2:40,pan:p})},
step(w){if(w===1)AU.nz(.09,{f:1300,q:.8,v:.06,rev:.1});else if(w===2)AU.nz(.05,{f:3500,q:1,v:.04,rev:.1});else AU.nz(.04,{ft:'lowpass',f:500,v:.06,rev:.05})},
chest(){AU.tone(150,.25,{type:'triangle',v:.15,f2:110});AU.tone(660,.5,{v:.07,dl:.15,rev:.6});AU.tone(990,.6,{v:.06,dl:.25,rev:.6})},
scan(){AU.tone(880,1.4,{v:.08,f2:440,rev:1});AU.tone(1320,.8,{v:.04,dl:.2,rev:1})},
lift(){AU.nz(1.2,{f:300,q:2,v:.15,rev:.4});AU.tone(220,.8,{type:'triangle',v:.08,f2:330,rev:.5})},
lampOut(){AU.nz(.6,{f:600,f2:150,v:.2,rev:.6});AU.tone(110,1.5,{v:.1,f2:55,rev:1})},
death(){AU.tone(220,2.5,{type:'triangle',v:.15,f2:55,rev:1});AU.nz(1.5,{ft:'lowpass',f:500,f2:80,v:.3,rev:1})},
shimmer(p){for(let i=0;i<3;i++)AU.tone(2200+i*330,1.2,{v:.025,dl:i*.12,pan:p,rev:1.5})},
deeper(){AU.tone(98,3,{type:'triangle',v:.1,at:.5,rev:1});AU.tone(146.8,3,{v:.06,at:.8,rev:1})},
heal(){AU.tone(440,.3,{v:.08,f2:660,rev:.4});AU.tone(660,.4,{v:.05,dl:.1,rev:.4})},
ui(){AU.tone(520,.04,{type:'square',v:.025,rev:0})},
sel(){AU.tone(700,.05,{type:'triangle',v:.05,rev:0});AU.nz(.03,{ft:'highpass',f:4000,v:.05})},
buy(){AU.tone(660,.1,{type:'triangle',v:.1});AU.tone(990,.2,{type:'triangle',v:.08,dl:.08,rev:.3})},
craft(){for(let i=0;i<3;i++){AU.tone(1200+i*40,.4,{type:'square',v:.03,dl:i*.18,rev:.5});AU.nz(.08,{ft:'highpass',f:3000,v:.2,dl:i*.18,rev:.4})}AU.tone(523,.8,{type:'triangle',v:.07,dl:.6,rev:.6});AU.tone(784,.9,{type:'triangle',v:.06,dl:.7,rev:.6})},
quest(){[392,523,659,784,1047].forEach((f,i)=>AU.tone(f,.7,{type:'triangle',v:.07,dl:i*.09,rev:.6}))},
ach(){[523,659,784].forEach((f,i)=>AU.tone(f,.6,{type:'triangle',v:.07,dl:i*.1,rev:.6}))},
hiss(x){AU.nz(2,{ft:'highpass',f:2500,v:.05,at:.3,pan:panOf(x),rev:.3})},
denied(){AU.tone(140,.12,{type:'square',v:.05})}};

// ---------- music sequencer ----------
const NOTE=n=>440*Math.pow(2,(n-69)/12);
const MUS={mode:'menu',layer:0,act:0,t:0,s:0,int:0,
bpm(){const m=this.mode;return m==='boss'?138:m==='camp'?92:m==='menu'?72:58+this.layer*5+this.act*6},
update(dt){if(!AU.ctx)return;this.t-=dt;let g=0;while(this.t<=0&&g++<4){this.tick(this.s++);this.t+=60/this.bpm()/4}},
kick(v){AU.tone(120,.28,{v:v||.3,f2:38,bus:'mus',rev:.1})},
snare(v){AU.nz(.16,{f:1900,q:.7,v:v||.18,bus:'mus',rev:.3});AU.tone(190,.07,{type:'triangle',v:.05,bus:'mus',rev:0})},
hat(v){AU.nz(.035,{ft:'highpass',f:7500,v:v||.04,bus:'mus',rev:0})},
pl(n,d,v,ty){AU.tone(NOTE(n),d,{type:ty||'triangle',v,bus:'mus',rev:.5,at:.008,lp:ty==='square'?1800:0})},
bell(n,d,v){AU.tone(NOTE(n),d,{v,bus:'mus',rev:1,at:.005});AU.tone(NOTE(n)*2.76,d*.5,{v:v*.3,bus:'mus',rev:1,at:.005})},
pad(n,d,v){AU.tone(NOTE(n),d,{v,bus:'mus',rev:.9,at:d*.3});AU.tone(NOTE(n)*1.005,d,{type:'triangle',v:v*.5,bus:'mus',rev:.9,at:d*.35,lp:900})},
bass(n,d,v){AU.tone(NOTE(n),d,{type:'sawtooth',v,bus:'mus',rev:.1,at:.005,lp:520})},
tick(s){const m=this.mode,b=s%16,bar=Math.floor(s/16);
 if(m==='menu'){const ch=[[50,53,57,60,64],[46,50,53,57,62],[41,45,48,53,57],[48,52,55,60,64]][bar%4],st=[0,3,6,10,13];if(b===0){this.pad(ch[0],6,.035);this.pad(ch[2]+12,6,.02)}const i=st.indexOf(b);if(i>=0)this.pl(ch[i]+12,2.5,.04);if(b===0||b===10)this.kick(.07)}
 else if(m==='camp'){const ch=[[53,57,60,65],[48,52,55,60],[50,53,57,62],[46,50,53,58]][bar%4];if(b%2===0)this.pl(ch[(b/2)%4]+12,.9,.042);if(b===0||b===8)this.bass(ch[0]-12,.45,.05);if(b%4===2)this.hat(.025);if(b===4||b===12)AU.nz(.08,{f:3000,q:.5,v:.035,bus:'mus',rev:.1});
  if(b===0&&bar%2===1){const mel=[72,74,77,79,81,84];for(let k=0;k<4;k++)AU.tone(NOTE(mel[ri(0,5)]),.5,{type:'sine',v:.03,dl:k*.33,bus:'mus',rev:.6})}}
 else if(m==='boss'){const r=(this.act?49:50)+[0,0,-2,-4][bar%4];if(b%4===0||b===14)this.kick(.32);if(b===4||b===12)this.snare(.2);if(b%2===1)this.hat(.035);const bl=[0,0,12,0,3,0,7,5];if(b%2===0){this.bass(r-12+bl[(b/2)%8],.2,.07);this.pl(r+12+[0,3,7,12,15,12,7,3][(b/2)%8],.22,.028,'square')}if(b===0&&bar%4===0)this.pad(r,4,.03)}
 else{const L=this.layer,A=this.act,root=(A?45:50)-L*2,sc=A?[0,1,4,5,7,8,10]:L<3?[0,3,5,7,10]:[0,1,3,6,7,10];
  if(s%32===0){this.pad(root-12,8,.03+L*.003);this.pad(root-12+sc[ri(1,sc.length-1)],8,.018)}
  if(L>=1&&(b===0||b===3))this.kick(.045+L*.012+this.int*.12);
  if(this.int>.3){if(b%2===0)this.bass(root-12+(b===8?sc[2]:0),.18,.045*this.int);if(b%4===2)this.hat(.02+this.int*.02);if(b===12&&this.int>.6)this.snare(.08)}
  if(b%4===0&&Math.random()<.22){const n=root+12+sc[ri(0,sc.length-1)]+(Math.random()<.3?12:0);if(A)this.bell(n,2.4,.03);else this.pl(n,2,.03,'sine')}
  if(A&&s%64===32)AU.nz(4,{f:500,f2:1200,q:3,v:.03,at:1.8,bus:'mus',rev:1})}},
set(m,L,A,force){const ch=m!==this.mode;if(m==='victory'){if(AU.ctx)[62,66,69,74,78,81,86].forEach((n,i)=>{AU.tone(NOTE(n),1.8,{type:'triangle',v:.07,dl:i*.12,bus:'mus',rev:.7});if(i%2===0)AU.tone(NOTE(n-24),1.8,{v:.06,dl:i*.12,bus:'mus',rev:.7})});m='camp'}
 if(ch)this.s=0;this.mode=m;this.layer=L||0;this.act=A||0;if(!AU.ctx)return;const t=AU.ctx.currentTime,fr=55*Math.pow(2,-((L||0)*2+(A||0)*3)/12),cave=m==='cave'||m==='boss';
 AU.drG.gain.setTargetAtTime(cave?.05:0,t,1);AU.dr[0].frequency.setTargetAtTime(fr,t,1);AU.dr[1].frequency.setTargetAtTime(fr*1.006,t,1);AU.amb.gain.setTargetAtTime(cave?.12:.03,t,1)}};
