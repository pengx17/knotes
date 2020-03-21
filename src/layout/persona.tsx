import {
  Persona,
  PersonaSize,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton
} from 'office-ui-fabric-react';

import React from 'react';
import { useAppContext } from '../app-context';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(s => s.charAt(0))
    .join('');

export const ConfirmDialog: React.FC<{
  hidden: boolean;
  onDismiss: (confirm: boolean) => void;
}> = ({ hidden, onDismiss }) => {
  return (
    <Dialog
      hidden={hidden}
      onDismiss={() => onDismiss(false)}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'Sign out?',
        closeButtonAriaLabel: 'Close',
        subText: 'Are you sure want to sign out?'
      }}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 450 } }
      }}
    >
      <DialogFooter>
        <PrimaryButton onClick={() => onDismiss(true)} text="Sign out!" />
        <DefaultButton onClick={() => onDismiss(false)} text="No, sorry" />
      </DialogFooter>
    </Dialog>
  );
};

export const UserPersona = () => {
  const { user, signOut } = useAppContext();
  const [showSignOut, setShowSignOut] = React.useState(false);
  return (
    <>
      <Persona
        onClick={() => setShowSignOut(true)}
        imageUrl={user.photoURL}
        text={user.displayName}
        imageInitials={getInitials(user.displayName)}
        secondaryText={user.email}
        size={PersonaSize.size40}
        css={{ cursor: 'pointer' }}
      />
      <ConfirmDialog
        hidden={!showSignOut}
        onDismiss={confirm => {
          if (confirm) {
            signOut();
          }
          setShowSignOut(false);
        }}
      />
    </>
  );
};
