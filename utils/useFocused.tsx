import { RefObject, useContext, useEffect, useState } from 'react';
import { Context as PersistentFocusContext } from './PersistentFocus';

function useFocused<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>
): boolean {
  const [value, setValue] = useState<boolean>(false);
  const persistentFocus = useContext(PersistentFocusContext);

  useEffect(() => {
    const element = ref.current;
    const handleFocus = persistentFocus
      ? () => {
          persistentFocus.setFocusedElement(element);
        }
      : () => setValue(true);
    const handleBlur = persistentFocus
      ? () => {
          persistentFocus.setFocusedElement(null);
        }
      : () => setValue(false);
    if (element) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);

      return () => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, [persistentFocus, ref]);

  if (persistentFocus) {
    return (
      ref.current != null && persistentFocus.focusedElement === ref.current
    );
  }
  return value;
}

export default useFocused;
