import firebase from 'firebase/app';
import React from 'react';
import FirebaseAuth from 'react-firebaseui/FirebaseAuth';
import { useNavigate } from 'react-router-dom';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { useEventCallback } from '../utils/use-event-callback';

const useUser = () => {
  const [u, setU] = React.useState<firebase.User>();
  React.useEffect(() => {
    return firebase.auth().onAuthStateChanged(_user => {
      setU(_user);
    });
  }, []);
  return { user: u, loading: u === undefined };
};

type authChildrenRender = (arg: {
  user: firebase.User;
  signOut: () => void;
}) => React.ReactElement;

const uiConfig = {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID
  ],
  signInFlow: 'popup',
  callbacks: {
    // Called when the user has been successfully signed in.
    signInSuccessWithAuthResult: () => {
      // Do not redirect.
      return false;
    }
  }
};

const centerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export const Auth: React.FC<{
  children: authChildrenRender;
}> = ({ children }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const signOut = useEventCallback(() => {
    firebase.auth().signOut();
  });

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div css={centerStyle}>
        <Spinner size={SpinnerSize.large} label="Loading..." />
      </div>
    );
  } else if (user) {
    return children({ user, signOut });
  } else {
    return (
      <div css={centerStyle}>
        <div className="ms-fontSize-42">KNotes / </div>
        <div css={{ display: 'flex' }}>
          <FirebaseAuth
            uiCallback={ui => ui.disableAutoSignIn()}
            firebaseAuth={firebase.auth()}
            uiConfig={uiConfig}
          />
        </div>
      </div>
    );
  }
};
