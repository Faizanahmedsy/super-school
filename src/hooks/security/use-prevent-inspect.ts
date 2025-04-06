import { useEffect } from 'react';

const usePreventInspect = () => {
  useEffect(() => {
    if (import.meta.env.VITE_ENV === 'testing') {
      return;
    }

    interface KeyboardEventWithModifiers extends KeyboardEvent {
      ctrlKey: boolean;
      shiftKey: boolean;
    }

    const blockShortcuts = (e: KeyboardEventWithModifiers) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    interface MouseEventWithPreventDefault extends MouseEvent {
      preventDefault: () => void;
    }

    const blockRightClick = (e: MouseEventWithPreventDefault) => {
      e.preventDefault();
    };

    window.addEventListener('contextmenu', blockRightClick);
    window.addEventListener('keydown', blockShortcuts);

    return () => {
      window.removeEventListener('contextmenu', blockRightClick);
      window.removeEventListener('keydown', blockShortcuts);
    };
  }, []);
};

export default usePreventInspect;
