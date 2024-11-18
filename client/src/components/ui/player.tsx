import { PlayerState } from "@/types";

type PlayerProps = {
  player: PlayerState;
  isCurrentPlayer: boolean;
};

export const Player: React.FC<PlayerProps> = ({ player, isCurrentPlayer }) => {
  return (
    <div
      className={`absolute rounded-full transition-all duration-50 transform -translate-x-1/2 -translate-y-1/2 ${
        isCurrentPlayer ? "border-2 border-yellow-400" : ""
      }`}
      style={{
        left: `${player.position.x}px`,
        top: `${player.position.y}px`,
        width: `${player.size * 2}px`,
        height: `${player.size * 2}px`,
        backgroundColor: isCurrentPlayer ? "#4CAF50" : "#FF5722",
        zIndex: isCurrentPlayer ? 10 : 5,
      }}
    >
      {player.skinId && (
        <div
          className="w-full h-full rounded-full bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://i.imgur.com/zAOoOR6.png)`,
          }}
        />
      )}
    </div>
  );
};
