// Logout.js

function logout() {
    auth.signOut().then(function() {
        localStorage.removeItem('userUID');
        alert('User Logged Out!');
        window.location.href = 'HomePage.html'; // Replace with your login or homepage URL
    }).catch(function(error) {
        var error_code = error.code;
        var error_message = error.message;
        alert(error_message);
    });
}
