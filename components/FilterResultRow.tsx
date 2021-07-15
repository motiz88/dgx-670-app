import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react';
import { Voice } from '../data';
import styles from '../styles/Filter.module.css';
import useFocusOnHover from '../utils/useFocusOnHover';
import useAnnounce from '../utils/useAnnounce';

function FilterResultRow(
  {
    voice,
  }: {
    voice: Voice;
  },
  forwardedRef: ForwardedRef<{ focus(): void }>
) {
  const ref = useRef<HTMLButtonElement>(null);
  useFocusOnHover(ref.current);
  const baseNote = 0x3c + ((voice.lsb + voice.msb + voice.pc1Based) % 12);
  const { announce } = useAnnounce(ref.current, [
    { type: 'program', msb: voice.msb, lsb: voice.lsb, pc: voice.pc1Based - 1 },
    {
      type: 'speak',
      text: voice.voiceNamePretty,
    },
    { type: 'note', note: baseNote + 0, duration: 60000 / 120 / 4 },
    { type: 'note', note: baseNote + 2, duration: 60000 / 120 / 4 },
    { type: 'note', note: baseNote + 4, duration: 60000 / 120 / 4 },
    { type: 'note', note: baseNote + 5, duration: 60000 / 120 / 4 },
    { type: 'note', note: baseNote + 7, duration: 60000 / 120 / 2 },
  ]);
  useImperativeHandle(forwardedRef, () => ({
    focus() {
      ref.current?.focus();
    },
  }));
  return (
    <button
      ref={ref}
      className={[styles.filterResult].join(' ')}
      onClick={() => announce()}
    >
      <span className={styles.resultsVoiceName}>{voice.voiceNamePretty}</span>
      <br />
      <small>
        {voice.category} {'>'} {voice.subCategoryPretty}
      </small>
      <br />
      <small>{voice.voiceType}</small>
    </button>
  );
}

export default forwardRef(FilterResultRow);
