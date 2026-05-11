import React from "react";
import "./styles/hud.css";

// ============================================================
// HUD COMPONENTS
// ============================================================

function StatBar({ label, cur, max, color }) {
  const pct = Math.max(0, Math.min(100, (cur / max) * 100));
  return (
    <div className="stat-row">
      <div className="stat-label" style={{color}}>{label}</div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color }}/>
      </div>
      <div className="stat-value" style={{color}}>
        {cur}<span style={{color:"var(--ink-mute)"}}>/</span>{max}
      </div>
    </div>
  );
}

function PlayerCard({ inventory, hp, maxHp }) {
  const D = window.PORTFOLIO_DATA;
  const gold = inventory?.gold ?? D.stats.GOLD;
  const curHp = Number.isFinite(hp) ? hp : D.stats.HP.cur;
  const totalHp = Number.isFinite(maxHp) ? maxHp : D.stats.HP.max;
  return (
    <div className="bevel">
      <div className="title-bar">
        <span>플레이어</span>
        <span style={{color:"#ffd84d"}}>Lv.12</span>
      </div>
      <div style={{padding: 12}}>
        <div style={{display:"flex", gap:10, alignItems:"center", marginBottom:10}}>
          <div style={{
            width: 44, height: 44,
            background: "var(--bg-tile)",
            border: "2px solid var(--bevel-light)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg, var(--neon-magenta), var(--neon-cyan))",
              border: "1px solid #000",
            }}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"var(--font-pixel)", fontSize:11, color:"var(--neon-yellow)", letterSpacing:1}}>{D.player.name}</div>
            <div style={{fontFamily:"var(--font-mono)", fontSize:13, color:"var(--neon-cyan)", letterSpacing:1}}>{D.player.class}</div>
          </div>
        </div>
        <StatBar label="HP" cur={curHp} max={totalHp} color="var(--neon-red)"/>
        <StatBar label="MP" cur={D.stats.MP.cur} max={D.stats.MP.max} color="var(--neon-cyan)"/>
        <StatBar label="XP" cur={D.stats.XP.cur} max={D.stats.XP.next} color="var(--neon-yellow)"/>
        <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontFamily:"var(--font-mono)", fontSize:13, color:"var(--ink-dim)", letterSpacing:1}}>
          <span>골드</span>
          <span style={{color:"var(--neon-yellow)"}}>{gold.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function MiniMap({ playerPos, signs, house, worldW, worldH, inventory }) {
  const colorMap = {
    magenta: "var(--neon-magenta)",
    cyan: "var(--neon-cyan)",
    yellow: "var(--neon-yellow)",
    green: "var(--neon-green)",
  };
  const gold = inventory?.gold ?? window.PORTFOLIO_DATA.stats.GOLD;
  const innerW = 160; const innerH = 104;
  const px = (playerPos.x / worldW) * innerW;
  const py = (playerPos.y / worldH) * innerH;
  const PATH = window.PATH_POINTS || [];
  return (
    <div className="bevel">
      <div className="title-bar">
        <span>지도</span>
        <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--neon-green)"}}>마을</span>
      </div>
      <div style={{padding: 4}}>
        <div className="minimap bevel-inset">
          <div className="minimap-inner">
            <svg width="100%" height="100%" viewBox={`0 0 ${innerW} ${innerH}`} style={{position:"absolute", inset:0}}>
              {PATH.slice(0, -1).map((p, i) => {
                const [x1, y1] = p; const [x2, y2] = PATH[i+1];
                return (
                  <line key={i}
                    x1={x1/worldW*innerW} y1={y1/worldH*innerH}
                    x2={x2/worldW*innerW} y2={y2/worldH*innerH}
                    stroke="rgba(255,200,120,0.5)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
            {house && (
              <div className="minimap-dot" style={{
                left: ((house.x + house.w/2)/worldW)*innerW,
                top: ((house.y + house.h/2)/worldH)*innerH,
                width: 7, height: 6,
                background: "#7a2d4a",
                border: "1px solid #ffd84d",
              }}/>
            )}
            {signs && signs.map(s => (
              <div key={s.id} className="minimap-dot minimap-zone"
                style={{
                  left: (s.x/worldW)*innerW,
                  top: (s.y/worldH)*innerH,
                  background: colorMap[s.color],
                  borderColor: colorMap[s.color],
                  boxShadow: `0 0 4px ${colorMap[s.color]}`,
                }}/>
            ))}
            <div className="minimap-dot minimap-player" style={{ left: px, top: py }}/>
          </div>
        </div>
        <div className="coords" style={{textAlign:"center"}}>
          <span style={{color:"var(--ink-dim)"}}>위치 </span>
          <span style={{color:"var(--neon-green)"}}>X:{Math.floor(playerPos.x).toString().padStart(4,"0")}</span>
          <span style={{color:"var(--ink-mute)"}}> / </span>
          <span style={{color:"var(--neon-green)"}}>Y:{Math.floor(playerPos.y).toString().padStart(4,"0")}</span>
        </div>
        <div className="minimap-gold">
          <span>GOLD</span>
          <strong>{gold.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
}

function NowPlaying({ insideHouse }) {
  const track = insideHouse ? "작업실 테마 - SOLAR OST" : "마을 테마 - SOLAR OST";
  return (
    <div className="bevel" style={{display:"inline-block"}}>
      <div className="now-playing">
        <span className="eq-bars"><span/><span/><span/><span/></span>
        <span style={{color:"var(--ink-dim)", letterSpacing: 1}}>재생 중</span>
        <span>{track}</span>
      </div>
    </div>
  );
}

function CompassClock({ time }) {
  return (
    <div className="bevel" style={{display:"inline-block"}}>
      <div style={{padding:"8px 14px", display:"flex", gap:14, alignItems:"center", fontFamily:"var(--font-mono)", fontSize:14, letterSpacing:1}}>
        <span style={{color:"var(--ink-dim)"}}>시간</span>
        <span style={{color:"var(--neon-cyan)"}}>{time}</span>
        <span style={{color:"var(--ink-mute)"}}>|</span>
        <span style={{color:"var(--neon-magenta)"}}>저장 3</span>
      </div>
    </div>
  );
}

function ZoneBadge({ near }) {
  if (!near) return null;
  return (
    <div className="bevel" style={{
      position:"absolute",
      top: "20%",
      left: "50%",
      transform: "translateX(-50%)",
      pointerEvents: "none",
    }}>
      <div className="title-bar">
        <span>새 구역</span>
      </div>
      <div style={{padding:"10px 18px", textAlign:"center"}}>
        <div style={{fontFamily:"var(--font-pixel)", fontSize:14, color:"var(--neon-yellow)", textShadow:"2px 2px 0 #000"}}>
          {near.title}
        </div>
        <div style={{fontFamily:"var(--font-mono)", fontSize:14, color:"var(--neon-cyan)", marginTop:4, letterSpacing:1}}>
          {near.sub}
        </div>
      </div>
    </div>
  );
}

window.PlayerCard = PlayerCard;
window.MiniMap = MiniMap;
window.NowPlaying = NowPlaying;
window.CompassClock = CompassClock;
window.ZoneBadge = ZoneBadge;
window.StatBar = StatBar;

export { CompassClock, MiniMap, NowPlaying, PlayerCard, StatBar, ZoneBadge };
