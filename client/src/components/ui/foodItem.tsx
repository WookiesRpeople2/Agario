import { Position } from "@/types";
import { GAME_CONSTANTS } from "@/contants";

type FoodItemComponent = {
  position: Position;
  size: number;
  id: string;
};

export const FoodItem: React.FC<FoodItemComponent> = ({ position, size }) => {
  return (
    <div
      className="absolute rounded-full bg-purple-500"
      style={{
        left: `${position.x - GAME_CONSTANTS.VIEW_WIDTH / 2}px`,
        top: `${position.y - GAME_CONSTANTS.VIEW_HEIGHT / 2}px`,
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};
