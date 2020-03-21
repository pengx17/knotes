import { DefaultButton } from 'office-ui-fabric-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../app-context';
import { addNote } from './data';

export const AddButton = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const onClick = async () => {
    const note = await addNote(user.uid);
    navigate('/note/' + note.id);
  };
  return (
    <DefaultButton
      iconProps={{ iconName: 'Add' }}
      onClick={onClick}
      text="Add Note"
    />
  );
};
