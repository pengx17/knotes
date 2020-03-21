import React from 'react';

import firebase from 'firebase/app';

export const getCollection = (path: string) => {
  return firebase.firestore().collection(path);
};

export const useFirestoreCollection = <T extends { id?: string } = any>(
  collectionPath: string,
  // following is for where
  fieldPath?: string,
  opStr?: firebase.firestore.WhereFilterOp,
  value?: any
) => {
  // TODO: loading state?
  // Add the path key to get rid of reading incorrect path
  const [docs, setDocs] = React.useState<{ [key: string]: T[] }>({});

  React.useEffect(() => {
    // TODO: lazy load instead eagerly load?
    let query = getCollection(collectionPath);
    if (fieldPath) {
      query = query.where(
        fieldPath,
        opStr,
        value
      ) as firebase.firestore.CollectionReference<
        firebase.firestore.DocumentData
      >;
    }
    return query.onSnapshot(newDoc => {
      const newDocs = newDoc.docs
        .filter(d => d.exists)
        .map(d => {
          return { ...d.data(), id: d.id } as T;
        });
      setDocs({ [collectionPath]: newDocs });
    });
  }, [collectionPath, fieldPath, opStr, value]);

  return docs[collectionPath];
};

const emptyResult = {};

export const useFirestoreDoc = <T = any>(
  collectionPath: string,
  docPath: string
): { exists?: boolean; data?: T } => {
  const combinedPath = collectionPath + '.' + docPath;
  const [doc, setDoc] = React.useState<{
    [key: string]: { exists: boolean; data: T };
  }>({});

  React.useEffect(() => {
    return getCollection(collectionPath)
      .doc(docPath)
      .onSnapshot(newDoc => {
        setDoc({
          [combinedPath]: {
            data: newDoc.data() as T,
            exists: newDoc.exists
          }
        });
      });
  }, [collectionPath, docPath, combinedPath]);

  return doc[combinedPath] || emptyResult;
};
