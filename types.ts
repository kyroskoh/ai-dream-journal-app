
export enum AppState {
  IDLE,
  RECORDING,
  PROCESSING,
  DISPLAYING,
}

export interface DreamData {
  id: string;
  date: string;
  transcription: string;
  imageUrl: string;
  interpretation: string;
  tags: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}