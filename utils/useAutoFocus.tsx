import { RefObject, useEffect, useState } from 'react';
import useOnScreen from './useOnScreen';

export default function useAutoFocus(
  ref: RefObject<HTMLElement>,
  rootMargin: string = '0px'
) {
  const isOnScreen = useOnScreen(ref, rootMargin);
  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!isFirst) {
      return;
    }
    if (ref.current && isOnScreen) {
      setIsFirst(false);
      ref.current.focus();
    }
  }, [isOnScreen, isFirst, ref]);
}
