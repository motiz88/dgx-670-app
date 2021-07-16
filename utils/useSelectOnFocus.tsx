import { MutableRefObject, RefObject, useEffect, useState } from 'react';
import useFocused from './useFocused';
import usePrevious from './usePrevious';

export default function useSelectOnFocus(ref: RefObject<HTMLInputElement>) {
  const isFocused = useFocused(ref);
  const wasFocused = usePrevious(isFocused);
  useEffect(() => {
    if (!wasFocused && isFocused) {
      ref.current?.select();
    }
  });
}
