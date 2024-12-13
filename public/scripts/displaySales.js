document.addEventListener('DOMContentLoaded', function() {
    const salesList = document.getElementById('salesList');
    const sellerId = localStorage.getItem('userUID');

    if (!sellerId) {
        window.location.href = 'HomePage.html'; // Redirect to homepage if no seller ID found
    } else {
        const database = firebase.database();

        // Fetch sales data from Firebase
        const salesRef = database.ref('sales/' + sellerId);
        salesRef.once('value', function(snapshot) {
            if (!snapshot.exists()) {
                salesList.innerHTML = '<tr><td colspan="4">No sales data available.</td></tr>';
                return;
            }

            const salesData = [];

            snapshot.forEach(function(childSnapshot) {
                const sale = childSnapshot.val();
                const productId = sale.productId;

                // Fetch product details to get the product name
                const productRef = database.ref('products/' + productId);
                salesData.push(productRef.once('value').then(function(productSnapshot) {
                    if (productSnapshot.exists()) {
                        const product = productSnapshot.val();
                        const productName = product.productName;

                        return `
                            <tr>
                                <td>${productName}</td>
                                <td>${sale.quantity}</td>
                                <td>₱${sale.total}</td>
                                <td>${new Date(sale.date).toLocaleString()}</td>
                            </tr>
                        `;
                    }
                }).catch(function(error) {
                    console.error('Error fetching product data:', error);
                }));
            });

            Promise.all(salesData).then(function(rows) {
                salesList.innerHTML = rows.join('');
            }).catch(function(error) {
                console.error('Error processing sales data:', error);
            });
        }).catch(function(error) {
            console.error('Error fetching sales data:', error);
        });
    }
});
