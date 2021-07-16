import Head from 'next/head';
import styles from '../styles/Settings.module.css';
import Link from 'next/link';
import React, { Dispatch, SetStateAction } from 'react';
import {
  PortsConfig,
  stripPrefix,
  useMidiConfig,
} from '../components/MidiConfig';
import useAnnounce from '../utils/useAnnounce';

export default function Settings() {
  const {
    midiOutputConfig,
    setMidiOutputConfig,
    // midiInputConfig,
    // setMidiInputConfig,
    portsByKey,
  } = useMidiConfig();
  const { announce } = useAnnounce(null, [
    { type: 'note', duration: 1000, note: 0x3c /* middle C */ },
  ]);
  return (
    <div className={styles.container}>
      <Head>
        <title>DGX-670 control app settings</title>
        <meta
          name="description"
          content="DGX-670 control app for vision impaired users"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Link href="/">
        <a>← Back</a>
      </Link>
      <PortConfigSection
        config={midiOutputConfig}
        portsByKey={portsByKey}
        onChange={setMidiOutputConfig}
        title="MIDI Outputs"
      />
      <button
        disabled={
          !Object.keys(midiOutputConfig).some(
            (key) => midiOutputConfig[key] && portsByKey.has(key)
          )
        }
        onClick={() => announce()}
      >
        Test outputs
      </button>
      {/* <PortConfigSection
        config={midiInputConfig}
        portsByKey={portsByKey}
        onChange={setMidiInputConfig}
        title="MIDI Inputs"
      /> */}
    </div>
  );
}

function PortConfigSection({
  config,
  portsByKey,
  onChange,
  title,
}: {
  config: PortsConfig;
  portsByKey: ReadonlyMap<string, WebMidi.MIDIPort>;
  onChange: Dispatch<SetStateAction<PortsConfig>>;
  title: string;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {Object.entries(config).map(([key, enabled]) => {
        const port = portsByKey.get(key)!;
        const displayName = stripPrefix(key);
        return (
          <div key={key}>
            <label
              className={
                port ? styles.checkItemEnabled : styles.checkItemDisabled
              }
            >
              <input
                type="checkbox"
                disabled={!port}
                checked={enabled}
                onChange={({ target: { checked } }) => {
                  onChange((c) => {
                    return { ...c, [key]: checked };
                  });
                }}
              />
              {displayName}
            </label>
            {!port && !enabled ? (
              <button
                className={styles.deleteButton}
                onClick={() => {
                  onChange((c) => {
                    const { [key]: _, ...newConfig } = c;
                    return newConfig;
                  });
                }}
              >
                ❌
              </button>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
