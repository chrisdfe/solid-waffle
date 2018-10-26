//
// Generic utility functions
//
const NOOP = () => {};

const randomBetween = (min, max) => min + Math.random() * (max - min);
const randomIntBetween = (min, max) => Math.floor(randomBetween(min, max));
const randomHexBetween = (min, max) => intToHex(randomBetween(min, max));
const randomItemInCollection = arr => arr[randomIntBetween(0, arr.length)];

const randomId = (length = 8) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += randomItemInCollection(characters);
  }
  return result;
};

const padHexValue = value => (value.length === 1 ? `0${value}` : value);

const intToHex = int => padHexValue(parseInt(int, 10).toString(16));

const scaleBetween = (unscaledNum, minAllowed, maxAllowed, min, max) =>
  (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;

const scaleBetweenZeroAndOne = (unscaledNum, min, max) =>
  scaleBetween(unscaledNum, 0, 1, min, max);

const randomHex = () => {
  let r = randomHexBetween(0, 255);
  let g = randomHexBetween(0, 255);
  let b = randomHexBetween(0, 255);

  return `#${r}${g}${b}`;
};

const lerp = (initialValue, targetValue, t) =>
  initialValue * (1 - t) + targetValue * t;

const fillCircle = (x, y, radius) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, radius * Math.PI);
  ctx.fill();
};
