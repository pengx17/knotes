// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/firestore';

import firebaseConfig from './config.json';

let initialized = false;

// Initialize Firebase
export function init() {
  if (initialized) {
    return;
  }
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  firebase.firestore().enablePersistence({ synchronizeTabs: true });
  initialized = true;
}

init();
