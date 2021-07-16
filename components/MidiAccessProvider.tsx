import { useCallback, useEffect, useState } from 'react';
import MidiAccessContext, { MidiPorts } from './MidiAccessContext';
import usePromise from 'react-use-promise';

function emptyFunction() {}

export default function MidiAccessProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissionsAttempt, setPermissionsAttempt] = useState(0);
  const [midiAccess, error, state] = usePromise(() => {
    if (!navigator.requestMIDIAccess) {
      throw new Error('Browser does not support MIDI');
    }
    return navigator.requestMIDIAccess();
  }, [permissionsAttempt]);
  const retryPermissions = useCallback(() => {
    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess()
        .then(() => setPermissionsAttempt((x) => x + 1));
    }
  }, []);
  const [midiPorts, setMidiPorts] = useState<MidiPorts>({
    inputs: new Map(),
    outputs: new Map(),
    state,
    retryPermissions,
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
        retryPermissions: emptyFunction, // We already have permissions!
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
