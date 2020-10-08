import { randomBytes } from "crypto";

export const randomString = (digit: number) => {
  // return (0|Math.random()*9e6).toString(36);
  return randomBytes(digit).toString('hex').toUpperCase();
}