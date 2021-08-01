import {
  ForwardedRef,
  forwardRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from '../styles/Filter.module.css';
import useAnnounce from '../utils/useAnnounce';
import useAutoFocus from '../utils/useAutoFocus';
import useFocusOnHover from '../utils/useFocusOnHover';
import useMousePressed from '../utils/useMousePressed';
import usePrevious from '../utils/usePrevious';
import useSelectOnFocus from '../utils/useSelectOnFocus';
// @ts-ignore
import { useSpeechRecognition } from 'react-speech-kit';
import useSound from 'use-sound';
import useMidiTriggers from '../utils/useMidiTriggers';
import { useMidiConfig } from './MidiConfig';

function FilterInputArea(
  {
    onChange = (value: string) => {},
    onSubmit = (source: 'speechRecognition' | 'form') => {},
  },
  forwardedRef: ForwardedRef<{ focus(): void }>
) {
  const [query, setQuery] = useState('piano');
  const ref = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useAutoFocus(inputRef);
  useSelectOnFocus(inputRef);
  useFocusOnHover(ref, inputRef);
  useImperativeHandle(forwardedRef, () => ({
    focus() {
      inputRef.current?.focus();
    },
  }));
  useAnnounce(
    inputRef,
    // Empty announcement list - just interrupt any announcements currently playing
    []
  );
  const [playStartListeningSound] = useSound('/beep-up.wav');
  const [playCancelListeningSound] = useSound('/little-thing.wav');

  const changedWhileListening = useRef(false);
  const {
    listen,
    listening: isListening,
    stop: stopListening,
  } = useSpeechRecognition({
    onResult: (result: string) => {
      changedWhileListening.current = true;
      setValue(result);
    },
  });
  const wasListening = usePrevious(isListening);

  useEffect(() => {
    if (wasListening && !isListening && changedWhileListening.current) {
      onSubmit('speechRecognition');
    }
  }, [isListening, wasListening, onSubmit]);
  const listeningGuard = useRef(false);
  const handleLongPressDown = useCallback(() => {
    if (!isListening && !listeningGuard.current) {
      listeningGuard.current = true;
      changedWhileListening.current = false;
      playStartListeningSound();
      // FIXME: Guard listening better, probably fork the hook and track this in a ref
      try {
        listen({ lang: document.documentElement.lang ?? '' });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isListening, listen, playStartListeningSound]);
  const handleLongPressUp = useCallback(() => {
    if (isListening && listeningGuard.current) {
      stopListening();
      listeningGuard.current = false;
      if (!changedWhileListening.current) {
        playCancelListeningSound();
      }
    }
  }, [isListening, playCancelListeningSound, stopListening]);
  useLongPress(inputRef, handleLongPressDown, handleLongPressUp);
  const setValue = (value: string) => {
    setQuery(value);
    onChange(value);
  };
  const { midiTriggersEnabled } = useMidiConfig();
  const midiTriggers = useMemo(
    () => ({
      onStartListening: handleLongPressDown,
      onEndListening: handleLongPressUp,
    }),
    [handleLongPressDown, handleLongPressUp]
  );
  useMidiTriggers(midiTriggersEnabled ? midiTriggers : undefined);
  return (
    <form
      className={styles.filterInputArea}
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit('form');
      }}
      onKeyDown={(e) => {
        if (e.code === 'Escape') {
          inputRef.current?.select();
          return;
        }
      }}
    >
      <input
        autoFocus
        ref={inputRef}
        className={[
          styles.filterInput,
          isListening && styles['filterInput-listening'],
        ]
          .filter(Boolean)
          .join(' ')}
        type="text"
        value={query}
        onChange={({ target: { value } }) => setValue(value)}
      />
    </form>
  );
}

function useLongPress(
  ref: RefObject<HTMLElement>,
  handleDown: () => void = () => {},
  handleUp: () => void = () => {}
) {
  const isMousePressed = useMousePressed(ref, {
    delay: 300,
    releaseDelay: 500,
  });
  const wasMousePressed = usePrevious(isMousePressed);
  useEffect(() => {
    if (!wasMousePressed && isMousePressed) {
      handleDown();
    } else if (wasMousePressed && !isMousePressed) {
      handleUp();
    }
  }, [handleDown, handleUp, isMousePressed, wasMousePressed]);
}
export default forwardRef(FilterInputArea);
