import { Server, Socket } from "socket.io";
import { Types } from "mongoose";
import { Skins } from "../models/skins";
import { Invintory } from "../models/invintory";
import { gameSession } from "../models/gameSession";
import { isValidMongoIdSocket } from "../middlewares/isValidMongoId";
import type { Position, PlayerState } from "../types";

const GAME_CONSTANTS = {
  INITIAL_SIZE: 10,
  MAP_WIDTH: 1000,
  MAP_HEIGHT: 1000,
  MIN_SIZE_TO_EAT: 1.2,
  EAT_SIZE_MULTIPLIER: 0.5,
  EXPERIENCE_MULTIPLIER: 10,
  COIN_MULTIPLIER: 5,
  LEVEL_UP_EXPERIENCE: 100,
  GAME_END_COINS: 50,
  LEVEL_UP_BONUS: 20,
  MOVE_RATE_LIMIT: 50,
} as const;

const isValidPosition = (position: Position): boolean => {
  return (
    typeof position.x === "number" &&
    typeof position.y === "number" &&
    position.x >= 0 &&
    position.x <= GAME_CONSTANTS.MAP_WIDTH &&
    position.y >= 0 &&
    position.y <= GAME_CONSTANTS.MAP_HEIGHT
  );
};

const handleError = (socket: Socket, error: unknown, message: string) => {
  console.error(`${message}:`, error);
  socket.emit("error", message);
};

const generateRandomPosition = (): Position => {
  return {
    x: Math.random() * GAME_CONSTANTS.MAP_WIDTH,
    y: Math.random() * GAME_CONSTANTS.MAP_HEIGHT,
  };
};

const canEatPlayer = (eater: PlayerState, eaten: PlayerState): boolean => {
  return eater.size >= eaten.size * GAME_CONSTANTS.MIN_SIZE_TO_EAT;
};

const calculateRewards = (eatenSize: number) => {
  return {
    experience: Math.floor(eatenSize) * GAME_CONSTANTS.EXPERIENCE_MULTIPLIER,
    coins: Math.floor(eatenSize) * GAME_CONSTANTS.COIN_MULTIPLIER,
  };
};

const isRateLimited = (player: PlayerState): boolean => {
  const now = Date.now();
  if (now - player.lastUpdate < GAME_CONSTANTS.MOVE_RATE_LIMIT) {
    return true;
  }
  player.lastUpdate = now;
  return false;
};

export class GameHandlers {
  private activePlayers: Map<string, PlayerState>;
  private io: Server;

  constructor(io: Server) {
    this.activePlayers = new Map();
    this.io = io;
  }

  joinGame = async (socket: Socket): Promise<void> => {
    try {
      const userId = socket.user._id;

      const session = await gameSession.create({
        userId,
        startTime: new Date(),
      });

      const inventory = await Invintory.findOne({ userId });
      if (!inventory) {
        throw new Error("User inventory not found");
      }

      const equippedSkin = inventory.skins.find((skin) => skin.equipped);

      const playerState: PlayerState = {
        id: userId,
        position: generateRandomPosition(),
        size: GAME_CONSTANTS.INITIAL_SIZE,
        skinId: equippedSkin?.skinId,
        sessionId: session._id,
        lastUpdate: Date.now(),
      };

      this.activePlayers.set(userId, playerState);
      socket.broadcast.emit("player_joined", playerState);
      socket.emit("game_state", Array.from(this.activePlayers.values()));
    } catch (error) {
      handleError(socket, error, "Failed to join game");
    }
  };

  handleMove = async (socket: Socket, position: Position): Promise<void> => {
    try {
      const userId = socket.user._id;
      const player = this.activePlayers.get(userId);

      if (!player) {
        throw new Error("Player not found");
      }

      if (!isValidPosition(position)) {
        throw new Error("Invalid position");
      }

      if (isRateLimited(player)) {
        return;
      }

      player.position = position;
      socket.broadcast.emit("player_moved", { id: userId, position });
    } catch (error) {
      handleError(socket, error, "Failed to process movement");
    }
  };

  handleEatPlayer = async (
    socket: Socket,
    eatenPlayerId: string
  ): Promise<void> => {
    try {
      const eaterId = socket.user._id;
      const eater = this.activePlayers.get(eaterId);
      const eaten = this.activePlayers.get(eatenPlayerId);

      if (!eater || !eaten) {
        throw new Error("Player not found");
      }

      if (canEatPlayer(eater, eaten)) {
        return;
      }

      eater.size += eaten.size * GAME_CONSTANTS.EAT_SIZE_MULTIPLIER;
      const rewards = calculateRewards(eaten.size);

      await Invintory.findOneAndUpdate({ userId: eaterId }, { $inc: rewards });

      this.activePlayers.delete(eatenPlayerId);
      this.io.to(eatenPlayerId).emit("game_over");
      this.io.emit("player_eaten", { eaterId, eatenId: eatenPlayerId });
    } catch (error) {
      handleError(socket, error, "Failed to process player collision");
    }
  };

  handlePurchaseSkin = async (
    socket: Socket,
    skinId: string
  ): Promise<void> => {
    try {
      if (!isValidMongoIdSocket(socket, skinId)) {
        throw new Error("Invalid skin ID");
      }

      const userId = socket.user._id;
      const [skin, inventory] = await Promise.all([
        Skins.findById(skinId),
        Invintory.findOne({ userId }),
      ]);

      if (!skin || !inventory) {
        throw new Error("Skin or inventory not found");
      }

      if (inventory.coins < skin.price) {
        throw new Error("Insufficient coins");
      }

      await Invintory.findOneAndUpdate(
        { userId },
        {
          $push: {
            skins: {
              skinId: new Types.ObjectId(skinId),
              acquired: new Date(),
              equipped: false,
            },
          },
          $inc: { coins: -skin.price },
        }
      );

      socket.emit("skin_purchased", {
        skinId: new Types.ObjectId(skinId),
        price: skin.price,
      });
    } catch (error) {
      handleError(socket, error, "Failed to purchase skin");
    }
  };

  handleEquipSkin = async (socket: Socket, skinId: string): Promise<void> => {
    try {
      if (!isValidMongoIdSocket(socket, skinId)) {
        throw new Error("Invalid skin ID");
      }

      const userId = socket.user._id;
      const player = this.activePlayers.get(userId);

      await Invintory.findOneAndUpdate(
        {
          userId,
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

      if (player) {
        player.skinId = new Types.ObjectId(skinId);
        this.io.emit("player_skin_changed", {
          playerId: userId,
          skinId: new Types.ObjectId(skinId),
        });
      }
    } catch (error) {
      handleError(socket, error, "Failed to equip skin");
    }
  };

  handleEndGame = async (socket: Socket): Promise<void> => {
    try {
      const userId = socket.user._id;
      const player = this.activePlayers.get(userId);

      if (!player) {
        throw new Error("Player not found");
      }

      const session = await gameSession.findById(player.sessionId);
      if (session) {
        const endTime = new Date();
        const timeAlive =
          (endTime.getTime() - session.startTime.getTime()) / 1000;

        await session.updateOne({
          endTime,
          score: player.size,
          maxSize: player.size,
          timeAlive,
        });
      }

      const inventory = await Invintory.findOne({ userId });
      if (inventory) {
        const shouldLevelUp =
          inventory.experience >= GAME_CONSTANTS.LEVEL_UP_EXPERIENCE;
        await inventory.updateOne({
          $inc: {
            level: shouldLevelUp ? 1 : 0,
            experience: shouldLevelUp ? GAME_CONSTANTS.LEVEL_UP_BONUS : 0,
            coins: GAME_CONSTANTS.GAME_END_COINS,
          },
        });
      }

      this.activePlayers.delete(userId);
      socket.broadcast.emit("player_left", userId);
    } catch (error) {
      handleError(socket, error, "Failed to end game session");
    }
  };

  handleDisconnect = async (socket: Socket): Promise<void> => {
    try {
      const userId = socket.user._id;
      const player = this.activePlayers.get(userId);

      if (player) {
        await gameSession.findByIdAndUpdate(player.sessionId, {
          endTime: new Date(),
        });

        this.activePlayers.delete(userId);
        this.io.emit("player_left", userId);
      }
    } catch (error) {
      console.error("Disconnect handler error:", error);
    }
  };
}
