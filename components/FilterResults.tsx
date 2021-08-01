import FilterResultRow from './FilterResultRow';
import { allVoices } from '../data';
import styles from '../styles/Filter.module.css';
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import usePrevious from '../utils/usePrevious';
import useArrowKeyNavigation from '../utils/useArrowKeyNavigation';
import useImperativeFocus from '../utils/useImperativeFocus';

function FilterResults(
  {
    results,
    onExit = () => {},
    isLoading,
  }: {
    results: ReadonlyArray<{ readonly id: number }>;
    onExit?: () => void;
    isLoading: boolean;
  },
  forwardedRef: ForwardedRef<{ focus(): void }>
) {
  const ref = useRef<HTMLDivElement>(null);
  const firstRef = useRef<{ focus(): void }>(null);
  const prevResults = usePrevious(results);
  useEffect(() => {
    if (prevResults !== results) {
      ref.current!.scrollTop = 0;
    }
  }, [results, prevResults]);
  const { focus: focusFirst } = useImperativeFocus(firstRef);
  useImperativeHandle(
    forwardedRef,
    () => ({
      focus: focusFirst,
    }),
    [focusFirst]
  );
  useArrowKeyNavigation(ref);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.code === 'Backspace' || e.code === 'Escape') {
        e.preventDefault();
        onExit();
        return;
      }
    },
    [onExit]
  );
  const resultRows = useMemo(
    () =>
      [...results].map(({ id }, index) => (
        <FilterResultRow
          key={id}
          voice={allVoices[id]}
          ref={index === 0 ? firstRef : null}
        />
      )),
    [results]
  );
  return (
    <div
      className={[
        styles.filterResults,
        isLoading ? styles.pending : styles.done,
      ].join(' ')}
      ref={ref}
      onKeyDown={handleKeyDown}
    >
      {resultRows}
    </div>
  );
}

export default forwardRef(FilterResults);
