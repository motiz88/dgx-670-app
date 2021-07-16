import { RefObject, useCallback, useEffect } from 'react';
import useHover from './useHover';
import useInputMode, { InputMode } from './useInputMode';
import usePrevious from './usePrevious';

export default function useFocusOnHover(
  ref: RefObject<HTMLElement>,
  focusElementOrRef: null | HTMLElement | RefObject<HTMLElement> = ref
) {
  const isHovered = useHover(ref);
  const wasHovered = usePrevious(isHovered);
  const inputMode = useInputMode();
  const inputIsMouse = inputMode === InputMode.Mouse;
  const inputWasMouse = usePrevious(inputIsMouse);
  useEffect(() => {
    if (isHovered && inputIsMouse && (!wasHovered || !inputWasMouse)) {
      if (focusElementOrRef) {
        if (focusElementOrRef instanceof HTMLElement) {
          focusElementOrRef.focus();
        } else {
          focusElementOrRef.current?.focus();
        }
      }
    }
  }, [focusElementOrRef, inputIsMouse, inputWasMouse, isHovered, wasHovered]);
}
