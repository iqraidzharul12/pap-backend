import { randomBytes } from "crypto";

export const randomString = (digit: number) => {
  // return (0|Math.random()*9e6).toString(36);
  return randomBytes(digit).toString('hex').toUpperCase();
}

export const randomAlphabetOnly = (digit: number) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < digit; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export const formatNumberDigit = (digit: number, value: number) => {
  return (value).toLocaleString('en-US', { minimumIntegerDigits: digit, useGrouping: false })
}