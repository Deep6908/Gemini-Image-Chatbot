export interface UploadedImage {
  file: File;
  dataUrl: string;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}