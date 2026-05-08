import React from "react";
import { Player } from "./world.jsx";

// ============================================================
// INDOOR SCENE - house gallery with project frames
// ============================================================

const { useEffect: iUseEffect, useMemo: iUseMemo, useRef: iUseRef, useState: iUseState } = React;

const ROOM_W = 2200;
const PLAYER_W = 32;
const PLAYER_H = 48;
const PLAYER_SCALE = 1.6;
const FRAME_W = 160;
const FRAME_BODY_H = 144;
const FRAME_Y = 92;
const FRAME_SPACING = 260;
const GAME_LETTERBOX_X = 150;
const GAME_LETTERBOX_Y = 200;
const MIN_GAME_W = 640;
const MIN_GAME_H = 420;

function getGameViewport() {
  return {
    w: Math.max(MIN_GAME_W, window.innerWidth - GAME_LETTERBOX_X * 2),
    h: Math.max(MIN_GAME_H, window.innerHeight - GAME_LETTERBOX_Y * 2),
  };
}

function HouseInterior({ onExit, onSelectProject, disabled = false }) {
  const D = window.PORTFOLIO_DATA;
  const projects = D.projects;
  const keys = iUseRef({});
  const [pos, setPos] = iUseState(() => ({ x: 118, y: Math.max(360, getGameViewport().h - 220) }));
  const [dir, setDir] = iUseState("right");
  const [moving, setMoving] = iUseState(false);
  const [vp, setVp] = iUseState(getGameViewport);

  const frames = iUseMemo(() => {
    const startX = 360;
    return projects.map((project, index) => ({
      project,
      x: startX + index * FRAME_SPACING,
      y: FRAME_Y,
    }));
  }, [projects]);

  const stageH = vp.h;
  const floorTop = Math.round(stageH * 0.7) + 20;
  const walkTop = Math.min(stageH - PLAYER_H * PLAYER_SCALE - 64, floorTop);
  const walkBottom = stageH - 30;
  const playerCenterX = pos.x + PLAYER_W / 2;
  const nearestFrame = frames.find(({ x }) => Math.abs(playerCenterX - (x + FRAME_W / 2)) < 92);
  const nearDoor = pos.x < 190 && pos.y > walkTop - 40;
  const camX = Math.max(0, Math.min(ROOM_W - vp.w, pos.x + PLAYER_W / 2 - vp.w / 2));

  iUseEffect(() => {
    const onResize = () => setVp(getGameViewport());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  iUseEffect(() => {
    setPos((p) => ({
      x: p.x,
      y: Math.max(walkTop, Math.min(walkBottom - PLAYER_H, p.y)),
    }));
  }, [walkTop, walkBottom]);

  iUseEffect(() => {
    const down = (e) => {
      const key = e.key.toLowerCase();
      if (disabled) return;
      keys.current[key] = true;
      if (key === "e") {
        if (nearestFrame) onSelectProject(nearestFrame.project);
        else if (nearDoor) onExit();
      }
      if (e.key === "Escape") onExit();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "e"].includes(key)) {
        e.preventDefault();
      }
    };
    const up = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [disabled, nearDoor, nearestFrame, onExit, onSelectProject]);

  iUseEffect(() => {
    let raf;
    const tick = () => {
      const k = keys.current;
      if (disabled) {
        setMoving(false);
        raf = requestAnimationFrame(tick);
        return;
      }
      const speed = 8;
      let dx = 0;
      let dy = 0;
      if (k.arrowleft || k.a) dx -= speed;
      if (k.arrowright || k.d) dx += speed;
      if (k.arrowup || k.w) dy -= speed;
      if (k.arrowdown || k.s) dy += speed;
      if (dx && dy) {
        dx *= 0.707;
        dy *= 0.707;
      }

      if (dx || dy) {
        setMoving(true);
        if (dx > 0) setDir("right");
        else if (dx < 0) setDir("left");
        else if (dy > 0) setDir("down");
        else if (dy < 0) setDir("up");
        setPos((p) => ({
          x: Math.max(40, Math.min(ROOM_W - PLAYER_W - 50, p.x + dx)),
          y: Math.max(walkTop, Math.min(walkBottom - PLAYER_H, p.y + dy)),
        }));
      } else {
        setMoving(false);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [disabled, walkBottom, walkTop]);

  return (
    <div style={{
      position:"absolute", inset:0,
      background:"#05020f",
      zIndex: 200,
      overflow:"hidden",
    }}>
      {/* room base - wide horizontal hall */}
      <div style={{
        position:"absolute", inset: 0,
        overflow:"hidden",
      }}>
      <div style={{
        position:"relative",
        width: ROOM_W, height:"100%",
        transform: `translateX(${-camX}px)`,
        transition: "transform 0.08s linear",
      }}>
        {/* back wall */}
        <div style={{
          position:"absolute", left:0, top:0, width:"100%", height:"70%",
          background:`
            repeating-linear-gradient(90deg,
              #8b72a4 0px, #8b72a4 32px,
              #7b6294 32px, #7b6294 33px),
            linear-gradient(180deg, #9a82b2 0%, #6f5688 100%)
          `,
          boxShadow:"inset 0 -8px 0 rgba(0,0,0,0.4)",
        }}>
          {/* wall trim */}
          <div style={{
            position:"absolute", left:0, top:60, width:"100%", height:6,
            background:"#574078",
            boxShadow:"0 -2px 0 #7a6488 inset",
          }}/>
          {/* baseboard */}
          <div style={{
            position:"absolute", left:0, bottom:0, width:"100%", height:24,
            background:"#574078",
            boxShadow:"inset 0 2px 0 #5a4468",
          }}/>
        </div>

        {/* floor */}
        <div style={{
          position:"absolute", left:0, top:"70%", width:"100%", height:"30%",
          background:`
            repeating-linear-gradient(0deg,
              #8a6248 0px, #8a6248 32px,
              #75533d 32px, #75533d 36px),
            linear-gradient(180deg, #9b7256 0%, #684735 100%)
          `,
        }}>
          {/* perspective lines */}
          <div style={{
            position:"absolute", inset:0,
            background:`repeating-linear-gradient(90deg,
              transparent 0px, transparent 80px,
              rgba(0,0,0,0.08) 80px, rgba(0,0,0,0.08) 82px)`,
          }}/>
          {/* rug - long runner */}
          <div style={{
            position:"absolute", left:"50%", top: 30,
            transform:"translateX(-50%)",
            width: 1780, height: 88,
            background:`
              repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px),
              linear-gradient(180deg, #776094 0%, #5f4c7e 100%)
            `,
            border:"3px solid #a993c7",
            boxShadow:"inset 0 0 0 2px rgba(255,255,255,0.08), 4px 4px 0 rgba(0,0,0,0.22)",
          }}>
            <div style={{position:"absolute", inset:9, border:"2px dashed rgba(255,242,255,0.24)", opacity:1}}/>
          </div>
        </div>

        {/* Title plate at top */}
        <div style={{
          position:"absolute", left:"50%", top: 16,
          transform:"translateX(-50%)",
          fontFamily:"var(--font-pixel)", fontSize:14,
          color:"var(--neon-yellow)",
          textShadow:"2px 2px 0 #000, 0 0 12px var(--neon-yellow)",
          letterSpacing: 2,
          background:"rgba(49,32,92,0.88)",
          border:"3px solid var(--bevel-light)",
          padding:"8px 16px",
          zIndex: 5,
        }}>
          SOLAR 작업실 - 프로젝트 갤러리
        </div>

        {/* Frames - single row, lined up along the back wall */}
        {frames.map(({ project, x, y }) => (
          <Frame
            key={project.id}
            project={project}
            x={x}
            y={y}
            near={nearestFrame?.project.id === project.id}
            onClick={() => onSelectProject(project)}
          />
        ))}

        {/* Furniture: wooden table & lamp on the floor */}
        <Furniture/>

        {/* Door (back to exit) */}
        <div style={{
          position:"absolute", left: 32, top: "60%",
          width: 80, height: 140,
          background:"#7a4830",
          boxShadow:`
            inset -3px -3px 0 #3a1a10,
            inset 3px 3px 0 #7a4830,
            0 0 0 4px #2a1a10
          `,
          cursor:"pointer",
        }} onClick={onExit}>
          <div style={{position:"absolute", left:8, top:12, width:64, height:50, border:"2px solid #3a1a10"}}/>
          <div style={{position:"absolute", left:8, top:78, width:64, height:50, border:"2px solid #3a1a10"}}/>
          <div style={{position:"absolute", right:10, top:70, width:6, height:6, background:"#ffd84d", borderRadius:"50%", boxShadow:"0 0 6px #ffd84d"}}/>
          <div style={{
            position:"absolute", left:"50%", bottom:-30, transform:"translateX(-50%)",
            fontFamily:"var(--font-pixel)", fontSize:9,
            background:"var(--neon-yellow)", color:"#000",
            padding:"4px 8px", whiteSpace:"nowrap",
            animation:"bob 0.6s ease-in-out infinite alternate",
          }}>나가기 [E]</div>
        </div>

        <div className="player" style={{
          left: pos.x,
          top: pos.y,
          zIndex: 20,
          transform: `scale(${PLAYER_SCALE})`,
          transformOrigin: "50% 100%",
        }}>
          <Player dir={dir} moving={moving}/>
        </div>
      </div>
      </div>
    </div>
  );
}

function Frame({ project, x, y, near, onClick }) {
  const p = project;
  const rarityColor = {
    common: "#cccccc",
    uncommon: "var(--neon-green)",
    rare: "var(--neon-cyan)",
    epic: "var(--neon-purple)",
    legendary: "var(--neon-yellow)",
  }[p.rarity];

  return (
    <div style={{
      width: FRAME_W, height: 184,
      cursor:"pointer",
      position:"absolute",
      left: x,
      top: y,
      transition:"transform 0.15s, filter 0.15s",
      filter: near ? `drop-shadow(0 0 12px ${rarityColor})` : "none",
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    onClick={onClick}>
      {/* nail above frame */}
      <div style={{
        position:"absolute", left:"50%", top:-4, transform:"translateX(-50%)",
        width: 4, height: 4, background:"#5a4830", borderRadius:"50%",
        boxShadow:"0 1px 0 #000",
      }}/>
      {/* string from nail */}
      <div style={{
        position:"absolute", left:"50%", top: 0, width: 1, height: 8,
        background:"#3a2d1a",
      }}/>

      {/* outer frame - gold */}
      <div style={{
        width:"100%", height: FRAME_BODY_H,
        background:`
          linear-gradient(135deg, #ffd84d 0%, #d4a020 50%, #ffd84d 100%)
        `,
        boxShadow:`
          inset -3px -3px 0 #8a6810,
          inset 3px 3px 0 #ffe680,
          4px 4px 0 rgba(0,0,0,0.5)
        `,
        padding: 8,
        position:"relative",
      }}>
        {/* inner frame - dark */}
        <div style={{
          width:"100%", height:"100%",
          background:"#2d1a52",
          boxShadow:`
            inset 2px 2px 0 #0a0420,
            inset -2px -2px 0 #3a2d6b
          `,
          padding: 5,
          position:"relative",
        }}>
          {/* "canvas" - project thumbnail (procedural) */}
          <div style={{
            width:"100%", height:"100%",
            background: `linear-gradient(135deg, ${p.thumbColor[0]} 0%, ${p.thumbColor[1]} 100%)`,
            position:"relative",
            overflow:"hidden",
          }}>
            {/* scanlines on canvas */}
            <div style={{
              position:"absolute", inset:0,
              background:"repeating-linear-gradient(0deg, transparent 0, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 5px)",
            }}/>
            {/* big icon */}
            <div style={{
              position:"absolute", inset:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"var(--font-pixel)", fontSize: 42,
              color:"#fff",
              textShadow:`3px 3px 0 rgba(0,0,0,0.5)`,
            }}>{p.icon}</div>
            {/* title bar across bottom */}
            <div style={{
              position:"absolute", left:0, right:0, bottom:0,
              padding:"3px 5px",
              background:"rgba(49,32,92,0.88)",
              fontFamily:"var(--font-pixel)", fontSize:6,
              color:"#fff",
              borderTop: `1px solid ${rarityColor}`,
              display:"flex", justifyContent:"space-between",
            }}>
              <span>{p.name}</span>
              <span style={{color: rarityColor}}>{p.rarity[0].toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* nameplate below frame */}
      <div style={{
        position:"absolute", left:"50%", top: 148,
        transform:"translateX(-50%)",
        background:"#7a6448",
        boxShadow:"inset -2px -2px 0 #5a4830, inset 2px 2px 0 #a08868",
        padding:"3px 8px",
        fontFamily:"var(--font-pixel)", fontSize:7,
        color:"#ffd84d",
        textShadow:"1px 1px 0 #000",
        whiteSpace:"nowrap",
      }}>{p.yr}</div>
      {near && (
        <div style={{
          position:"absolute", left:"50%", top: 186,
          transform:"translateX(-50%)",
          fontFamily:"var(--font-pixel)", fontSize:8,
          background:"var(--neon-yellow)", color:"#000",
          padding:"4px 8px", whiteSpace:"nowrap",
          animation:"bob 0.6s ease-in-out infinite alternate",
        }}>보기 [E]</div>
      )}
    </div>
  );
}

function Furniture() {
  return (
    <>
      {/* small wooden chest right side */}
      <div style={{
        position:"absolute", right: 80, top: "73%",
        width: 80, height: 60,
      }}>
        <div style={{position:"absolute", left:0, top:8, width:80, height:50, background:"#7a4830", boxShadow:"inset -3px -3px 0 #4a2810, inset 3px 3px 0 #a06850"}}/>
        <div style={{position:"absolute", left:0, top:0, width:80, height:14, background:"#a06850", boxShadow:"inset -2px -2px 0 #7a4830, inset 2px 2px 0 #c89070"}}/>
        <div style={{position:"absolute", left:36, top:18, width:8, height:10, background:"#ffd84d", boxShadow:"0 0 4px #ffd84d"}}/>
        <div style={{position:"absolute", left:0, top:62, width:80, height:6, background:"rgba(0,0,0,0.5)", filter:"blur(2px)"}}/>
      </div>

      {/* lamp left side */}
      <div style={{position:"absolute", left: 140, top: "70%", width: 40, height: 100}}>
        {/* shade */}
        <div style={{position:"absolute", left:4, top:0, width:32, height:20, background:"#ffd84d", boxShadow:"inset -3px -3px 0 #d4a020, 0 0 16px rgba(255,216,77,0.6)"}}/>
        {/* pole */}
        <div style={{position:"absolute", left:18, top:18, width:4, height:60, background:"#3a2d4a"}}/>
        {/* base */}
        <div style={{position:"absolute", left:8, top:78, width:24, height:8, background:"#3a2d4a", boxShadow:"inset -2px -2px 0 #1a0f2a"}}/>
        <div style={{position:"absolute", left:0, top:88, width:40, height:4, background:"rgba(0,0,0,0.5)", filter:"blur(1px)"}}/>
      </div>

      {/* potted plant */}
      <div style={{position:"absolute", right: 200, top: "72%", width: 50, height: 80}}>
        <div style={{position:"absolute", left:8, top:36, width:34, height:28, background:"#7a4830", boxShadow:"inset -2px -2px 0 #4a2810, inset 2px 2px 0 #a06850"}}/>
        <div style={{position:"absolute", left:5, top:32, width:40, height:8, background:"#a06850", boxShadow:"inset -1px -1px 0 #7a4830"}}/>
        {/* leaves */}
        <div style={{position:"absolute", left:14, top:8, width:22, height:30, background:"#3f7a52", borderRadius:"50% 50% 30% 30%", boxShadow:"inset -3px -3px 0 #2d5a3d"}}/>
        <div style={{position:"absolute", left:8, top:18, width:14, height:22, background:"#5a8a6d", borderRadius:"50% 50% 30% 30%", transform:"rotate(-25deg)"}}/>
        <div style={{position:"absolute", left:28, top:18, width:14, height:22, background:"#5a8a6d", borderRadius:"50% 50% 30% 30%", transform:"rotate(25deg)"}}/>
      </div>
    </>
  );
}

window.HouseInterior = HouseInterior;

export { HouseInterior };

