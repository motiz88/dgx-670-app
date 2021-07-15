import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { search } from '../data';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import FilterResults from '../components/FilterResults';
import FilterInputArea from '../components/FilterInputArea';
import useSpeechSynthesis from '../utils/useSpeechSynthesis';
import usePrevious from '../utils/usePrevious';
import PermissionsOverlay from '../components/PermissionsOverlay';

export default function Home() {
  const [query] = useState('piano');
  const [filterQuery, setFilterQuery] = useState(query);
  const [isPending, startTransition] = useTransition();
  const results = useMemo(() => search(filterQuery), [filterQuery]);
  const resultsRef = useRef<{ focus(): void }>(null);
  const inputRef = useRef<{ focus(): void }>(null);
  useEffect(() => {
    if (!results.length) {
      inputRef.current?.focus();
    }
  }, [results]);
  const { speak } = useSpeechSynthesis();
  const handleSubmit = useCallback(
    ({}) => {
      if (results.length) {
        speak({ text: 'OK. I found:' }).then(() => {
          resultsRef.current?.focus();
        });
      } else if (!filterQuery.trim().length) {
        speak({ text: 'What would you like to play?' });
      } else {
        speak({ text: "Sorry, I couldn't find: " + filterQuery });
      }
    },
    [filterQuery, results.length, speak]
  );
  const submit = useSubmit<{
    source: 'speechRecognition' | 'form';
  }>(handleSubmit);

  return (
    <div className={styles.container}>
      <Head>
        <title>DGX-670 control app</title>
        <meta
          name="description"
          content="DGX-670 control app for vision impaired users"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FilterInputArea
        onChange={(value) => {
          startTransition(() => setFilterQuery(value));
        }}
        onSubmit={(source) => {
          // Wrap in a transition this gets flushed after a possible filterQuery transition
          startTransition(() => {
            submit({ source });
          });
        }}
        ref={inputRef}
      />
      <FilterResults
        results={results}
        ref={resultsRef}
        onExit={() => {
          inputRef.current?.focus();
        }}
        isLoading={isPending}
      />
      <PermissionsOverlay />
    </div>
  );
}

function useSubmit<T extends {}>(
  handler: (arg0: T) => void
): (arg0: T) => void {
  const [submitEvent, setSubmitEvent] = useState<null | T>(null);
  const prevSubmitEvent = usePrevious(submitEvent);
  useEffect(() => {
    if (submitEvent !== prevSubmitEvent && submitEvent) {
      handler(submitEvent);
    }
  }, [handler, prevSubmitEvent, submitEvent]);
  return (arg0) => setSubmitEvent({ ...arg0 });
}
