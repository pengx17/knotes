import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../app-context';
import { updateNoteMeta, useNoteMetaList } from '../note/data';
import { NoteMeta } from '../note/type';
import { useMatch } from '../utils/use-match';

const MetaListItem: React.FC<{ meta: NoteMeta }> = ({ meta }) => {
  const url = 'note/' + meta.id;
  const active = useMatch(url);
  const activeStyle = active
    ? { background: 'rgb(37, 142, 222)', color: '#fff' }
    : {
        '&:hover': {
          background: '#eee'
        }
      };
  const { user } = useAppContext();
  const navigate = useNavigate();
  return (
    <div
      css={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '&:hover > .archive-button': {
          maxWidth: '50px'
        }
      }}
    >
      <Link
        to={url}
        as="div"
        css={{
          cursor: 'pointer',
          padding: '6px',
          maxWidth: '100%',
          flex: '1',
          ...activeStyle
        }}
      >
        <div
          css={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {meta.title || '<Empty>'}
        </div>
      </Link>
      <div
        css={{
          cursor: 'pointer',
          marginLeft: '8px',
          maxWidth: 0,
          transition: 'max-width 0.2s'
        }}
        className="archive-button"
        onClick={e => {
          e.preventDefault();
          // deleteNote(user.uid, meta.id);
          updateNoteMeta(user.uid, meta.id, {
            archived: true
          });
          navigate('..');
        }}
      >
        🗑
      </div>
    </div>
  );
};

export const MetaList = () => {
  const { user } = useAppContext();
  const list = useNoteMetaList(user.uid);

  return (
    <div css={{ display: 'flex', flexFlow: 'column', alignItems: 'stretch' }}>
      {list &&
        list.length > 0 &&
        list.map(meta => <MetaListItem key={meta.id} meta={meta} />)}
      {list && list.length === 0 && <div>No note yet</div>}
    </div>
  );
};
