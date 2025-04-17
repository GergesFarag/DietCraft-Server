import { goals } from "../models/userInfo.schema";

export const calculateCalories = (
  age: number,
  weight: number,
  height: number,
  gender: boolean,
  activityLevel: string,
  goal: Number
): number => {
  let bmr;

  if (gender === true) {
    bmr = 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age;
  } else {
    bmr = 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age;
  }

  const activityMultiplier: any = {
    low: 1.2,
    medium: 1.45,
    high: 1.7,
  };
  let cal = bmr * activityMultiplier[activityLevel];
  if (goal === goals.gainWeight) cal += 500;
  else if (goal === goals.loseWeight) cal -= 500;
  return cal;
};
