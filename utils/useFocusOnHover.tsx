import { useCallback, useEffect } from 'react';
import useHover from './useHover';
import useInputMode, { InputMode } from './useInputMode';
import usePrevious from './usePrevious';

export default function useFocusOnHover(
  element: null | HTMLElement,
  focusElement: null | HTMLElement = element
) {
  const isHovered = useHover(element);
  const wasHovered = usePrevious(isHovered);
  const inputMode = useInputMode();
  const inputIsMouse = inputMode === InputMode.Mouse;
  const inputWasMouse = usePrevious(inputIsMouse);
  useEffect(() => {
    if (isHovered && inputIsMouse && (!wasHovered || !inputWasMouse)) {
      focusElement?.focus();
    }
  }, [
    isHovered,
    wasHovered,
    inputIsMouse,
    inputWasMouse,
    element,
    focusElement,
  ]);
}
