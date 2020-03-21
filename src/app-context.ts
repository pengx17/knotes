import React from 'react';

export interface AppContext {
  user: firebase.User;
  signOut: () => void;
}

export const AppContext = React.createContext<AppContext>(null);
export const useAppContext = () => React.useContext(AppContext);
