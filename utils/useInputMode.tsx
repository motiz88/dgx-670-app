import { createContext, useContext, useEffect, useState } from 'react';

export enum InputMode {
  Keyboard,
  Mouse,
}

const Context = createContext(InputMode.Mouse);

function InputModeProvider({ children }: { children?: React.ReactNode }) {
  const [inputMode, setInputMode] = useState(InputMode.Mouse);
  useEffect(() => {
    function handleKeyEvent() {
      setInputMode(InputMode.Keyboard);
    }
    function handleMouseEvent() {
      setInputMode(InputMode.Mouse);
    }

    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('mousemove', handleMouseEvent);
    window.addEventListener('mousedown', handleMouseEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
      window.removeEventListener('mousemove', handleMouseEvent);
      window.removeEventListener('mousedown', handleMouseEvent);
    };
  }, []);
  return <Context.Provider value={inputMode}>{children}</Context.Provider>;
}

function useInputMode() {
  return useContext(Context);
}

export default useInputMode;
export { InputModeProvider };
