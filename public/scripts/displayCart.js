document.addEventListener('DOMContentLoaded', function() {
    const cartList = document.getElementById('cartList');
    const userId = localStorage.getItem('userUID');
    const payButton = document.getElementById('payButton');
    const continueShoppingButton = document.getElementById('continueShoppingButton');

    function displayCart() {
        cartList.innerHTML = '';

        const cartRef = firebase.database().ref('carts/' + userId);
        cartRef.once('value').then(function(snapshot) {
            if (!snapshot.exists()) {
                cartList.innerHTML = '<p>Your cart is empty.</p>';
                return;
            }

            snapshot.forEach(function(childSnapshot) {
                const productId = childSnapshot.key;
                const quantity = childSnapshot.val().quantity;

                firebase.database().ref('products/' + productId).once('value').then(function(productSnapshot) {
                    if (productSnapshot.exists()) {
                        const product = productSnapshot.val();
                        const productItem = document.createElement('div');
                        productItem.className = 'product-item';
                        productItem.innerHTML = `
                            <img src="${product.productImageUrl}" alt="${product.productName}">
                            <div class="product-info">
                                <h3>${product.productName}</h3>
                                <p>${product.productDesc}</p>
                                <p>Price: ₱${product.productPrice}</p>
                                <p>Quantity: <span id="quantity-${productId}">${quantity}</span></p>
                                <div class="quantity-controls" id="controls-${productId}">
                                    <button onclick="changeQuantity('${productId}', -1)">-</button>
                                    <input type="number" id="input-quantity-${productId}" value="${quantity}" min="1">
                                    <button onclick="changeQuantity('${productId}', 1)">+</button>
                                    <button onclick="saveQuantity('${productId}')">Save</button>
                                </div>
                                <button class="edit-qty-btn" onclick="editQuantity('${productId}')">Edit Qty</button>
                                <button class="remove-from-cart-btn" onclick="removeFromCart('${productId}')">Remove</button>
                            </div>
                        `;
                        cartList.appendChild(productItem);

                        document.getElementById(`input-quantity-${productId}`).addEventListener('change', function() {
                            updateQuantity(productId, this.value);
                        });
                    }
                }).catch(function(error) {
                    console.error('Error fetching product data:', error);
                });
            });
        }).catch(function(error) {
            console.error('Error fetching cart data:', error);
        });
    }

    window.editQuantity = function(productId) {
        document.getElementById(`controls-${productId}`).style.visibility = 'visible';
    };

    window.changeQuantity = function(productId, change) {
        const quantityInput = document.getElementById(`input-quantity-${productId}`);
        let quantity = parseInt(quantityInput.value);
        quantity += change;

        if (quantity < 1) {
            quantity = 1;
        }

        quantityInput.value = quantity;
    };

    window.saveQuantity = function(productId) {
        const quantityInput = document.getElementById(`input-quantity-${productId}`);
        const quantity = parseInt(quantityInput.value);
        updateQuantity(productId, quantity);
        document.getElementById(`controls-${productId}`).style.visibility = 'hidden';
    };

    window.updateQuantity = function(productId, quantity) {
        const userId = localStorage.getItem('userUID');
        const cartRef = firebase.database().ref('carts/' + userId + '/' + productId);
        cartRef.update({ quantity: parseInt(quantity) }).then(function() {
            document.getElementById(`quantity-${productId}`).textContent = quantity;
        }).catch(function(error) {
            console.error('Error updating quantity:', error);
            alert('Error updating quantity: ' + error.message);
        });
    };

    window.removeFromCart = function(productId) {
        const userId = localStorage.getItem('userUID');
        const cartRef = firebase.database().ref('carts/' + userId + '/' + productId);
        cartRef.remove().then(function() {
            alert('Product removed from cart!');
            displayCart();
        }).catch(function(error) {
            console.error('Error removing from cart:', error);
            alert('Error removing from cart: ' + error.message);
        });
    };

    window.payForItems = function() {
        if (confirm('Are you sure you want to proceed with the payment?')) {
            const cartRef = firebase.database().ref('carts/' + userId);

            cartRef.once('value').then(function(snapshot) {
                if (!snapshot.exists()) {
                    alert('Your cart is empty.');
                    return;
                }

                const promises = [];

                snapshot.forEach(function(childSnapshot) {
                    const productId = childSnapshot.key;
                    const quantity = childSnapshot.val().quantity;

                    const promise = firebase.database().ref('products/' + productId).once('value').then(function(productSnapshot) {
                        if (productSnapshot.exists()) {
                            const product = productSnapshot.val();
                            const newStock = product.productStock - quantity;

                            if (newStock >= 0) {
                                firebase.database().ref('products/' + productId).update({
                                    productStock: newStock
                                });

                                const sellerId = product.sellerId; // Extracting sellerId from the product data
                                const saleData = {
                                    productId: productId,
                                    quantity: quantity,
                                    date: Date.now(),
                                    total: quantity * product.productPrice,
                                    sellerId: sellerId // Including sellerId in sale data
                                };

                                const salesRef = firebase.database().ref('sales/' + sellerId); // Using sellerId for the sales reference
                                const purchaseHistoryRef = firebase.database().ref('purchaseHistory/' + userId);

                                salesRef.push(saleData);
                                purchaseHistoryRef.push(saleData);

                                cartRef.child(productId).remove();
                            }
                        }
                    }).catch(function(error) {
                        console.error('Error fetching product data:', error);
                    });

                    promises.push(promise);
                });

                Promise.all(promises).then(function() {
                    alert('Thank you for your purchase!');
                    setTimeout(function() {
                        window.location.href = 'HomePage.html'; // Redirect to homepage
                    }, 2000); // Wait for 2 seconds before redirecting
                }).catch(function(error) {
                    console.error('Error processing payment:', error);
                });
            }).catch(function(error) {
                console.error('Error processing payment:', error);
            });
        }
    };

    payButton.addEventListener('click', window.payForItems);
    continueShoppingButton.addEventListener('click', function() {
        window.location.href = 'ShopAll.html'; // Change to your shopping page
    });

    displayCart();
});
