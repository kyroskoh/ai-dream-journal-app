
export enum AppState {
  IDLE,
  RECORDING,
  PROCESSING,
  DISPLAYING,
}

export interface DreamData {
  transcription: string;
  imageUrl: string;
  interpretation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
