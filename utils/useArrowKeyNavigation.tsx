// @ts-ignore
import handleEvents from 'react-arrow-key-navigation-hook/dist/handleEvents';
import { RefObject, useEffect } from 'react';

export default function useArrowKeyNavigation(
  ref: RefObject<HTMLElement>,
  { selectors }: { selectors?: string } = {}
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const eventHandler = (event: KeyboardEvent) => {
      handleEvents({ event, parentNode: element, selectors });
    };
    document.addEventListener('keydown', eventHandler);
    return () => document.removeEventListener('keydown', eventHandler);
  }, [ref, selectors]);
}
