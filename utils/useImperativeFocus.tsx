import { RefObject, useContext, useMemo } from 'react';
import { Context as PersistentFocusContext } from './PersistentFocus';

interface Focusable {
  focus(): void;
}

export default function useImperativeFocus(
  elementOrRef: null | Focusable | RefObject<Focusable>
) {
  const persistentFocus = useContext(PersistentFocusContext);
  const api = useMemo(
    () => ({
      focus() {
        function focusElement(element: null | Focusable) {
          if (!element) {
            return;
          }
          element.focus();
          if (persistentFocus && element instanceof HTMLElement) {
            persistentFocus.setFocusedElement(element);
          }
        }
        if (elementOrRef) {
          if ('focus' in elementOrRef) {
            focusElement(elementOrRef);
          } else {
            focusElement(elementOrRef.current);
          }
        }
      },
    }),
    [elementOrRef, persistentFocus]
  );
  return api;
}
