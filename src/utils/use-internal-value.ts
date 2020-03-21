import React from 'react';

export const useInternalValue = <T>(value: T) => {
  const [internal, setInternal] = React.useState(value);
  React.useEffect(() => {
    setInternal(value);
  }, [value]);
  return [internal, setInternal];
};
