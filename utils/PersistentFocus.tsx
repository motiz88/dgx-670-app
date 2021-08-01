import { createContext, RefObject, useEffect, useMemo, useState } from 'react';

interface API {
  focusedElement: null | HTMLElement;
  setFocusedElement(value: null | HTMLElement): void;
}
export const Context = createContext<null | API>(null);

export function PersistentFocusProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [focusedElement, setFocusedElement] = useState<null | HTMLElement>(
    null
  );
  const api = useMemo(
    () => ({ focusedElement, setFocusedElement }),
    [focusedElement]
  );
  return <Context.Provider value={api}>{children}</Context.Provider>;
}
