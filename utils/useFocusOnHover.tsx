import { RefObject, useCallback, useEffect } from 'react';
import useHover from './useHover';
import useImperativeFocus from './useImperativeFocus';
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
  const { focus } = useImperativeFocus(focusElementOrRef);
  useEffect(() => {
    if (isHovered && inputIsMouse && (!wasHovered || !inputWasMouse)) {
      focus();
    }
  }, [focus, inputIsMouse, inputWasMouse, isHovered, wasHovered]);
}
