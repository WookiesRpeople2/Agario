import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { Types } from "mongoose";
import { Skins } from "../models/skins";
import { Invintory } from "../models/invintory";
import { gameSession } from "../models/gameSession";
import { socketAuthMiddleware } from "../middlewares/auth";

type Position = {
  x: number;
  y: number;
};

type PlayerState = {
  id: string;
  position: Position;
  size: number;
  skinId?: Types.ObjectId;
  sessionId: Types.ObjectId;
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

export const initializeSocketControllers = (server: HTTPServer) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents
  >(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  const activePlayers: Map<string, PlayerState> = new Map();

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    const userId = socket.user._id;
    console.log("connected: ", userId);

    socket.on("join_game", async () => {
      try {
        const session = await gameSession.create({
          userId: socket.user._id,
          startTime: new Date(),
        });

        const inventory = await Invintory.findOne({ userId: socket.user._id });
        const equippedSkin = inventory?.skins.find((skin) => skin.equipped);

        const playerState: PlayerState = {
          id: userId,
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          size: 10,
          skinId: equippedSkin?.skinId,
          sessionId: session._id,
        };

        activePlayers.set(userId, playerState);
        socket.broadcast.emit("player_joined", playerState);
        socket.emit("game_state", Array.from(activePlayers.values()));
      } catch (error) {
        socket.emit("error", "Failed to join game");
      }
    });

    socket.on("move", (position: Position) => {
      const player = activePlayers.get(userId);
      if (player) {
        player.position = position;
        socket.broadcast.emit("player_moved", {
          id: userId,
          position: position,
        });
      }
    });

    socket.on("eat_player", async (eatenPlayerId: string) => {
      try {
        const eater = activePlayers.get(userId);
        const eaten = activePlayers.get(eatenPlayerId);

        if (eater && eaten && eater.size > eaten.size) {
          eater.size += eaten.size * 0.5;

          const sizeBonus = Math.floor(eaten.size);
          await Invintory.findOneAndUpdate(
            { userId: socket.user._id },
            {
              $inc: {
                experience: sizeBonus * 10,
                coins: sizeBonus * 5,
              },
            }
          );

          activePlayers.delete(eatenPlayerId);
          io.to(eatenPlayerId).emit("game_over");
          io.emit("player_eaten", { eaterId: userId, eatenId: eatenPlayerId });
        }
      } catch (error) {
        socket.emit("error", "Failed to process player collision");
      }
    });

    socket.on("purchase_skin", async (skinId: string) => {
      try {
        const skin = await Skins.findById(skinId);
        const inventory = await Invintory.findOne({ userId: socket.user._id });

        if (skin && inventory && inventory.coins >= skin.price) {
          await Invintory.findOneAndUpdate(
            { userId: socket.user._id },
            {
              $push: {
                skins: {
                  skinId: new Types.ObjectId(skinId),
                  acquired: new Date(),
                },
              },
              $inc: { coins: -skin.price },
            }
          );
          socket.emit("skin_purchased", {
            skinId: new Types.ObjectId(skinId),
            price: skin.price,
          });
        } else {
          socket.emit("error", "Insufficient coins or invalid skin");
        }
      } catch (error) {
        socket.emit("error", "Failed to purchase skin");
      }
    });

    socket.on("equip_skin", async (skinId: string) => {
      try {
        await Invintory.findOneAndUpdate(
          {
            userId: socket.user._id,
            "skins.skinId": new Types.ObjectId(skinId),
          },
          {
            $set: {
              "skins.$.equipped": true,
              "skins.$[other].equipped": false,
            },
          },
          {
            arrayFilters: [
              { "other.skinId": { $ne: new Types.ObjectId(skinId) } },
            ],
          }
        );

        const player = activePlayers.get(userId);
        if (player) {
          player.skinId = new Types.ObjectId(skinId);
          io.emit("player_skin_changed", {
            playerId: userId,
            skinId: new Types.ObjectId(skinId),
          });
        }
      } catch (error) {
        socket.emit("error", "Failed to equip skin");
      }
    });

    socket.on("end_game", async () => {
      // try {
      //   const player = activePlayers.get(userId);
      //   if (player) {
      //     const session = await gameSession.findById(player.sessionId);
      //     if (session) {
      //       session.endTime = new Date();
      //       session.score = player.size;
      //       session.maxSize = player.size;
      //       session.timeAlive =
      //         (session.endTime.getTime() - session.startTime.getTime()) / 1000;
      //       await session.save();
      //     }
      //     const invintory = await Invintory.findById(player.sessionId);
      //     if (invintory) {
      //       const updateInvintory = {
      //         level:
      //           invintory.experience >= 100
      //             ? invintory.experience + 1
      //             : invintory?.level,
      //         experience:
      //           invintory.experience >= 100
      //             ? invintory.experience + 20
      //             : (invintory.experience = 0),
      //         coins: invintory.coins + 50,
      //       };
      //       invintory.updateOne(updateInvintory);
      //     }
      //     activePlayers.delete(userId);
      //     socket.broadcast.emit("player_left", userId);
      //   }
      // } catch (error) {
      //   socket.emit("error", "Failed to end game session");
      // }
    });

    socket.on("disconnect", async () => {
      try {
        const player = activePlayers.get(userId);
        if (player) {
          await gameSession.findByIdAndUpdate(player.sessionId, {
            endTime: new Date(),
          });
          activePlayers.delete(userId);
          io.emit("player_left", userId);
        }
      } catch (error) {
        console.error("Disconnect handler error:", error);
      }
    });
  });

  return io;
};
