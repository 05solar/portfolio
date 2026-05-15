import React from "react";
import { fruitCount, fruitSaleValue } from "./utils.js";
import merchantHappy from "./assets/marchant_happy.png";
import merchantDefault from "./assets/merchant.png";
import merchantMad from "./assets/merchant_mad.png";
import merchantSad from "./assets/merchant_sad.png";
import merchantSmile from "./assets/merchant_smile.png";
import "./styles/gamble.css";

const { useEffect, useMemo, useState } = React;

export const GAMBLE_GAMES = [
  {
    id: "dice",
    name: "주사위 게임",
    payout: 2,
    opponent: "merchant",
    rule: [
      "주사위 5개를 차례대로 굴려 합계가 20에 가장 가까운 쪽이 이기는 게임이야.",
      "각 차례마다 그 주사위를 넣고 굴릴지, 빼고 넘길지 선택할 수 있어.",
      "굴린 주사위는 나중에 뺄 수 없고, 뺀 주사위도 다시 굴릴 수 없어.",
      "상점 주인과 플레이하는 게임이고, 승리 보상은 배팅 금액의 2배야.",
    ],
  },
  {
    id: "baccarat",
    name: "카드 게임",
    payout: 2,
    opponent: "merchant",
    rule: [
      "카드 게임은 블랙잭이야.",
      "카드 합계를 21에 최대한 가깝게 만들되, 21을 넘기면 바로 패배야.",
      "J, Q, K는 10점이고 A는 1점 또는 11점 중 유리한 값으로 계산돼.",
      "히트로 카드를 더 받거나 스탠드로 멈출 수 있고, 상점 주인은 17점 이상이면 멈춰.",
      "상점 주인과 플레이하는 게임이고, 승리 보상은 배팅 금액의 2배야.",
    ],
  },
  {
    id: "roulette",
    name: "룰렛",
    payout: 10,
    opponent: "solo",
    rule: [
      "세 칸의 룰렛이 빠르게 돌아가.",
      "멈추기 버튼을 눌렀을 때 세 칸이 모두 7이면 승리야.",
      "혼자 플레이하는 게임이고, 승리 보상은 배팅 금액의 10배야.",
    ],
  },
];

const CARD_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const CARD_SUITS = ["하트", "다이아", "스페이드", "클로버"];
const CARD_SUIT_SYMBOLS = {
  하트: "♥",
  다이아: "♦",
  스페이드: "♠",
  클로버: "♣",
};
const ROULETTE_SYMBOLS = ["7", "BAR", "별", "체리", "종"];

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function drawCard() {
  return {
    rank: CARD_RANKS[Math.floor(Math.random() * CARD_RANKS.length)],
    suit: CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)],
  };
}

function blackjackCardValue(card) {
  if (!card) return 0;
  if (card.rank === "A") return 11;
  if (["10", "J", "Q", "K"].includes(card.rank)) return 10;
  return Number(card.rank);
}

function blackjackTotal(cards) {
  let total = cards.reduce((sum, card) => sum + blackjackCardValue(card), 0);
  let aces = cards.filter((card) => card?.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function createMerchantDiceScore() {
  return Array.from({ length: 5 }, rollDie).reduce((sum, value) => {
    const next = sum + value;
    if (next <= 20) return next;
    return Math.abs(20 - next) <= Math.abs(20 - sum) ? next : sum;
  }, 0);
}

function clampBet(value, gold) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(gold, Math.floor(parsed)));
}

function createDiceState() {
  return { step: 0, rolls: [], total: 0, rolling: false, merchantTotal: 0 };
}

function createCardState() {
  return { player: [], merchant: [], phase: "player", flipping: false, done: false, message: "히트 또는 스탠드를 선택해." };
}

function createRouletteState() {
  return { spinning: false, stopping: false, final: [0, 0, 0], display: [0, 1, 2], done: false };
}

function formatGold(value) {
  return `${value.toLocaleString()}원`;
}

function randomRouletteIndexes() {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * ROULETTE_SYMBOLS.length));
}

function GambleShop({ gold, fruits, onClose, onSellFruit, onPlay }) {
  const [screen, setScreen] = useState("menu");
  const [selectedGame, setSelectedGame] = useState(null);
  const [bet, setBet] = useState(0);
  const [result, setResult] = useState(null);
  const [diceState, setDiceState] = useState(createDiceState);
  const [cardState, setCardState] = useState(createCardState);
  const [rouletteState, setRouletteState] = useState(createRouletteState);

  const fruitTotal = fruitCount(fruits);
  const saleValue = fruitSaleValue(fruits);
  const maxBet = Math.max(0, gold || 0);
  const canBet = bet > 0 && bet <= maxBet;

  const merchantImage = useMemo(() => {
    if (screen !== "result" || !result) return merchantDefault;
    if (result.opponent === "push") return merchantDefault;
    if (result.opponent === "solo") return result.won ? merchantSad : merchantSmile;
    return result.won ? merchantSad : merchantHappy;
  }, [result, screen]);

  const dialogueText = useMemo(() => {
    if (screen === "menu") return "무엇을 할래? 과일을 팔거나 게임을 고를 수 있어.";
    if (screen === "game-list") return "게임을 골라. 룰을 보고 시작할 수도 있고, 바로 배팅으로 넘어갈 수도 있어.";
    if (screen === "pregame" && selectedGame) return `${selectedGame.name}을 선택했어. 룰을 볼래, 바로 시작할래?`;
    if (screen === "rule" && selectedGame) return selectedGame.rule.join(" ");
    if (screen === "bet" && selectedGame) return `${selectedGame.name}에 걸 금액을 정해. 지금 가진 돈 안에서만 배팅할 수 있어.`;
    if (screen === "playing" && selectedGame) return `${selectedGame.name} 진행 중...`;
    if (screen === "result" && result) return result.message;
    return "어서 와.";
  }, [result, screen, selectedGame]);

  useEffect(() => {
    const keydown = (event) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key)) return;
      const controls = [...document.querySelectorAll(".gamble-scene button:not(:disabled), .gamble-scene input:not(:disabled)")];
      if (!controls.length) return;
      const active = document.activeElement;
      const current = controls.indexOf(active);

      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        controls[(current + direction + controls.length) % controls.length].focus();
      }

      if ((event.key === " " || event.key === "Enter") && active && active.tagName !== "INPUT") {
        event.preventDefault();
        active.click();
      }
    };

    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  useEffect(() => {
    const firstChoice = document.querySelector(".gamble-scene .command-option:not(:disabled)");
    firstChoice?.focus();
  }, [screen, selectedGame?.id]);

  useEffect(() => {
    setBet((current) => clampBet(current, maxBet));
  }, [maxBet]);

  useEffect(() => {
    if (screen !== "playing" || selectedGame?.id !== "roulette" || (!rouletteState.spinning && !rouletteState.stopping)) return;
    const id = setInterval(() => {
      setRouletteState((prev) => ({ ...prev, display: randomRouletteIndexes() }));
    }, rouletteState.stopping ? 145 : 70);
    return () => clearInterval(id);
  }, [rouletteState.spinning, rouletteState.stopping, screen, selectedGame]);

  function goMenu() {
    setScreen("menu");
    setSelectedGame(null);
    setResult(null);
  }

  function chooseGame(game) {
    setSelectedGame(game);
    setBet(Math.min(maxBet, Math.max(1, Math.floor(maxBet / 10))));
    setResult(null);
    setScreen("pregame");
  }

  function goBet() {
    if (!selectedGame) return;
    setBet((current) => current || Math.min(maxBet, Math.max(1, Math.floor(maxBet / 10))));
    setScreen("bet");
  }

  function startGame() {
    if (!selectedGame || !canBet) return;
    setResult(null);
    if (selectedGame.id === "dice") {
      setDiceState({ step: 0, rolls: [], total: 0, rolling: false, merchantTotal: createMerchantDiceScore() });
    }
    if (selectedGame.id === "baccarat") {
      setCardState({
        player: [drawCard(), drawCard()],
        merchant: [drawCard(), drawCard()],
        phase: "player",
        flipping: false,
        done: false,
        message: "히트 또는 스탠드를 선택해.",
      });
    }
    if (selectedGame.id === "roulette") {
      setRouletteState({ ...createRouletteState(), spinning: true, display: randomRouletteIndexes() });
    }
    setScreen("playing");
  }

  function decideDie(keep) {
    if (diceState.rolling || diceState.step >= 5) return;
    if (!keep) {
      advanceDice([...diceState.rolls, { value: null, kept: false }], diceState.total);
      return;
    }
    setDiceState((prev) => ({ ...prev, rolling: true }));
    setTimeout(() => {
      const value = rollDie();
      advanceDice([...diceState.rolls, { value, kept: true }], diceState.total + value);
    }, 720);
  }

  function advanceDice(nextRolls, nextTotal) {
    const nextStep = nextRolls.length;
    setDiceState((prev) => ({ ...prev, step: nextStep, rolls: nextRolls, total: nextTotal, rolling: false }));
    if (nextStep >= 5) {
      const playerGap = Math.abs(20 - nextTotal);
      const merchantGap = Math.abs(20 - diceState.merchantTotal);
      const won = playerGap <= merchantGap;
      setTimeout(() => {
        finishGame(
          won,
          `내 합계 ${nextTotal}, 상점 주인 합계 ${diceState.merchantTotal}.`,
        );
      }, 700);
    }
  }

  function hitBlackjack() {
    if (selectedGame?.id !== "baccarat" || cardState.done || cardState.phase !== "player" || cardState.flipping) return;
    const nextPlayer = [...cardState.player, drawCard()];
    const playerTotal = blackjackTotal(nextPlayer);
    setCardState((prev) => ({
      ...prev,
      player: nextPlayer,
      flipping: true,
      message: playerTotal > 21 ? "버스트! 21을 넘겼어." : "카드를 한 장 더 받았어.",
    }));
    setTimeout(() => {
      setCardState((prev) => ({ ...prev, flipping: false }));
      if (playerTotal > 21) {
        setCardState((prev) => ({ ...prev, done: true, phase: "done" }));
        finishGame(false, `내 점수 ${playerTotal}, 상점 주인 점수 ${blackjackTotal(cardState.merchant)}. 플레이어 버스트.`);
      }
    }, 420);
  }

  function standBlackjack() {
    if (selectedGame?.id !== "baccarat" || cardState.done || cardState.phase !== "player" || cardState.flipping) return;
    let merchantCards = [...cardState.merchant];
    while (blackjackTotal(merchantCards) < 17) {
      merchantCards = [...merchantCards, drawCard()];
    }

    const playerTotal = blackjackTotal(cardState.player);
    const merchantTotal = blackjackTotal(merchantCards);
    const merchantBust = merchantTotal > 21;
    const won = merchantBust || playerTotal > merchantTotal;
    const push = !merchantBust && playerTotal === merchantTotal;
    const detail = `내 점수 ${playerTotal}, 상점 주인 점수 ${merchantTotal}.${merchantBust ? " 상점 주인 버스트." : ""}`;

    setCardState((prev) => ({
      ...prev,
      merchant: merchantCards,
      phase: "dealer",
      flipping: true,
      message: "상점 주인이 카드를 정리하는 중...",
    }));

    setTimeout(() => {
      setCardState((prev) => ({ ...prev, flipping: false, done: true, phase: "done" }));
      if (push) {
        finishPush(`${detail} 무승부입니다. 배팅 금액은 변하지 않습니다.`);
        return;
      }
      finishGame(won, detail);
    }, 720);
  }

  function stopRoulette() {
    if (!selectedGame || !rouletteState.spinning || rouletteState.stopping) return;
    const final = randomRouletteIndexes();
    const won = final.every((index) => ROULETTE_SYMBOLS[index] === "7");
    setRouletteState((prev) => ({ ...prev, spinning: false, stopping: true, final }));
    setTimeout(() => {
      setRouletteState((prev) => ({ ...prev, display: final, stopping: false, done: true }));
      finishGame(won, `룰렛 결과 ${final.map((index) => ROULETTE_SYMBOLS[index]).join(" / ")}.`);
    }, 1350);
  }

  function finishGame(won, detail) {
    if (!selectedGame) return;
    const reward = bet * selectedGame.payout;
    const amount = won ? reward : bet;
    const message = selectedGame.opponent === "solo"
      ? `${detail} 플레이어가 ${won ? formatGold(amount) + "을 얻었습니다" : formatGold(amount) + "을 잃었습니다"}.`
      : `${won ? "플레이어 승리" : "상점 승리"}! ${detail} 플레이어가 ${won ? formatGold(amount) + "을 얻었습니다" : formatGold(amount) + "을 잃었습니다"}.`;

    onPlay({
      ...selectedGame,
      cost: bet,
      reward,
      chance: won ? 1 : 0,
    });
    setResult({ won, message, opponent: selectedGame.opponent });
    setScreen("result");
  }

  function finishPush(message) {
    setResult({ won: false, message, opponent: "push" });
    setScreen("result");
  }

  return (
    <div className="gamble-scene">
      <button className="gamble-close" onClick={onClose} aria-label="상점 닫기">X</button>
      <div className={`shopkeeper-stage ${screen === "playing" ? "is-playing" : ""}`} aria-hidden="true">
        <div className="shopkeeper-shadow" />
        <img className="shopkeeper-image" src={merchantImage} alt="" />
      </div>

      {screen === "playing" && selectedGame && (
        <div className="game-motion-stage">
          {selectedGame.id === "dice" && <DiceGameView state={diceState} onDecision={decideDie} />}
          {selectedGame.id === "baccarat" && <CardGameView state={cardState} onHit={hitBlackjack} onStand={standBlackjack} />}
          {selectedGame.id === "roulette" && <RouletteGameView state={rouletteState} onStop={stopRoulette} />}
        </div>
      )}

      <div className="dialogue-box">
        <div className="dialogue-portrait">
          <img src={merchantImage} alt="상점 주인" />
        </div>
        <div className="dialogue-copy">
          <div className="dialogue-name">[상점 주인]</div>
          <p>{dialogueText}</p>
          <div className="dialogue-wallet">
            <span>보유 금액</span>
            <strong>{formatGold(gold)}</strong>
            <span>과일 판매가</span>
            <strong>{formatGold(saleValue)}</strong>
          </div>
          <ShopActions
            screen={screen}
            fruitTotal={fruitTotal}
            saleValue={saleValue}
            selectedGame={selectedGame}
            bet={bet}
            maxBet={maxBet}
            canBet={canBet}
            onBetChange={(value) => setBet(clampBet(value, maxBet))}
            onSellFruit={onSellFruit}
            onShowGames={() => setScreen("game-list")}
            onChooseGame={chooseGame}
            onRule={() => setScreen("rule")}
            onGoBet={goBet}
            onStart={startGame}
            onBack={() => (screen === "menu" ? onClose() : goMenu())}
          />
        </div>
        <div className="dialogue-caret" />
      </div>
    </div>
  );
}

function CommandButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`command-option ${className}`} {...props}>
      <span className="command-marker">&gt;</span>
      <span>{children}</span>
    </button>
  );
}

function ShopActions({
  screen,
  fruitTotal,
  saleValue,
  selectedGame,
  bet,
  maxBet,
  canBet,
  onBetChange,
  onSellFruit,
  onShowGames,
  onChooseGame,
  onRule,
  onGoBet,
  onStart,
  onBack,
}) {
  if (screen === "menu") {
    return (
      <div className="command-list">
        <CommandButton onClick={onSellFruit} disabled={!fruitTotal}>
          물건팔기 {fruitTotal ? `+${formatGold(saleValue)}` : ""}
        </CommandButton>
        <CommandButton onClick={onShowGames}>게임하기</CommandButton>
      </div>
    );
  }

  if (screen === "game-list") {
    return (
      <div className="command-list">
        {GAMBLE_GAMES.map((game) => (
          <CommandButton key={game.id} className="game-command" onClick={() => onChooseGame(game)}>
            <span className="gamble-game-main">
              <span className="gamble-game-name">{game.name}</span>
              <span className="gamble-game-desc">승리 보상 {game.payout}배</span>
            </span>
          </CommandButton>
        ))}
        <CommandButton onClick={onBack}>뒤로</CommandButton>
      </div>
    );
  }

  if (screen === "pregame" && selectedGame) {
    return (
      <div className="command-list">
        <CommandButton onClick={onRule}>룰 설명 듣기</CommandButton>
        <CommandButton onClick={onGoBet}>바로 시작하기</CommandButton>
        <CommandButton onClick={onBack}>뒤로</CommandButton>
      </div>
    );
  }

  if (screen === "rule" && selectedGame) {
    return (
      <div className="command-list">
        <CommandButton onClick={onGoBet}>다음</CommandButton>
        <CommandButton onClick={onBack}>뒤로</CommandButton>
      </div>
    );
  }

  if (screen === "bet" && selectedGame) {
    return (
      <div className="bet-panel">
        <label className="bet-label" htmlFor="gamble-bet">배팅 금액</label>
        <input
          id="gamble-bet"
          className="bet-input"
          type="number"
          min="0"
          max={maxBet}
          value={bet}
          onChange={(event) => onBetChange(event.target.value)}
        />
        <div className="bet-shortcuts">
          <button className="bevel" onClick={() => onBetChange(Math.floor(maxBet / 4))}>25%</button>
          <button className="bevel" onClick={() => onBetChange(Math.floor(maxBet / 2))}>50%</button>
          <button className="bevel" onClick={() => onBetChange(maxBet)}>MAX</button>
        </div>
        <div className="bet-hint">
          최대 {formatGold(maxBet)} / 승리 시 {formatGold(bet * selectedGame.payout)}
        </div>
        <div className="command-list">
          <CommandButton onClick={onStart} disabled={!canBet}>게임 시작</CommandButton>
          <CommandButton onClick={onBack}>처음으로</CommandButton>
        </div>
      </div>
    );
  }

  if (screen === "result") {
    return (
      <div className="command-list">
        <CommandButton onClick={onGoBet}>다시 배팅</CommandButton>
        <CommandButton onClick={onBack}>처음으로</CommandButton>
      </div>
    );
  }

  return null;
}

function DiceGameView({ state, onDecision }) {
  return (
    <div className="dice-board">
      <div className="game-score-row">
        <span>내 합계 {state.total}</span>
        <span>상점 합계 {state.merchantTotal}</span>
        <span>{Math.min(state.step + 1, 5)} / 5</span>
      </div>
      <div className="dice-line">
        {Array.from({ length: 5 }).map((_, index) => {
          const roll = state.rolls[index];
          return (
            <div key={index} className={`die ${state.rolling && index === state.step ? "is-rolling" : ""} ${roll?.kept === false ? "is-skipped" : ""}`}>
              <span className="die-face die-face-front">{roll ? (roll.kept ? roll.value : "X") : "?"}</span>
              <span className="die-face die-face-top" />
              <span className="die-face die-face-right" />
            </div>
          );
        })}
      </div>
      {state.step < 5 ? (
        <div className="command-list motion-command-list">
          <CommandButton onClick={() => onDecision(true)} disabled={state.rolling}>넣고 굴리기</CommandButton>
          <CommandButton onClick={() => onDecision(false)} disabled={state.rolling}>빼고 넘기기</CommandButton>
        </div>
      ) : (
        <div className="motion-wait">결과 계산 중...</div>
      )}
    </div>
  );
}

function CardGameView({ state, onHit, onStand }) {
  const cards = [
    ...state.player.map((card) => ({ owner: "플레이어", card, open: true })),
    ...state.merchant.map((card, index) => ({ owner: "상점", card, open: state.phase !== "player" || index === 0 })),
  ];
  const playerTotal = blackjackTotal(state.player);
  const visibleMerchantCards = state.phase === "player" ? state.merchant.slice(0, 1) : state.merchant;
  const merchantTotal = blackjackTotal(visibleMerchantCards);
  return (
    <div className="card-board">
      <div className="card-row">
        {cards.map((item, index) => {
          const red = item.card && ["하트", "다이아"].includes(item.card.suit);
          const symbol = item.card ? CARD_SUIT_SYMBOLS[item.card.suit] : "";
          return (
            <div key={`${item.owner}-${index}`} className={`play-card ${item.open ? "is-open" : ""} ${red ? "is-red" : ""} ${state.flipping && index === cards.length - 1 ? "is-flipping" : ""}`}>
              {item.open ? (
                <>
                  <span className="card-corner card-corner-top">{item.card.rank}<i>{symbol}</i></span>
                  <span className="card-art">{symbol}</span>
                  <span className="card-suit">{item.card.suit}</span>
                  <span className="card-corner card-corner-bottom">{item.card.rank}<i>{symbol}</i></span>
                  <small>{item.owner}</small>
                </>
              ) : (
                <>
                  <b>?</b>
                  <span className="card-pattern">SOLAR</span>
                  <small>{item.owner}</small>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="game-score-row">
        <span>내 점수 {playerTotal}</span>
        <span>상점 점수 {state.phase === "player" ? `${merchantTotal}+?` : merchantTotal}</span>
      </div>
      {state.phase === "player" && !state.done ? (
        <div className="command-list motion-command-list">
          <CommandButton onClick={onHit} disabled={state.flipping}>히트</CommandButton>
          <CommandButton onClick={onStand} disabled={state.flipping}>스탠드</CommandButton>
        </div>
      ) : (
        <div className="motion-wait">{state.message}</div>
      )}
    </div>
  );
}

function RouletteGameView({ state, onStop }) {
  const visible = state.display;
  return (
    <div className="roulette-board">
      <div className={`roulette-wheel ${state.spinning ? "is-spinning" : ""} ${state.stopping ? "is-stopping" : ""}`}>
        {visible.map((index, reel) => (
          <div key={reel} className="roulette-reel">
            <div className="roulette-strip">
              <span>{ROULETTE_SYMBOLS[(index + 3) % ROULETTE_SYMBOLS.length]}</span>
              <span className="is-current">{ROULETTE_SYMBOLS[index]}</span>
              <span>{ROULETTE_SYMBOLS[(index + 1) % ROULETTE_SYMBOLS.length]}</span>
              <span>{ROULETTE_SYMBOLS[(index + 2) % ROULETTE_SYMBOLS.length]}</span>
            </div>
          </div>
        ))}
      </div>
      {!state.done && (
        <div className="command-list motion-command-list">
          <CommandButton onClick={onStop} disabled={!state.spinning || state.stopping}>
            {state.stopping ? "멈추는 중..." : "멈추기"}
          </CommandButton>
        </div>
      )}
      <div className="motion-wait">{state.stopping ? "룰렛 감속 중..." : "룰렛 회전 중..."}</div>
    </div>
  );
}

export default GambleShop;
