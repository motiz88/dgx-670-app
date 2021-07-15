import { useEffect, useState } from 'react';

function useFocused<T extends HTMLElement = HTMLElement>(
  element: null | T
): boolean {
  const [value, setValue] = useState<boolean>(false);

  const handleFocus = () => setValue(true);
  const handleBlur = () => setValue(false);

  useEffect(() => {
    if (element) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);

      return () => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, [element]);

  return value;
}

export default useFocused;
