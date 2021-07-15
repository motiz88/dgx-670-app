import { useEffect, useRef } from 'react';

export default function usePrevious<T>(value: T) {
  const ref: React.MutableRefObject<void | T> = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
