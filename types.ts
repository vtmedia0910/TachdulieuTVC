export interface Scene {
  master_prompts?: Record<string, string>;
  layers?: {
    audio_engineering?: Record<string, string>;
    tiktok_native?: Record<string, string>;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface GroupedData {
  [key: string]: string[];
}

export interface ParsedResult {
  grouped: GroupedData;
  keys: string[];
}

export enum AIModelType {
  FAST = 'FAST',
  THINKING = 'THINKING'
}
