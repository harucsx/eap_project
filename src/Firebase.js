import * as firebase from 'firebase'

let config = {
  apiKey: "AIzaSyClwuRJ61VuvrX11uTYExG2uEbGHROwRA0",
  authDomain: "eap-project-cd091.firebaseapp.com",
  databaseURL: "https://eap-project-cd091.firebaseio.com",
  projectId: "eap-project-cd091",
  storageBucket: "eap-project-cd091.appspot.com",
  messagingSenderId: "656525774664"
};

export const initfb = () => {
  firebase.initializeApp(config);
};