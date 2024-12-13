// authCheckCustomer.js

// Check if customerId exists in local storage
const customerId = localStorage.getItem('userUID');
const userType = localStorage.getItem('userType');

if (!customerId) {
    // Redirect to login page or homepage if no userUID found
    alert('Please log in to have/view your cart.');
    window.location.href = 'HomePage.html'; // Replace with your login or homepage URL
} else if (userType === 'seller') {
    // Redirect to SellerUI if user is a seller
    window.location.href = 'SellerUI.html'; // Replace with your seller dashboard URL
}
