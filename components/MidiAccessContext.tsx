import { createContext } from 'react';

export interface MidiPorts {
  /**
   * The MIDI input ports available to the system.
   */
  inputs: WebMidi.MIDIInputMap;

  /**
   * The MIDI output ports available to the system.
   */
  outputs: WebMidi.MIDIOutputMap;

  state: 'pending' | 'rejected' | 'resolved';

  retryPermissions(): void;
}

// @ts-ignore
export default createContext<MidiPorts>(null);
