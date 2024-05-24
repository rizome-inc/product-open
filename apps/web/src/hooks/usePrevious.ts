import { useEffect, useRef } from "react";

// For context, see https://blog.logrocket.com/accessing-previous-props-state-react-hooks/

/**
 * Hook that stores the previous value of a state variable upon change.
 *
 * @param value
 * @returns
 */
export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current; // Initially this is undefined. When `value` changes, ref.current updates to the original `value` parameter
};
