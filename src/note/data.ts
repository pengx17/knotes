import React from 'react';
import {
  getCollection as _getCollection,
  useFirestoreCollection as _useFirestoreCollection,
  useFirestoreDoc as _useFirestoreDoc
} from '../firebase/use-firestore';
import { NoteContent, NoteMeta } from './type';

const paths = {
  meta: 'meta',
  content: 'content'
};

const getCollection = (uid: string, path: string) =>
  _getCollection('user/' + uid + '/' + path);

const useFirestoreCollection = <T>(
  uid: string,
  path: string,
  fieldPath?: string,
  opStr?: firebase.firestore.WhereFilterOp,
  value?: any
) =>
  _useFirestoreCollection<T>(
    'user/' + uid + '/' + path,
    fieldPath,
    opStr,
    value
  );

const useFirestoreDoc = <T>(uid: string, path: string, docPath: string) =>
  _useFirestoreDoc<T>('user/' + uid + '/' + path, docPath);

const defaultContent = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
];

export const addNote = async (uid: string, meta?: NoteMeta) => {
  if (!meta) {
    const current = new Date().toISOString();
    meta = {
      created: current,
      updated: current,
      tags: [],
      title: 'Enter your title here',
      archived: false
    };
  }
  const metaPromise = getCollection(uid, paths.meta).add(meta);
  metaPromise.then(res => {
    // Should also create an empty content for the user
    getCollection(uid, paths.content)
      .doc(res.id) // reuse the meta id to de-dup
      .set({
        content: defaultContent,
        counter: 0
      });
  });
  return metaPromise;
};

const getNoteMetaRef = (uid: string, nid: string) =>
  getCollection(uid, paths.meta).doc(nid);
const getNoteContentRef = (uid: string, nid: string) =>
  getCollection(uid, paths.content).doc(nid);

export const deleteNote = (uid: string, nid: string) => {
  return getNoteMetaRef(uid, nid).delete();
};

export const updateNoteMeta = (
  uid: string,
  nid: string,
  meta: Partial<NoteMeta>
) => {
  return getNoteMetaRef(uid, nid).update({
    ...meta,
    updated: new Date().toISOString()
  });
};

export const updateNoteContent = async (
  uid: string,
  nid: string,
  content: any,
  counter: import('firebase').firestore.FieldValue
) => {
  await getNoteContentRef(uid, nid).update({
    content,
    counter
  });
  await getNoteMetaRef(uid, nid).update('updated', new Date().toISOString());
};

export const useNoteMetaList = (uid: string, archived = false) => {
  const list = useFirestoreCollection<NoteMeta>(
    uid,
    paths.meta,
    'archived',
    '==',
    archived
  );
  return React.useMemo(() => {
    return list
      ? [...list].sort((a, b) => b.updated.localeCompare(a.updated))
      : null;
  }, [list]);
};

export const useNoteMeta = (uid: string, nid: string) => {
  return useFirestoreDoc<NoteMeta>(uid, paths.meta, nid);
};

export const useNoteContent = (uid: string, nid: string) => {
  return useFirestoreDoc<NoteContent>(uid, paths.content, nid);
};
