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
import Link from 'next/link';
import Image from 'next/image';
import gear from '../images/gear.svg';
import useImperativeFocus from '../utils/useImperativeFocus';
import { PersistentFocusProvider } from '../utils/PersistentFocus';

export default function HomeWrapper() {
  return (
    <PersistentFocusProvider>
      <Home />
    </PersistentFocusProvider>
  );
}

function Home() {
  const [query] = useState('piano');
  const [filterQuery, setFilterQuery] = useState(query);
  const [isPending, startTransition] = useTransition();
  const results = useMemo(() => search(filterQuery), [filterQuery]);
  const resultsRef = useRef<{ focus(): void }>(null);
  const inputRef = useRef<{ focus(): void }>(null);
  const { focus: focusInput } = useImperativeFocus(inputRef);
  useEffect(() => {
    if (!results.length) {
      focusInput();
    }
  }, [focusInput, results]);
  const { speak } = useSpeechSynthesis();
  const { focus: focusResults } = useImperativeFocus(resultsRef);
  const handleSubmit = useCallback(
    ({}) => {
      if (results.length) {
        speak({ text: 'OK. I found:' }).then(() => {
          focusResults();
        });
      } else if (!filterQuery.trim().length) {
        speak({ text: 'What would you like to play?' });
      } else {
        speak({ text: "Sorry, I couldn't find: " + filterQuery });
      }
    },
    [filterQuery, results.length, speak, focusResults]
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
      <PermissionsOverlay />
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
          focusInput();
        }}
        isLoading={isPending}
      />
      <div className={styles.toolbar}>
        <Link href="/settings">
          <a className={styles.settingsButton}>
            <Image src={gear} height={15} width={15} alt="Settings" />
          </a>
        </Link>
      </div>
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
