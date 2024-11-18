import { model, Schema } from "mongoose";

export const invintory = model(
  "Invintory",
  new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
