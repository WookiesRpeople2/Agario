import { Schema } from "mongoose";

export const Users = new Schema({
  username: {
    type: String,
    require: true,
  },
  avatar: {
    type: String,
  },
  bestScore: {
    type: Number,
  },
});
