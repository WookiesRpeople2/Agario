import { model, Schema } from "mongoose";

export const Users = model(
  "Users",
  new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    providers: [
      {
        providerId: String,
        providerName: String,
        providerData: Schema.Types.Mixed,
      },
    ],
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: Date,
  })
);
