import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import React from 'react';
import { useNavigate, useParams, useRoutes } from 'react-router-dom';
import { useAppContext } from '../app-context';
import { NoteContentView } from '../note/content';
import { useNoteContent, useNoteMeta } from '../note/data';
import { Nav } from './nav';

const centerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const RouteNoteContent = () => {
  const { nid } = useParams();
  const { user } = useAppContext();
  const meta = useNoteMeta(user.uid, nid);
  const { data: content, exists: contentExists } = useNoteContent(
    user.uid,
    nid
  );

  if ((meta.exists && meta.exists === undefined) || meta.exists === undefined) {
    return (
      <div css={centerStyle}>
        <Spinner size={SpinnerSize.large} />
      </div>
    );
  }

  if (meta.exists && contentExists) {
    return <NoteContentView nid={nid} meta={meta.data} content={content} />;
  }

  return <div css={centerStyle}>Note does not exist!</div>;
};

// This suspense hook looks cool:
// https://medium.com/@straybugs/rxjs-hooks-and-suspense-the-ultimate-guide-6d4f61dc224c

const RouteEmptyContent = () => {
  return (
    <div css={centerStyle}>
      <div
        css={{
          fontSize: '32px'
        }}
      >
        <span role="img" aria-label="left">
          👈
        </span>{' '}
        Start by selecting a note
      </div>
    </div>
  );
};

const Navigate: React.FC<{ to: string }> = ({ to }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  return <noscript />;
};

const RootRoutes = [
  {
    path: 'note',
    element: <RouteEmptyContent />
  },
  {
    path: 'note/:nid',
    element: <RouteNoteContent />
  },
  {
    path: '',
    element: <Navigate to="note" />
  }
];

const AppRouteView = () => {
  return useRoutes(RootRoutes);
};

export const MainLayout = () => {
  return (
    <div
      css={{
        display: 'flex',
        height: '100%',
        width: '100%'
      }}
    >
      <Nav />
      <div css={{ flex: '1', overflow: 'auto' }}>
        <AppRouteView />
      </div>
    </div>
  );
};
