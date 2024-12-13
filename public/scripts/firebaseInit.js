// firebaseInit.js
if (!firebase.apps.length) {
    const firebaseConfig = {
        apiKey: "AIzaSyBizODxEK2Urzza-hNarTn7M0_2_4xgIg4",
        authDomain: "first-try-a43a5.firebaseapp.com",
        databaseURL: "https://first-try-a43a5-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "first-try-a43a5",
        storageBucket: "first-try-a43a5.appspot.com",
        messagingSenderId: "1086396037346",
        appId: "1:1086396037346:web:4dc78db6a3757410f606bb",
        measurementId: "G-2VPCDL07SF"
    };
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
