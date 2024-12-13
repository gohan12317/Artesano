document.addEventListener('DOMContentLoaded', function() {
    const historyList = document.getElementById('historyList');
    const userId = localStorage.getItem('userUID');

    function displayPurchaseHistory() {
        historyList.innerHTML = '';

        const purchaseHistoryRef = firebase.database().ref('purchaseHistory/' + userId);
        purchaseHistoryRef.once('value', function(snapshot) {
            if (!snapshot.exists()) {
                historyList.innerHTML = '<p>You have no purchase history.</p>';
                return;
            }

            snapshot.forEach(function(childSnapshot) {
                const purchase = childSnapshot.val();
                const productId = purchase.productId;

                // Fetch product details to get the product name and image
                firebase.database().ref('products/' + productId).once('value', function(productSnapshot) {
                    if (productSnapshot.exists()) {
                        const product = productSnapshot.val();
                        const productName = product.productName;
                        const productImageUrl = product.productImageUrl;

                        const purchaseItem = document.createElement('div');
                        purchaseItem.className = 'purchase-item';
                        purchaseItem.innerHTML = `
                            <img src="${productImageUrl}" alt="${productName}" class="purchase-item-img">
                            <div class="purchase-item-details">
                                <p><strong>Product Name:</strong> ${productName}</p>
                                <p><strong>Quantity:</strong> ${purchase.quantity}</p>
                                <p><strong>Total:</strong> ₱${purchase.total}</p>
                                <p><strong>Date:</strong> ${new Date(purchase.date).toLocaleString()}</p>
                            </div>
                        `;
                        historyList.appendChild(purchaseItem);
                    }
                }).catch(function(error) {
                    console.error('Error fetching product data:', error);
                });
            });

            // Add return to home button
            const returnButton = document.createElement('button');
            returnButton.textContent = 'Return to Home Screen';
            returnButton.className = 'return-home-btn';
            returnButton.addEventListener('click', function() {
                window.location.href = 'HomePage.html'; // Change to your homepage
            });
            historyList.appendChild(returnButton);
        }).catch(function(error) {
            console.error('Error fetching purchase history:', error);
        });
    }

    displayPurchaseHistory();
});
