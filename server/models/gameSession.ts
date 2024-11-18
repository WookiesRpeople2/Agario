import { model, Schema } from "mongoose";

export const gameSession = model(
  "gameSession",
  new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    score: Number,
    experienceGained: Number,
    coinsGained: Number,
    maxSize: Number,
    playersEaten: Number,
    timeAlive: Number,
  })
);
