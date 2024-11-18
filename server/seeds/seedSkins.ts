import mongoose from "mongoose";
import { Skins } from "../models/skins";
import { apiConfig } from "../config";
import type { TSkins } from "../types";

const SKIN_URLS = [
  "https://i.imgur.com/yDG1S2F.png",
  "https://i.imgur.com/a3a7lbR.png",
];

(async () => {
  try {
    await mongoose.connect(apiConfig.db.mongoUrl);
    console.log("Connected to MongoDB");

    const skins: TSkins[] = [
      {
        name: "default",
        imageUrl: "https://i.imgur.com/zAOoOR6.png",
        price: 1000,
        rarity: "common",
        effects: ["default effect"],
      },
    ];

    SKIN_URLS.forEach((url, index) => {
      skins.push({
        name: `skin-${index + 1}`,
        imageUrl: url,
        price: 1500 + index * 500,
        rarity: "rare",
        effects: ["special effect"],
      });
    });

    for (const skin of skins) {
      try {
        await Skins.create(skin);
        console.log(`Seeded skin: ${skin.name}`);
      } catch (error) {
        continue;
      }
    }

    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  } catch (connectionError) {
    console.error("Error connecting to MongoDB:", connectionError);
  }
})();
