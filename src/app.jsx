import React from "react";
import {
  House,
  Player,
  Sign,
  VillageBackground,
} from "./world.jsx";
import {
  CompassClock,
  MiniMap,
  NowPlaying,
  PlayerCard,
} from "./hud.jsx";
import { ProjectModal, SignModal } from "./modals.jsx";
import { HouseInterior } from "./interior.jsx";
import {
  TweakSection,
  TweakSlider,
  TweakToggle,
  TweaksPanel,
  useTweaks,
} from "./tweaks-panel.jsx";

// ============================================================
// MAIN APP ??Village + camera + indoor switching
// ============================================================

const { useState: aUseState, useEffect: aUseEffect, useRef: aUseRef, useMemo: aUseMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scanlineIntensity": 0.6,
  "crtFlicker": true,
  "rgbMask": true,
  "speed": 8,
  "showHud": true
}/*EDITMODE-END*/;

const WORLD_W = 1700;
const WORLD_H = 1100;
const PLAYER_W = 32;
const PLAYER_H = 48;

function App() {
  const D = window.PORTFOLIO_DATA;
  const [booted, setBooted] = aUseState(false);
  const [pos, setPos] = aUseState({ x: 200, y: 800 });
  const [dir, setDir] = aUseState("down");
  const [moving, setMoving] = aUseState(false);
  const [openSign, setOpenSign] = aUseState(null);
  const [openProject, setOpenProject] = aUseState(null);
  const [insideHouse, setInsideHouse] = aUseState(false);
  const [time, setTime] = aUseState("00:00");
  const [tweaks, setTweak] = useTweaks
    ? useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];
  const [tweaksOpen, setTweaksOpen] = aUseState(false);

  const keys = aUseRef({});

  const anyModalOpen = openSign || openProject;

  // Keyboard
  aUseEffect(() => {
    const down = (e) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === "Escape") {
        if (openProject) setOpenProject(null);
        else if (openSign) setOpenSign(null);
        else if (insideHouse) setInsideHouse(false);
      }
      if (e.key.toLowerCase() === "e" && !anyModalOpen) {
        if (insideHouse) return;
        const sign = nearestSign(pos);
        if (sign) {
          setOpenSign(sign);
          return;
        }
        const atDoor = nearHouseDoor(pos);
        if (atDoor) {
          setInsideHouse(true);
          return;
        }
      }
      if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," "].includes(e.key.toLowerCase())) {
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
  }, [openSign, openProject, insideHouse, pos]);

  // Game loop
  aUseEffect(() => {
    let raf;
    const tick = () => {
      if (!anyModalOpen && !insideHouse) {
        const k = keys.current;
        const speed = tweaks.speed || 8;
        let dx = 0, dy = 0;
        if (k["arrowleft"] || k["a"])  dx -= speed;
        if (k["arrowright"]|| k["d"])  dx += speed;
        if (k["arrowup"]   || k["w"])  dy -= speed;
        if (k["arrowdown"] || k["s"])  dy += speed;
        if (dx && dy) { dx *= 0.707; dy *= 0.707; }

        if (dx || dy) {
          setMoving(true);
          if (dx > 0) setDir("right");
          else if (dx < 0) setDir("left");
          else if (dy > 0) setDir("down");
          else if (dy < 0) setDir("up");
          setPos(p => ({
            x: Math.max(20, Math.min(WORLD_W - PLAYER_W - 20, p.x + dx)),
            y: Math.max(20, Math.min(WORLD_H - PLAYER_H - 20, p.y + dy)),
          }));
        } else {
          setMoving(false);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [anyModalOpen, insideHouse, tweaks.speed]);

  // Clock
  aUseEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2,"0");
      const mm = String(d.getMinutes()).padStart(2,"0");
      setTime(`${hh}:${mm}`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  function nearestSign(p) {
    const px = p.x + PLAYER_W/2;
    const py = p.y + PLAYER_H/2;
    for (const s of D.signs) {
      if (Math.hypot(s.x - px, s.y - py) < 70) return s;
    }
    return null;
  }
  function nearHouseDoor(p) {
    const h = D.house;
    const dx = h.x + h.doorOffsetX;
    const dy = h.y + h.doorOffsetY;
    const px = p.x + PLAYER_W/2;
    const py = p.y + PLAYER_H/2;
    return Math.hypot(dx - px, dy - py) < 70;
  }

  const nearSign = nearestSign(pos);
  const nearDoor = nearHouseDoor(pos);

  // Camera
  const [vp, setVp] = aUseState({ w: window.innerWidth, h: window.innerHeight });
  aUseEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const camX = Math.max(0, Math.min(WORLD_W - vp.w, pos.x + PLAYER_W/2 - vp.w/2));
  const camY = Math.max(0, Math.min(WORLD_H - vp.h, pos.y + PLAYER_H/2 - vp.h/2));

  // Tweaks panel listener
  aUseEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({type:"__edit_mode_available"}, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  // Place player just outside the door when leaving the house
  function exitHouse() {
    setInsideHouse(false);
    const h = D.house;
    setPos({ x: h.x + h.doorOffsetX - PLAYER_W/2, y: h.y + h.doorOffsetY + 20 });
  }

  return (
    <div className="crt-shell">
      <div className="crt-screen">
        {/* Outdoor world */}
        {!insideHouse && (
          <div className="world-stage">
            <div className="world-map" style={{ transform: `translate(${-camX}px, ${-camY}px)` }}>
              <VillageBackground/>
              <House near={nearDoor}/>
              {D.signs.map(s => (
                <Sign key={s.id} sign={s} near={nearSign?.id === s.id}/>
              ))}
              <div className="player" style={{ left: pos.x, top: pos.y }}>
                <Player dir={dir} moving={moving}/>
              </div>
            </div>
          </div>
        )}

        {/* Indoor scene */}
        {insideHouse && (
          <HouseInterior
            onExit={exitHouse}
            onSelectProject={(p) => setOpenProject(p)}
            disabled={!!openProject}
          />
        )}

        {/* HUD */}
        {tweaks.showHud && (
          <div className="hud">
            <div className="hud-top-left">
              <PlayerCard/>
            </div>
            {!insideHouse && (
              <div className="hud-top-right">
                <MiniMap playerPos={pos} signs={D.signs} house={D.house} worldW={WORLD_W} worldH={WORLD_H}/>
              </div>
            )}
            <div className="hud-bottom-left">
              <NowPlaying insideHouse={insideHouse}/>
            </div>
            <div className="hud-bottom-right" style={{display:"flex", justifyContent:"flex-end"}}>
              <CompassClock time={time}/>
            </div>
          </div>
        )}

        {/* Controls hint */}
        <div className="controls-footer">
          <span><span className="kbd">?묅넃?먥넂</span> / <span className="kbd">WASD</span> MOVE</span>
          <span><span className="kbd">E</span> INTERACT</span>
          <span><span className="kbd">ESC</span> CLOSE</span>
        </div>

        {/* Modals */}
        {openSign && <SignModal sign={openSign} onClose={() => setOpenSign(null)}/>}
        {openProject && <ProjectModal project={openProject} onClose={() => setOpenProject(null)}/>}

        {/* CRT effects */}
        <div className="crt-roll" style={{opacity: tweaks.scanlineIntensity}}/>
        {tweaks.crtFlicker && <div className="crt-flicker"/>}

        {/* Boot screen */}
        {!booted && <BootScreen onStart={() => setBooted(true)}/>}

        {/* Tweaks Panel */}
        {tweaksOpen && (
          <TweaksPanel title="TWEAKS" onClose={() => {
            setTweaksOpen(false);
            window.parent.postMessage({type:"__edit_mode_dismissed"}, "*");
          }}>
            <TweakSection title="CRT EFFECTS">
              <TweakSlider label="Scanline Roll" min={0} max={1} step={0.05}
                value={tweaks.scanlineIntensity} onChange={v => setTweak("scanlineIntensity", v)}/>
              <TweakToggle label="Flicker" value={tweaks.crtFlicker}
                onChange={v => setTweak("crtFlicker", v)}/>
              <TweakToggle label="RGB Mask" value={tweaks.rgbMask}
                onChange={v => setTweak("rgbMask", v)}/>
            </TweakSection>
            <TweakSection title="GAME">
              <TweakSlider label="Move Speed" min={2} max={12} step={1}
                value={tweaks.speed} onChange={v => setTweak("speed", v)}/>
              <TweakToggle label="Show HUD" value={tweaks.showHud}
                onChange={v => setTweak("showHud", v)}/>
            </TweakSection>
          </TweaksPanel>
        )}

        {!tweaks.rgbMask && <style>{`.crt-screen::after { display: none; }`}</style>}
      </div>
    </div>
  );
}

// ============================================================
// BOOT SCREEN
// ============================================================
function BootScreen({ onStart }) {
  const [stage, setStage] = aUseState(0);
  const [hidden, setHidden] = aUseState(false);

  aUseEffect(() => {
    const id = setTimeout(() => setStage(1), 2400);
    return () => clearTimeout(id);
  }, []);

  aUseEffect(() => {
    const onKey = (e) => {
      if (stage === 1 && (e.key === "Enter" || e.key === " " || e.key.toLowerCase() === "e")) {
        setHidden(true);
        setTimeout(onStart, 500);
      }
    };
    const onClick = () => {
      if (stage === 1) {
        setHidden(true);
        setTimeout(onStart, 500);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [stage]);

  if (stage === 0) {
    return (
      <div className={`boot-screen ${hidden ? "hidden" : ""}`}>
        <div>
          <div style={{fontFamily:"var(--font-pixel)", fontSize:14, color:"var(--neon-magenta)", marginBottom:20}}>
            SOLAR-BIOS v3.21 (C) 2026 쨌 POST
          </div>
          <div className="boot-progress">
            <span className="line">??Detecting CPU... CHAOTIC GOOD @ 4.2 GHz</span>
            <span className="line">??Memory test: 7,820 / 10,000 XP ??OK</span>
            <span className="line">??Loading village from MAP.DAT...</span>
            <span className="line">??Mounting WORKSHOP.GALLERY... 6 frames</span>
            <span className="line">??Initializing pathfinder... OK</span>
            <span className="line" style={{color:"var(--neon-yellow)"}}>??Boot complete. Welcome to Solar Village.</span>
          </div>
        </div>
        <div style={{textAlign:"center", color:"var(--ink-dim)", fontFamily:"var(--font-mono)", fontSize:14, letterSpacing:2}}>
          PORTFOLIO.EXE ??solar / 2026
        </div>
      </div>
    );
  }

  return (
    <div className={`boot-screen ${hidden ? "hidden" : ""}`} style={{justifyContent:"center"}}>
      <div>
        <div className="boot-logo">SOLAR.EXE</div>
        <div className="boot-subtitle">A PORTFOLIO ADVENTURE 쨌 1998쨌STYLE</div>
        <div style={{marginTop:60, marginBottom:60, display:"flex", justifyContent:"center"}}>
          <div style={{
            background:"var(--bg-panel)",
            border:"3px solid var(--bevel-light)",
            padding:"16px 24px",
            display:"flex", gap:20, alignItems:"center",
          }}>
            <div style={{transform:"scale(2)", marginRight:12}}>
              <Player dir="down" moving={false}/>
            </div>
            <div>
              <div style={{fontFamily:"var(--font-pixel)", fontSize:14, color:"var(--neon-yellow)"}}>??NEW GAME</div>
              <div style={{fontFamily:"var(--font-pixel)", fontSize:11, color:"var(--ink-dim)", marginTop:6}}>  CONTINUE...</div>
              <div style={{fontFamily:"var(--font-pixel)", fontSize:11, color:"var(--ink-dim)", marginTop:6}}>  OPTIONS</div>
            </div>
          </div>
        </div>
        <div className="boot-press-start">??PRESS [SPACE] TO START ?</div>
        <div style={{textAlign:"center", marginTop:40, fontFamily:"var(--font-mono)", fontSize:14, color:"var(--ink-mute)"}}>
          짤 2026 SOLAR PRODUCTIONS 쨌 ALL QUESTS RESERVED
        </div>
      </div>
    </div>
  );
}

window.App = App;

export default App;
