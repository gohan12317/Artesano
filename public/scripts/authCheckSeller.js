// authCheckSeller.js

// Check if user is logged in
const userId = localStorage.getItem('userUID');
const userType = localStorage.getItem('userType');

if (!userId || userType !== 'seller') {
    // Redirect to homepage if no userId found or user is not a seller
    window.location.href = 'HomePage.html'; // Replace with your login or homepage URL
} else {
    // Fetch user details from Firebase to ensure the user is still authenticated
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            const userRef = database.ref('users/' + userId);
            userRef.once('value', function(snapshot) {
                const userData = snapshot.val();
                if (!userData || userData.user_type !== 'seller') {
                    // Redirect to homepage if user is not a seller
                    window.location.href = 'HomePage.html'; // Replace with your homepage URL
                }
            });
        } else {
            // Redirect to homepage if user is not authenticated
            window.location.href = 'HomePage.html'; // Replace with your homepage URL
        }
    });
}
