import { FRUIT_INFO } from "./world.jsx";

export function fruitCount(fruits) {
  return Object.values(fruits || {}).reduce((sum, count) => sum + count, 0);
}

export function fruitSaleValue(fruits) {
  return Object.entries(fruits || {}).reduce((sum, [kind, count]) => {
    return sum + (FRUIT_INFO[kind]?.price || 0) * count;
  }, 0);
}
