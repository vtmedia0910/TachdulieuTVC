import { Scene, GroupedData, ParsedResult } from '../types';

export const parseSceneJson = (jsonString: string): ParsedResult => {
  try {
    const data: Scene[] = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error("Input must be a JSON array.");
    }

    const grouped: GroupedData = {};

    data.forEach(scene => {
      // 1. Master Prompts
      if (scene.master_prompts) {
        for (const [key, value] of Object.entries(scene.master_prompts)) {
          if (typeof value === 'string') {
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(value);
          }
        }
      }

      // 2. Audio Engineering
      if (scene.layers?.audio_engineering) {
        for (const [key, value] of Object.entries(scene.layers.audio_engineering)) {
          if (typeof value === 'string') {
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(value);
          }
        }
      }

      // 3. TikTok Native Text
      if (scene.layers?.tiktok_native) {
        for (const [key, value] of Object.entries(scene.layers.tiktok_native)) {
          if (typeof value === 'string') {
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(value);
          }
        }
      }
    });

    return {
      grouped,
      keys: Object.keys(grouped).sort()
    };
  } catch (error) {
    throw new Error("Invalid JSON format. Please check your input.");
  }
};

export const formatFieldContent = (values: string[]): string => {
  return values.map((v, i) => `${i + 1}. ${v}`).join("\n\n");
};
