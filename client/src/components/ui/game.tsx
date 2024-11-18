import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { Position } from "@/types";
import { FoodItem } from "./foodItem";
import { Player } from "./player";
import { GAME_CONSTANTS } from "@/contants";

export const GameMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { gameState, move, eatPlayer, eatFood, endGame, spawnFood } =
    useSocket();
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!mapRef.current) return;

      const rect = mapRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const position: Position = {
        x: Math.max(
          0,
          Math.min(x / GAME_CONSTANTS.SPEED_FACTOR, GAME_CONSTANTS.MAP_WIDTH)
        ),
        y: Math.max(
          0,
          Math.min(y / GAME_CONSTANTS.SPEED_FACTOR, GAME_CONSTANTS.MAP_HEIGHT)
        ),
      };

      move(position);
      setPos(position);
    },
    [move]
  );

  useEffect(() => {
    const centerX = pos.x - GAME_CONSTANTS.VIEW_WIDTH / 2;
    const centerY = pos.y - GAME_CONSTANTS.VIEW_HEIGHT / 2;

    const newCameraX = Math.max(
      0,
      Math.min(centerX, GAME_CONSTANTS.MAP_WIDTH - GAME_CONSTANTS.VIEW_WIDTH)
    );
    const newCameraY = Math.max(
      0,
      Math.min(centerY, GAME_CONSTANTS.MAP_HEIGHT - GAME_CONSTANTS.VIEW_HEIGHT)
    );

    setCamera({ x: newCameraX, y: newCameraY });
  }, [pos]);

  useEffect(() => {
    spawnFood();
    const checkCollisions = () => {
      gameState.players.forEach((otherPlayer) => {
        const currentPlayer = gameState.currentPlayer;
        console.log(currentPlayer);
        if (!currentPlayer) return;
        if (otherPlayer.id === currentPlayer.id) return;

        const distance = Math.hypot(
          currentPlayer.position.x - otherPlayer.position.x,
          currentPlayer.position.y - otherPlayer.position.y
        );

        if (distance < currentPlayer.size + otherPlayer.size) {
          eatPlayer(otherPlayer.id);
        }
      });

      gameState.food.forEach(() => {
        eatFood();
      });
    };

    const interval = setInterval(checkCollisions, 100);
    return () => clearInterval(interval);
  }, [gameState, gameState.food, eatPlayer, eatFood]);

  useEffect(() => {
    return () => {
      endGame();
    };
  }, [endGame]);

  if (!gameState.isConnected) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-xl">Connecting to game server...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="absolute top-4 left-4 z-20 bg-black/50 text-white p-4 rounded">
        <div>Players: {gameState.players.length}</div>
        {gameState.currentPlayer && (
          <>
            <div>Size: {gameState.currentPlayer.size.toFixed(1)}</div>
            <div>
              Position: ({pos.x.toFixed(0)},{pos.y.toFixed(0)})
            </div>
          </>
        )}
      </div>

      <div
        ref={mapRef}
        className="relative overflow-hidden bg-gray-900"
        style={{
          width: GAME_CONSTANTS.MAP_WIDTH,
          height: GAME_CONSTANTS.MAP_HEIGHT,
          transform: `translate(-${camera.x}px, -${camera.y}px)`,
        }}
        onMouseMove={handleMouseMove}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff1a 1px, transparent 1px), linear-gradient(90deg, #ffffff1a 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {gameState.food.map((food) => (
          <FoodItem
            key={food.id}
            position={food.position}
            size={food.size}
            id={food.id}
          />
        ))}

        {gameState.players.map((player) => (
          <Player
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === gameState.currentPlayer?.id}
          />
        ))}
      </div>
    </div>
  );
};
