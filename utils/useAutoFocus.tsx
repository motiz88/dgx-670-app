import { RefObject, useEffect, useState } from 'react';
import useImperativeFocus from './useImperativeFocus';
import useOnScreen from './useOnScreen';

export default function useAutoFocus(
  ref: RefObject<HTMLElement>,
  rootMargin: string = '0px'
) {
  const isOnScreen = useOnScreen(ref, rootMargin);
  const [isFirst, setIsFirst] = useState(true);
  const { focus } = useImperativeFocus(ref);
  useEffect(() => {
    if (!isFirst) {
      return;
    }
    if (ref.current && isOnScreen) {
      setIsFirst(false);
      focus();
    }
  }, [isOnScreen, isFirst, ref, focus]);
}
