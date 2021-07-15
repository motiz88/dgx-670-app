// @ts-ignore
import handleEvents from 'react-arrow-key-navigation-hook/dist/handleEvents';
import { useEffect } from 'react';

export default function useArrowKeyNavigation(
  element: HTMLElement | null,
  { selectors }: { selectors?: string } = {}
) {
  useEffect(() => {
    const eventHandler = (event: KeyboardEvent) => {
      handleEvents({ event, parentNode: element, selectors });
    };
    document.addEventListener('keydown', eventHandler);
    return () => document.removeEventListener('keydown', eventHandler);
  }, [element, selectors]);
}
