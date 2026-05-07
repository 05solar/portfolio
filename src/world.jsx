import React from "react";

// ============================================================
// VILLAGE WORLD — path, fences, trees, signs, house
// ============================================================

const { useState: vUseState, useEffect: vUseEffect, useRef: vUseRef, useMemo: vUseMemo } = React;

// World layout — village map (linear horizontal path)
// Path runs left → right in a straight line, with signs along it and house at the end
const WORLD_MAP_W = 1700;
const WORLD_MAP_H = 1100;

const PATH_POINTS = [
  [180, 800],
  [1420, 800],
];

function VillageBackground() {
  return (
    <>
      {/* Sky / atmosphere */}
      <div style={{
        position:"absolute", left:0, top:0, width:"100%", height:"40%",
        background:"linear-gradient(180deg, #4a2f76 0%, #60417f 58%, rgba(96,65,127,0) 100%)",
        pointerEvents:"none",
      }}/>

      {/* distant moon */}
      <div style={{
        position:"absolute", left: 1280, top: 80,
        width: 80, height: 80, borderRadius: "50%",
        background:"radial-gradient(circle at 35% 35%, #f5e6c8, #c8a878 60%, #8a6848)",
        boxShadow:"0 0 40px rgba(255,230,180,0.4)",
      }}/>
      <div style={{
        position:"absolute", left: 1300, top: 90,
        width: 16, height: 16, borderRadius:"50%",
        background:"#8a6848", opacity: 0.6,
      }}/>
      <div style={{
        position:"absolute", left: 1328, top: 130,
        width: 8, height: 8, borderRadius:"50%",
        background:"#8a6848", opacity: 0.6,
      }}/>

      {/* stars */}
      <Stars/>

      {/* big village title carved into ground */}
      <div style={{
        position:"absolute", left: 0, top: 30,
        width: "100%", textAlign: "center",
        fontFamily: "var(--font-pixel)",
        fontSize: 18, letterSpacing: 6,
        color: "rgba(180,140,255,0.18)",
      }}>
        ─── SOLAR VILLAGE · SAVE-3 ───
      </div>

      {/* grass texture */}
      <GrassTexture/>

      {/* path */}
      <PixelPath/>

      {/* trees */}
      <Trees/>

      {/* fences along path */}
      <Fences/>

      {/* misc decoration */}
      <Decorations/>
    </>
  );
}

function Stars() {
  const stars = vUseMemo(() => {
    const arr = [];
    const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 80; i++) {
      const x = Math.floor(seed(i*3) * WORLD_MAP_W);
      const y = Math.floor(seed(i*5+1) * 600);
      const big = seed(i*7+2) > 0.85;
      arr.push({ x, y, big, key: i });
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
  const tiles = vUseMemo(() => {
    const arr = [];
    const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(seed(i*3) * WORLD_MAP_W);
      const y = Math.floor(seed(i*5+1) * WORLD_MAP_H);
      const variant = Math.floor(seed(i*7+2) * 4);
      arr.push({ x, y, variant, key: i });
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
      {tiles.map(t => (
        <div key={t.key} style={{
          position:"absolute",
          left: t.x, top: t.y,
          width: 8, height: 6,
          fontFamily: "var(--font-pixel)",
          fontSize: 10,
          color: ["#79b77d","#4d865b","#8cc994","#326e46"][t.variant],
          opacity: 0.7,
          pointerEvents:"none",
        }}>{["ʷ","ᵛ","˅","ᵗ"][t.variant]}</div>
      ))}
    </>
  );
}

// Pixel path: dirt tiles along PATH_POINTS
function PixelPath() {
  // Build segments of 32px tiles between path points
  const tiles = vUseMemo(() => {
    const out = [];
    const TILE = 32;
    for (let i = 0; i < PATH_POINTS.length - 1; i++) {
      const [x1,y1] = PATH_POINTS[i];
      const [x2,y2] = PATH_POINTS[i+1];
      const dx = x2 - x1; const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      const steps = Math.ceil(dist / TILE);
      for (let s = 0; s <= steps; s++) {
        const t = s/steps;
        const x = Math.round((x1 + dx*t)/TILE)*TILE;
        const y = Math.round((y1 + dy*t)/TILE)*TILE;
        out.push([x,y]);
      }
    }
    // Dedup
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
          position:"absolute",
          left: x - 16, top: y - 16,
          width: 32, height: 32,
          background: `
            linear-gradient(135deg, rgba(255,230,170,0.22) 0%, transparent 38%),
            linear-gradient(180deg, #b19868 0%, #8b7650 100%)
          `,
          border: "1px solid #6e5b38",
          boxShadow: "inset -3px -3px 0 rgba(0,0,0,0.22), inset 2px 2px 0 rgba(255,230,170,0.18)",
        }}/>
      ))}
      {/* path edge markers — small stones */}
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
      const onPath = (y > 720 && y < 880);
      const onHouse = (x > 1260 && x < 1580 && y > 540 && y < 850);
      if (onPath || onHouse) continue;
      const big = seed(i*7+2) > 0.5;
      arr.push({ x, y, big, key: i });
    }
    return arr;
  }, []);
  return trees.map(t => <Tree key={t.key} x={t.x} y={t.y} big={t.big}/>);
}

function Tree({ x, y, big }) {
  const scale = big ? 1.2 : 1;
  return (
    <div style={{
      position:"absolute", left: x, top: y, transform: `scale(${scale})`,
      transformOrigin:"50% 100%",
      pointerEvents:"none",
    }}>
      {/* shadow */}
      <div style={{position:"absolute", left:-22, top:42, width:44, height:8, borderRadius:"50%", background:"rgba(0,0,0,0.4)", filter:"blur(2px)"}}/>
      {/* trunk */}
      <div style={{position:"absolute", left:-4, top:24, width:8, height:24, background:"#4a3520", boxShadow:"inset -2px 0 0 #2a1a10"}}/>
      {/* foliage layers — pixel style */}
      <div style={{position:"absolute", left:-18, top:8, width:36, height:24, background:"#2d5a3d", boxShadow:"inset -2px -2px 0 #1a3d27, inset 2px 2px 0 #3f7a52"}}/>
      <div style={{position:"absolute", left:-14, top:-2, width:28, height:18, background:"#3f7a52", boxShadow:"inset -2px -2px 0 #2d5a3d, inset 2px 2px 0 #5a8a6d"}}/>
      <div style={{position:"absolute", left:-10, top:-10, width:20, height:14, background:"#5a8a6d", boxShadow:"inset -1px -1px 0 #3f7a52"}}/>
      {/* highlights */}
      <div style={{position:"absolute", left:-4, top:0, width:4, height:4, background:"#7aaa8d"}}/>
    </div>
  );
}

function Fences() {
  // Fence segments along path — short pickets every 80px on both sides
  const fences = vUseMemo(() => {
    const arr = [];
    for (let i = 0; i < PATH_POINTS.length - 1; i++) {
      const [x1,y1] = PATH_POINTS[i];
      const [x2,y2] = PATH_POINTS[i+1];
      const dx = x2 - x1; const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);
      const offset = 60;
      const steps = Math.floor(dist / 90);
      for (let s = 1; s < steps; s++) {
        const t = s/steps;
        const cx = x1 + dx*t;
        const cy = y1 + dy*t;
        arr.push({ x: cx + perpX*offset, y: cy + perpY*offset, key: `${i}-${s}-l` });
        arr.push({ x: cx - perpX*offset, y: cy - perpY*offset, key: `${i}-${s}-r` });
      }
    }
    return arr;
  }, []);
  return fences.map(f => <FencePost key={f.key} x={f.x} y={f.y}/>);
}

function FencePost({ x, y }) {
  return (
    <div style={{
      position:"absolute", left: x - 4, top: y - 14,
      width: 8, height: 18,
      background:"#a08868",
      boxShadow:"inset -2px 0 0 #7a6448, inset 0 -2px 0 #5a4830",
      pointerEvents:"none",
    }}>
      <div style={{position:"absolute", left:-2, top:4, width:12, height:3, background:"#a08868", boxShadow:"inset 0 -1px 0 #7a6448"}}/>
      <div style={{position:"absolute", left:-2, top:10, width:12, height:3, background:"#a08868", boxShadow:"inset 0 -1px 0 #7a6448"}}/>
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
      const onPath = (y > 720 && y < 880);
      const onHouse = (x > 1260 && x < 1580 && y > 540 && y < 850);
      if (onPath || onHouse) continue;
      const kind = ["flower","mushroom","crystal","rock"][Math.floor(seed(i*7+2)*4)];
      arr.push({ x, y, kind, key: i });
    }
    return arr;
  }, []);
  return items.map(it => <Deco key={it.key} {...it}/>);
}

function Deco({ x, y, kind }) {
  const m = {
    flower:   { color:"var(--neon-pink)",   char:"✿", size:14 },
    mushroom: { color:"var(--neon-red)",    char:"♣", size:16 },
    crystal:  { color:"var(--neon-cyan)",   char:"◆", size:14 },
    rock:     { color:"#7a7488",           char:"▲", size:18 },
  }[kind];
  return (
    <div style={{
      position:"absolute", left: x, top: y,
      fontFamily:"var(--font-pixel)",
      fontSize: m.size, color: m.color,
      opacity: 0.7,
      textShadow:"1px 1px 0 #000",
      pointerEvents:"none",
      userSelect:"none",
    }}>{m.char}</div>
  );
}

// ============================================================
// SIGN POST
// ============================================================
function Sign({ sign, near }) {
  const colorMap = {
    magenta: "var(--neon-magenta)",
    cyan: "var(--neon-cyan)",
    yellow: "var(--neon-yellow)",
    green: "var(--neon-green)",
  };
  const c = colorMap[sign.color];

  return (
    <div style={{
      position:"absolute",
      left: sign.x - 30, top: sign.y - 80,
      width: 60, height: 80,
      pointerEvents:"none",
    }}>
      {/* Hover hint above sign */}
      {near && (
        <div style={{
          position:"absolute", top:-44, left:"50%", transform:"translateX(-50%)",
          fontFamily:"var(--font-pixel)", fontSize:9,
          background:"var(--neon-yellow)", color:"#000",
          padding:"4px 8px", whiteSpace:"nowrap",
          animation:"bob 0.6s ease-in-out infinite alternate",
        }}>▶ READ [E]</div>
      )}
      {/* Floating tag with title (subtle when not near) */}
      <div style={{
        position:"absolute", top:-22, left:"50%", transform:"translateX(-50%)",
        fontFamily:"var(--font-pixel)", fontSize:8,
        color: near ? c : "var(--ink-dim)",
        background:"rgba(10,4,24,0.8)",
        border:`1px solid ${near ? c : "var(--bevel-mid)"}`,
        padding:"2px 6px", whiteSpace:"nowrap",
        textShadow:"1px 1px 0 #000",
      }}>{sign.title}</div>

      {/* Sign post */}
      {/* board */}
      <div style={{
        position:"absolute", left:8, top:8,
        width:44, height:36,
        background:"#a08868",
        boxShadow:`
          inset -3px -3px 0 #6a4830,
          inset 3px 3px 0 #c8a878,
          0 0 0 2px #4a3520
        `,
      }}>
        {/* nails */}
        <div style={{position:"absolute", left:3, top:3, width:3, height:3, background:"#3a2d1a", borderRadius:"50%"}}/>
        <div style={{position:"absolute", right:3, top:3, width:3, height:3, background:"#3a2d1a", borderRadius:"50%"}}/>
        <div style={{position:"absolute", left:3, bottom:3, width:3, height:3, background:"#3a2d1a", borderRadius:"50%"}}/>
        <div style={{position:"absolute", right:3, bottom:3, width:3, height:3, background:"#3a2d1a", borderRadius:"50%"}}/>
        {/* icon on board */}
        <div style={{
          position:"absolute", inset:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"var(--font-pixel)", fontSize:18,
          color: c,
          textShadow:`0 0 6px ${c}, 1px 1px 0 #000`,
        }}>{sign.icon}</div>
      </div>
      {/* post */}
      <div style={{
        position:"absolute", left:26, top:44,
        width:8, height:36,
        background:"#7a6448",
        boxShadow:"inset -2px 0 0 #5a4830, inset 2px 0 0 #a08868",
      }}/>
      {/* shadow */}
      <div style={{
        position:"absolute", left:6, top:78,
        width:48, height:6, borderRadius:"50%",
        background:"rgba(0,0,0,0.5)", filter:"blur(2px)",
      }}/>
      {/* glow when near */}
      {near && (
        <div style={{
          position:"absolute", inset:0,
          boxShadow: `0 0 24px ${c}`,
          pointerEvents:"none",
        }}/>
      )}
    </div>
  );
}

// ============================================================
// HOUSE
// ============================================================
function House({ near }) {
  const D = window.PORTFOLIO_DATA;
  const h = D.house;
  return (
    <div style={{
      position:"absolute",
      left: h.x, top: h.y,
      width: h.w, height: h.h,
      pointerEvents:"none",
    }}>
      {/* shadow */}
      <div style={{
        position:"absolute", left:10, top: h.h - 12,
        width: h.w - 20, height: 16, borderRadius:"50%",
        background:"rgba(78,42,96,0.35)", filter:"blur(4px)",
      }}/>

      {/* roof — pixel triangle */}
      <div style={{
        position:"absolute", left: 0, top: 0,
        width: h.w, height: 90,
        background:`
          repeating-linear-gradient(0deg, #ff7acb 0px, #ff7acb 8px, #ffb1dc 8px, #ffb1dc 16px)
        `,
        clipPath:"polygon(50% 0, 100% 100%, 0 100%)",
        filter:"drop-shadow(2px 2px 0 #7d3c82)",
      }}/>
      <div style={{position:"absolute", left:54, top:48, width:28, height:18, background:"#ffe680", boxShadow:"inset -2px -2px 0 #d4a020", transform:"rotate(-19deg)"}}/>
      <div style={{position:"absolute", left:200, top:50, width:26, height:16, background:"#9df4ff", boxShadow:"inset -2px -2px 0 #39a8c2", transform:"rotate(19deg)"}}/>

      {/* chimney */}
      <div style={{position:"absolute", left: 200, top: 10, width: 24, height: 50, background:"#8f6fb0", boxShadow:"inset -3px 0 0 #5c4280"}}/>
      <div style={{position:"absolute", left: 196, top: 6, width: 32, height: 8, background:"#5c4280"}}/>
      {/* smoke */}
      <Smoke baseX={208} baseY={0}/>

      {/* roof edge */}
      <div style={{position:"absolute", left:0, top:84, width:h.w, height:8, background:"#c83c91", boxShadow:"0 3px 0 #ffe680"}}/>

      {/* walls */}
      <div style={{
        position:"absolute", left:8, top:90, width: h.w - 16, height: h.h - 90,
        background: `
          repeating-linear-gradient(90deg, #ffe0a8 0px, #ffe0a8 32px, #f4c987 32px, #f4c987 33px),
          #ffd39a
        `,
        boxShadow:`
          inset -4px -4px 0 #c58b5e,
          inset 4px 4px 0 #fff1c7
        `,
        borderRadius:"0 0 10px 10px",
      }}>
        {/* horizontal beam */}
        <div style={{position:"absolute", left:0, top:60, width:"100%", height:4, background:"#d98b9f"}}/>

        {/* windows */}
        <Window x={28} y={16}/>
        <Window x={194} y={16}/>
        <div style={{position:"absolute", left:22, top:62, width:72, height:12, background:"#70a978", boxShadow:"inset -2px -2px 0 #3f7a52"}}>
          <div style={{position:"absolute", left:8, top:-5, width:6, height:6, background:"#ff7acb"}}/>
          <div style={{position:"absolute", left:28, top:-5, width:6, height:6, background:"#ffd84d"}}/>
          <div style={{position:"absolute", left:50, top:-5, width:6, height:6, background:"#9df4ff"}}/>
        </div>
        <div style={{position:"absolute", left:188, top:62, width:72, height:12, background:"#70a978", boxShadow:"inset -2px -2px 0 #3f7a52"}}>
          <div style={{position:"absolute", left:10, top:-5, width:6, height:6, background:"#ffd84d"}}/>
          <div style={{position:"absolute", left:34, top:-5, width:6, height:6, background:"#ff7acb"}}/>
          <div style={{position:"absolute", left:54, top:-5, width:6, height:6, background:"#9df4ff"}}/>
        </div>

        {/* door */}
        <div style={{
          position:"absolute", left: 108, bottom: 0,
          width: 48, height: 66,
          background:"#b86a8d",
          borderRadius:"24px 24px 0 0",
          boxShadow:`
            inset -3px -3px 0 #7d3c5d,
            inset 3px 3px 0 #f1a5c6,
            0 0 0 3px #7d3c5d
          `,
        }}>
          {/* door panels */}
          <div style={{position:"absolute", left:8, top:16, width:32, height:16, border:"2px solid #7d3c5d", borderRadius:"8px 8px 2px 2px"}}/>
          <div style={{position:"absolute", left:8, top:38, width:32, height:18, border:"2px solid #7d3c5d"}}/>
          {/* knob */}
          <div style={{position:"absolute", right:8, top:36, width:6, height:6, background:"#ffd84d", borderRadius:"50%", boxShadow:"0 0 6px #ffd84d"}}/>
        </div>

        {/* welcome mat */}
        <div style={{
          position:"absolute", left: 94, bottom: -10,
          width: 76, height: 12,
          background:"#63e6ff",
          boxShadow:"inset 0 -3px 0 #2c8eb0",
          borderRadius:"2px",
        }}/>

        {/* house sign */}
        <div style={{
          position:"absolute", left: 82, top: 26,
          width: 100, height: 18,
          background:"#fff1c7",
          boxShadow:"inset -2px -2px 0 #d4a020, inset 2px 2px 0 #fff8df, 0 2px 0 #b86a8d",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"var(--font-pixel)", fontSize:7,
          color:"#b86a8d",
          textShadow:"1px 1px 0 #fff8df",
        }}>SWEET LAB</div>
      </div>

      {/* prompt when near door */}
      {near && (
        <div style={{
          position:"absolute", left:"50%", bottom:-32, transform:"translateX(-50%)",
          fontFamily:"var(--font-pixel)", fontSize:9,
          background:"var(--neon-yellow)", color:"#000",
          padding:"4px 8px", whiteSpace:"nowrap",
          animation:"bob 0.6s ease-in-out infinite alternate",
        }}>▶ ENTER [E]</div>
      )}
    </div>
  );
}

function Window({ x, y }) {
  return (
    <div style={{
      position:"absolute", left: x, top: y,
      width: 60, height: 40,
      background:"#3b2368",
      borderRadius:"10px 10px 4px 4px",
      boxShadow:"inset 2px 2px 0 #b86a8d, inset -2px -2px 0 #7d3c82, 0 0 10px rgba(255,216,77,0.45)",
    }}>
      {/* warm light */}
      <div style={{
        position:"absolute", inset:4,
        background:"linear-gradient(135deg, #fff1c7 0%, #ffd84d 45%, #ffb1dc 100%)",
        borderRadius:"7px 7px 2px 2px",
        opacity: 0.9,
      }}/>
      {/* cross frame */}
      <div style={{position:"absolute", left:"50%", top:3, width:2, height:"85%", background:"#b86a8d", transform:"translateX(-50%)"}}/>
      <div style={{position:"absolute", left:4, top:"52%", width:"86%", height:2, background:"#b86a8d", transform:"translateY(-50%)"}}/>
      {/* sill */}
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
    <div key={i} style={{
      position:"absolute", left: p.x, top: p.y,
      width: p.size, height: p.size,
      borderRadius:"50%",
      background:"rgba(180,140,255,0.4)",
      animation: `smoke 4s ease-in-out infinite`,
      animationDelay: `${p.delay * 0.3}s`,
    }}/>
  ));
}

// --- Player Sprite ---
function Player({ dir, moving }) {
  return (
    <div style={{
      width: 32, height: 48,
      position: "relative",
      animation: moving ? "playerBob 0.28s steps(2) infinite" : "none",
      transform: dir === "left" ? "scaleX(-1)" : "scaleX(1)",
    }}>
      {/* star charm */}
      <div style={{
        position: "absolute", left: 24, top: 4,
        width: 5, height: 5,
        background: "var(--neon-yellow)",
        boxShadow: "0 0 6px var(--neon-yellow), 0 5px 0 #d4a020",
        transform: "rotate(45deg)",
      }}/>

      {/* bow / soft ears */}
      <div style={{ position: "absolute", left: 4, top: 4, width: 9, height: 9, background: "#ff7acb", boxShadow: "inset -2px -2px 0 #c83c91" }}/>
      <div style={{ position: "absolute", left: 19, top: 4, width: 9, height: 9, background: "#ff7acb", boxShadow: "inset -2px -2px 0 #c83c91" }}/>
      <div style={{ position: "absolute", left: 13, top: 7, width: 6, height: 6, background: "var(--neon-yellow)", boxShadow: "inset -1px -1px 0 #d4a020" }}/>

      {/* big rounded hair cap */}
      <div style={{
        position: "absolute", left: 5, top: 8,
        width: 22, height: 18,
        background: "#7b5cff",
        borderRadius: "10px 10px 6px 6px",
        boxShadow: "inset -3px -2px 0 #4c35a8, inset 2px 1px 0 #ad9cff",
      }}/>

      {/* face */}
      <div style={{
        position: "absolute", left: 7, top: 14,
        width: 18, height: 14,
        background: "#ffd9c6",
        borderRadius: "7px",
        boxShadow: "inset -2px -1px 0 #e4aa90",
      }}/>
      <div style={{ position: "absolute", left: 10, top: 18, width: 3, height: 4, background: "#21133d", borderRadius: 2 }}/>
      <div style={{ position: "absolute", left: 20, top: 18, width: 3, height: 4, background: "#21133d", borderRadius: 2 }}/>
      <div style={{ position: "absolute", left: 11, top: 23, width: 4, height: 2, background: "#ff8dbd", opacity: 0.9 }}/>
      <div style={{ position: "absolute", left: 19, top: 23, width: 4, height: 2, background: "#ff8dbd", opacity: 0.9 }}/>
      <div style={{ position: "absolute", left: 15, top: 24, width: 4, height: 2, background: "#b04d6b" }}/>

      {/* tiny hoodie body */}
      <div style={{
        position: "absolute", left: 8, top: 28,
        width: 17, height: 14,
        background: "#63e6ff",
        borderRadius: "5px 5px 3px 3px",
        boxShadow: "inset -3px -2px 0 #2c8eb0, inset 2px 1px 0 #b6f6ff",
      }}/>
      <div style={{ position: "absolute", left: 14, top: 31, width: 5, height: 5, background: "#fff2ff", boxShadow: "inset -1px -1px 0 #b6f6ff" }}/>

      {/* stubby arms */}
      <div style={{ position: "absolute", left: 5, top: 31, width: 5, height: 8, background: "#ff7acb", borderRadius: 3, boxShadow: "inset -1px -1px 0 #c83c91" }}/>
      <div style={{ position: "absolute", left: 23, top: 31, width: 5, height: 8, background: "#ff7acb", borderRadius: 3, boxShadow: "inset -1px -1px 0 #c83c91" }}/>

      {/* little feet */}
      <div style={{ position: "absolute", left: 9, top: 41, width: 7, height: 5, background: "#4c35a8", borderRadius: "0 0 3px 3px" }}/>
      <div style={{ position: "absolute", left: 18, top: 41, width: 7, height: 5, background: "#4c35a8", borderRadius: "0 0 3px 3px" }}/>
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

export { House, PATH_POINTS, Player, Sign, VillageBackground };
