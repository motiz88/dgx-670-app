import { useEffect, useState } from 'react';
import MidiAccessContext, { MidiPorts } from './MidiAccessContext';
import usePromise from 'react-use-promise';

export default function MidiAccessProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [midiAccess, error, state] = usePromise(() => {
    if (!navigator.requestMIDIAccess) {
      throw new Error('Browser does not support MIDI');
    }
    return navigator.requestMIDIAccess();
  }, []);
  const [midiPorts, setMidiPorts] = useState<MidiPorts>({
    inputs: new Map(),
    outputs: new Map(),
    state,
  });
  useEffect(() => {
    if (!midiAccess) {
      return;
    }
    const listener = () => {
      setMidiPorts({
        inputs: new Map(midiAccess.inputs),
        outputs: new Map(midiAccess.outputs),
        state,
      });
    };
    listener();
    midiAccess.addEventListener('statechange', listener);
    return () => {
      midiAccess.removeEventListener('statechange', listener);
    };
  }, [midiAccess, state]);
  // TODO: Handle retrying/reloading down the tree
  if (error) {
    console.error(error);
  }
  return (
    <MidiAccessContext.Provider value={midiPorts}>
      {children}
    </MidiAccessContext.Provider>
  );
}
