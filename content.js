'use strict';
// Authored campaign data. Progression-critical objects are placed on guaranteed paths.
const ROOT_ITEMS = [
 ['amber','Amber Sap',85,[223,157,53]],['heartwood','Heartwood',110,[125,155,91]],
 ['memory','Memory Glass',220,[122,221,205]],['sunamber','Sunken Amber',420,[250,192,94]],
 ['seed','Worldseed Shard',1300,[195,237,152]],['pollen','Black Pollen',160,[131,106,148]],
 ['rootsteel','Rootsteel',310,[161,175,129]]
];
ROOT_ITEMS.forEach(([id,n,v,c],i)=>{ITEMS[id]={n,v,c,r:i===4?5:3};T[id.toUpperCase()]=30+i;dT(30+i,{ore:id,extra:3+i,mat:i===2?'crystal':'wood'})});
T.ROOT=15;T.SAP=45;dT(T.ROOT,{hp:13,mat:'wood'});dT(T.SAP,{solid:false,opaque:false,hp:0});
const rootLayer=(name,k,en)=>({name,rock:T.ROOT,wall:[[85,94,60],[109,79,37],[55,100,90],[53,68,47],[74,53,51]][k],alt:[45,58,48],floor:[[31,40,32],[58,43,25],[27,44,41],[25,32,27],[32,26,30]][k],amb:[.045,.052,.036],open:.5,ores:ROOT_ITEMS.map((_,i)=>[30+i,i===4?2:7,1,3]),en,lakes:k===1?7:2,moss:.5,shroom:0});
ACTS.push({name:'The Sunken Root',boss:'sovereign',seal:[8,8,8,8,8],layers:[
 rootLayer('Rootfall Descent',0,{rootstalker:5,leech:5,rootbat:4,ambershell:3}),
 rootLayer('The Amber Flood',1,{leech:7,pollenwitch:4,mimic:3,choir:2}),
 rootLayer('The Memory Grove',2,{memoryhusk:6,mimic:4,rootstalker:4,choir:3}),
 rootLayer('The Heartwood Labyrinth',3,{woodgolem:4,rootbat:5,pollenwitch:4,foreman:1}),
 rootLayer('The Root’s Heart',4,{woodgolem:3,memoryhusk:4,choir:3,ambershell:4})],hints:[
 'The roots listen. Mining and explosions raise <b>Root attention</b>. Rest or use light to calm it.',
 'Amber slows your steps. Carrying more than three sap samples calls the leeches.',
 'Follow the blue memories. Amber silhouettes remember things that never happened.',
 'Living gates can be cut, fed ore, or soothed with a flare. The main lift route stays open.',
 'Three memory nodes surround the Heart. Rescue them for the Accord, or study the old seal.']});
const RECIPES=[
 {id:'cbar',n:'Copper Bar',c:{coal:1,copper:3},use:'Projects, Prospector, utility tools'},
 {id:'ibar',n:'Iron Bar',c:{coal:2,iron:3},use:'Breaker, Bulwark, camp infirmary'},
 {id:'alloy',n:'Reinforced Alloy',c:{ibar:1,cbar:1},use:'Workshop, armor, bridges'},
 {id:'filament',n:'Conductive Filament',c:{gold:2,amethyst:1},use:'Signal tower, chain bolts'},
 {id:'lens',n:'Lens Core',c:{diamond:1,gold:2},use:'Deep Pulse, map room'},
 {id:'staralloy',n:'Star Alloy',c:{starmetal:1,diamond:1},use:'Pressure weave, mastery projects'},
 {id:'frostalloy',n:'Frost Alloy',c:{frostite:2,mythril:1},use:'Frostbrand, thermal packs'},
 {id:'voidalloy',n:'Void Alloy',c:{mythril:1,voidstone:1},use:'Void Reaver, memory recorder'},
 {id:'resin',n:'Living Resin',c:{amber:2,heartwood:2},use:'Rootcarver, garden, living bridge'},
 {id:'record',n:'Recorded Relic',c:{memory:2,relic:1},use:'Accord research, Echo Blade'}
];
RECIPES.forEach((r,i)=>{ITEMS[r.id]={n:r.n,v:40+i*75,c:[151+i*7,158,120+i*7],r:2,refined:true}});
const ENCHANTS={
 pick:[{id:'prospector',n:'Prospector',tag:'ORE',d:'Every third mined ore yields an extra piece. Mining power −15%.',c:{cbar:2}},
 {id:'breaker',n:'Breaker',tag:'NOISE',d:'Mining power +35%; mining alerts twice as far.',c:{ibar:2}},
 {id:'silent',n:'Silent Grip',tag:'RESCUE',d:'Mining noise −75%; Root attention gain −65%.',c:{cbar:1,chitin:4}},
 {id:'pulse',n:'Deep Pulse',tag:'LIGHT',d:'Free scanner; reveals all landmark directions.',c:{lens:1}},
 {id:'rootcarver',n:'Rootcarver',tag:'ROOT',d:'Double damage to living wood; sap does not slow you.',c:{resin:2,rootsteel:2}}],
 sword:[{id:'ripper',n:'Ripper',tag:'NOISE',d:'Hits inflict 6 bleed damage over 3 seconds.',c:{ibar:1,chitin:3}},
 {id:'bulwark',n:'Bulwark',tag:'RESCUE',d:'Take 40% less direct damage while swinging; strikes stagger.',c:{ibar:2}},
 {id:'frostbrand',n:'Frostbrand',tag:'FROST',d:'Every melee hit slows enemies for 2.5 seconds.',c:{frostalloy:1}},
 {id:'echo',n:'Echo Blade',tag:'VOID',d:'Each hit echoes for 40% damage after 0.6 seconds.',c:{record:1}}],
 bow:[{id:'pierce',n:'Piercing Bolts',tag:'ORE',d:'Shots pass through two additional enemies.',c:{alloy:1}},
 {id:'chain',n:'Chain Arc',tag:'LIGHT',d:'A hit jumps for 50% damage to one nearby enemy.',c:{filament:2}},
 {id:'frost',n:'Frost Volley',tag:'FROST',d:'All ranged hits slow targets; projectile speed −20%.',c:{frostalloy:1}}],
 armor:[{id:'porter',n:'Porter Harness',tag:'ORE',d:'+8 backpack slots; movement speed −10%.',c:{alloy:1}},
 {id:'pressure',n:'Pressure Weave',tag:'VOID',d:'Environmental damage −50%.',c:{staralloy:1}},
 {id:'rescue',n:'Rescue Weave',tag:'RESCUE',d:'Save three extra items on death; rope channel takes 2 seconds.',c:{cbar:2,chitin:5}}]
};
const PROJECTS=[
 {id:'forge',n:'Forge',who:'Bera',x:76,y:82,c:{copper:4,coal:3},m:35,d:'Bera lights the second hearth. Enchantments are now available.',benefit:'Unlock weapon branches.'},
 {id:'smelter',n:'Refinery',who:'Orrin',x:174,y:82,c:{copper:3,coal:3},m:25,d:'Orrin returns to the furnace. Nothing valuable leaves as slag.',benefit:'Refine ores, purify and overheat.'},
 {id:'workshop',n:'Workshop',who:'Pip',x:282,y:82,c:{cbar:2},m:90,d:'Pip hangs a bridge kit over the door. Test it before you trust it.',benefit:'Bridges, decoys, thermal packs and recorders.'},
 {id:'infirmary',n:'Infirmary',who:'Ada',x:76,y:184,c:{ibar:2},m:100,d:'Ada unfolds a clean blanket. Coming home counts as courage.',benefit:'+20 maximum HP; save one extra item on death.'},
 {id:'map',n:'Map Room',who:'Tess',x:390,y:82,c:{cbar:2},m:80,d:'Tess marks the safe shafts in gold.',benefit:'Start with 30 extra oil; choose optional destinations.'},
 {id:'archive',n:'Archive',who:'Nell',x:174,y:274,c:{iron:3},m:45,d:'Nell puts Iona’s ribbon beside the charter. Names come before numbers.',benefit:'Study records; discover alternate resolutions.'},
 {id:'board',n:'Contract Board',who:'Marrow',x:274,y:184,c:{copper:2},m:30,d:'Marrow signs his own name beneath yours. No more anonymous losses.',benefit:'+25% contract cash rewards.'},
 {id:'training',n:'Training Yard',who:'Joss',x:480,y:184,c:{chitin:4},m:50,d:'Joss paints a target. Better bruises here than silence below.',benefit:'Test build damage safely; +10% melee damage.'},
 {id:'gallery',n:'Relic Gallery',who:'Vela',x:282,y:274,c:{fossil:1,cbar:1},m:100,d:'Vela leaves an empty shelf for what you have not found yet.',benefit:'+1 backpack slot per three collected relics (up to 5).'},
 {id:'tower',n:'Signal Tower',who:'Finch',x:480,y:82,c:{filament:2},m:160,d:'Finch hears a second rhythm underneath Iona’s signal.',benefit:'Choose expedition conditions and share daily seeds.'},
 {id:'garden',n:'Root Garden',who:'Iona',x:390,y:274,c:{resin:2,seed:1},m:300,d:'Iona plants the seed without asking it for anything.',benefit:'Unlock Accord research; +45 oil in the Root.'}
];
const CONTRACTS=[
 ['relay','Iona’s Last Signal','Mine copper by the lift, repair Iona’s brass relay, then bring her memory home.','object',1,100],
 ['rescue','A Voice in the Stone','Free a trapped worker; escort their signal home.','rescue',1,150],
 ['copper','Copper for the Hearth','Bank 6 Copper Ore.','copper',6,100],
 ['coal','Keep the Fires Lit','Bank 6 Coal.','coal',6,90],
 ['hunt','Cull the Brood','Defeat 4 creatures and extract.','kills',4,130],
 ['nest','Quiet the Nursery','Destroy a nest and extract.','nest',1,160],
 ['beacon','Light the Way','Repair a beacon with 20 seconds of oil.','beacon',1,150],
 ['survey','Surveyor’s Footsteps','Explore 180 floor tiles and extract.','map',180,140],
 ['cache','The Sealed Payroll','Open a sealed cache and return its records.','cache',1,180],
 ['fragile','Glass, Unbroken','Recover a fragile lens; take no damage after pickup.','fragile',1,220],
 ['fast','Before the Bell','Find the dispatch and extract within 4 minutes.','speed',1,180],
 ['care','An Unopened Bottle','Recover medicine without drinking a tonic.','tonicless',1,190],
 ['greed','Every Pocket Full','Extract with a full backpack.','full',1,220],
 ['fossil','Before the Mine','Return a fossil from a fossil wall.','fossil',1,180],
 ['relic','A Name, Not a Number','Recover a memorial relic.','relic',1,230],
 ['shrine','The Ancient Debt','Make an offering at a shrine.','shrine',1,240],
 ['iron','Shore up the Shafts','Bank 5 Iron Ore.','iron',5,180],
 ['crystal','A Singing Sample','Bank 3 Amethyst.','amethyst',3,220],
 ['cold','Cold Evidence','Bank 3 Frostite.','frostite',3,260],
 ['memory','Unforgotten','Rescue a memory echo.','echorescue',1,300],
 ['sap','Liquid Sunlight','Bank 4 Amber Sap; leeches follow heavy loads.','amber',4,300],
 ['silence','Leave No Echo','Recover a record with Root attention below 40.','quiet',1,350],
 ['return','The Old Promise','Carry a relic to an earlier-act archive.','return',1,400],
 ['master','The Long Way Home','Defeat an act boss and extract.','boss',1,600]
].map(([id,n,d,kind,goal,reward])=>({id,n,d,kind,goal,reward}));
const CONDITIONS=[
 {id:'calm',n:'Still Air',d:'Ordinary cave conditions.'},
 {id:'rich',n:'Mineral Bloom',d:'Double ore yield; 25% less starting oil.'},
 {id:'migration',n:'The Migration',d:'More patrols; each kill restores 3 oil.'},
 {id:'echoes',n:'Echo Night',d:'Landmarks glow at any distance; enemy detection doubles.'},
 {id:'blackout',n:'Lantern Pilgrimage',d:'Half lamp radius; start with 5 extra flares.'}
];
const VARIANTS=[
 ['rust','The Rustworks',0,'beacon','Machinery wakes when the beacon is repaired. Oil +35; two guardians wake.'],
 ['ash','The Ashen Quarry',0,'vein','Loose ceilings shelter a rich fossil vein.'],
 ['shaft','The Forgotten Shaft',0,'archive','Old records reveal who signed the first mining charter.'],
 ['redwater','The Redwater Cut',0,'pump','Drain a mineral flood or cross it for a cache.'],
 ['glass','The Glass Glacier',1,'cache','Thin ice hides a supply cache. Explosions break its contents.'],
 ['whiteout','The Whiteout Shelf',1,'beacon','Restore a light to recover oil in the whiteout.'],
 ['cathedral','The Spore Cathedral',1,'garden','Harvest spores or protect the colony for a blessing.'],
 ['blue','The Blue Ruins',1,'shrine','A frozen shrine remembers the King as a jailer.'],
 ['market','The Black Market Camp',-1,'merchant','Trade health for supplies or pay with ore.'],
 ['deep','The Deep Archive',-1,'archive','Trade a relic for an older memory.'],
 ['mirror','The Mirror Cave',-1,'echo','Blue echoes guide; amber echoes summon.'],
 ['colossus','The Sleeping Colossus',-1,'nest','The walls breathe. Leave quietly or provoke its keeper.'],
 ['starfall','The Starfall Chamber',-1,'vein','Star ore shines beneath an unstable ceiling.']
].map(([id,n,a,event,d])=>({id,n,a,event,d}));
const RELICS=[
 ['ribbon','Iona’s Blue Ribbon','She tied it around the relay so Marrow would know.'],
 ['whistle','Hal’s Whistle','Three notes mean: bring everyone home.'],
 ['charter','The Original Charter','Marrow’s signature authorized the first broken seal.'],
 ['tooth','Brood Tooth','The brood fed on the mine’s poisoned runoff.'],
 ['compass','Tess’s Compass','It points down, even in daylight.'],
 ['fossil','Leaf in Stone','A leaf older than the mountain.'],
 ['bell','The Quiet Bell','The King used silence to keep the Root asleep.'],
 ['mask','A Medic’s Mask','Ada’s mother worked in the flooded shaft.'],
 ['lens','The Witness Lens','It remembers light after the lamp is gone.'],
 ['crown','Crown Splinter','A jailer’s burden, mistaken for a throne.'],
 ['seed','The First Seed','It still dreams of rain.'],
 ['glass','Iona’s Memory','She followed the voices to keep them from being forgotten.'],
 ['badge','The Foreman’s Badge','Rusk refused to leave his crew behind.'],
 ['song','Choir Shell','The Root speaks in the voices it has saved.'],
 ['heart','Heart of the World','Something living has trusted you with its future.']
];
const BEATS={
 inheritance:['Blackwood · your grandfather’s journal','Forty years ago, the company buried his name with the collapse. His last pages describe a fissure below the worked seam. Ten years at the scrapyard bought the deed back. The mine belongs to you now.'],
 arrival:['Old Marrow','You’re the recovery miner. My niece Iona went below with my old relay. Last night it tapped her name.'],
 descent:['Your field log','Mine copper beside the lift. The relay beyond the blue lamps needs two pieces, or you can risk taking its battery. Bring the signal home.'],
 ore:['Iona · recording','Copper carries the signal. Please, leave enough for the lamps.'],
 enemy:['Old Marrow · radio','Watch its shoulders. When it shudders, move sideways. Then strike.'],
 object:['Iona · relay','Uncle, the miners aren’t dead. Something is keeping their memories. Don’t send the cutters.'],
 extraction:['Old Marrow','That is her ribbon. I signed the order that opened this place. Help me bring them home.'],
 lift:['Tess','A restored lift is a promise: next time, we start here.'],
 flood:['Ada · radio','My mother drowned in this shaft. Her last message said the water was warm.'],
 crystal:['Nell · radio','The crystals repeat voices. Someone was recording this long before us.'],
 shrine:['The Stone Witness','We sealed a wound. You sold the bandages.'],
 relic:['Vela','Keep the name with the object. Treasure without a name is just theft.'],
 broodEntry:['Your field log','Empty tonic bottles line the nest. The brood grew where our waste ran down.'],
 brood:['Old Marrow','We poisoned her water. Killing her opened the ice, but it did not make us innocent.'],
 frozen:['Tess','Ice bends your steps. The ghosts fear flares more than steel.'],
 wraith:['Edda · echo','Do not break the crown. He was holding the door shut.'],
 mycel:['Pip · radio','These mushrooms grow toward voices, not light.'],
 kingEvidence:['The Warden’s Record','A king was chosen to remember the seal. A crown was chosen to forget the man.'],
 core:['Your field log','The pillars are roots turned to stone. Something below them is still warm.'],
 kingReveal:['The Hollow King','I have kept your hunger from waking its hunger. Who will stand watch when I fall?'],
 king:['The Hollow King','Beneath me: the Sunken Root. I was never its master. Only its lullaby.'],
 root:['Iona · echo','I came to rescue them. Now it remembers me, too.'],
 marrowMemory:['Young Marrow · memory','The charter says the ground belongs to us. Nobody asked what was already living in it.'],
 sovereign:['The Root Choir','You call it ore. We call it yesterday. What have you come to take?'],
 resolution:['Iona','Tell them what it cost. And when they ask if it was worth it, let them answer.']
};
const LANDMARKS=[
 ['shelter','Miner Shelter','Hal','There is room for one more name on this wall.'],
 ['lift','Collapsed Lift','Tess','The counterweight is good. The supports are not.'],
 ['cache','Locked Supply Cache','Orrin','The seal is intact. Something has scratched it from inside.'],
 ['beacon','Rescue Beacon','Finch','Three taps. A pause. Three taps.'],
 ['shrine','Ancient Shrine','Stone Witness','Offer light, and walk without fear.'],
 ['rails','The Last Cart','Rusk','We sent the ore up. We stayed.'],
 ['ritual','Ritual Chamber','Edda','The circle held until someone mined the silver.'],
 ['fossil','Fossil Wall','Vela','A tree under a mountain. Think about that.'],
 ['nest','Creature Nursery','Iona','The small ones have not learned to fear us yet.'],
 ['garden','Spore Garden','Pip','We can harvest it. Or learn why it grows here.'],
 ['temple','Ice Temple','The Warden','Warm hands broke a cold promise.'],
 ['gallery','Crystal Gallery','Nell','Every shard is a voice. None of them are singing.'],
 ['observatory','Void Observatory','The King','The stars below are older than the stars above.'],
 ['archive','Sealed Archive','Nell','The original charter names Marrow as supervisor.'],
 ['pump','Flooded Machinery','Orrin','A little oil could move a great deal of water.'],
 ['workshop','Golem Workshop','Bera','They were built to protect workers. Something changed the order.'],
 ['memorial','The Miner Tree','Iona','All our names. Even the ones the camp forgot.'],
 ['echo','Marrow’s First Descent','Young Marrow','I thought we could stop whenever we wanted.'],
 ['court','Root Courtroom','The Choir','We remember what you carried. We also remember what you left.'],
 ['nursery','Root Nursery','Iona','It is not too late to plant something instead.']
].map(([id,n,voice,line])=>({id,n,voice,line}));
const MASTERY=[['miner','Mine 100 ore across expeditions',100],['rescuer','Bring home 5 workers or echoes',5],['scholar','Discover 15 relics',15],['hunter','Defeat 100 creatures',100],['builder','Restore every camp station',11],['old','Extract from the Old Mine 5 times',5],['ice','Extract from the Frozen Deep 5 times',5],['root','Extract from the Sunken Root 5 times',5],['contracts','Complete 12 contracts',12],['endings','Witness all three resolutions',3]];
// Early gear arrives within the opening chapter, then costs still require planning.
PICKS[1].c={copper:4,coal:3};PICKS[1].m=35;SWORDS[0].c={copper:4,coal:2};SWORDS[0].m=40;
MODS.push({id:'nomad',n:'Nomad’s Lantern',d:'No tonics. Each discovered landmark heals 12 HP.'},{id:'oath',n:'Keeper’s Oath',d:'Double contract rewards; market prices halved.'});

// Frozen roles make navigation, light and timing matter independently of weapon tier.
ACTS[1].layers[0].en.skater=4;ACTS[1].layers[1].en.frostchoir=2;ACTS[1].layers[2].en.mirrorling=3;
ENCHANTS.pick.find(e=>e.id==='rootcarver').c.sunamber=1;
const REQUESTS={
 forge:{n:'Bera · Learn the Opening',d:'Defeat 4 creatures. Bera wants proof you can read a charge.',ready:()=>S.stats.kills>=4,reward:'A Copper Bar and a tonic',grant:()=>{S.mats.cbar=(S.mats.cbar||0)+1;S.cons.tonic++}},
 map:{n:'Tess · Leave a Way Back',d:'Restore a second lift in the Old Mine.',ready:()=>S.unl[0]>=2,reward:'A Lens Core and Tess’s compass',grant:()=>{S.mats.lens=(S.mats.lens||0)+1;relic('compass')}},
 infirmary:{n:'Ada · One More Chair',d:'Bring one miner or memory safely home.',ready:()=>S.exp.rescues>=1,reward:'Three tonics and Ada’s mask',grant:()=>{S.cons.tonic+=3;relic('mask')}},
 archive:{n:'Nell · Read the Fine Print',d:'Recover the original mining charter from an archive.',ready:()=>S.exp.relics.charter,reward:'A Recorded Relic and seal research',grant:()=>{S.mats.record=(S.mats.record||0)+1;S.exp.flags.seal=true}},
 tower:{n:'Finch · A Familiar Voice',d:'Return with Iona’s relay signal.',ready:()=>S.exp.flags.extraction,reward:'A Conductive Filament',grant:()=>{S.mats.filament=(S.mats.filament||0)+1}},
 gallery:{n:'Vela · Give It a Name',d:'Discover five objects with personal histories.',ready:()=>Object.keys(S.exp.relics).length>=5,reward:'An Ancient Relic and $100',grant:()=>{S.mats.relic=(S.mats.relic||0)+1;S.money+=100}}
};
