// Firebase configuration for RunTracker PWA
const firebaseConfig = {
    apiKey: "[PEGA TU API KEY]",
    authDomain: "[PEGA TU AUTH DOMAIN]",
    databaseURL: "[PEGA TU DATABASE URL]",
    projectId: "[PEGA TU PROJECT ID]",
    storageBucket: "[PEGA TU STORAGE BUCKET]",
    messagingSenderId: "[PEGA TU SENDER ID]",
    appId: "[PEGA TU APP ID]"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
