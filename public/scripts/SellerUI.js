document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addItemForm').addEventListener('submit', function(event) {
        event.preventDefault();
    
        const productId = document.getElementById('productId').value;
        const productName = document.getElementById('productName').value;
        const productDesc = document.getElementById('productDesc').value;
        const productPrice = document.getElementById('productPrice').value;
        const productStock = document.getElementById('productStock').value;
        const productImage = document.getElementById('productImage').files[0];
        const progressElement = document.getElementById('progress');
    
    
        
    
        if (productId) {
            // Edit existing product
            database.ref('products/' + productId).once('value', function(snapshot) {
                const existingProduct = snapshot.val();
                const productData = {
                    sellerId: existingProduct.sellerId,
                    productName: productName,
                    productDesc: productDesc,
                    productPrice: productPrice,
                    productStock: productStock,
                    productImageUrl: existingProduct.productImageUrl // Keep existing image URL
                };
    
                if (productImage) {
                    const storageRef = storage.ref('products/' + productImage.name);
                    const uploadTask = storageRef.put(productImage);
    
                    uploadTask.on('state_changed', function(snapshot) {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        progressElement.textContent = 'Upload is ' + progress + '% done';
                    }, function(error) {
                        console.error('Error uploading image:', error);
                        progressElement.textContent = 'Error uploading image: ' + error.message;
                    }, function() {
                        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                            productData.productImageUrl = downloadURL; // Update with new image URL
                            updateProduct(productId, productData);
                        });
                    });
                } else {
                    updateProduct(productId, productData); // Use existing image URL
                }
            });
        } else {
            // Add new product
            if (productImage) {
                const storageRef = storage.ref('products/' + productImage.name);
                const uploadTask = storageRef.put(productImage);
    
                uploadTask.on('state_changed', function(snapshot) {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressElement.textContent = 'Upload is ' + progress + '% done';
                }, function(error) {
                    console.error('Error uploading image:', error);
                    progressElement.textContent = 'Error uploading image: ' + error.message;
                }, function() {
                    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                        const newProductKey = database.ref().child('products').push().key;
                        const newProductData = {
                            sellerId: sellerId, // Ensure the sellerId is included
                            productName: productName,
                            productDesc: productDesc,
                            productPrice: productPrice,
                            productStock: productStock,
                            productImageUrl: downloadURL
                        };
                        const updates = {};
                        updates['/products/' + newProductKey] = newProductData;
                        database.ref().update(updates, function(error) {
                            if (error) {
                                console.error('Error saving product data:', error);
                                progressElement.textContent = 'Error saving product data: ' + error.message;
                            } else {
                                console.log('Product data saved successfully.');
                                progressElement.textContent = 'Product added successfully!';
                                document.getElementById('addItemForm').reset();
                                displayProducts();
                            }
                        });
                    });
                });
            } else {
                console.error('No image file selected.');
                progressElement.textContent = 'No image file selected.';
            }
        }
    });
    
    function updateProduct(productId, productData) {
        const updates = {};
        updates['/products/' + productId] = productData;
    
        const progressElement = document.getElementById('progress'); // Add this line
    
        database.ref().update(updates, function(error) {
            if (error) {
                console.error('Error updating product data:', error);
                progressElement.textContent = 'Error updating product data: ' + error.message;
            } else {
                console.log('Product data updated successfully.');
                progressElement.textContent = 'Product updated successfully!';
                document.getElementById('addItemForm').reset();
                window.location.reload();
            }
        });
    }
    
    function deleteProduct(productId) {
        database.ref('products/' + productId).remove()
        .then(function() {
            console.log('Product deleted successfully.');
            
            // Remove the product from all customers' carts
            database.ref('carts').once('value', function(snapshot) {
                snapshot.forEach(function(cartSnapshot) {
                    const cartRef = database.ref('carts/' + cartSnapshot.key + '/' + productId);
                    cartRef.remove().then(function() {
                        console.log('Product removed from cart:', cartSnapshot.key);
                    }).catch(function(error) {
                        console.error('Error removing product from cart:', error);
                    });
                });
            }).then(function() {
                displayProducts();
            }).catch(function(error) {
                console.error('Error fetching carts:', error);
            });
    
        })
        .catch(function(error) {
            console.error('Error deleting product:', error);
        });
    }
    
    const productsPerPage = 8;
    let currentPage = 1;
    let totalProducts = 0;
    let totalPages = 0;
    
    function displayProducts(page) {
        const productList = document.getElementById('productList');
        const pagination = document.getElementById('pagination');
        productList.innerHTML = '';
        pagination.innerHTML = '';
    
        const sellerId = localStorage.getItem('userUID');
    
        if (!sellerId) {
            console.error('No seller ID found in local storage.');
            return;
        }
    
        // Fetch and display the store name
        database.ref('users/' + sellerId).once('value', function(snapshot) {
            const userData = snapshot.val();
            if (userData && userData.store_name) {
                document.getElementById('storeName').textContent = "Welcome, " + userData.store_name + "!";
            } else {
                console.error('Store name not found for seller ID:', sellerId);
            }
        });
    
        database.ref('products').orderByChild('sellerId').equalTo(sellerId).once('value', function(snapshot) {
            const products = [];
            snapshot.forEach(function(childSnapshot) {
                products.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
    
            totalProducts = products.length;
            totalPages = Math.ceil(totalProducts / productsPerPage);
            const start = (page - 1) * productsPerPage;
            const end = start + productsPerPage;
            const paginatedProducts = products.slice(start, end);
    
            paginatedProducts.forEach(function(product) {
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.innerHTML = `
                    <img src="${product.productImageUrl}" alt="${product.productName}">
                    <h3>${product.productName}</h3>
                    <p>Description: ${product.productDesc}</p>
                    <p>Price: ₱${product.productPrice}</p>
                    <p>Stock: ${product.productStock}</p>
                    <button class="edit-btn" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct('${product.id}')">Delete</button>
                `;
                productList.appendChild(productItem);
            });
    
            renderPagination();
        });
    }
    
    function renderPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
    
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-btn';
            pageButton.textContent = i;
            pageButton.onclick = function() {
                currentPage = i;
                displayProducts(currentPage);
            };
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pagination.appendChild(pageButton);
        }
    }
    
    function editProduct(productId) {                                                                     
        database.ref('products/' + productId).once('value', function(snapshot) {
            const product = snapshot.val();
            document.getElementById('productId').value = productId;
            document.getElementById('productName').value = product.productName;
            document.getElementById('productDesc').value = product.productDesc;
            document.getElementById('productPrice').value = product.productPrice;
            document.getElementById('productStock').value = product.productStock;
            // Note: The productImage input will remain empty as we cannot pre-fill it with an existing file
            document.querySelector('.submit-btn').textContent = 'Update Product';
        });
    }
    
    // Initial display of products
    displayProducts(currentPage);
    
    function editProduct(productId) {
        database.ref('products/' + productId).once('value', function(snapshot) {
            const product = snapshot.val();
            document.getElementById('productId').value = productId;
            document.getElementById('productName').value = product.productName;
            document.getElementById('productDesc').value = product.productDesc;
            document.getElementById('productPrice').value = product.productPrice;
            document.getElementById('productStock').value = product.productStock;
            // Note: The productImage input will remain empty as we cannot pre-fill it with an existing file
            document.querySelector('.submit-btn').textContent = 'Update Product';
        });
    }
    
    // Initial display of products
    displayProducts();
    
    });