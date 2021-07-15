import { createContext } from 'react';

export interface AnnouncementsInterface {
  announce(announcement: Announcement): void;
  stop(): void;
}

export type Announcement =
  | {
      type: 'speak';
      text: string;
    }
  | {
      type: 'midi';
      data: number[] | Uint8Array;
      delay?: number;
    }
  | {
      type: 'sleep';
      duration: number;
    }
  | {
      type: 'note';
      channel?: number;
      duration?: number;
      note?: number;
      velocity?: number;
    }
  | {
      type: 'program';
      channel?: number;
      msb: number;
      lsb: number;
      pc: number;
    };

// @ts-ignore
export default createContext<AnnouncementsInterface>(null);
