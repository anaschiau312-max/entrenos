// Firebase configuration for RunTracker PWA
const firebaseConfig = {
    apiKey: "AIzaSyAuUbzE-bh5627ZMK6KIEdbh8qNR_rnSzg",
    authDomain: "entrenos-45561.firebaseapp.com",
    databaseURL: "https://entrenos-45561-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "entrenos-45561",
    storageBucket: "entrenos-45561.firebasestorage.app",
    messagingSenderId: "301429271298",
    appId: "1:301429271298:web:fc9a5bd64a34798332b01b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
