import React from "react";
import { fruitCount, fruitSaleValue } from "./utils.js";
import "./styles/gamble.css";

export const GAMBLE_GAMES = [
  {
    id: "coin-flip",
    name: "코인 뒤집기",
    cost: 50,
    reward: 90,
    chance: 0.55,
    icon: "C",
    desc: "빛나는 동전이 앞면이면 승리. 가장 안정적인 판돈입니다.",
  },
  {
    id: "dice-duel",
    name: "주사위 결투",
    cost: 100,
    reward: 210,
    chance: 0.42,
    icon: "D",
    desc: "상점 주인보다 높은 눈이 나오면 승리합니다.",
  },
  {
    id: "slot-spark",
    name: "네온 슬롯",
    cost: 180,
    reward: 480,
    chance: 0.28,
    icon: "S",
    desc: "세 칸의 네온 문양이 맞으면 큰 보상이 터집니다.",
  },
];

function GambleShop({ gold, fruits, onClose, onSellFruit, onPlay }) {
  const fruitTotal = fruitCount(fruits);
  const saleValue = fruitSaleValue(fruits);

  return (
    <div className="gamble-scene">
      <button className="gamble-close" onClick={onClose} aria-label="상점 닫기">X</button>
      <div className="shopkeeper-stage" aria-hidden="true">
        <div className="shopkeeper-shadow"/>
        <div className="shopkeeper-sprite">
          <div className="shopkeeper-hood"/>
          <div className="shopkeeper-face"/>
          <div className="shopkeeper-hair shopkeeper-hair-left"/>
          <div className="shopkeeper-hair shopkeeper-hair-right"/>
          <div className="shopkeeper-eye shopkeeper-eye-left"/>
          <div className="shopkeeper-eye shopkeeper-eye-right"/>
          <div className="shopkeeper-mouth"/>
          <div className="shopkeeper-cloak"/>
          <div className="shopkeeper-scarf"/>
          <div className="shopkeeper-hand shopkeeper-hand-left"/>
          <div className="shopkeeper-hand shopkeeper-hand-right"/>
          <div className="shopkeeper-card shopkeeper-card-a"/>
          <div className="shopkeeper-card shopkeeper-card-b"/>
        </div>
      </div>

      <div className="dialogue-box">
        <div className="dialogue-portrait">
          <div className="mini-keeper-face"/>
        </div>
        <div className="dialogue-copy">
          <div className="dialogue-name">[도박꾼 상점 주인]</div>
          <p>좋아, 네가 모은 코인을 굴려 보자. 세 판 중 원하는 게임을 고르고, 운이 따라오면 지갑이 웃을 거야.</p>
          <div className="dialogue-wallet">
            <span>보유 골드</span>
            <strong>{gold.toLocaleString()}</strong>
            <span>과일 판매가</span>
            <strong>{saleValue.toLocaleString()}</strong>
          </div>
          <div className="gamble-actions">
            {GAMBLE_GAMES.map((game) => (
              <button key={game.id} className="gamble-game bevel" onClick={() => onPlay(game)}>
                <span className="gamble-game-icon">{game.icon}</span>
                <span className="gamble-game-main">
                  <span className="gamble-game-name">{game.name}</span>
                  <span className="gamble-game-desc">{game.desc}</span>
                </span>
                <span className="gamble-game-stakes">
                  -{game.cost} / +{game.reward}
                </span>
              </button>
            ))}
            <button className="gamble-sell bevel" onClick={onSellFruit} disabled={!fruitTotal}>
              과일 판매 {fruitTotal ? `+${saleValue}` : "없음"}
            </button>
          </div>
        </div>
        <div className="dialogue-caret"/>
      </div>
    </div>
  );
}

export default GambleShop;
