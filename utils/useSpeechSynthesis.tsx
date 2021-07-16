// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

const useSpeechSynthesis = (props = {}) => {
  const { onEnd = () => {} } = props;
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  const processVoices = (voiceOptions) => {
    setVoices(voiceOptions);
  };

  const handleEnd = () => {
    setSpeaking(false);
    onEnd();
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      // Firefox seems to have voices upfront and never calls the
      // voiceschanged event
      let voiceOptions = window.speechSynthesis.getVoices();
      if (voiceOptions.length > 0) {
        processVoices(voiceOptions);
        return;
      }

      window.speechSynthesis.onvoiceschanged = (event) => {
        voiceOptions = event.target.getVoices();
        processVoices(voiceOptions);
      };
    }
  }, []);

  const speak = (args = {}) => {
    const {
      voice = null,
      text = '',
      rate = 1,
      pitch = 1,
      volume = 1,
      lang,
    } = args;
    if (!supported) return Promise.resolve();
    setSpeaking(true);
    // Firefox won't repeat an utterance that has been
    // spoken, so we need to create a new instance each time
    const utterance = new window.SpeechSynthesisUtterance();
    // Chrome doesn't automatically use the document's language
    utterance.lang = lang ?? document.documentElement.lang;
    utterance.text = text;
    utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => {
        handleEnd();
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  };

  const cancel = () => {
    if (!supported) return;
    setSpeaking(false);
    window.speechSynthesis.cancel();
  };

  return {
    supported,
    speak,
    speaking,
    cancel,
    voices,
  };
};

export default useSpeechSynthesis;
