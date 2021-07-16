import { DecodeStream } from '@lachenmayer/midi-messages';
import { useContext, useEffect, useMemo } from 'react';
import { useMidiConfig } from '../components/MidiConfig';
import { MIDIMessage } from './midi-message-types';

type MIDIMessageEventHandler = (
  this: WebMidi.MIDIInput,
  event: WebMidi.MIDIMessageEvent
) => void;

const LISTEN_TRIGGER_NOTE = 21;

export default function useMidiTriggers({
  onStartListening = () => {},
  onEndListening = () => {},
}: {
  onStartListening?: () => void;
  onEndListening?: () => void;
} = {}) {
  const { activeMidiInputs } = useMidiConfig();
  useEffect(() => {
    const handlerByInput: Map<WebMidi.MIDIInput, MIDIMessageEventHandler> =
      new Map();
    for (const input of activeMidiInputs) {
      const decoder = new DecodeStream();
      const handleMessage: MIDIMessageEventHandler = function (e) {
        decoder.on('data', (message: MIDIMessage) => {
          if (
            message.type === 'NoteOn' &&
            message.note === LISTEN_TRIGGER_NOTE
          ) {
            onStartListening();
          } else if (
            message.type === 'NoteOff' &&
            message.note === LISTEN_TRIGGER_NOTE
          ) {
            onEndListening();
          }
        });
        decoder.write(e.data);
      };
      input.addEventListener('midimessage', handleMessage);
      handlerByInput.set(input, handleMessage);
    }
    return () => {
      for (const [input, handler] of handlerByInput) {
        input.removeEventListener(
          'midimessage',
          // @ts-ignore wtf
          handler
        );
      }
    };
  }, [activeMidiInputs, onEndListening, onStartListening]);
}
