import React from "react";
import { Player } from "./world.jsx";

// ============================================================
// MODAL PANELS - sign dialogue and project detail
// ============================================================

const rarityLabel = {
  common: "일반",
  uncommon: "고급",
  rare: "희귀",
  epic: "영웅",
  legendary: "전설",
};

function ModalShell({ title, code, onClose, children, footerLeft, footerRight }) {
  return (
    <div className="modal-backdrop" onClick={(e) => {
      if (e.target.classList.contains("modal-backdrop")) onClose();
    }}>
      <div className="modal bevel-thick">
        <div className="title-bar">
          <span>{title} {code && <span style={{color:"var(--neon-yellow)", marginLeft:8}}>[{code}]</span>}</span>
          <div className="controls">
            <div className="ctrl-btn">_</div>
            <div className="ctrl-btn">□</div>
            <div className="ctrl-btn" onClick={onClose} style={{color:"var(--neon-red)", cursor:"pointer"}}>X</div>
          </div>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <span>{footerLeft || <><span className="kbd">ESC</span> 닫기</>}</span>
          <span>{footerRight || "SOLAR.EXE v1.2.6"}</span>
        </div>
      </div>
    </div>
  );
}

function SignModal({ sign, onClose }) {
  if (sign.kind === "about") return <AboutSign sign={sign} onClose={onClose}/>;
  if (sign.kind === "skills") return <SkillsSign sign={sign} onClose={onClose}/>;
  if (sign.kind === "quests") return <QuestsSign sign={sign} onClose={onClose}/>;
  return null;
}

function AboutSign({ sign, onClose }) {
  const c = sign.content;
  return (
    <ModalShell title={sign.title} code="ABOUT.DAT" onClose={onClose}>
      <div style={{display:"flex", gap:18, marginBottom:18}}>
        <div style={{
          width: 110, height: 130,
          background:"var(--bg-tile)",
          border:"3px solid var(--bevel-light)",
          boxShadow:"inset 2px 2px 0 #0a0420",
          position:"relative",
          flexShrink: 0,
        }}>
          <div style={{
            position:"absolute", inset:0,
            background:`
              repeating-linear-gradient(0deg, transparent 0, transparent 4px, rgba(255,110,199,0.06) 4px, rgba(255,110,199,0.06) 5px),
              radial-gradient(circle at 50% 60%, rgba(255,110,199,0.3), transparent 70%)
            `,
          }}/>
          <div style={{position:"absolute", left:"50%", top:"58%", transform:"translate(-50%,-50%) scale(2)"}}>
            <Player dir="down" moving={false}/>
          </div>
          <div style={{position:"absolute", top:4, left:4, width:6, height:6, background:"var(--neon-magenta)"}}/>
          <div style={{position:"absolute", top:4, right:4, width:6, height:6, background:"var(--neon-cyan)"}}/>
          <div style={{position:"absolute", bottom:4, left:4, width:6, height:6, background:"var(--neon-yellow)"}}/>
          <div style={{position:"absolute", bottom:4, right:4, width:6, height:6, background:"var(--neon-green)"}}/>
        </div>

        <div style={{flex:1}}>
          <div style={{fontFamily:"var(--font-pixel)", fontSize:14, color:"var(--neon-yellow)", textShadow:"2px 2px 0 #000", marginBottom:6}}>
            {c.heading}
          </div>
          <div style={{
            background:"var(--bg-tile)",
            borderTop:"2px solid var(--bevel-deepest)",
            borderLeft:"2px solid var(--bevel-deepest)",
            borderRight:"2px solid var(--bevel-light)",
            borderBottom:"2px solid var(--bevel-light)",
            padding:"10px 14px",
            fontFamily:"var(--font-mono)", fontSize:17, lineHeight:1.5,
            color:"var(--ink)",
            position:"relative",
          }}>
            {c.lines.map((line, i) => (
              <div key={i} style={{display:"flex", gap:6}}>
                <span style={{color:"var(--neon-magenta)"}}>›</span>
                <span>{line}</span>
              </div>
            ))}
            <div style={{
              position:"absolute", left:-8, top: 14,
              width:0, height:0,
              borderTop:"6px solid transparent",
              borderBottom:"6px solid transparent",
              borderRight:"8px solid var(--bevel-deepest)",
            }}/>
          </div>
        </div>
      </div>

      <div className="bevel-inset" style={{padding:14, marginBottom:14}}>
        <div style={{fontFamily:"var(--font-pixel)", fontSize:10, color:"var(--neon-cyan)", marginBottom:10, letterSpacing:1}}>
          능력치
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px 16px"}}>
          {Object.entries(c.attributes).map(([k,v]) => (
            <AttrRow key={k} label={k} value={v}/>
          ))}
        </div>
      </div>

      <div className="bevel-inset" style={{padding:14}}>
        <div style={{fontFamily:"var(--font-pixel)", fontSize:10, color:"var(--neon-cyan)", marginBottom:10, letterSpacing:1}}>
          프로필 정보
        </div>
        <div className="stat-grid">
          {c.meta.map(m => (
            <div key={m.l} className="stat-line">
              <span className="l">{m.l}</span>
              <span className="v">{m.v}</span>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

function AttrRow({ label, value }) {
  const max = 20;
  const pct = (value / max) * 100;
  return (
    <div style={{padding:"4px 0", borderBottom:"1px dashed var(--bevel-mid)"}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
        <span style={{fontFamily:"var(--font-pixel)", fontSize:10, color:"var(--neon-cyan)"}}>{label}</span>
        <span style={{fontFamily:"var(--font-pixel)", fontSize:10, color:"var(--neon-yellow)"}}>{value}</span>
      </div>
      <div style={{height:6, background:"var(--bevel-deepest)", border:"1px solid var(--bevel-mid)"}}>
        <div style={{height:"100%", width:`${pct}%`, background:"var(--neon-magenta)"}}/>
      </div>
    </div>
  );
}

function SkillsSign({ sign, onClose }) {
  const c = sign.content;
  const colorMap = {
    magenta:"var(--neon-magenta)", cyan:"var(--neon-cyan)",
    yellow:"var(--neon-yellow)", green:"var(--neon-green)",
  };
  const accent = colorMap[sign.color];

  return (
    <ModalShell title={sign.title} code="SKILLS.DAT" onClose={onClose}>
      <div style={{
        background:"var(--bg-panel-2)",
        padding:"12px 14px",
        borderLeft:`4px solid ${accent}`,
        marginBottom:18,
        fontFamily:"var(--font-mono)", fontSize:16, lineHeight:1.5,
      }}>
        <div style={{fontFamily:"var(--font-pixel)", fontSize:14, color: accent, marginBottom:6, textShadow:`0 0 8px ${accent}`}}>
          {c.heading}
        </div>
        <div style={{color:"var(--ink-dim)"}}>{c.intro}</div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10}}>
        {c.skills.map(s => (
          <SkillCard key={s.name} skill={s} accent={accent}/>
        ))}
      </div>
    </ModalShell>
  );
}

function SkillCard({ skill, accent }) {
  const max = 10;
  const isMax = skill.lvl === "MAX";
  const cur = isMax ? max : parseInt(skill.lvl) || 0;
  const pct = (cur / max) * 100;
  return (
    <div className="bevel-inset" style={{padding:"10px 12px", opacity: skill.locked ? 0.5 : 1}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontFamily:"var(--font-pixel)", fontSize:11, color: skill.locked ? "var(--ink-mute)" : "var(--ink)"}}>
          {skill.locked && "잠김 "}{skill.name}
        </div>
        <div style={{fontFamily:"var(--font-pixel)", fontSize:10, color: isMax ? "var(--neon-magenta)" : accent, textShadow: isMax ? `0 0 6px var(--neon-magenta)` : "none"}}>
          {isMax ? "최대" : skill.lvl}
        </div>
      </div>
      <div style={{height:8, background:"var(--bevel-deepest)", border:"1px solid var(--bevel-mid)", margin:"6px 0"}}>
        <div style={{height:"100%", width:`${pct}%`, background: isMax ? "var(--neon-magenta)" : accent,
          backgroundImage:"repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 4px)",
        }}/>
      </div>
      <div style={{fontFamily:"var(--font-mono)", fontSize:14, color:"var(--ink-dim)", letterSpacing:1}}>
        {skill.desc}
      </div>
    </div>
  );
}

function QuestsSign({ sign, onClose }) {
  const c = sign.content;
  return (
    <ModalShell title={sign.title} code="EXP.DAT" onClose={onClose}>
      <div style={{
        background:"var(--bg-panel-2)",
        padding:"12px 14px",
        borderLeft:"4px solid var(--neon-yellow)",
        marginBottom:18,
        fontFamily:"var(--font-mono)", fontSize:16, lineHeight:1.5,
      }}>
        <div style={{fontFamily:"var(--font-pixel)", fontSize:14, color:"var(--neon-yellow)", marginBottom:6, textShadow:"0 0 8px var(--neon-yellow)"}}>
          {c.heading}
        </div>
        <div style={{color:"var(--ink-dim)"}}>{c.intro}</div>
      </div>

      <div className="quest-list">
        {c.quests.map((q, i) => (
          <div key={i} className={`quest ${q.state}`}>
            <div className="quest-icon">{q.icon}</div>
            <div className="quest-body">
              <div className="quest-title">{q.title}</div>
              <div className="quest-meta">{q.meta}</div>
              <div className="quest-desc">{q.desc}</div>
            </div>
            <div className="quest-reward">
              <span className="xp">{q.xp}</span>
              <span className="status">
                {q.state === "completed" ? "완료" : q.state === "active" ? "진행 중" : "잠김"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}

function ProjectModal({ project, onClose }) {
  const item = project;
  const rarityColor = {
    common: "#cccccc",
    uncommon: "var(--neon-green)",
    rare: "var(--neon-cyan)",
    epic: "var(--neon-purple)",
    legendary: "var(--neon-yellow)",
  }[item.rarity];

  return (
    <ModalShell title="프로젝트 보기" code={item.name} onClose={onClose}>
      <div style={{display:"grid", gridTemplateColumns:"260px 1fr", gap: 20}}>
        <div>
          <div style={{
            width:"100%", aspectRatio:"4/5",
            background:`linear-gradient(135deg, ${item.thumbColor[0]} 0%, ${item.thumbColor[1]} 100%)`,
            border: `4px solid ${rarityColor}`,
            boxShadow: `0 0 20px ${rarityColor}`,
            position:"relative",
            overflow:"hidden",
          }}>
            <div style={{position:"absolute", inset:0, background:"repeating-linear-gradient(0deg, transparent 0, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 5px)"}}/>
            <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-pixel)", fontSize: 96, color:"#fff", textShadow:"4px 4px 0 rgba(0,0,0,0.5)"}}>
              {item.icon}
            </div>
          </div>
          <div style={{
            marginTop: 8, padding:"6px 10px",
            background:"var(--bg-tile)",
            border:"2px solid var(--bevel-mid)",
            fontFamily:"var(--font-mono)", fontSize:14, textAlign:"center",
            color:"var(--neon-yellow)", letterSpacing:1,
          }}>
            획득 연도 - {item.yr}
          </div>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div>
            <div style={{fontFamily:"var(--font-pixel)", fontSize:18, color:"var(--neon-yellow)", textShadow:"2px 2px 0 var(--bevel-deepest)"}}>
              {item.name}
            </div>
            <div style={{fontFamily:"var(--font-mono)", fontSize:15, color:"var(--neon-cyan)", marginTop:4, letterSpacing:1}}>
              {item.type}
            </div>
            <div style={{
              display:"inline-block", marginTop:6,
              fontFamily:"var(--font-pixel)", fontSize:9,
              padding:"3px 8px",
              border:`1px solid ${rarityColor}`,
              color: rarityColor,
            }}>{rarityLabel[item.rarity] || item.rarity}</div>
          </div>

          <div className="bevel-inset" style={{padding:14, fontFamily:"var(--font-mono)", fontSize:17, lineHeight:1.5, color:"var(--ink)"}}>
            {item.desc}
          </div>

          <div className="bevel-inset" style={{padding:"10px 14px"}}>
            <div style={{fontFamily:"var(--font-pixel)", fontSize:9, color:"var(--neon-cyan)", marginBottom:8}}>상세 정보</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px"}}>
              {item.stats.map((s,i) => (
                <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px dashed var(--bevel-mid)", padding:"6px 0", fontFamily:"var(--font-mono)", fontSize:14}}>
                  <span style={{color:"var(--ink-dim)"}}>{s[0]}</span>
                  <span style={{color: s[0]==="등급" ? rarityColor : "var(--neon-green)", fontFamily:"var(--font-mono)", fontSize:14}}>{s[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
            {item.tags.map(t => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              style={{
                alignSelf:"flex-start",
                marginTop:4,
                padding:"8px 12px",
                background:"var(--neon-yellow)",
                color:"#000",
                border:"2px solid var(--bevel-deepest)",
                boxShadow:"3px 3px 0 var(--bevel-deepest)",
                fontFamily:"var(--font-pixel)",
                fontSize:9,
                textDecoration:"none",
              }}
            >
              GitHub 열기
            </a>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

window.SignModal = SignModal;
window.ProjectModal = ProjectModal;

export { ProjectModal, SignModal };
