import { useState, useCallback } from 'react';

/**
 * Manage boolean toggle state with memoized handlers.
 *
 * @param initialValue - Initial boolean state (default: false)
 * @returns Tuple of [value, toggle, setTrue, setFalse]
 *
 * @example
 * ```tsx
 * const [isOpen, toggleOpen, open, close] = useToggle(false);
 *
 * <Button onClick={toggleOpen}>Toggle</Button>
 * <Button onClick={open}>Open</Button>
 * <Button onClick={close}>Close</Button>
 * ```
 */
export function useToggle(initialValue = false): readonly [boolean, () => void, () => void, () => void] {
   const [value, setValue] = useState(initialValue);

   const toggle = useCallback(() => {
      setValue((prev) => !prev);
   }, []);

   const setTrue = useCallback(() => {
      setValue(true);
   }, []);

   const setFalse = useCallback(() => {
      setValue(false);
   }, []);

   return [value, toggle, setTrue, setFalse] as const;
}
