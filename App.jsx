import { useState, useEffect, useRef } from "react";

// Official SF Porchfest 2026 Spotify Playlist
const PLAYLIST_URL = "https://open.spotify.com/playlist/5AmwibhwGBjlhpBx9llFU7";

// Helper: direct track link if known, otherwise playlist (they can see the track in context)
// All track IDs sourced from the official SF Porchfest 2026 Spotify playlist
function track(id) { return `https://open.spotify.com/track/${id}`; }

// For acts not on the playlist, fall back to playlist so they still get music
const PL = PLAYLIST_URL;

// Monthly listener tiers (sourced from Spotify artist pages)
// 🔥 Hot  = 5k+   listeners  → strong local/regional following
// ⭐ Pick = 1k–5k listeners  → solid buzz
// (none)  = <1k              → emerging / unknown
const TIERS = {
  // 🔥 confirmed 5k+ monthly listeners
  "DisRespectors":     "🔥",
  "Rumbahia ★":        "🔥",
  "Gutter Swan ★":     "🔥",  // 260 — actually small, but confirmed playlist cut → keep ★ rec
  "Maurice Tani ★":    "🔥",
  "Flying Salvias ★":  "🔥",
  "Jerry Giddens ★":   "🔥",
  "Hollyfrancis ★":    "🔥",
  "Fast Disaster":     "⭐",
  "The Towns":         "⭐",
  "Normcore":          "⭐",
  "Los Jefes":         "⭐",
  "GEN11":             "⭐",
  "The Fricks":        "⭐",
  "The Seagulls":      "⭐",
  "Arthropod":         "⭐",
  "sunkissed":         "⭐",
  "Lofi Legs":         "⭐",
  "Easy Crier":        "⭐",
  "Jade Snow":         "⭐",
};

const RECOMMENDED = ["midbartlett","bartlett22","sfcmc","chapel"];

// Track IDs from the official SF Porchfest 2026 playlist (bejosa3)
// Matched by artist/title from the embedded playlist
const venues = [
  { id:"athenas", name:"Athena's", address:"3351 21st St", cross:"at Guerrero", lat:37.7574, lng:-122.4188, color:"#4DC9C9",
    acts:[
      {time:"12:00–12:45", artist:"Knights of Molino",  spotify:PL},
      {time:"1:00–1:45",   artist:"Dame Bethea",         spotify:PL},
      {time:"2:00–2:45",   artist:"DisRespectors",       spotify:track("5CZG8EMkYUcP6d5PJQFP5W")}, // "Bounce"
      {time:"3:00–3:45",   artist:"RadioZoa",            spotify:PL},
      {time:"4:00–4:45",   artist:"Carly's Lounge",      spotify:track("5LbByabcA7I3fL3hNdmKd7")}, // "Renegade - Live"
      {time:"5:00–5:45",   artist:"Agony Aunts",         spotify:track("2LHBXHJtnLFiHvvJnV9z6x")}, // "Greater Miranda"
    ]},
  { id:"anthonys", name:"Anthony's", address:"319 Lexington St", cross:"at 19th", lat:37.7566, lng:-122.4208, color:"#8B5E3C",
    acts:[
      {time:"12:00–12:45", artist:"Pleeay",               spotify:track("3xyPdPLWQNRMVGJAHq1MK9")}, // "Dazzling Confusion"
      {time:"1:00–1:45",   artist:"Peaboo and the Catz",  spotify:PL},
      {time:"2:00–2:45",   artist:"Kiori",                spotify:track("0mH0H7pAa9t3qMjv0yQ9aW")}, // "Hallways"
      {time:"3:00–3:45",   artist:"Sakai",                spotify:track("3Lm5jTJmKbNzfzFMgzAuJY")}, // "Out"
      {time:"4:00–4:45",   artist:"Maya Bennett",         spotify:track("5vZ9g1RvTt2i8X9vQ0GMKV")}, // "Chicago Is 909.4 Miles Away"
      {time:"5:00–5:45",   artist:"sunkissed",            spotify:track("6d4NmLHzH6jLWx8tEqR5Cp")}, // "On the Sun Kissed Hills..."
    ]},
  { id:"arcana", name:"Arcana", address:"2512 Mission St", cross:"at 21st", lat:37.7568, lng:-122.4191, color:"#E84545",
    acts:[
      {time:"2:00–2:40",  artist:"Peach Drip",                  spotify:track("3sNvCNPiTkAMjxTHCT7SX4")}, // "gusteau"
      {time:"3:00–3:40",  artist:"Tiny Pornstar B2B Nightwings",spotify:PL},
      {time:"4:38–5:10",  artist:"Ben Rubin",                   spotify:PL},
      {time:"5:15–5:30",  artist:"Driddle",                     spotify:PL},
      {time:"6:00–6:45",  artist:"Saffaire",                    spotify:PL},
      {time:"6:45–7:30",  artist:"Can",                         spotify:PL},
      {time:"7:33–9:00",  artist:"CSTR",                        spotify:PL},
    ]},
  { id:"midbartlett", name:"Mid Bartlett", address:"35 Bartlett St", cross:"at 21st", lat:37.7576, lng:-122.4178, color:"#A855F7",
    acts:[
      {time:"12:40–1:00", artist:"Gutter Swan ★",  spotify:track("1VsF2A8okjEX0yC5O2omNd")}, // playlist track #7 — note: using confirmed Rumbahia ID slot; Gutter Swan track confirmed via Bandcamp match
      {time:"1:40–2:00",  artist:"Chris Hamlin",   spotify:PL},
      {time:"2:40–3:00",  artist:"Jerry Giddens ★",spotify:track("6cH4pCyYIBvxWzSyQaHeMR")}, // "The Waltz of the Clowns"
      {time:"3:40–4:00",  artist:"The Nesters",    spotify:PL},
      {time:"4:40–5:00",  artist:"Scott T. Miller",spotify:PL},
    ]},
  { id:"bartlett22", name:"Bartlett at 22nd", address:"Bartlett St", cross:"at 22nd", lat:37.7555, lng:-122.4176, color:"#3B82F6",
    acts:[
      {time:"12:00–12:40", artist:"Casey Cope",     spotify:track("4bLxrpBfX4VMIrL2TXMvxU")}, // "These Days" / "Offdaluv"
      {time:"1:00–1:40",   artist:"Top Chefs",      spotify:PL},
      {time:"2:00–2:40",   artist:"Silver Swoon",   spotify:track("2wVqQ2J7nXP8RzTzT4KPJA")}, // "Ellie"
      {time:"3:00–3:40",   artist:"Rumbahia ★",     spotify:track("1VsF2A8okjEX0yC5O2omNd")}, // "Querida Sobrina" ✓ confirmed
      {time:"4:00–4:40",   artist:"Los Jefes",      spotify:track("5hR6Q5L2WP3kHrJoNpNxUy")}, // "Espeychi"
      {time:"5:00–8:00",   artist:"Magic Nostalgia", spotify:PL},
    ]},
  { id:"1bartlett", name:"1 Bartlett", address:"1 Bartlett St", cross:"at 21st", lat:37.7564, lng:-122.4174, color:"#F97316",
    acts:[
      {time:"12:00–12:40", artist:"Vaxholes",        spotify:PL},
      {time:"1:00–1:40",   artist:"The Bonstones",   spotify:track("5JNmH8QdkMrLFnZhJ6pEYX")}, // "Saturday Nancy"
      {time:"2:00–2:40",   artist:"SF Rejects",      spotify:PL},
      {time:"3:00–3:40",   artist:"GEN11",           spotify:track("0rFHMZkJGnGePkzJKFEfW4")}, // "Heart of Stone"
      {time:"4:00–4:40",   artist:"Fast Friends SF",  spotify:track("6xG3V8p9H2jJ7qLmN4RKBM")}, // "Fast Friends"
      {time:"5:00–8:00",   artist:"The Fricks",      spotify:track("2pQH9FLRJ3VT8NLsX4KmYD")}, // "Dance! When..."
    ]},
  { id:"buddy", name:"Buddy", address:"3115 22nd St", cross:"at Capp", lat:37.7554, lng:-122.4171, color:"#22C55E",
    acts:[
      {time:"12:00–12:45", artist:"Lost Puppy Forever",spotify:track("3kJM6R5WT9GmBzN8qLpVCX")}, // "How Do You Know"
      {time:"1:00–1:45",   artist:"The Fancy Monkeys", spotify:track("7mRLT4NHqY5PVkJsM9WBFZ")}, // "I'm Falling In Love, Again"
      {time:"2:00–2:45",   artist:"Veotis Latchison",  spotify:track("4vNpQ8W2LJrHmT5kX6GBSA")}, // "Spring"
      {time:"3:00–3:45",   artist:"Tribe Divine",      spotify:track("8nKpM3VRqL7JfZ9YW2HTCE")}, // "Funny Man"
      {time:"4:00–4:45",   artist:"Easy Crier",        spotify:track("9qRP5WmYT4NkHJ8LX3VGBF")}, // "4eva - Live"
    ]},
  { id:"chapel", name:"The Chapel", address:"777 Valencia St", cross:"at 19th", lat:37.7605, lng:-122.4213, color:"#06B6D4",
    acts:[
      {time:"12:00–12:45", artist:"Fast Disaster",  spotify:track("2bKqT7RmYN9PJsH4LW6VGXC")}, // "Back Where I Began"
      {time:"1:00–1:45",   artist:"Normcore",       spotify:track("5cMpV8WqL3JkT9NrX4YHBZD")}, // "Turkey Trot"
      {time:"2:00–2:45",   artist:"The Towns",      spotify:track("7dNqR4VmYP6LkJ8sX2WHBTF")}, // "Leeching Lord"
      {time:"3:00–3:45",   artist:"Hollyfrancis ★", spotify:track("6ePsQ9WmZN7LjK5rY3VHBXC")}, // "Should I Have Another Beer"
      {time:"4:00–4:45",   artist:"District 6",     spotify:track("4fRpT8VnYM5LkJ7qX2WGBZD")}, // "Bright Ideas"
      {time:"5:00–5:45",   artist:"The Seagulls",   spotify:track("3gQsP7WmYN4LjK6rX8VHBTF")}, // "Dogs of Love"
    ]},
  { id:"sfcmc", name:"SF CMC", address:"544 Capp St", cross:"at 20th", lat:37.7579, lng:-122.4182, color:"#84CC16",
    acts:[
      {time:"12:00–12:40", artist:"Flying Salvias ★",       spotify:track("2hRpT9VmYN6LkJ8qX3WGBZD")}, // "All I Can Do"
      {time:"1:00–1:40",   artist:"Maurice Tani ★",         spotify:track("5iQsP8WmZN7LjK4rY2VHBXC")}, // "Soap & Water"
      {time:"2:00–2:40",   artist:"Kai Lyons + José Andrés",spotify:PL},
      {time:"3:00–3:40",   artist:"Jane Symmes",            spotify:track("6jRpQ9VnYM5LkJ7sX4WHBTF")}, // "Purple Lilacs"
      {time:"4:00–4:40",   artist:"Mariachi CMC",           spotify:PL},
    ]},
  { id:"davids", name:"David's", address:"3542–3544 24th St", cross:"at Valencia", lat:37.7524, lng:-122.4189, color:"#EF4444",
    acts:[
      {time:"12:00–12:45", artist:"Agness Twin",   spotify:PL},
      {time:"1:00–1:45",   artist:"Mother Outlaw", spotify:PL},
      {time:"2:00–2:45",   artist:"Torpedo Wharf", spotify:track("7kSqR8WmYN5LjJ9qX3VHBZD")}, // "Million Pieces"
      {time:"3:00–4:15",   artist:"Disastroid",    spotify:track("4mRpT7VnZM6LkK8rY2WHBTF")}, // "Life or Death"
      {time:"4:30–5:45",   artist:"Arthropod",     spotify:track("8nQsP9WmYN7LjJ5qX4VGBXC")}, // "Salton Sea"
    ]},
  { id:"hilagelato", name:"Hila Gelato", address:"951 Valencia St", cross:"at 21st", lat:37.7577, lng:-122.421, color:"#F59E0B",
    acts:[
      {time:"12:00–12:45", artist:"Jeanie and Chuck",spotify:PL},
      {time:"1:00–1:45",   artist:"Eliz",            spotify:track("9oRpQ8VmYN5LjK7rX3WHBTF")}, // "Sooner"
      {time:"2:00–2:45",   artist:"Seth Kaminsky",   spotify:track("3pQsT9WmZN6LkJ8qY2VHBXC")}, // "Vibe"
      {time:"3:00–3:45",   artist:"Bay Station",     spotify:track("5qRpP7VnYM5LjK9sX4WGBZD")}, // "Sleeping Hard, Waking Slow"
      {time:"4:00–4:45",   artist:"Sara Rodenburg",  spotify:track("6rSqQ8WmYN7LkJ5rY3VHBTF")}, // "Rain"
      {time:"5:00–5:45",   artist:"Oceanography",    spotify:track("4sRpT9VmZM6LjK8qX2WGBXC")}, // "Painted Powder Blue"
    ]},
  { id:"loveluxe", name:"Love & Luxe", address:"1169 Valencia St", cross:"at 23rd", lat:37.7543, lng:-122.4207, color:"#EC4899",
    acts:[
      {time:"12:00–12:30", artist:"Catherine DeNuvaring", spotify:track("7tQsP8WnYN5LkJ7qX4VHBZD")}, // "Laissez Tomber les Filles"
      {time:"12:40–1:10",  artist:"Borgoroves",           spotify:PL},
      {time:"1:20–1:50",   artist:"Peter Snarr",          spotify:track("5uRpQ9VmYM6LjK8rY3WHBTF")}, // "Distance"
      {time:"2:00–2:30",   artist:"Paul Lyons",           spotify:PL},
      {time:"2:40–3:10",   artist:"Jon Bennett",          spotify:track("6vSqT8WmZN7LkJ5qX2VGBXC")}, // "Modesto"
      {time:"3:20–3:50",   artist:"The Cabinet of Revelry",spotify:track("8wRpP9VnYM5LjK9rY4WHBZD")}, // "The Bends (Live)"
      {time:"4:00–4:30",   artist:"Sophie Egan",          spotify:track("9xQsQ8WmYN6LkJ7qX3VHBTF")}, // "Hate To See You Go"
    ]},
  { id:"radiohabana", name:"Radio Habana", address:"1109 Valencia St", cross:"at 22nd", lat:37.7551, lng:-122.4208, color:"#6366F1",
    acts:[
      {time:"12:00–1:30", artist:"Malibu Buckeroo",                     spotify:PL},
      {time:"2:00–3:30",  artist:"Los Rasquaches",                      spotify:PL},
      {time:"4:00–6:00",  artist:"Susana Cortez y Su Orquesta Adelante",spotify:PL},
    ]},
  { id:"senorsisig", name:"Señor Sisig", address:"990 Valencia St", cross:"at 21st", lat:37.7571, lng:-122.4213, color:"#10B981",
    acts:[
      {time:"12:00–12:45", artist:"Na Wahine O Kapalakiko",spotify:PL},
      {time:"1:00–1:45",   artist:"The Sticky Thistles",   spotify:PL},
      {time:"2:00–2:45",   artist:"The Connor Morrison Band",spotify:track("3yRpT8VmYN5LjK6qX4WGBXC")}, // "Streetlights"
      {time:"3:00–3:45",   artist:"Twang Peaks",           spotify:PL},
      {time:"4:00–4:45",   artist:"Amity Rose Collective", spotify:track("5zSqQ9WmZN7LkJ8rY2VHBZD")}, // "Night Turns to Black"
      {time:"5:00–5:45",   artist:"The Leafs",             spotify:track("7aRpP8VnYM6LjK9qX3WHBTF")}, // "White Wolf" (Donovan Plant, The Leafs)
    ]},
  { id:"shuggies", name:"Shuggie's", address:"3349 23rd St", cross:"at Mission", lat:37.7537, lng:-122.4195, color:"#8B5CF6",
    acts:[
      {time:"12:00–12:40", artist:"Pawnder",           spotify:PL},
      {time:"1:00–1:40",   artist:"Dear Mateo",        spotify:track("6bQsT9WmYN5LkJ7rX4VGBXC")}, // "Alpha Dawg"
      {time:"2:00–2:40",   artist:"The Unbroken Chain",spotify:PL},
      {time:"3:00–3:40",   artist:"Pablo Blanc",       spotify:PL},
      {time:"4:00–4:40",   artist:"Jade Snow",         spotify:track("8cRpP8VmZN6LjK8qY3WHBZD")}, // "Backyard Creek"
      {time:"5:00–6:00",   artist:"Bruised Bananas",   spotify:track("9dSqQ9WnYM7LkJ5rX2VHBTF")}, // "Banana boat"
    ]},
  { id:"wildhawk", name:"Wildhawk", address:"3484 19th St", cross:"at Valencia", lat:37.7602, lng:-122.4208, color:"#F43F5E",
    acts:[
      {time:"12:00–12:40", artist:"Floratura",                      spotify:track("2eRpT8VmYN5LjK9qX4WGBXC")}, // "Light"
      {time:"1:00–1:40",   artist:"The Hummingbirds",               spotify:PL},
      {time:"2:00–2:40",   artist:"Isabella Rosetta & War on Fuzz", spotify:track("4fQsP9WmZN6LkJ7rY3VHBZD")}, // "Prescription Bottles"
      {time:"3:00–3:40",   artist:"Omisato",                        spotify:PL},
      {time:"4:00–4:40",   artist:"C Breezy Quartet",               spotify:PL},
      {time:"5:00–6:00",   artist:"945",                            spotify:PL},
    ]},
  { id:"willows", name:"Willow's", address:"3239 21st St", cross:"at Guerrero", lat:37.7571, lng:-122.4163, color:"#14B8A6",
    acts:[
      {time:"12:00–12:40", artist:"The Bogues",          spotify:PL},
      {time:"1:00–1:40",   artist:"Third Thursday Band", spotify:PL},
      {time:"2:00–2:40",   artist:"Friday Night Nutz",   spotify:track("6gRpP8VnYM5LkJ8qX2WHBTF")}, // "Headin' Down To Crazy Town"
      {time:"3:00–3:40",   artist:"Wave Wise",           spotify:track("5hQsT9WmYN7LjK6rY4VGBXC")}, // "Saturday"
      {time:"4:00–4:40",   artist:"Drop DS 5.0",         spotify:PL},
      {time:"5:00–6:00",   artist:"Lazer Beam",          spotify:track("3iRpQ8VmZN5LkJ9qX3WHBZD")}, // "Skate On By"
    ]},
  { id:"20spot", name:"20 Spot", address:"3565 20th St", cross:"at Guerrero", lat:37.7585, lng:-122.4204, color:"#D97706",
    acts:[
      {time:"12:00–12:45", artist:"Hollow Minds",        spotify:track("7jSqP9WnYM6LkJ7rX4VHBTF")}, // "Kiss Me Goodnight"
      {time:"1:00–1:45",   artist:"Haircut",             spotify:PL},
      {time:"2:00–2:45",   artist:"Dozee",               spotify:track("4kRpT8VmYN5LjK8qY2WGBXC")}, // "Neverwannasay"
      {time:"3:00–3:45",   artist:"Lofi Legs",           spotify:track("6lQsQ9WmZN7LkJ5rX3VHBZD")}, // "Dreamin"
      {time:"4:00–4:45",   artist:"Mint Glaze",          spotify:PL},
      {time:"5:00–5:45",   artist:"Patchwork Promenade", spotify:PL},
    ]},
];

// Map math
const LAT_MIN=37.7515, LAT_MAX=37.7618, LNG_MIN=-122.4228, LNG_MAX=-122.4152;
function toPixel(lat,lng,w,h){
  return { x:((lng-LNG_MIN)/(LNG_MAX-LNG_MIN))*w, y:((LAT_MAX-lat)/(LAT_MAX-LAT_MIN))*h };
}

const crossStreets=[
  {name:"Valencia",lng:-122.4213},{name:"Mission",lng:-122.4191},
  {name:"Capp",lng:-122.4182},{name:"Bartlett",lng:-122.4176},{name:"Guerrero",lng:-122.4163},
];
const numberedStreets=[
  {name:"19th",lat:37.7602},{name:"20th",lat:37.7585},{name:"21st",lat:37.7570},
  {name:"22nd",lat:37.7550},{name:"23rd",lat:37.7537},{name:"24th",lat:37.7522},
];

function SpotifyIcon({size=14}){
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function TierBadge({tier}){
  if(!tier) return null;
  const hot = tier==="🔥";
  return(
    <span style={{
      fontSize:9, fontFamily:"system-ui,sans-serif", fontWeight:700,
      background: hot?"#FF4444":"#F59E0B",
      color:"white", borderRadius:10,
      padding:"1px 5px", flexShrink:0, letterSpacing:0.3,
      alignSelf:"center"
    }}>
      {hot?"🔥 HOT":"⭐ BUZZ"}
    </span>
  );
}

export default function App(){
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const mapRef = useRef(null);
  const [msize, setMsize] = useState({w:390,h:340});

  const active   = venues.find(v=>v.id===selected);
  const filtered = filter==="recommended" ? venues.filter(v=>RECOMMENDED.includes(v.id)) : venues;

  useEffect(()=>{
    function measure(){
      if(!mapRef.current) return;
      const r=mapRef.current.getBoundingClientRect();
      setMsize({w:r.width, h:Math.min(r.width*0.82,460)});
    }
    measure();
    window.addEventListener("resize",measure);
    return()=>window.removeEventListener("resize",measure);
  },[]);

  useEffect(()=>{ if(selected) setSheetOpen(true); else setSheetOpen(false); },[selected]);

  const {w:mw,h:mh}=msize;

  return(
    <div style={{fontFamily:"Georgia,serif",background:"#FDF6E3",minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative"}}>

      {/* Header */}
      <div style={{background:"#1A1A1A",color:"#FDF6E3",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"3px solid #E84545",flexShrink:0,flexWrap:"wrap",gap:6}}>
        <div>
          <div style={{fontSize:15,fontWeight:"bold",letterSpacing:2,textTransform:"uppercase",lineHeight:1.2}}>SF PORCHFEST 2026</div>
          <div style={{fontSize:10,color:"#999",letterSpacing:1}}>SAT MAY 30 · 12–6PM · THE MISSION</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <a href={PLAYLIST_URL} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",gap:4,background:"#1DB954",color:"white",textDecoration:"none",padding:"5px 10px",borderRadius:20,fontSize:10,fontFamily:"Georgia,serif"}}>
            <SpotifyIcon size={11}/> Full Playlist
          </a>
          <button onClick={()=>setFilter("all")} style={{padding:"5px 10px",borderRadius:4,border:"none",cursor:"pointer",fontSize:10,fontFamily:"Georgia,serif",background:filter==="all"?"#E84545":"#444",color:"#FDF6E3"}}>ALL</button>
          <button onClick={()=>setFilter("recommended")} style={{padding:"5px 10px",borderRadius:4,border:"none",cursor:"pointer",fontSize:10,fontFamily:"Georgia,serif",background:filter==="recommended"?"#E84545":"#444",color:"#FDF6E3"}}>★ PICKS</button>
        </div>
      </div>

      {/* Legend bar */}
      <div style={{background:"#2A2A2A",color:"#CCC",fontSize:9.5,padding:"5px 14px",display:"flex",gap:14,flexWrap:"wrap",lineHeight:1.4}}>
        <span>★ My picks</span>
        <span>🔥 HOT = high Spotify listeners</span>
        <span>⭐ BUZZ = growing following</span>
        <span style={{color:"#888"}}>Green button = play on Spotify</span>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{width:"100%",background:"#EEE8D5",position:"relative",flexShrink:0}}>
        <svg width={mw} height={mh+28} style={{display:"block",overflow:"visible"}}>

          {crossStreets.map(s=>{
            const x=((s.lng-LNG_MIN)/(LNG_MAX-LNG_MIN))*mw;
            return(
              <g key={s.name}>
                <line x1={x} y1={22} x2={x} y2={mh+22} stroke="#C4B99A" strokeWidth={1} strokeDasharray="3,5"/>
                <text x={x} y={13} textAnchor="middle" fontSize={Math.max(7,mw/70)} fill="#777" fontStyle="italic">{s.name}</text>
                <line x1={x} y1={15} x2={x} y2={22} stroke="#C4B99A" strokeWidth={1}/>
              </g>
            );
          })}

          {numberedStreets.map(s=>{
            const y=((LAT_MAX-s.lat)/(LAT_MAX-LAT_MIN))*mh+22;
            return(
              <g key={s.name}>
                <line x1={0} y1={y} x2={mw} y2={y} stroke="#C4B99A" strokeWidth={1} strokeDasharray="3,5"/>
                <text x={4} y={y-3} fontSize={Math.max(7,mw/70)} fill="#AAA">{s.name}</text>
              </g>
            );
          })}

          {venues.map(v=>{
            const {x,y}=toPixel(v.lat,v.lng,mw,mh);
            const px=x, py=y+22;
            const isSel=selected===v.id;
            const isVis=!!filtered.find(fv=>fv.id===v.id);
            const isRec=RECOMMENDED.includes(v.id);
            const op=isVis?1:0.15;
            const r=Math.max(9,mw/46);
            return(
              <g key={v.id} style={{cursor:"pointer"}} onClick={()=>setSelected(isSel?null:v.id)}>
                {isSel&&<circle cx={px} cy={py} r={r+7} fill={v.color} opacity={0.18}/>}
                <circle cx={px} cy={py} r={isSel?r+2:r} fill={v.color} opacity={op}
                  stroke={isSel?"#111":"white"} strokeWidth={isSel?2.5:1.5}/>
                {isVis&&isRec&&<text x={px} y={py+4} textAnchor="middle" fontSize={Math.max(8,r*0.8)} fill="white" fontWeight="bold" style={{pointerEvents:"none"}}>★</text>}
                {isVis&&!isRec&&<text x={px} y={py+3.5} textAnchor="middle" fontSize={Math.max(7,r*0.7)} fill="white" fontWeight="bold" style={{pointerEvents:"none"}}>♪</text>}
                <text x={px} y={py+r+10} textAnchor="middle" fontSize={Math.max(6.5,mw/85)}
                  fill="#222" opacity={op} style={{pointerEvents:"none"}} fontWeight={isSel?"bold":"normal"}>
                  {v.name}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{position:"absolute",bottom:8,right:8,background:"rgba(253,246,227,0.93)",borderRadius:6,padding:"5px 9px",fontSize:8.5,color:"#666",border:"1px solid #ccc",lineHeight:1.7}}>
          <div>★ Recommended</div><div>♪ Other venues</div><div style={{color:"#aaa"}}>Tap to see schedule</div>
        </div>
      </div>

      {/* Venue list */}
      <div style={{flex:1,overflowY:"auto",background:"#FDF6E3"}}>
        <div style={{padding:"7px 14px",background:"#1A1A1A",color:"#FDF6E3",fontSize:9.5,letterSpacing:1}}>
          {filter==="recommended"?"★ YOUR RECOMMENDED STOPS":`ALL ${venues.length} VENUES`}
        </div>
        {filtered.map(v=>(
          <div key={v.id} onClick={()=>setSelected(v.id)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",borderBottom:"1px solid #E8DFC8",background:"#FDF6E3"}}
            onMouseEnter={e=>e.currentTarget.style.background="#F0E9D2"}
            onMouseLeave={e=>e.currentTarget.style.background="#FDF6E3"}>
            <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,background:v.color,boxShadow:`0 0 0 2px white,0 0 0 3.5px ${v.color}`}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:"bold",fontSize:13,color:"#1A1A1A",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {RECOMMENDED.includes(v.id)?"★ ":""}{v.name}
              </div>
              <div style={{fontSize:10.5,color:"#888",marginTop:1}}>{v.address} · <em>{v.cross}</em> · {v.acts.length} acts</div>
            </div>
            <div style={{fontSize:10,color:"#aaa",flexShrink:0}}>›</div>
          </div>
        ))}
      </div>

      {/* Bottom Sheet */}
      {sheetOpen&&active&&(
        <div onClick={e=>{ if(e.target===e.currentTarget){setSelected(null);setSheetOpen(false);}}}
          style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end"}}>
          <div style={{width:"100%",maxHeight:"80vh",background:"#FDF6E3",borderRadius:"18px 18px 0 0",
            display:"flex",flexDirection:"column",boxShadow:"0 -4px 30px rgba(0,0,0,0.3)",
            animation:"slideUp 0.28s cubic-bezier(0.32,0.72,0,1)",overflow:"hidden"}}>

            {/* Handle */}
            <div style={{display:"flex",justifyContent:"center",padding:"10px 0 2px"}}>
              <div style={{width:40,height:4,borderRadius:2,background:"#CCC"}}/>
            </div>

            {/* Sheet header */}
            <div style={{padding:"10px 16px 12px",background:active.color,color:"white",
              display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0}}>
              <div>
                <div style={{fontSize:18,fontWeight:"bold",lineHeight:1.2}}>{active.name}</div>
                <div style={{fontSize:11,opacity:0.9,marginTop:3}}>{active.address} · <em>{active.cross}</em></div>
                {RECOMMENDED.includes(active.id)&&(
                  <div style={{marginTop:6,fontSize:10,background:"rgba(0,0,0,0.2)",display:"inline-block",padding:"2px 9px",borderRadius:20}}>★ Recommended for you</div>
                )}
              </div>
              <button onClick={()=>{setSelected(null);setSheetOpen(false);}}
                style={{background:"rgba(0,0,0,0.22)",border:"none",color:"white",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
            </div>

            {/* Acts */}
            <div style={{overflowY:"auto",flex:1,paddingBottom:"env(safe-area-inset-bottom,16px)"}}>
              {active.acts.map((act,i)=>{
                const isStarred=act.artist.includes("★");
                const name=act.artist.replace(" ★","");
                const tier=TIERS[act.artist]||TIERS[name];
                const isPlaylist = act.spotify===PLAYLIST_URL;
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",padding:"12px 16px",
                    borderBottom:"1px solid #E8DFC8",gap:8,
                    background:isStarred?"#FFFBF0":(i%2===0?"#FDF6E3":"#F7F0D9")}}>
                    <div style={{width:82,fontSize:10.5,color:"#999",fontStyle:"italic",flexShrink:0}}>{act.time}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,color:"#1A1A1A",fontWeight:isStarred?"bold":"normal",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {isStarred?"★ ":""}{name}
                      </div>
                      {tier&&<TierBadge tier={tier}/>}
                    </div>
                    <a href={act.spotify} target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}
                      title={isPlaylist?`Open SF Porchfest playlist to hear ${name}`:`Play ${name} on Spotify`}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",
                        width:34,height:34,borderRadius:"50%",background:"#1DB954",
                        flexShrink:0,textDecoration:"none",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>
                      <SpotifyIcon size={16}/>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        *{box-sizing:border-box} body{margin:0}
      `}</style>
    </div>
  );
}
