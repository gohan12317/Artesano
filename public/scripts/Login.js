document.addEventListener('DOMContentLoaded', function() {
    /*const firebaseConfig = {
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
    const auth = firebase.auth();
    const database = firebase.database();*/

    function login() {
        // Get all our input fields
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validate input fields
        if (!validate_email(email) || !validate_password(password)) {
            alert('Email or Password is Outta Line!!');
            return; // Don't continue running the code
        }

        auth.signInWithEmailAndPassword(email, password)
        .then(function() {
            // Declare user variable
            var user = auth.currentUser;
            console.log('User logged in:', user); // Log the user object for debugging

            // Store the user UID in local storage
            localStorage.setItem('userUID', user.uid);

            // Add this user to Firebase Database
            var database_ref = database.ref();

            // Create User data
            var user_data = {
                last_login: Date.now()
            };

            // Push to Firebase Database
            database_ref.child('users/' + user.uid).update(user_data)
            .then(function() {
                console.log('User data updated:', user_data); // Log the updated user data

                // Fetch the user_type from the database
                database_ref.child('users/' + user.uid).once('value').then(function(snapshot) {
                    // Log the entire snapshot for debugging
                    console.log('Snapshot:', snapshot.val());

                    var userType = snapshot.val().user_type;
                    localStorage.setItem('userType', userType);// for storing user type

                    // Log the userType for debugging
                    console.log('User Type:', userType);

                    // Redirect based on user_type
                    if (userType === 'seller') {
                        window.location.href = 'SellerUI.html'; // Replace with your seller dashboard URL
                    } else if (userType === 'customer') {
                        window.location.href = 'HomePage.html'; // Replace with your customer dashboard URL
                    } else {
                        alert('Unknown user type!');
                    }
                }).catch(function(error) {
                    console.error('Error fetching user type:', error);
                });
            }).catch(function(error) {
                console.error('Error updating user data:', error);
            });

            alert('User Logged In!!');
        })
        .catch(function(error) {
            // Firebase will use this to alert of its errors
            var error_code = error.code;
            var error_message = error.message;
            console.error('Error during sign-in:', error_code, error_message); // Log the error

            alert(error_message);
        });
    }

    // Validate Functions
    function validate_email(email) {
        var expression = /^[^@]+@\w+(\.\w+)+\w$/;
        return expression.test(email);
    }

    function validate_password(password) {
        return password.length >= 6;
    }

    // Attach the login function to the button click
    document.getElementById('loginButton').addEventListener('click', login);
});
