import { useEffect } from 'react';
import useHover from './useHover';
import usePrevious from './usePrevious';

export default function useFocusOnHover(
  element: null | HTMLElement,
  focusElement: null | HTMLElement = element
) {
  const isHovered = useHover(element);
  const wasHovered = usePrevious(isHovered);
  useEffect(() => {
    if (!wasHovered && isHovered) {
      focusElement?.focus();
    }
  }, [isHovered, wasHovered, element, focusElement]);
}
