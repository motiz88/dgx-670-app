import { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import useSound from 'use-sound';
import styles from '../styles/PermissionsOverlay.module.css';
import useSpeechSynthesis from '../utils/useSpeechSynthesis';
// @ts-ignore
import { useSpeechRecognition } from 'react-speech-kit';
import usePrevious from '../utils/usePrevious';

function PermissionsOverlay() {
  const [modalIsOpen, setIsOpen] = useState(true);
  const [playSound] = useSound('/little-thing.wav');
  const { speak } = useSpeechSynthesis();
  const {
    listen,
    stop: stopListening,
    listening: isListening,
  } = useSpeechRecognition();
  const wasListening = usePrevious(isListening);
  useEffect(() => {
    if (!wasListening && isListening) {
      stopListening();
    }
  }, [isListening, stopListening, wasListening]);

  const handleUserActivation = useCallback(
    (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener('click', handleUserActivation);
      window.removeEventListener('keydown', handleUserActivation, true);
      speak({ text: '' });
      playSound();
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess();
      }
      listen();
      setIsOpen(false);
    },
    [listen, playSound, speak]
  );

  useEffect(() => {
    if (modalIsOpen) {
      window.addEventListener('click', handleUserActivation);
      window.addEventListener('keydown', handleUserActivation, true);
      return () => {
        window.removeEventListener('click', handleUserActivation);
        window.removeEventListener('keydown', handleUserActivation, true);
      };
    }
  }, [handleUserActivation, modalIsOpen]);

  return (
    <Modal
      isOpen={modalIsOpen}
      contentLabel="Welcome"
      className={styles.modalContent}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      // We're not targeting screen readers at the moment.
      ariaHideApp={false}
      shouldFocusAfterRender={true}
      shouldReturnFocusAfterClose={true}
    >
      <h1>Welcome!</h1>
      <p>Click anywhere or press any key to start.</p>
      <button>Close</button>
    </Modal>
  );
}

export default PermissionsOverlay;
