import { useCallback, useContext, useMemo, useRef } from 'react';
import AnnouncementsContext, { Announcement } from './AnnouncementsContext';
import useSpeechSynthesis from '../utils/useSpeechSynthesis';
import { useMidiConfig } from './MidiConfig';

const DEFAULT_CHANNEL = 0;

export default function AnnouncementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queue = useRef<Announcement[]>([]);
  const isBusy = useRef(false);
  const { speak, cancel: stopSpeaking } = useSpeechSynthesis();
  const { activeMidiOutputs } = useMidiConfig();
  const tryAdvanceQueue = useCallback(() => {
    if (isBusy.current) {
      return;
    }
    if (!queue.current.length) {
      isBusy.current = false;
      return;
    }
    const myQueue = queue.current;
    const [announcement] = myQueue;
    myQueue.shift();
    const next = () => {
      if (myQueue !== queue.current) {
        return;
      }
      isBusy.current = false;
      tryAdvanceQueue();
    };
    isBusy.current = true;
    switch (announcement.type) {
      case 'speak':
        speak({ text: announcement.text }).then(next);
        break;
      case 'sleep':
        if (myQueue.length && myQueue[0].type === 'midi') {
          myQueue[0].delay = (myQueue[0].delay || 0) + announcement.duration;
          Promise.resolve().then(next);
        } else if (myQueue.length && myQueue[0].type === 'sleep') {
          myQueue[0].duration += announcement.duration;
          Promise.resolve().then(next);
        } else {
          sleep(announcement.duration).then(next);
        }
        break;
      case 'midi':
        for (const output of activeMidiOutputs) {
          output.send(
            announcement.data,
            announcement.delay != null
              ? performance.now() + announcement.delay
              : undefined
          );
        }
        Promise.resolve().then(next);
        break;
      case 'note':
        {
          const duration = announcement.duration ?? 60000 / 120 / 4;
          const note = announcement.note ?? 0x3c;
          const channel = announcement.channel ?? DEFAULT_CHANNEL;
          myQueue.unshift(
            {
              type: 'midi',
              data: [
                // Note On
                0x90 + channel,
                note,
                announcement.velocity ?? 0x60,
              ],
            },
            {
              type: 'midi',
              data: [
                // Note Off
                0x80 + channel,
                note,
                0x00,
              ],
              delay: duration,
            },
            {
              type: 'sleep',
              duration,
            }
          );
        }
        Promise.resolve().then(next);
        break;
      case 'program':
        {
          const channel = announcement.channel ?? DEFAULT_CHANNEL;
          myQueue.unshift({
            type: 'midi',
            data: [
              // CC
              0xb0 + channel,
              // Bank Select
              0x00,
              announcement.msb,
              // CC
              0xb0 + channel,
              // Bank select (LSB)
              0x20,
              announcement.lsb,
              // Program Change
              0xc0 + channel,
              announcement.pc,
            ],
          });
        }
        Promise.resolve().then(next);
        break;
    }
  }, [speak, activeMidiOutputs]);
  const stopMidi = useCallback(() => {
    for (const output of activeMidiOutputs) {
      // "MIDI panic": note off messages on all notes/channels
      for (let note = 0; note <= 127; ++note) {
        for (let channel = 0; channel <= 15; ++channel) {
          // Note off
          output.send([0x80 + channel, note, 0x00]);
        }
      }
    }
  }, [activeMidiOutputs]);
  const api = useMemo(
    () => ({
      announce(announcement: Announcement) {
        queue.current.push(announcement);
        if (!isBusy.current) {
          tryAdvanceQueue();
        }
      },
      stop() {
        queue.current = [];
        isBusy.current = false;
        stopSpeaking();
        stopMidi();
      },
    }),
    [stopMidi, stopSpeaking, tryAdvanceQueue]
  );
  return (
    <AnnouncementsContext.Provider value={api}>
      {children}
    </AnnouncementsContext.Provider>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
