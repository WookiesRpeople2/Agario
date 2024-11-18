import { model, Schema } from "mongoose";

export const Invintory = model(
  "Invintory",
  new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    coins: {
      type: Number,
      default: 0,
    },
    skins: [
      {
        skinId: {
          type: Schema.Types.ObjectId,
          ref: "Skin",
        },
        acquired: {
          type: Date,
          default: Date.now,
        },
        equipped: {
          type: Boolean,
          default: false,
        },
      },
    ],
    achievements: [
      {
        name: String,
        description: String,
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  })
);
