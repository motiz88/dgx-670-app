import { useEffect, useState } from 'react';

export default function useOnScreen(
  element: null | HTMLElement,
  rootMargin: string = '0px'
) {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    if (!element) {
      return;
    }
    observer.observe(element);
    return () => {
      observer.unobserve(element);
    };
  }, [element, rootMargin]);
  return isIntersecting;
}
