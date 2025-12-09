export interface MemeConfig {
  topText: string;
  bottomText: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
}

export enum GeneratorMode {
  UPLOAD = 'UPLOAD',
  AI_GENERATE = 'AI_GENERATE'
}

export interface GeneratedImage {
  url: string;
  isBase64: boolean;
}

export interface CaptionSuggestion {
  top: string;
  bottom: string;
}