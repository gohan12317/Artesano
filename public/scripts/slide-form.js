document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById("userForm");
    const overlay = document.getElementById("overlay");
    const loginButton = document.getElementById("loginButton");
    const closeButton = document.getElementById("closeButton");
    const createAccountButton = document.getElementById("createAccountButton");
    const logoutButton = userForm ? userForm.querySelector('button[onclick="logout()"]') : null;
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const registerLink = userForm ? userForm.querySelector('p') : null;
    const userId = localStorage.getItem('userUID');
    const welcomeMessage = document.createElement('div'); // Create a div for the welcome message

    // Function to show or hide form elements based on user's login status
    function updateFormDisplay() {
        if (userId) {
            // User is logged in, fetch user email
            auth.onAuthStateChanged((user) => {
                if (user) {
                    const userEmail = user.email;

                    // Set welcome message
                    welcomeMessage.textContent = `Welcome, ${userEmail}`;
                    welcomeMessage.id = "welcomeMessage"; // Add an ID for easy removal later
                    if (userForm && emailInput) {
                        userForm.insertBefore(welcomeMessage, emailInput); // Insert welcome message before email input
                    }
                        // Create the view purchase history button dynamically
                        const viewPurchaseHistoryButton = document.createElement('button');
                        viewPurchaseHistoryButton.id = 'viewPurchaseHistoryButton';
                        viewPurchaseHistoryButton.textContent = 'View Purchase History';
                        userForm.appendChild(viewPurchaseHistoryButton);
    
                        // Add event listener to the dynamically created button
                        viewPurchaseHistoryButton.addEventListener('click', function() {
                            window.location.href = 'customerPage.html'; // Redirect to customerPage.html
                        });                
                }
            });

            // Hide login elements and show logout
            if (loginButton) loginButton.style.display = "none";
            if (emailInput) emailInput.style.display = "none";
            if (passwordInput) passwordInput.style.display = "none";
            if (registerLink) registerLink.style.display = "none";  // Hide the "No account?" link
            if (logoutButton) logoutButton.style.display = "block";
        } else {
            // User is not logged in, show login elements and hide logout
            const existingMessage = document.getElementById("welcomeMessage");
            if (existingMessage) {
                existingMessage.remove(); // Remove the existing welcome message
            }
            if (loginButton) loginButton.style.display = "block";
            if (emailInput) emailInput.style.display = "block";
            if (passwordInput) passwordInput.style.display = "block";
            if (registerLink) registerLink.style.display = "block";  // Show the "No account?" link
            if (logoutButton) logoutButton.style.display = "none";
                        // Remove the view purchase history button if it exists
                        const existingViewPurchaseHistoryButton = document.getElementById('viewPurchaseHistoryButton');
                        if (existingViewPurchaseHistoryButton) {
                            existingViewPurchaseHistoryButton.remove();
                        }
        }
    }

    // Call the function to update form display on load
    updateFormDisplay();

    if (createAccountButton) {
        createAccountButton.addEventListener("click", function() {
            if (userForm) userForm.style.right = "0";
            if (overlay) overlay.style.display = "block"; // Show the overlay
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", function() {
            if (userForm) userForm.style.right = "-100%";
            if (overlay) overlay.style.display = "none"; // Hide the overlay
        });
    }

    // Attach the logout function from Logout.js
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            logout();
            updateFormDisplay();
        });
    }

    

});