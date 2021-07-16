import { MutableRefObject, useEffect, useState } from 'react';
import useFocused from './useFocused';
import usePrevious from './usePrevious';

export default function useSelectOnFocus(element: null | HTMLInputElement) {
  const isFocused = useFocused(element);
  const wasFocused = usePrevious(isFocused);
  useEffect(() => {
    if (!wasFocused && isFocused) {
      element?.select();
    }
  });
}
