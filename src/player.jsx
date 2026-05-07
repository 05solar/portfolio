import React from "react";

// ============================================================
// PLAYER SPRITE
// ============================================================

function Player({ dir, moving }) {
  return (
    <div className="player-sprite" style={{
      width: 32, height: 48,
      position: "relative",
      animation: moving ? "playerBob 0.3s steps(2) infinite" : "none",
      transform: dir === "left" ? "scaleX(-1)" : "scaleX(1)",
    }}>
      <div style={{ position:"absolute", left:8, top:0, width:16, height:6, background:"var(--neon-magenta)", boxShadow:"inset -2px -2px 0 #8a2868" }}/>
      <div style={{ position:"absolute", left:6, top:6, width:20, height:4, background:"var(--neon-magenta)", boxShadow:"inset 0 -2px 0 #8a2868" }}/>
      <div style={{ position:"absolute", left:8, top:10, width:16, height:10, background:"#f5d6b8", boxShadow:"inset -1px -1px 0 #c9a47a" }}/>
      <div style={{ position:"absolute", left:11, top:14, width:2, height:3, background:"#0a0612" }}/>
      <div style={{ position:"absolute", left:19, top:14, width:2, height:3, background:"#0a0612" }}/>
      <div style={{ position:"absolute", left:6, top:20, width:20, height:14, background:"var(--neon-cyan)", boxShadow:"inset -2px -2px 0 #2870a0" }}/>
      <div style={{ position:"absolute", left:4, top:24, width:4, height:12, background:"var(--neon-purple)", boxShadow:"inset -1px 0 0 #5a2880" }}/>
      <div style={{ position:"absolute", left:24, top:24, width:4, height:12, background:"var(--neon-purple)", boxShadow:"inset -1px 0 0 #5a2880" }}/>
      <div style={{ position:"absolute", left:10, top:34, width:4, height:10, background:"#3a2d6b" }}/>
      <div style={{ position:"absolute", left:18, top:34, width:4, height:10, background:"#3a2d6b" }}/>
      <div style={{ position:"absolute", left:9, top:42, width:6, height:4, background:"#1a0f3a" }}/>
      <div style={{ position:"absolute", left:17, top:42, width:6, height:4, background:"#1a0f3a" }}/>
      <div className="player-shadow"/>
    </div>
  );
}

window.Player = Player;
