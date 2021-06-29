import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDHcMAnZoa7rjQRvL1s82TrAb2opy8CENs',
  authDomain: 'music-d7b6a.firebaseapp.com',
  projectId: 'music-d7b6a',
  storageBucket: 'music-d7b6a.appspot.com',
  appId: '1:992956971513:web:8a8d5e314d99c103932528',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const usersCollection = db.collection('users');

export {
  auth,
  db,
  usersCollection,
};
