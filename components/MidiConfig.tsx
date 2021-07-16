import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import MidiAccessContext from './MidiAccessContext';

export function getKeyForPort(p: WebMidi.MIDIPort): string {
  const prefix = p.type + ':';
  const name = [p.manufacturer, p.name].filter(Boolean).join(' ');
  if (name) {
    return prefix + name;
  }
  return prefix + p.id.toString();
}

export function stripPrefix(key: string) {
  if (key.startsWith('input:')) {
    return key.slice('input:'.length);
  }
  if (key.startsWith('output:')) {
    return key.slice('output:'.length);
  }
  throw new Error('Invalid key for MIDI port');
}

export type PortsConfig = { [name: string]: boolean };

export function MidiConfigProvider({ children }: { children: ReactNode }) {
  const { inputs, outputs } = useContext(MidiAccessContext);
  const portsByKey = useMemo(() => {
    const map = new Map<string, WebMidi.MIDIPort>();
    for (const input of inputs.values()) {
      map.set(getKeyForPort(input), input);
    }
    for (const output of outputs.values()) {
      map.set(getKeyForPort(output), output);
    }
    return map;
  }, [inputs, outputs]);
  const [midiInputConfig, setMidiInputConfig] = useLocalStorage<PortsConfig>(
    'midiInputConfig',
    {}
  );
  const [midiOutputConfig, setMidiOutputConfig] = useLocalStorage<PortsConfig>(
    'midiOutputConfig',
    {}
  );
  useEffect(() => {
    reconcileConfigWithPorts(midiInputConfig, inputs, setMidiInputConfig);
  }, [midiInputConfig, inputs, setMidiInputConfig]);
  useEffect(() => {
    reconcileConfigWithPorts(midiOutputConfig, outputs, setMidiOutputConfig);
  }, [midiOutputConfig, outputs, setMidiOutputConfig]);
  const activeMidiInputs = useMemo(
    () =>
      [...inputs.values()].filter(
        (input) => midiInputConfig[getKeyForPort(input)] === true
      ),
    [inputs, midiInputConfig]
  );
  const activeMidiOutputs = useMemo(
    () =>
      [...outputs.values()].filter(
        (output) => midiOutputConfig[getKeyForPort(output)] === true
      ),
    [outputs, midiOutputConfig]
  );
  const [midiTriggersEnabled, setMidiTriggersEnabled] =
    useLocalStorage<boolean>('midiTriggersEnabled', true);
  const value = useMemo(
    () => ({
      portsByKey,
      midiInputConfig,
      midiOutputConfig,
      setMidiInputConfig,
      setMidiOutputConfig,
      activeMidiInputs,
      activeMidiOutputs,
      midiTriggersEnabled,
      setMidiTriggersEnabled,
    }),
    [
      midiInputConfig,
      midiOutputConfig,
      portsByKey,
      setMidiInputConfig,
      setMidiOutputConfig,
      activeMidiInputs,
      activeMidiOutputs,
      midiTriggersEnabled,
      setMidiTriggersEnabled,
    ]
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

const Context = createContext<{
  portsByKey: ReadonlyMap<string, WebMidi.MIDIPort>;
  midiInputConfig: PortsConfig;
  midiOutputConfig: PortsConfig;
  setMidiInputConfig: Dispatch<SetStateAction<PortsConfig>>;
  setMidiOutputConfig: Dispatch<SetStateAction<PortsConfig>>;
  activeMidiInputs: ReadonlyArray<WebMidi.MIDIInput>;
  activeMidiOutputs: ReadonlyArray<WebMidi.MIDIOutput>;
  midiTriggersEnabled: boolean;
  setMidiTriggersEnabled: Dispatch<SetStateAction<boolean>>;
}>({
  portsByKey: new Map(),
  midiInputConfig: {},
  midiOutputConfig: {},
  setMidiInputConfig: () => {},
  setMidiOutputConfig: () => {},
  activeMidiInputs: [],
  activeMidiOutputs: [],
  midiTriggersEnabled: true,
  setMidiTriggersEnabled: () => {},
});

export function useMidiConfig() {
  return useContext(Context);
}

function reconcileConfigWithPorts(
  config: PortsConfig,
  ports: WebMidi.MIDIInputMap | WebMidi.MIDIOutputMap,
  setPorts: (value: PortsConfig) => void
) {
  let newConfig: undefined | PortsConfig;
  for (const port of ports.values()) {
    const key = getKeyForPort(port);
    if (!Object.hasOwnProperty.call(config, key)) {
      newConfig = newConfig ?? {};
      newConfig[key] = true;
    }
  }
  if (newConfig) {
    setPorts({ ...config, ...newConfig });
  }
}
