import dayjs from 'dayjs';
import firebase from 'firebase/app';
import { isEqual } from 'lodash-es';
import { TextField } from 'office-ui-fabric-react';
import React from 'react';
import { useAppContext } from '../app-context';
import { useEventCallback } from '../utils/use-event-callback';
import { useIsMounted } from '../utils/use-is-mounted';
import { updateNoteContent, updateNoteMeta } from './data';
import { ContentEditor } from './editor';
import { NoteContent, NoteMeta } from './type';

const incrBy1 = firebase.firestore.FieldValue.increment(1);

const Footer: React.FC<{
  meta: NoteMeta;
}> = ({ meta }) => {
  return (
    <div>
      <em>Last updated {dayjs(meta.updated).fromNow()}</em>
    </div>
  );
};

export const NoteContentView: React.FC<{
  nid: string;
  meta: NoteMeta;
  content: NoteContent;
}> = ({ nid, meta, content }) => {
  const { user } = useAppContext();
  const isMounted = useIsMounted();

  const updateMeta = useEventCallback(partialMeta => {
    return updateNoteMeta(user.uid, nid, { ...meta, ...partialMeta });
  });

  const updateContent = useEventCallback(newContent => {
    return updateNoteContent(user.uid, nid, newContent, incrBy1);
  });

  const [internalContent, setInternalContent] = React.useState(content);

  const onContentChange = useEventCallback(val => {
    if (!isMounted()) {
      return;
    }
    if (!isEqual(val, internalContent?.content)) {
      setInternalContent(old => ({
        counter: old.counter + 1,
        content: val
      }));
      updateContent(val);
    } else {
      setInternalContent(old => ({
        counter: old.counter,
        content: val
      }));
    }
  });

  React.useEffect(() => {
    if (
      content &&
      (content?.counter > internalContent?.counter || !internalContent)
    ) {
      setInternalContent(content);
    }
  }, [content, internalContent]);

  return (
    <div css={{ padding: '12px' }}>
      <TextField
        value={meta.title}
        css={{ marginBottom: '12px' }}
        placeholder="Add a title here"
        label="Title"
        onChange={e => updateMeta({ title: (e.target as any).value })}
      />
      {internalContent && internalContent?.content ? (
        <ContentEditor
          value={internalContent.content}
          onChange={onContentChange}
        />
      ) : (
        undefined
      )}
      <div css={{ height: '0.5em' }} />
      <Footer meta={meta} />
    </div>
  );
};
