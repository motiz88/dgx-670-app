import { useEffect, useState } from 'react';
import useOnScreen from './useOnScreen';

export default function useAutoFocus(
  element: null | HTMLElement,
  rootMargin: string = '0px'
) {
  const isOnScreen = useOnScreen(element, rootMargin);
  const [isFirst, setIsFirst] = useState(true);
  useEffect(() => {
    if (!isFirst) {
      return;
    }
    if (element && isOnScreen) {
      setIsFirst(false);
      element.focus();
    }
  }, [isOnScreen, isFirst, element]);
}
