import type { Types } from "mongoose";

export type PlayerState = {
  id: string;
  position: Position;
  size: number;
  skinId?: Types.ObjectId;
  sessionId: Types.ObjectId;
  lastUpdate: number;
};

export type FoodItem = {
  id: string;
  position: Position;
  size: number;
};

export type Position = {
  x: number;
  y: number;
};

export type ServerToClientEvents = {
  error: (message: string) => void;
  player_joined: (player: PlayerState) => void;
  game_state: (players: PlayerState[]) => void;
  player_moved: (data: { id: string; position: Position }) => void;
  player_eaten: (data: { eaterId: string; eatenId: string }) => void;
  game_over: () => void;
  skin_purchased: (data: { skinId: Types.ObjectId; price: number }) => void;
  player_skin_changed: (data: {
    playerId: string;
    skinId: Types.ObjectId;
  }) => void;
  player_left: (playerId: string) => void;
};

export type ClientToServerEvents = {
  join_game: () => void;
  move: (position: Position) => void;
  eat_player: (eatenPlayerId: string) => void;
  purchase_skin: (skinId: string) => void;
  equip_skin: (skinId: string) => void;
  end_game: () => void;
};

export type InterServerEvents = {
  ping: () => void;
};

export type TSkins = {
  name: string;
  imageUrl: string;
  price: number;
  rarity: string;
  effects: string[];
};
