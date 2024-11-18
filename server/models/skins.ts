import { model, Schema } from "mongoose";

export const Skins = model(
  "Skins",
  new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      required: true,
    },
    effects: [
      {
        type: String,
      },
    ],
  })
);
