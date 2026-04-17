export const RACE_TITLE_MAX_LENGTH = 60;

export function sanitizeRaceTitle(input: string): string {
  return input.replace(/[^\p{L}\p{N}\s,.']/gu, '').slice(0, RACE_TITLE_MAX_LENGTH);
}
