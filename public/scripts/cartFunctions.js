function addToCart(productId) {
    const userId = localStorage.getItem('userUID');

    if (!userId) {
        alert('Please log in to add products to your cart.');
        return;
    }

    const quantity = parseInt(document.getElementById(`quantity-${productId}`).value);

    // Fetch the product's stock to validate the quantity
    database.ref('products/' + productId).once('value', function(snapshot) {
        if (snapshot.exists()) {
            const product = snapshot.val();
            if (quantity > product.productStock) {
                alert(`Cannot add more than ${product.productStock} items to the cart.`);
            } else {
                const cartRef = database.ref('carts/' + userId);
                cartRef.child(productId).set({
                    quantity: quantity
                }, function(error) {
                    if (error) {
                        console.error('Error adding to cart:', error);
                        alert('Error adding to cart: ' + error.message);
                    } else {
                        alert('Product added to cart!');
                    }
                });
            }
        } else {
            alert('Product does not exist.');
        }
    }).catch(function(error) {
        console.error('Error fetching product data:', error);
    });
}

