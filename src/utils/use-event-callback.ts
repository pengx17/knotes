import React from 'react';

export function useEventCallback<F extends (...args: any[]) => any>(fn: F): F {
  const ref = React.useRef(fn);

  // we copy a ref to the callback scoped to the current state/props on each render
  React.useEffect(() => {
    ref.current = fn;
  });

  return React.useCallback(
    (...args) => ref.current.apply(void 0, args),
    []
  ) as any;
}
