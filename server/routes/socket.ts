import { Server as HTTPServer } from "http";
import type { Types } from "mongoose";
import { socketAuthMiddleware } from "../middlewares/auth";
import { GameHandlers } from "../controllers/game";
import type { Socket, Server } from "socket.io";

type PlayerState = {
  id: string;
  position: Position;
  size: number;
  skinId?: Types.ObjectId;
  sessionId: Types.ObjectId;
};

type Position = {
  x: number;
  y: number;
};

type ServerToClientEvents = {
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

type ClientToServerEvents = {
  join_game: () => void;
  move: (position: Position) => void;
  eat_player: (eatenPlayerId: string) => void;
  purchase_skin: (skinId: string) => void;
  equip_skin: (skinId: string) => void;
  end_game: () => void;
};

type InterServerEvents = {
  ping: () => void;
};

export const SocketRoute = (io: Server) => {
  const gameHandler = new GameHandlers(io);

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    socket.on("join_game", async () => await gameHandler.joinGame(socket));
    socket.on(
      "move",
      async (position: Position) =>
        await gameHandler.handleMove(socket, position)
    );
    socket.on("set_food", async () => gameHandler.handleSetFood());
    socket.on("eat_food", async () => await gameHandler.handleEatFood(socket));
    socket.on(
      "eat_player",
      async (eatenPlayerId: string) =>
        await gameHandler.handleEatPlayer(socket, eatenPlayerId)
    );
    socket.on(
      "purchase_skin",
      async (skinId: string) =>
        await gameHandler.handlePurchaseSkin(socket, skinId)
    );
    socket.on(
      "equip_skin",
      async (skinId: string) =>
        await gameHandler.handleEquipSkin(socket, skinId)
    );
    socket.on("end_game", async () => await gameHandler.handleEndGame(socket));
    socket.on(
      "disconnect",
      async () => await gameHandler.handleDisconnect(socket)
    );
  });
};
