export interface Player {
  id: number;
  name: string;
  color: string;
  timeLeft: number;
}

export interface GameSettings {
  timerDuration: number;
  players: Player[];
}

export const PLAYER_COLORS = {
  PLAYER_1: '#6DE1D2',
  PLAYER_2: '#FFD63A',
  PLAYER_3: '#FFA955',
  PLAYER_4: '#F75A5A',
};

export const TIMER_PRESETS = [30, 60, 120, 180, 300]; // 30초, 1분, 2분, 3분, 5분 