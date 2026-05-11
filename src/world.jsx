import React from "react";
import "./styles/world.css";
import "./styles/player.css";

const { useMemo: vUseMemo } = React;

const WORLD_MAP_W = 1900;
const WORLD_MAP_H = 1300;

const PATH_POINTS = [
  [180, 800],
  [1420, 800],
];

const FRUIT_NODES = [
  { id: "berry-north", x: 350, y: 620, kind: "berry", label: "별딸기", price: 18 },
  { id: "peach-north", x: 620, y: 540, kind: "peach", label: "복숭아", price: 28 },
  { id: "apple-south", x: 760, y: 970, kind: "apple", label: "태양사과", price: 24 },
  { id: "berry-south", x: 1030, y: 980, kind: "berry", label: "별딸기", price: 18 },
  { id: "apple-far", x: 1460, y: 420, kind: "apple", label: "태양사과", price: 24 },
  { id: "peach-west", x: 210, y: 940, kind: "peach", label: "복숭아", price: 28 },
  { id: "apple-north", x: 890, y: 450, kind: "apple", label: "태양사과", price: 24 },
  { id: "berry-east", x: 1370, y: 920, kind: "berry", label: "별딸기", price: 18 },
];

const FRUIT_INFO = {
  berry: { label: "별딸기", price: 18, color: "#ff6ec7" },
  peach: { label: "복숭아", price: 28, color: "#ffb36b" },
  apple: { label: "태양사과", price: 24, color: "#ff5577" },
};

const FOREST_SHOP = {
  id: "forest-shop",
  x: 520,
  y: 430,
  label: "겜블 상점",
};

const MONSTER_SPAWNS = [
  { id: "slime-west", x: 250, y: 500, vx: 1.5, vy: 1.1, color: "#4dd6ff", name: "파란 슬라임", type: "slime" },
  { id: "slime-south", x: 1130, y: 1000, vx: -1.4, vy: 1.2, color: "#ff6ec7", name: "분홍 슬라임", type: "slime" },
  { id: "bat-east", x: 1480, y: 520, vx: -1.8, vy: 1.4, color: "#b34dff", name: "보라 박쥐", type: "bat" },
  { id: "mote-north", x: 820, y: 360, vx: 1.2, vy: -1.6, color: "#ffd84d", name: "빛가루 모스", type: "mote" },
  { id: "mote-far", x: 1530, y: 880, vx: -1.6, vy: -1.1, color: "#4dff8a", name: "초록 모스", type: "mote" },
];

function VillageBackground({
  inventory,
  collectedFruitIds = [],
  nearbyFruitId = null,
  nearbyShop = false,
  monsters = [],
  goldDrops = [],
  nearbyGoldDropId = null,
}) {
  return (
    <>
      <div style={{
        position:"absolute", left:0, top:0, width:"100%", height:"40%",
        background:"linear-gradient(180deg, #4a2f76 0%, #60417f 58%, rgba(96,65,127,0) 100%)",
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute", left: 1280, top: 80,
        width: 80, height: 80, borderRadius: "50%",
        background:"radial-gradient(circle at 35% 35%, #f5e6c8, #c8a878 60%, #8a6848)",
        boxShadow:"0 0 40px rgba(255,230,180,0.4)",
      }}/>
      <Stars/>
      <div style={{
        position:"absolute", left: 0, top: 30,
        width: "100%", textAlign: "center",
        fontFamily: "var(--font-pixel)",
        fontSize: 18, letterSpacing: 4,
        color: "rgba(180,140,255,0.18)",
      }}>
        SOLAR 留덉쓣 - ???3
      </div>
      <GrassTexture/>
      <PixelPath/>
      <Trees/>
      <Fences/>
      <GameExtras
        inventory={inventory}
        collectedFruitIds={collectedFruitIds}
        nearbyFruitId={nearbyFruitId}
        nearbyShop={nearbyShop}
        monsters={monsters}
        goldDrops={goldDrops}
        nearbyGoldDropId={nearbyGoldDropId}
      />
      <Decorations/>
    </>
  );
}

function Stars() {
  const stars = vUseMemo(() => {
    const arr = [];
    const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 80; i++) {
      arr.push({
        x: Math.floor(seed(i * 3) * WORLD_MAP_W),
        y: Math.floor(seed(i * 5 + 1) * 600),
        big: seed(i * 7 + 2) > 0.85,
        key: i,
      });
    }
    return arr;
  }, []);
  return stars.map(s => (
    <div key={s.key} style={{
      position:"absolute", left: s.x, top: s.y,
      width: s.big ? 3 : 2, height: s.big ? 3 : 2,
      background: s.big ? "#fff" : "#c8b4ff",
      opacity: s.big ? 0.9 : 0.5,
      boxShadow: s.big ? "0 0 4px #fff" : "none",
      animation: s.big ? `twinkle ${2 + (s.key % 3)}s steps(2) infinite` : "none",
    }}/>
  ));
}

function GrassTexture() {
  const marks = vUseMemo(() => {
    const arr = [];
    const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 200; i++) {
      arr.push({
        x: Math.floor(seed(i * 3) * WORLD_MAP_W),
        y: Math.floor(seed(i * 5 + 1) * WORLD_MAP_H),
        variant: Math.floor(seed(i * 7 + 2) * 4),
        key: i,
      });
    }
    return arr;
  }, []);
  return (
    <>
      <div style={{
        position:"absolute", left: 0, top: 0,
        width: WORLD_MAP_W, height: WORLD_MAP_H,
        background:`
          repeating-linear-gradient(0deg, transparent 0, transparent 31px, rgba(255,255,255,0.02) 31px, rgba(255,255,255,0.02) 32px),
          repeating-linear-gradient(90deg, transparent 0, transparent 31px, rgba(255,255,255,0.02) 31px, rgba(255,255,255,0.02) 32px),
          linear-gradient(180deg, #4d865b 0%, #326e46 100%)
        `,
        backgroundSize: "32px 32px, 32px 32px, 100% 100%",
      }}/>
      {marks.map(t => (
        <div key={t.key} style={{
          position:"absolute", left: t.x, top: t.y,
          width: 8, height: 6,
          fontFamily: "var(--font-pixel)",
          fontSize: 10,
          color: ["#79b77d","#4d865b","#8cc994","#326e46"][t.variant],
          opacity: 0.7,
          pointerEvents:"none",
        }}>{[".", "'", "`", ","][t.variant]}</div>
      ))}
    </>
  );
}

function PixelPath() {
  const tiles = vUseMemo(() => {
    const out = [];
    const TILE = 32;
    for (let i = 0; i < PATH_POINTS.length - 1; i++) {
      const [x1,y1] = PATH_POINTS[i];
      const [x2,y2] = PATH_POINTS[i+1];
      const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / TILE);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        out.push([
          Math.round((x1 + (x2 - x1) * t) / TILE) * TILE,
          Math.round((y1 + (y2 - y1) * t) / TILE) * TILE,
        ]);
      }
    }
    const seen = new Set();
    return out.filter(([x,y]) => {
      const k = `${x}_${y}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, []);

  return (
    <>
      {tiles.map(([x,y], i) => (
        <div key={i} style={{
          position:"absolute", left: x - 16, top: y - 16,
          width: 32, height: 32,
          background: `
            linear-gradient(135deg, rgba(255,230,170,0.22) 0%, transparent 38%),
            linear-gradient(180deg, #b19868 0%, #8b7650 100%)
          `,
          border: "1px solid #6e5b38",
          boxShadow: "inset -3px -3px 0 rgba(0,0,0,0.22), inset 2px 2px 0 rgba(255,230,170,0.18)",
        }}/>
      ))}
      {tiles.filter((_,i) => i % 4 === 0).map(([x,y], i) => (
        <div key={`stone-${i}`} style={{
          position:"absolute",
          left: x - 18 + (i % 2 ? 36 : 0),
          top: y + (i % 2 ? 20 : -22),
          width: 6, height: 5,
          background: "#7a7488",
          boxShadow: "1px 1px 0 #4a4458",
        }}/>
      ))}
    </>
  );
}

function Trees() {
  const trees = vUseMemo(() => {
    const arr = [];
    const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(seed(i*3) * (WORLD_MAP_W - 120)) + 60;
      const y = Math.floor(seed(i*5+1) * 1000) + 50;
      if ((y > 720 && y < 880) || (x > 1260 && x < 1580 && y > 540 && y < 850)) continue;
      arr.push({ x, y, big: seed(i*7+2) > 0.5, key: i });
    }
    return arr;
  }, []);
  return trees.map(t => <Tree key={t.key} {...t}/>);
}

function Tree({ x, y, big }) {
  const scale = big ? 1.2 : 1;
  return (
    <div style={{ position:"absolute", left: x, top: y, transform: `scale(${scale})`, transformOrigin:"50% 100%", pointerEvents:"none" }}>
      <div style={{position:"absolute", left:-22, top:42, width:44, height:8, borderRadius:"50%", background:"rgba(0,0,0,0.4)", filter:"blur(2px)"}}/>
      <div style={{position:"absolute", left:-4, top:24, width:8, height:24, background:"#4a3520", boxShadow:"inset -2px 0 0 #2a1a10"}}/>
      <div style={{position:"absolute", left:-18, top:8, width:36, height:24, background:"#2d5a3d", boxShadow:"inset -2px -2px 0 #1a3d27, inset 2px 2px 0 #3f7a52"}}/>
      <div style={{position:"absolute", left:-14, top:-2, width:28, height:18, background:"#3f7a52", boxShadow:"inset -2px -2px 0 #2d5a3d, inset 2px 2px 0 #5a8a6d"}}/>
      <div style={{position:"absolute", left:-10, top:-10, width:20, height:14, background:"#5a8a6d", boxShadow:"inset -1px -1px 0 #3f7a52"}}/>
      <div style={{position:"absolute", left:-4, top:0, width:4, height:4, background:"#7aaa8d"}}/>
    </div>
  );
}

function Fences() {
  const fences = vUseMemo(() => {
    const arr = [];
    for (let i = 0; i < PATH_POINTS.length - 1; i++) {
      const [x1,y1] = PATH_POINTS[i];
      const [x2,y2] = PATH_POINTS[i+1];
      const steps = Math.floor(Math.hypot(x2 - x1, y2 - y1) / 90);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const cx = x1 + (x2 - x1) * t;
        const cy = y1 + (y2 - y1) * t;
        arr.push({ x: cx, y: cy + 60, key: `${i}-${s}-l` });
        arr.push({ x: cx, y: cy - 60, key: `${i}-${s}-r` });
      }
    }
    return arr;
  }, []);
  return fences.map(f => <FencePost key={f.key} {...f}/>);
}

function FencePost({ x, y }) {
  return (
    <div style={{ position:"absolute", left: x - 4, top: y - 14, width: 8, height: 18, background:"#a08868", boxShadow:"inset -2px 0 0 #7a6448, inset 0 -2px 0 #5a4830", pointerEvents:"none" }}>
      <div style={{position:"absolute", left:-2, top:4, width:12, height:3, background:"#a08868", boxShadow:"inset 0 -1px 0 #7a6448"}}/>
      <div style={{position:"absolute", left:-2, top:10, width:12, height:3, background:"#a08868", boxShadow:"inset 0 -1px 0 #7a6448"}}/>
    </div>
  );
}

function GameExtras({ inventory, collectedFruitIds, nearbyFruitId, nearbyShop, monsters, goldDrops, nearbyGoldDropId }) {
  const collectedSet = new Set(collectedFruitIds);
  const fruitTotal = Object.values(inventory?.fruits || {}).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <InventoryPanel inventory={inventory} fruitTotal={fruitTotal}/>
      <ForestShop nearby={nearbyShop} fruitTotal={fruitTotal}/>
      {FRUIT_NODES.map((fruit) => (
        <FruitNode key={fruit.id} fruit={fruit} collected={collectedSet.has(fruit.id)} nearby={nearbyFruitId === fruit.id}/>
      ))}
      {monsters.map((monster) => (
        <MonsterNode key={monster.id} monster={monster}/>
      ))}
      {goldDrops.map((drop) => (
        <GoldDropNode key={drop.id} drop={drop} nearby={nearbyGoldDropId === drop.id}/>
      ))}
    </>
  );
}

function InventoryPanel({ inventory, fruitTotal }) {
  return (
    <div style={{ position:"absolute", left: 48, top: 120, padding:"8px 12px", background:"rgba(10,4,24,0.72)", border:"2px solid var(--bevel-mid)", fontFamily:"var(--font-pixel)", fontSize:9, color:"var(--neon-yellow)", zIndex: 6, lineHeight: 1.8 }}>
      <div>?몃깽?좊━ {fruitTotal}</div>
      <div style={{color:"var(--neon-green)"}}>怨⑤뱶 {inventory?.gold || 0}</div>
    </div>
  );
}

function ForestShop({ nearby }) {
  return (
    <div style={{ position:"absolute", left: FOREST_SHOP.x, top: FOREST_SHOP.y, width: 112, height: 96, zIndex: 7, pointerEvents:"none" }}>
      <div style={{ position:"absolute", left: 12, top: 24, width: 88, height: 58, background:"#7a4830", boxShadow:"inset -4px -4px 0 #4a2810, inset 4px 4px 0 #a06850, 0 0 0 3px #2a1a10" }}/>
      <div style={{ position:"absolute", left: 0, top: 12, width: 112, height: 28, background:"repeating-linear-gradient(90deg, #ffd84d 0, #ffd84d 14px, #ff6ec7 14px, #ff6ec7 28px)", boxShadow:"0 4px 0 #3a1a10" }}/>
      <div style={{ position:"absolute", left: 18, top: 48, width: 76, height: 16, background:"#fff1c7", color:"#7a4830", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-pixel)", fontSize:7 }}>GAME SHOP</div>
      <div style={{ position:"absolute", left: 47, top: 66, width: 18, height: 18, borderRadius:"50%", background:"#ffd84d", boxShadow:"inset -4px -3px 0 #d49a20, inset 3px 2px 0 #fff6c7, 0 0 12px #ffd84d" }}/>
      {nearby && (
        <div style={{ position:"absolute", left:"50%", top:-22, transform:"translateX(-50%)", fontFamily:"var(--font-pixel)", fontSize:8, background:"var(--neon-yellow)", color:"#000", padding:"4px 8px", whiteSpace:"nowrap", animation:"bob 0.6s ease-in-out infinite alternate" }}>
          겜블 [E]
        </div>
      )}
    </div>
  );
}

function FruitNode({ fruit, collected, nearby }) {
  if (collected) {
    return <div style={{ position:"absolute", left: fruit.x, top: fruit.y, width: 20, height: 8, background:"rgba(0,0,0,0.35)", borderRadius:"50%", filter:"blur(1px)", zIndex: 5 }}/>;
  }

  const color = FRUIT_INFO[fruit.kind].color;
  return (
    <div title={`${fruit.label} 梨꾩쭛`} style={{ position:"absolute", left: fruit.x, top: fruit.y, width: 34, height: 34, zIndex: 7, pointerEvents:"none", filter: nearby ? `drop-shadow(0 0 10px ${color})` : "none" }}>
      <span style={{ position:"absolute", left: 6, top: 10, width: 20, height: 18, background: color, borderRadius:"50% 50% 45% 45%", boxShadow:`inset -4px -4px 0 rgba(0,0,0,0.22), 0 0 10px ${color}` }}/>
      <span style={{ position:"absolute", left: 17, top: 5, width: 5, height: 9, background:"#3a2d1a", boxShadow:"5px 2px 0 #5a8a6d" }}/>
      {nearby && (
        <span style={{ position:"absolute", left: "50%", top: -18, transform:"translateX(-50%)", padding:"3px 6px", background:"var(--neon-yellow)", color:"#000", fontFamily:"var(--font-pixel)", fontSize:7, whiteSpace:"nowrap", animation:"bob 0.6s ease-in-out infinite alternate" }}>
          梨꾩쭛 [E]
        </span>
      )}
    </div>
  );
}

function GoldDropNode({ drop, nearby }) {
  return (
    <div
      className={`gold-drop ${nearby ? "gold-drop-near" : ""}`}
      title={`${drop.amount} 怨⑤뱶`}
      style={{ position:"absolute", left: drop.x, top: drop.y, width: 26, height: 26, zIndex: 8, pointerEvents:"none" }}
    >
      <span className="gold-drop-shadow"/>
      <span className="gold-drop-coin"/>
      <span className="gold-drop-spark gold-drop-spark-a"/>
      <span className="gold-drop-spark gold-drop-spark-b"/>
      {nearby && (
        <span className="gold-drop-prompt">
          以띻린 [E]
        </span>
      )}
    </div>
  );
}

function MonsterNode({ monster }) {
  if (!monster.alive) return null;
  const isBat = monster.type === "bat";
  const isMote = monster.type === "mote";
  const isHit = (monster.hitUntil || 0) > Date.now();
  const className = `monster-node ${isHit ? "monster-node-hit" : ""} ${isBat ? "monster-node-bat" : ""}`;
  return (
    <div className={className} title={monster.name} style={{ position:"absolute", left: monster.x, top: monster.y, width: isBat ? 52 : 42, height: isBat ? 34 : 36, pointerEvents:"none", zIndex: 6 }}>
      <div style={{ position:"absolute", left: 4, top: -8, width: 34, height: 4, background:"#2a143d", border:"1px solid #000" }}>
        <div style={{ height:"100%", width:`${Math.max(0, Math.min(100, ((monster.hp ?? 72) / 72) * 100))}%`, background:"var(--neon-red)" }}/>
      </div>
      <div style={{ position:"absolute", left: isBat ? 8 : 6, top: isBat ? 8 : 4, width: isBat ? 34 : 30, height: isBat ? 20 : 26, background: monster.color, borderRadius: isMote ? "8px" : isBat ? "50% 50% 42% 42%" : "50% 50% 38% 38%", transform: isMote ? "rotate(45deg)" : "none", boxShadow:`inset -5px -5px 0 rgba(0,0,0,0.25), 0 0 12px ${monster.color}` }}/>
      {isBat && (
        <>
          <div style={{position:"absolute", left:0, top:12, width:16, height:10, background:monster.color, clipPath:"polygon(100% 0, 0 50%, 100% 100%)"}}/>
          <div style={{position:"absolute", right:0, top:12, width:16, height:10, background:monster.color, clipPath:"polygon(0 0, 100% 50%, 0 100%)"}}/>
        </>
      )}
      <div style={{position:"absolute", left:16, top:15, width:4, height:4, background:"#0a0420", boxShadow:"12px 0 0 #0a0420"}}/>
      {!isBat && <div style={{position:"absolute", left:8, top:30, width:28, height:5, borderRadius:"50%", background:"rgba(0,0,0,0.45)", filter:"blur(2px)"}}/>}
      {isHit && (
        <>
          <div className="monster-hit-flash"/>
          <div className="monster-hit-spark monster-hit-spark-a"/>
          <div className="monster-hit-spark monster-hit-spark-b"/>
          <div className="monster-hit-spark monster-hit-spark-c"/>
        </>
      )}
    </div>
  );
}

function Decorations() {
  const items = vUseMemo(() => {
    const arr = [];
    const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(seed(i*3) * (WORLD_MAP_W - 100)) + 50;
      const y = Math.floor(seed(i*5+1) * 1000) + 50;
      if ((y > 720 && y < 880) || (x > 1260 && x < 1580 && y > 540 && y < 850)) continue;
      const kind = ["flower","mushroom","crystal","rock"][Math.floor(seed(i*7+2)*4)];
      arr.push({ x, y, kind, key: i });
    }
    return arr;
  }, []);
  return items.map(it => <Deco key={it.key} {...it}/>);
}

function Deco({ x, y, kind }) {
  const m = {
    flower: { color:"var(--neon-pink)", char:"*", size:14 },
    mushroom: { color:"var(--neon-red)", char:"^", size:16 },
    crystal: { color:"var(--neon-cyan)", char:"*", size:14 },
    rock: { color:"#7a7488", char:"o", size:18 },
  }[kind];
  return <div style={{ position:"absolute", left: x, top: y, fontFamily:"var(--font-pixel)", fontSize: m.size, color: m.color, opacity: 0.7, textShadow:"1px 1px 0 #000", pointerEvents:"none", userSelect:"none" }}>{m.char}</div>;
}

function Sign({ sign, near }) {
  const colorMap = {
    magenta: "var(--neon-magenta)",
    cyan: "var(--neon-cyan)",
    yellow: "var(--neon-yellow)",
    green: "var(--neon-green)",
  };
  const c = colorMap[sign.color];

  return (
    <div style={{ position:"absolute", left: sign.x - 30, top: sign.y - 80, width: 60, height: 80, pointerEvents:"none" }}>
      {near && <div style={{ position:"absolute", top:-44, left:"50%", transform:"translateX(-50%)", fontFamily:"var(--font-pixel)", fontSize:9, background:"var(--neon-yellow)", color:"#000", padding:"4px 8px", whiteSpace:"nowrap", animation:"bob 0.6s ease-in-out infinite alternate" }}>?쎄린 [E]</div>}
      <div style={{ position:"absolute", top:-22, left:"50%", transform:"translateX(-50%)", fontFamily:"var(--font-pixel)", fontSize:8, color: near ? c : "var(--ink-dim)", background:"rgba(10,4,24,0.8)", border:`1px solid ${near ? c : "var(--bevel-mid)"}`, padding:"2px 6px", whiteSpace:"nowrap", textShadow:"1px 1px 0 #000" }}>{sign.title}</div>
      <div style={{ position:"absolute", left:8, top:8, width:44, height:36, background:"#a08868", boxShadow:"inset -3px -3px 0 #6a4830, inset 3px 3px 0 #c8a878, 0 0 0 2px #4a3520" }}>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-pixel)", fontSize:18, color: c, textShadow:`0 0 6px ${c}, 1px 1px 0 #000` }}>{sign.icon}</div>
      </div>
      <div style={{position:"absolute", left:26, top:44, width:8, height:36, background:"#7a6448", boxShadow:"inset -2px 0 0 #5a4830, inset 2px 0 0 #a08868"}}/>
      <div style={{position:"absolute", left:6, top:78, width:48, height:6, borderRadius:"50%", background:"rgba(0,0,0,0.5)", filter:"blur(2px)"}}/>
      {near && <div style={{position:"absolute", inset:0, boxShadow: `0 0 24px ${c}`, pointerEvents:"none"}}/>}
    </div>
  );
}

function House({ near }) {
  const D = window.PORTFOLIO_DATA;
  const h = D.house;
  return (
    <div style={{ position:"absolute", left: h.x, top: h.y, width: h.w, height: h.h, pointerEvents:"none" }}>
      <div style={{position:"absolute", left:10, top: h.h - 12, width: h.w - 20, height: 16, borderRadius:"50%", background:"rgba(78,42,96,0.35)", filter:"blur(4px)"}}/>
      <div style={{ position:"absolute", left: 0, top: 0, width: h.w, height: 90, background:"repeating-linear-gradient(0deg, #ff7acb 0px, #ff7acb 8px, #ffb1dc 8px, #ffb1dc 16px)", clipPath:"polygon(50% 0, 100% 100%, 0 100%)", filter:"drop-shadow(2px 2px 0 #7d3c82)" }}/>
      <div style={{position:"absolute", left:54, top:48, width:28, height:18, background:"#ffe680", boxShadow:"inset -2px -2px 0 #d4a020", transform:"rotate(-19deg)"}}/>
      <div style={{position:"absolute", left:200, top:50, width:26, height:16, background:"#9df4ff", boxShadow:"inset -2px -2px 0 #39a8c2", transform:"rotate(19deg)"}}/>
      <div style={{position:"absolute", left: 200, top: 10, width: 24, height: 50, background:"#8f6fb0", boxShadow:"inset -3px 0 0 #5c4280"}}/>
      <div style={{position:"absolute", left: 196, top: 6, width: 32, height: 8, background:"#5c4280"}}/>
      <Smoke baseX={208} baseY={0}/>
      <div style={{position:"absolute", left:0, top:84, width:h.w, height:8, background:"#c83c91", boxShadow:"0 3px 0 #ffe680"}}/>
      <div style={{ position:"absolute", left:8, top:90, width: h.w - 16, height: h.h - 90, background:"repeating-linear-gradient(90deg, #ffe0a8 0px, #ffe0a8 32px, #f4c987 32px, #f4c987 33px), #ffd39a", boxShadow:"inset -4px -4px 0 #c58b5e, inset 4px 4px 0 #fff1c7", borderRadius:"0 0 10px 10px" }}>
        <Window x={28} y={16}/>
        <Window x={194} y={16}/>
        <div style={{position:"absolute", left: 108, bottom: 0, width: 48, height: 66, background:"#b86a8d", borderRadius:"24px 24px 0 0", boxShadow:"inset -3px -3px 0 #7d3c5d, inset 3px 3px 0 #f1a5c6, 0 0 0 3px #7d3c5d"}}>
          <div style={{position:"absolute", left:8, top:16, width:32, height:16, border:"2px solid #7d3c5d", borderRadius:"8px 8px 2px 2px"}}/>
          <div style={{position:"absolute", left:8, top:38, width:32, height:18, border:"2px solid #7d3c5d"}}/>
          <div style={{position:"absolute", right:8, top:36, width:6, height:6, background:"#ffd84d", borderRadius:"50%", boxShadow:"0 0 6px #ffd84d"}}/>
        </div>
        <div style={{position:"absolute", left: 94, bottom: -10, width: 76, height: 12, background:"#63e6ff", boxShadow:"inset 0 -3px 0 #2c8eb0", borderRadius:"2px"}}/>
        <div style={{position:"absolute", left: 82, top: 26, width: 100, height: 18, background:"#fff1c7", boxShadow:"inset -2px -2px 0 #d4a020, inset 2px 2px 0 #fff8df, 0 2px 0 #b86a8d", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-pixel)", fontSize:7, color:"#b86a8d", textShadow:"1px 1px 0 #fff8df"}}>SOLAR LAB</div>
      </div>
      {near && <div style={{ position:"absolute", left:"50%", bottom:-32, transform:"translateX(-50%)", fontFamily:"var(--font-pixel)", fontSize:9, background:"var(--neon-yellow)", color:"#000", padding:"4px 8px", whiteSpace:"nowrap", animation:"bob 0.6s ease-in-out infinite alternate" }}>?ㅼ뼱媛湲?[E]</div>}
    </div>
  );
}

function Window({ x, y }) {
  return (
    <div style={{ position:"absolute", left: x, top: y, width: 60, height: 40, background:"#3b2368", borderRadius:"10px 10px 4px 4px", boxShadow:"inset 2px 2px 0 #b86a8d, inset -2px -2px 0 #7d3c82, 0 0 10px rgba(255,216,77,0.45)" }}>
      <div style={{position:"absolute", inset:4, background:"linear-gradient(135deg, #fff1c7 0%, #ffd84d 45%, #ffb1dc 100%)", borderRadius:"7px 7px 2px 2px", opacity: 0.9}}/>
      <div style={{position:"absolute", left:"50%", top:3, width:2, height:"85%", background:"#b86a8d", transform:"translateX(-50%)"}}/>
      <div style={{position:"absolute", left:4, top:"52%", width:"86%", height:2, background:"#b86a8d", transform:"translateY(-50%)"}}/>
      <div style={{position:"absolute", left:-4, bottom:-4, width:68, height:6, background:"#fff1c7", boxShadow:"inset -2px -1px 0 #d4a020"}}/>
    </div>
  );
}

function Smoke({ baseX, baseY }) {
  const puffs = [
    { x: baseX, y: baseY - 10, size: 12, delay: 0 },
    { x: baseX - 8, y: baseY - 30, size: 16, delay: 1 },
    { x: baseX + 6, y: baseY - 50, size: 20, delay: 2 },
    { x: baseX - 4, y: baseY - 75, size: 24, delay: 3 },
  ];
  return puffs.map((p, i) => (
    <div key={i} style={{ position:"absolute", left: p.x, top: p.y, width: p.size, height: p.size, borderRadius:"50%", background:"rgba(180,140,255,0.4)", animation: "smoke 4s ease-in-out infinite", animationDelay: `${p.delay * 0.3}s` }}/>
  ));
}

function Player({ dir, moving, stunned = false, attacking = false, hit = false }) {
  const stateClass = [
    "player-sprite",
    attacking ? `player-attack player-attack-${dir}` : "",
    hit ? "player-hit" : "",
  ].filter(Boolean).join(" ");
  return (
    <div className={stateClass} style={{ width: 32, height: 48, position: "relative", opacity: stunned ? 0.55 : 1, animation: moving ? "playerBob 0.28s steps(2) infinite" : "none", transform: dir === "left" ? "scaleX(-1)" : "scaleX(1)" }}>
      <div style={{position: "absolute", left: 24, top: 4, width: 5, height: 5, background: "var(--neon-yellow)", boxShadow: "0 0 6px var(--neon-yellow), 0 5px 0 #d4a020", transform: "rotate(45deg)"}}/>
      <div style={{ position: "absolute", left: 4, top: 4, width: 9, height: 9, background: "#ff7acb", boxShadow: "inset -2px -2px 0 #c83c91" }}/>
      <div style={{ position: "absolute", left: 19, top: 4, width: 9, height: 9, background: "#ff7acb", boxShadow: "inset -2px -2px 0 #c83c91" }}/>
      <div style={{ position: "absolute", left: 13, top: 7, width: 6, height: 6, background: "var(--neon-yellow)", boxShadow: "inset -1px -1px 0 #d4a020" }}/>
      <div style={{position: "absolute", left: 5, top: 8, width: 22, height: 18, background: "#7b5cff", borderRadius: "10px 10px 6px 6px", boxShadow: "inset -3px -2px 0 #4c35a8, inset 2px 1px 0 #ad9cff"}}/>
      <div style={{position: "absolute", left: 7, top: 14, width: 18, height: 14, background: "#ffd9c6", borderRadius: "7px", boxShadow: "inset -2px -1px 0 #e4aa90"}}/>
      <div style={{ position: "absolute", left: 10, top: 18, width: 3, height: 4, background: "#21133d", borderRadius: 2 }}/>
      <div style={{ position: "absolute", left: 20, top: 18, width: 3, height: 4, background: "#21133d", borderRadius: 2 }}/>
      <div style={{ position: "absolute", left: 15, top: 24, width: 4, height: 2, background: "#b04d6b" }}/>
      <div style={{position: "absolute", left: 8, top: 28, width: 17, height: 14, background: "#63e6ff", borderRadius: "5px 5px 3px 3px", boxShadow: "inset -3px -2px 0 #2c8eb0, inset 2px 1px 0 #b6f6ff"}}/>
      <div style={{ position: "absolute", left: 5, top: 31, width: 5, height: 8, background: "#ff7acb", borderRadius: 3, boxShadow: "inset -1px -1px 0 #c83c91" }}/>
      <div style={{ position: "absolute", left: 23, top: 31, width: 5, height: 8, background: "#ff7acb", borderRadius: 3, boxShadow: "inset -1px -1px 0 #c83c91" }}/>
      <div style={{ position: "absolute", left: 9, top: 41, width: 7, height: 5, background: "#4c35a8", borderRadius: "0 0 3px 3px" }}/>
      <div style={{ position: "absolute", left: 18, top: 41, width: 7, height: 5, background: "#4c35a8", borderRadius: "0 0 3px 3px" }}/>
      {attacking && (
        <>
          <div className="player-attack-arm"/>
          <div className="player-attack-slash"/>
        </>
      )}
      {hit && <div className="player-hit-flash"/>}
      <div className="player-shadow"/>
      <style>{`@keyframes playerBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }`}</style>
    </div>
  );
}

window.VillageBackground = VillageBackground;
window.Sign = Sign;
window.House = House;
window.Player = Player;
window.PATH_POINTS = PATH_POINTS;

export { FOREST_SHOP, FRUIT_INFO, FRUIT_NODES, House, MONSTER_SPAWNS, PATH_POINTS, Player, Sign, VillageBackground };
