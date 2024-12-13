// Register.js

// Set up our register function
function register() {
    // Get all our input fields
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const userType = document.getElementById('user-type').value;
    let storeName = '';
    let storeLocation = '';

    // Validate input fields
    if (!validate_email(email) || !validate_password(password)) {
        alert('Email or Password is Outta Line!!');
        return;
    }

    // Validate if user type is selected
    if (!validate_field(userType)) {
        alert('Please select either customer or seller');
        return;
    }

    // Check for seller fields if user is a seller
    if (userType === 'seller') {
        storeName = document.getElementById('store_name').value;
        storeLocation = document.getElementById('store_location').value;

        if (!validate_field(storeName) || !validate_field(storeLocation)) {
            alert('Store Name or Store Location is Outta Line!!');
            return;
        }
    }

    console.log("Proceeding with Firebase Authentication");

    // Move on with Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then(function() {
            // Declare user variable
            const user = auth.currentUser;
            console.log("User created with UID:", user.uid);

            // Add this user to Firebase Database
            const database_ref = database.ref();

            // Create User data
            const user_data = {
                email: email,
                password: password,
                user_type: userType,
                store_name: storeName,
                store_location: storeLocation,
                last_login: Date.now()
            };

            if (userType === 'seller') {
                user_data.store_name = storeName;
                user_data.store_location = storeLocation;
            }

            // Push to Firebase Database
            database_ref.child('users/' + user.uid).set(user_data)
                .then(function() {
                    console.log("User data stored successfully in database");
                    // Redirect to homepage
                    window.location.href = 'HomePage.html';

                    // Done
                    alert('User Created!!');
                })
                .catch(function(error) {
                    console.error("Error storing user data in database:", error);
                });
        })
        .catch(function(error) {
            // Firebase will use this to alert of its errors
            const error_code = error.code;
            const error_message = error.message;
            console.error("Error during Firebase authentication:", error_code, error_message);
            alert(error_message);
        });
}

// Validate Functions
function validate_email(email) {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(email);
}

function validate_password(password) {
    // Firebase only accepts lengths greater than 6
    return password.length >= 6;
}

function validate_field(field) {
    return field != null && field.length > 0;
}

// THIS IS FOR THE DROPDOWN OF EITHER SELLER OR CUSTOMER
document.addEventListener('DOMContentLoaded', function() {
    const userTypeSelect = document.getElementById('user-type');
    const storeNameContainer = document.getElementById('store-name-container');

    userTypeSelect.addEventListener('change', function() {
        // Check if the selected option is 'seller'
        if (this.value === 'seller') {
            storeNameContainer.style.display = 'block'; // Show the store name input
        } else {
            storeNameContainer.style.display = 'none'; // Hide the store name input
        }
    });
});

var userForm = document.getElementById("userForm");
var overlay = document.getElementById("overlay");

document.getElementById("createAccountButton").addEventListener("click", function() {
    userForm.style.right = "0";
    overlay.style.display = "block"; 
});

document.getElementById("closeButton").addEventListener("click", function() {
    userForm.style.right = "-100%";
    overlay.style.display = "none"; 
});
