import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppContext } from './app-context';
import { Auth } from './firebase';
import { MainLayout } from './layout/main';

const AppWithUser: React.FC<{
  user: firebase.User;
  signOut: () => void;
}> = ({ user, signOut }) => {
  const context = React.useMemo(
    () => ({
      user,
      signOut
    }),
    [user, signOut]
  );
  return (
    <AppContext.Provider value={context}>
      <MainLayout />
    </AppContext.Provider>
  );
};

export const App = () => {
  return (
    <Router>
      <Auth>
        {({ user, signOut }) => <AppWithUser user={user} signOut={signOut} />}
      </Auth>
    </Router>
  );
};
