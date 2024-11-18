export type BaseFormProps<T> = {
  onSubmit: (data: T) => void;
  isLoading: boolean;
};

export type PlayerState = {
  id: string;
  position: Position;
  size: number;
  skinId?: string;
  sessionId: string;
  lastUpdate: number;
};

export type TFoodItem = {
  id: string;
  position: Position;
  size: number;
};

export type Position = {
  x: number;
  y: number;
};
