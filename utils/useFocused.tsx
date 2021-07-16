import { RefObject, useEffect, useState } from 'react';

function useFocused<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>
): boolean {
  const [value, setValue] = useState<boolean>(false);

  const handleFocus = () => setValue(true);
  const handleBlur = () => setValue(false);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);

      return () => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, [ref]);

  return value;
}

export default useFocused;
