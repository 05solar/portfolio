import React from "react";
import {
  FOREST_SHOP,
  FRUIT_NODES,
  House,
  MONSTER_SPAWNS,
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
import GambleShop from "./GambleShop.jsx";
import BootScreen from "./BootScreen.jsx";
import { fruitCount, fruitSaleValue } from "./utils.js";
import "./styles/crt.css";
import "./styles/bevel.css";
import "./styles/typography.css";

// ============================================================
// MAIN APP - village, camera, indoor switching
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
const GAME_LETTERBOX_X = 150;
const GAME_LETTERBOX_Y = 200;
const MIN_GAME_W = 640;
const MIN_GAME_H = 420;
const INVENTORY_CACHE_KEY = "portfolio_inventory_v1";
const MAX_HP = 248;
const FRUIT_RESPAWN_MS = 30000;
const DAMAGE_COOLDOWN_MS = 900;
const ATTACK_COOLDOWN_MS = 420;
const MONSTER_RESPAWN_MS = 3000;
const MONSTER_MAX_HP = 72;
const ATTACK_DAMAGE = 36;
const STUN_MS = 5000;
const GOLD_PICKUP_RANGE = 56;
const PLAYER_RESPAWN = { x: 200, y: 800 };
const DEFAULT_INVENTORY = {
  gold: 1342,
  fruits: {},
  collectedFruitIds: [],
  collectedAt: {},
};

function getGameViewport() {
  return {
    w: Math.max(MIN_GAME_W, window.innerWidth - GAME_LETTERBOX_X * 2),
    h: Math.max(MIN_GAME_H, window.innerHeight - GAME_LETTERBOX_Y * 2),
  };
}

function loadCachedInventory() {
  try {
    const raw = localStorage.getItem(INVENTORY_CACHE_KEY);
    if (!raw) return DEFAULT_INVENTORY;
    const parsed = JSON.parse(raw);
    return {
      gold: Number.isFinite(parsed.gold) ? parsed.gold : DEFAULT_INVENTORY.gold,
      fruits: parsed.fruits && typeof parsed.fruits === "object" ? parsed.fruits : {},
      collectedFruitIds: Array.isArray(parsed.collectedFruitIds) ? parsed.collectedFruitIds : [],
      collectedAt: parsed.collectedAt && typeof parsed.collectedAt === "object" ? parsed.collectedAt : {},
    };
  } catch {
    return DEFAULT_INVENTORY;
  }
}

function createMonsters() {
  return MONSTER_SPAWNS.map((monster) => ({
    ...monster,
    spawnX: monster.x,
    spawnY: monster.y,
    hp: MONSTER_MAX_HP,
    alive: true,
    respawnAt: 0,
    hitUntil: 0,
  }));
}

function App() {
  const D = window.PORTFOLIO_DATA;
  const [booted, setBooted] = aUseState(false);
  const [pos, setPos] = aUseState(PLAYER_RESPAWN);
  const [dir, setDir] = aUseState("down");
  const [moving, setMoving] = aUseState(false);
  const [hp, setHp] = aUseState(MAX_HP);
  const [stunnedUntil, setStunnedUntil] = aUseState(0);
  const [playerAttackUntil, setPlayerAttackUntil] = aUseState(0);
  const [playerHitUntil, setPlayerHitUntil] = aUseState(0);
  const [monsters, setMonsters] = aUseState(createMonsters);
  const [goldDrops, setGoldDrops] = aUseState([]);
  const [openSign, setOpenSign] = aUseState(null);
  const [openProject, setOpenProject] = aUseState(null);
  const [openGambleShop, setOpenGambleShop] = aUseState(false);
  const [insideHouse, setInsideHouse] = aUseState(false);
  const [time, setTime] = aUseState("00:00");
  const [inventory, setInventory] = aUseState(loadCachedInventory);
  const [toast, setToast] = aUseState("");
  const [tweaks, setTweak] = useTweaks
    ? useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];
  const [tweaksOpen, setTweaksOpen] = aUseState(false);

  const keys = aUseRef({});
  const posRef = aUseRef(pos);
  const hpRef = aUseRef(hp);
  const monstersRef = aUseRef(monsters);
  const stunnedUntilRef = aUseRef(stunnedUntil);
  const damageUntilRef = aUseRef(0);
  const attackUntilRef = aUseRef(0);

  const anyModalOpen = openSign || openProject || openGambleShop;

  aUseEffect(() => { posRef.current = pos; }, [pos]);
  aUseEffect(() => { hpRef.current = hp; }, [hp]);
  aUseEffect(() => { monstersRef.current = monsters; }, [monsters]);
  aUseEffect(() => { stunnedUntilRef.current = stunnedUntil; }, [stunnedUntil]);

  aUseEffect(() => {
    localStorage.setItem(INVENTORY_CACHE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  aUseEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  aUseEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setInventory((prev) => {
        const collectedAt = prev.collectedAt || {};
        const keptIds = prev.collectedFruitIds.filter((id) => {
          const collectedTime = collectedAt[id] || 0;
          return now - collectedTime < FRUIT_RESPAWN_MS;
        });
        if (keptIds.length === prev.collectedFruitIds.length) return prev;
        const kept = new Set(keptIds);
        const nextCollectedAt = {};
        keptIds.forEach((id) => {
          nextCollectedAt[id] = collectedAt[id];
        });
        return {
          ...prev,
          collectedFruitIds: keptIds,
          collectedAt: nextCollectedAt,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  aUseEffect(() => {
    if (!stunnedUntil) return;
    const delay = Math.max(0, stunnedUntil - Date.now());
    const id = setTimeout(() => {
      setHp(MAX_HP);
      setPos(PLAYER_RESPAWN);
      setStunnedUntil(0);
      setToast("체력을 회복하고 시작 지점에서 다시 깨어났습니다.");
    }, delay);
    return () => clearTimeout(id);
  }, [stunnedUntil]);

  aUseEffect(() => {
    if (!playerAttackUntil) return;
    const id = setTimeout(() => setPlayerAttackUntil(0), Math.max(0, playerAttackUntil - Date.now()));
    return () => clearTimeout(id);
  }, [playerAttackUntil]);

  aUseEffect(() => {
    if (!playerHitUntil) return;
    const id = setTimeout(() => setPlayerHitUntil(0), Math.max(0, playerHitUntil - Date.now()));
    return () => clearTimeout(id);
  }, [playerHitUntil]);

  // Keyboard
  aUseEffect(() => {
    const down = (e) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === "Escape") {
        if (openProject) setOpenProject(null);
        else if (openGambleShop) setOpenGambleShop(false);
        else if (openSign) setOpenSign(null);
        else if (insideHouse) setInsideHouse(false);
      }
      if (e.key === " " && !anyModalOpen && !insideHouse) {
        attackMonster();
        e.preventDefault();
      }
      if (e.key.toLowerCase() === "e" && !anyModalOpen) {
        if (insideHouse || stunnedUntilRef.current > Date.now()) return;
        const goldDrop = nearestGoldDrop(pos, goldDrops);
        if (goldDrop) {
          collectGoldDrop(goldDrop);
          return;
        }
        const fruit = nearestFruit(pos, inventory.collectedFruitIds);
        if (fruit) {
          collectFruit(fruit);
          return;
        }
        if (nearForestShop(pos)) {
          setOpenGambleShop(true);
          return;
        }
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
  }, [openSign, openProject, insideHouse, pos, inventory, goldDrops]);

  // Game loop
  aUseEffect(() => {
    let raf;
    const tick = () => {
      const now = Date.now();
      if (!anyModalOpen && !insideHouse) {
        const k = keys.current;
        const speed = tweaks.speed || 8;
        let dx = 0, dy = 0;
        const stunned = stunnedUntilRef.current > now;
        if (!stunned) {
          if (k["arrowleft"] || k["a"])  dx -= speed;
          if (k["arrowright"]|| k["d"])  dx += speed;
          if (k["arrowup"]   || k["w"])  dy -= speed;
          if (k["arrowdown"] || k["s"])  dy += speed;
        }
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
        setMonsters((current) => {
          let touched = false;
          const playerX = posRef.current.x + PLAYER_W / 2;
          const playerY = posRef.current.y + PLAYER_H / 2;
          const next = current.map((monster) => {
            if (!monster.alive) {
              if (monster.respawnAt && now >= monster.respawnAt) {
                return {
                  ...monster,
                  x: monster.spawnX,
                  y: monster.spawnY,
                  hp: MONSTER_MAX_HP,
                  alive: true,
                  respawnAt: 0,
                };
              }
              return monster;
            }
            let x = monster.x + monster.vx;
            let y = monster.y + monster.vy;
            let vx = monster.vx;
            let vy = monster.vy;
            if (x < 40 || x > WORLD_W - 70) {
              vx *= -1;
              x = Math.max(40, Math.min(WORLD_W - 70, x));
            }
            if (y < 120 || y > WORLD_H - 70) {
              vy *= -1;
              y = Math.max(120, Math.min(WORLD_H - 70, y));
            }
            if (Math.hypot(x + 21 - playerX, y + 18 - playerY) < 34) touched = true;
            return { ...monster, x, y, vx, vy };
          });

          if (touched && now > damageUntilRef.current && stunnedUntilRef.current <= now) {
            damageUntilRef.current = now + DAMAGE_COOLDOWN_MS;
            setPlayerHitUntil(now + 360);
            setHp((prev) => {
              const nextHp = Math.max(0, prev - 36);
              if (nextHp <= 0) {
                setStunnedUntil(now + STUN_MS);
                setMoving(false);
                setToast("HP가 모두 떨어졌습니다. 5초 뒤 시작 지점에서 부활합니다.");
              } else {
                setToast(`몬스터에게 피해를 입었습니다. HP ${nextHp}/${MAX_HP}`);
              }
              return nextHp;
            });
          }
          return next;
        });
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
  function nearestFruit(p, collectedFruitIds) {
    const px = p.x + PLAYER_W/2;
    const py = p.y + PLAYER_H/2;
    return FRUIT_NODES.find((fruit) => {
      if (collectedFruitIds.includes(fruit.id)) return false;
      return Math.hypot(fruit.x + 17 - px, fruit.y + 17 - py) < 58;
    }) || null;
  }
  function nearForestShop(p) {
    const px = p.x + PLAYER_W/2;
    const py = p.y + PLAYER_H/2;
    return Math.hypot(FOREST_SHOP.x + 56 - px, FOREST_SHOP.y + 64 - py) < 92;
  }
  function nearestGoldDrop(p, drops) {
    const px = p.x + PLAYER_W/2;
    const py = p.y + PLAYER_H/2;
    return drops.find((drop) => Math.hypot(drop.x + 13 - px, drop.y + 13 - py) < GOLD_PICKUP_RANGE) || null;
  }
  function goldForMonster(monster) {
    if (monster.type === "bat") return 34;
    if (monster.type === "mote") return 26;
    return 20;
  }
  function attackMonster() {
    const now = Date.now();
    if (stunnedUntilRef.current > now || now < attackUntilRef.current) return;
    attackUntilRef.current = now + ATTACK_COOLDOWN_MS;
    setPlayerAttackUntil(now + 330);

    const playerX = posRef.current.x + PLAYER_W / 2;
    const playerY = posRef.current.y + PLAYER_H / 2;
    const facing = {
      left: [-1, 0],
      right: [1, 0],
      up: [0, -1],
      down: [0, 1],
    }[dir] || [0, 1];

    let hitName = "";
    let defeatedName = "";
    let targetMonster = null;
    let targetScore = Infinity;

    monstersRef.current.forEach((monster) => {
      if (!monster.alive) return;
      const mx = monster.x + 21;
      const my = monster.y + 18;
      const dx = mx - playerX;
      const dy = my - playerY;
      const distance = Math.hypot(dx, dy);
      const forwardness = dx * facing[0] + dy * facing[1];
      if (distance < 82 && forwardness > -14 && distance < targetScore) {
        targetMonster = monster;
        targetScore = distance;
      }
    });

    if (!targetMonster) {
      setToast("공격이 빗나갔습니다.");
      return;
    }

    hitName = targetMonster.name;
    const previewNextHp = Math.max(0, (targetMonster.hp ?? MONSTER_MAX_HP) - ATTACK_DAMAGE);
    const droppedGold = previewNextHp <= 0
      ? {
          id: `${targetMonster.id}-${now}`,
          x: Math.max(28, Math.min(WORLD_W - 42, targetMonster.x + 8)),
          y: Math.max(92, Math.min(WORLD_H - 36, targetMonster.y + 14)),
          amount: goldForMonster(targetMonster),
        }
      : null;

    if (droppedGold) {
      defeatedName = targetMonster.name;
      setGoldDrops((prev) => [...prev, droppedGold]);
    }

    setMonsters((current) => {
      return current.map((monster, index) => {
        if (monster.id !== targetMonster.id) return monster;
        const nextHp = Math.max(0, (monster.hp ?? MONSTER_MAX_HP) - ATTACK_DAMAGE);
        const dx = monster.x + 21 - playerX;
        const dy = monster.y + 18 - playerY;
        const dist = Math.max(1, Math.hypot(dx, dy));
        if (nextHp <= 0) {
          return {
            ...monster,
            hp: 0,
            alive: false,
            respawnAt: now + MONSTER_RESPAWN_MS,
            hitUntil: now + 260,
          };
        }
        return {
          ...monster,
          hp: nextHp,
          hitUntil: now + 320,
          x: Math.max(40, Math.min(WORLD_W - 70, monster.x + (dx / dist) * 28)),
          y: Math.max(120, Math.min(WORLD_H - 70, monster.y + (dy / dist) * 28)),
          vx: monster.vx * -1,
          vy: monster.vy * -1,
        };
      });
    });

    if (defeatedName) setToast(`${defeatedName}을(를) 물리쳤습니다. 골드가 떨어졌습니다.`);
    else if (hitName) setToast(`${hitName}에게 ${ATTACK_DAMAGE} 데미지!`);
  }
  function collectGoldDrop(drop) {
    setGoldDrops((prev) => prev.filter((item) => item.id !== drop.id));
    setInventory((prev) => ({
      ...prev,
      gold: (prev.gold || 0) + drop.amount,
    }));
    setToast(`${drop.amount}골드를 주웠습니다.`);
  }
  function collectFruit(fruit) {
    setInventory((prev) => {
      if (prev.collectedFruitIds.includes(fruit.id)) return prev;
      return {
        ...prev,
        fruits: {
          ...prev.fruits,
          [fruit.kind]: (prev.fruits[fruit.kind] || 0) + 1,
        },
        collectedFruitIds: [...prev.collectedFruitIds, fruit.id],
        collectedAt: {
          ...(prev.collectedAt || {}),
          [fruit.id]: Date.now(),
        },
      };
    });
    setToast(`${fruit.label}을(를) 채집했습니다.`);
  }
  function sellFruit() {
    const total = fruitSaleValue(inventory.fruits);
    const count = fruitCount(inventory.fruits);
    if (!count) {
      setToast("판매할 과일이 없습니다.");
      return;
    }
    setInventory((prev) => ({
      ...prev,
      gold: prev.gold + total,
      fruits: {},
    }));
    setToast(`과일 ${count}개가 ${total}원에 판매되었습니다!`);
  }
  function playGambleGame(game) {
    const gold = inventory.gold || 0;
    if (gold < game.cost) {
      setToast(`${game.cost}원이 필요합니다.`);
      return;
    }

    const roll = Math.random();
    const won = roll < game.chance;
    const delta = won ? game.reward : -game.cost;
    setInventory((prev) => ({
      ...prev,
      gold: Math.max(0, (prev.gold || 0) + delta),
    }));
    setToast(won ? `${game.name} 성공! ${game.reward}원을 얻었습니다.` : `${game.name} 실패... ${game.cost}원을 잃었습니다.`);
  }

  const nearSign = nearestSign(pos);
  const nearDoor = nearHouseDoor(pos);
  const nearFruit = nearestFruit(pos, inventory.collectedFruitIds);
  const nearShop = nearForestShop(pos);
  const nearGoldDrop = nearestGoldDrop(pos, goldDrops);

  // Camera
  const [vp, setVp] = aUseState(getGameViewport);
  aUseEffect(() => {
    const onResize = () => setVp(getGameViewport());
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
              <VillageBackground
                inventory={inventory}
                collectedFruitIds={inventory.collectedFruitIds}
                nearbyFruitId={nearFruit?.id}
                nearbyShop={nearShop}
                monsters={monsters}
                goldDrops={goldDrops}
                nearbyGoldDropId={nearGoldDrop?.id}
              />
              <House near={nearDoor}/>
              {D.signs.map(s => (
                <Sign key={s.id} sign={s} near={nearSign?.id === s.id}/>
              ))}
              <div className="player" style={{ left: pos.x, top: pos.y }}>
                <Player
                  dir={dir}
                  moving={moving}
                  stunned={stunnedUntil > Date.now()}
                  attacking={playerAttackUntil > Date.now()}
                  hit={playerHitUntil > Date.now()}
                />
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
              <PlayerCard inventory={inventory} hp={hp} maxHp={MAX_HP}/>
            </div>
            {!insideHouse && (
              <div className="hud-top-right">
                <MiniMap playerPos={pos} signs={D.signs} house={D.house} worldW={WORLD_W} worldH={WORLD_H} inventory={inventory}/>
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
          <span><span className="kbd">방향키</span> / <span className="kbd">WASD</span> 이동</span>
          <span><span className="kbd">SPACE</span> 공격</span>
          <span><span className="kbd">E</span> 상호작용</span>
          <span><span className="kbd">ESC</span> 닫기</span>
        </div>

        {toast && (
          <div style={{
            position:"absolute",
            left:"50%",
            top: 24,
            transform:"translateX(-50%)",
            zIndex: 6500,
            padding:"8px 14px",
            background:"rgba(10,4,24,0.88)",
            border:"2px solid var(--neon-yellow)",
            color:"var(--neon-yellow)",
            fontFamily:"var(--font-pixel)",
            fontSize:9,
            textShadow:"1px 1px 0 #000",
          }}>
            {toast}
          </div>
        )}

        {/* Modals */}
        {openSign && <SignModal sign={openSign} onClose={() => setOpenSign(null)}/>}
        {openProject && <ProjectModal project={openProject} onClose={() => setOpenProject(null)}/>}
        {openGambleShop && (
          <GambleShop
            gold={inventory.gold || 0}
            fruits={inventory.fruits}
            onClose={() => setOpenGambleShop(false)}
            onSellFruit={sellFruit}
            onPlay={playGambleGame}
          />
        )}

        {/* CRT effects */}
        <div className="crt-roll" style={{opacity: tweaks.scanlineIntensity}}/>
        {tweaks.crtFlicker && <div className="crt-flicker"/>}

        {/* Boot screen */}
        {!booted && <BootScreen onStart={() => setBooted(true)}/>}

        {/* Tweaks Panel */}
        {tweaksOpen && (
          <TweaksPanel title="화면 조정" onClose={() => {
            setTweaksOpen(false);
            window.parent.postMessage({type:"__edit_mode_dismissed"}, "*");
          }}>
            <TweakSection title="CRT 효과">
              <TweakSlider label="스캔라인 강도" min={0} max={1} step={0.05}
                value={tweaks.scanlineIntensity} onChange={v => setTweak("scanlineIntensity", v)}/>
              <TweakToggle label="화면 깜빡임" value={tweaks.crtFlicker}
                onChange={v => setTweak("crtFlicker", v)}/>
              <TweakToggle label="RGB 마스크" value={tweaks.rgbMask}
                onChange={v => setTweak("rgbMask", v)}/>
            </TweakSection>
            <TweakSection title="게임">
              <TweakSlider label="이동 속도" min={2} max={12} step={1}
                value={tweaks.speed} onChange={v => setTweak("speed", v)}/>
              <TweakToggle label="HUD 표시" value={tweaks.showHud}
                onChange={v => setTweak("showHud", v)}/>
            </TweakSection>
          </TweaksPanel>
        )}

        {!tweaks.rgbMask && <style>{`.crt-screen::after { display: none; }`}</style>}
      </div>
    </div>
  );
}

window.App = App;

export default App;
