import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Position, PlayerState, FoodItem } from "../types";
import { clientConfig } from "@/config";
import { useAuth } from "./useAuth";

type GameState = {
  players: PlayerState[];
  food: FoodItem[];
  currentPlayer: PlayerState | null;
  isConnected: boolean;
};

type UseSocketReturn = {
  gameState: GameState;
  move: (position: Position) => void;
  spawnFood: () => void;
  eatPlayer: (eatenPlayerId: string) => void;
  eatFood: () => void;
  purchaseSkin: (skinId: string) => void;
  equipSkin: (skinId: string) => void;
  endGame: () => void;
};

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    food: [],
    currentPlayer: null,
    isConnected: false,
  });
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    const newSocket = io(clientConfig.urls.socket, {
      withCredentials: true,
      auth: { token: token },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, clientConfig.urls.socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setGameState((prev) => ({ ...prev, isConnected: true }));
      socket.emit("join_game");
    });

    socket.on("disconnect", () => {
      setGameState((prev) => ({ ...prev, isConnected: false }));
    });

    socket.on("game_state", (players: PlayerState[], playerId: string) => {
      setGameState((prev) => ({
        ...prev,
        players,
        currentPlayer: players.find((p) => p.id === playerId) || null,
      }));
    });

    socket.on("player_joined", (player: PlayerState) => {
      setGameState((prev) => ({
        ...prev,
        players: [...prev.players, player],
      }));
    });

    socket.on("player_left", (playerId: string) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== playerId),
      }));
    });

    socket.on(
      "player_moved",
      ({ id, position }: { id: string; position: Position }) => {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === id ? { ...p, position } : p
          ),
        }));
      }
    );

    socket.on("food_spawned", (food: FoodItem) => {
      setGameState((prev) => ({
        ...prev,
        food: [...prev.food, food],
      }));
    });

    socket.on(
      "food_eaten",
      ({
        foodId,
        playerId,
        newSize,
      }: {
        foodId: string;
        playerId: string;
        newSize: number;
      }) => {
        setGameState((prev) => ({
          ...prev,
          food: prev.food.filter((f) => f.id !== foodId),
          players: prev.players.map((p) =>
            p.id === playerId ? { ...p, size: newSize } : p
          ),
        }));
      }
    );

    socket.on(
      "player_eaten",
      ({ eaterId, eatenId }: { eaterId: string; eatenId: string }) => {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.filter((p) => p.id !== eatenId),
        }));
      }
    );

    socket.on("game_over", () => {
      setGameState((prev) => ({
        ...prev,
        currentPlayer: null,
      }));
    });

    socket.on(
      "player_skin_changed",
      ({ playerId, skinId }: { playerId: string; skinId: string }) => {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === playerId ? { ...p, skinId } : p
          ),
        }));
      }
    );
  }, [socket]);

  const move = useCallback(
    (position: Position) => {
      socket?.emit("move", position);
    },
    [socket]
  );

  const spawnFood = useCallback(() => {
    socket?.emit("set_food");
  }, [socket]);

  const eatPlayer = useCallback(
    (eatenPlayerId: string) => {
      socket?.emit("eat_player", eatenPlayerId);
    },
    [socket]
  );

  const eatFood = useCallback(() => {
    socket?.emit("eat_food");
  }, [socket]);

  const purchaseSkin = useCallback(
    (skinId: string) => {
      socket?.emit("purchase_skin", skinId);
    },
    [socket]
  );

  const equipSkin = useCallback(
    (skinId: string) => {
      socket?.emit("equip_skin", skinId);
    },
    [socket]
  );

  const endGame = useCallback(() => {
    socket?.emit("end_game");
  }, [socket]);

  return {
    gameState,
    move,
    spawnFood,
    eatPlayer,
    eatFood,
    purchaseSkin,
    equipSkin,
    endGame,
  };
};
