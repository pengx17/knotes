import { useLocation, useResolvedLocation } from 'react-router-dom';

export const useMatch = (url: string) => {
  let location = useLocation();
  let resolvedLocation = useResolvedLocation(url);
  return (
    location.pathname === resolvedLocation.pathname ||
    (location.pathname.startsWith(resolvedLocation.pathname) &&
      location.pathname.charAt(resolvedLocation.pathname.length) === '/')
  );
};
