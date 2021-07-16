import { RefObject, useEffect, useRef, useState } from 'react';

export default function useMousePressed(
  ref: RefObject<HTMLElement>,
  options: { delay?: number; releaseDelay?: number } = {}
) {
  const [isPressed, setPressed] = useState(false);
  const downTimerId = useRef<number>();
  const upTimerId = useRef<number>();
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    function clear() {
      window.clearTimeout(downTimerId.current);
      downTimerId.current = undefined;
      window.clearTimeout(upTimerId.current);
      upTimerId.current = undefined;
    }
    function handleMouseDown() {
      clear();
      if (options.delay) {
        downTimerId.current = window.setTimeout(() => {
          setPressed(true);
        }, options.delay);
      } else {
        setPressed(true);
      }
    }
    function handleMouseUp() {
      clear();
      if (options.releaseDelay) {
        upTimerId.current = window.setTimeout(() => {
          setPressed(false);
        }, options.releaseDelay);
      } else {
        setPressed(false);
      }
    }
    element.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      clear();
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [options.delay, options.releaseDelay, ref]);
  return isPressed;
}
