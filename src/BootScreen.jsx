import React from "react";
import { Player } from "./world.jsx";
import "./styles/boot.css";

const { useState, useEffect } = React;

function BootScreen({ onStart }) {
  const [stage, setStage] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setStage(1), 2400);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
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
            SOLAR-BIOS v3.21 (C) 2026 - 시작 점검
          </div>
          <div className="boot-progress">
            <span className="line">CPU 확인 중... 호기심 모드 @ 4.2 GHz</span>
            <span className="line">메모리 테스트: 7,820 / 10,000 XP - 정상</span>
            <span className="line">마을 데이터 MAP.DAT 불러오는 중...</span>
            <span className="line">작업실 갤러리 연결 중... 프로젝트 6개</span>
            <span className="line">이동 경로 초기화 중... 정상</span>
            <span className="line" style={{color:"var(--neon-yellow)"}}>부팅 완료. 솔라 마을에 오신 것을 환영합니다.</span>
          </div>
        </div>
        <div style={{textAlign:"center", color:"var(--ink-dim)", fontFamily:"var(--font-mono)", fontSize:14, letterSpacing:2}}>
          PORTFOLIO.EXE - solar / 2026
        </div>
      </div>
    );
  }

  return (
    <div className={`boot-screen ${hidden ? "hidden" : ""}`} style={{justifyContent:"center"}}>
      <div>
        <div className="boot-logo">SOLAR.EXE</div>
        <div className="boot-subtitle">게임처럼 탐험하는 포트폴리오</div>
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
              <div style={{fontFamily:"var(--font-pixel)", fontSize:14, color:"var(--neon-yellow)"}}>새 게임</div>
              <div style={{fontFamily:"var(--font-pixel)", fontSize:11, color:"var(--ink-dim)", marginTop:6}}>  이어하기...</div>
              <div style={{fontFamily:"var(--font-pixel)", fontSize:11, color:"var(--ink-dim)", marginTop:6}}>  설정</div>
            </div>
          </div>
        </div>
        <div className="boot-press-start">[SPACE]를 눌러 시작</div>
        <div style={{textAlign:"center", marginTop:40, fontFamily:"var(--font-mono)", fontSize:14, color:"var(--ink-mute)"}}>
          2026 SOLAR PRODUCTIONS - 모든 퀘스트 보관됨
        </div>
      </div>
    </div>
  );
}

export default BootScreen;
