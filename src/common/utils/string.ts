import { customAlphabet } from 'nanoid';

export const nanoid = (count: number) =>
  customAlphabet('abcdefghijklmnoprstuwxyz123456789', count);

export const capitalized = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};
