document.addEventListener('DOMContentLoaded', function () {
    const addItemForm = document.getElementById('addItemForm');
    const formTitle = document.querySelector('#add_container h1');
    const submitButton = document.querySelector('.submit-btn');
    const productList = document.getElementById('productList');
    const requiredFields = document.querySelectorAll('#addItemForm input[required], #addItemForm textarea[required]');

    requiredFields.forEach(field => {
        field.addEventListener('input', function() {
            // Check if the field is empty
            if (!this.value) {
                if (!this.previousElementSibling || this.previousElementSibling.className !== 'required-asterisk') {
                    // Create and insert the asterisk if not already there
                    const asterisk = document.createElement('span');
                    asterisk.className = 'required-asterisk';
                    asterisk.textContent = '* required';
                    this.parentNode.insertBefore(asterisk, this);
                }
            } else {
                // Remove the asterisk if the field is filled
                if (this.previousElementSibling && this.previousElementSibling.className === 'required-asterisk') {
                    this.previousElementSibling.remove();
                }
            }
        });

        // Trigger the input event on page load to check pre-filled fields
        field.dispatchEvent(new Event('input'));
    });

    // Function to handle form submission
    addItemForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const productId = document.getElementById('productId').value;
        const productName = document.getElementById('productName').value;
        const productDesc = document.getElementById('productDesc').value;
        const productPrice = document.getElementById('productPrice').value;
        const productStock = document.getElementById('productStock').value;
        const productImage = document.getElementById('productImage').files[0];

        if (submitButton.textContent === 'Add Product') {
            addProduct(productName, productDesc, productPrice, productStock, productImage);
        } else {
            updateProduct(productId, productName, productDesc, productPrice, productStock, productImage);
        }
    });

    window.editProduct = function (productId) {
        firebase.database().ref('products/' + productId).once('value').then(function (snapshot) {
            if (snapshot.exists()) {
                const product = snapshot.val();
                document.getElementById('productId').value = productId;
                document.getElementById('productName').value = product.productName;
                document.getElementById('productDesc').value = product.productDesc;
                document.getElementById('productPrice').value = product.productPrice;
                document.getElementById('productStock').value = product.productStock;
    
                // Update form title and button text
                formTitle.textContent = 'Update Product';
                submitButton.textContent = 'Update Product';
    
                // Trigger input events to update validation state
                requiredFields.forEach(field => {
                    field.dispatchEvent(new Event('input'));
                });
            }
        }).catch(function (error) {
            console.error('Error fetching product data:', error);
        });
    };
    

    function addProduct(name, desc, price, stock, image) {
        const newProductRef = firebase.database().ref('products').push();
        const productId = newProductRef.key;

        const storageRef = firebase.storage().ref('product_images/' + productId);
        const uploadTask = storageRef.put(image);

        uploadTask.on('state_changed', function (snapshot) {
            // Handle progress
        }, function (error) {
            console.error('Error uploading image:', error);
        }, function () {
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                const newProduct = {
                    productName: name,
                    productDesc: desc,
                    productPrice: price,
                    productStock: stock,
                    productImageUrl: downloadURL,
                    sellerId: localStorage.getItem('userUID')
                };

                newProductRef.set(newProduct).then(function () {
                    alert('Product added successfully!');
                    displayProducts();
                    resetForm();
                }).catch(function (error) {
                    console.error('Error adding product:', error);
                });
            });
        });
    }

    function updateProduct(id, name, desc, price, stock, image) {
        const productRef = firebase.database().ref('products/' + id);
        const updates = {
            productName: name,
            productDesc: desc,
            productPrice: price,
            productStock: stock
        };

        if (image) {
            const storageRef = firebase.storage().ref('product_images/' + id);
            const uploadTask = storageRef.put(image);

            uploadTask.on('state_changed', function (snapshot) {
                // Handle progress
            }, function (error) {
                console.error('Error uploading image:', error);
            }, function () {
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    updates.productImageUrl = downloadURL;
                    productRef.update(updates).then(function () {
                        alert('Product updated successfully!');
                        displayProducts();
                        resetForm();
                    }).catch(function (error) {
                        console.error('Error updating product:', error);
                    });
                });
            });
        } else {
            productRef.update(updates).then(function () {
                alert('Product updated successfully!');
                displayProducts();
                resetForm();
            }).catch(function (error) {
                console.error('Error updating product:', error);
            });
        }
    }

    function displayProducts() {
        productList.innerHTML = '';

        firebase.database().ref('products').orderByChild('sellerId').equalTo(localStorage.getItem('userUID')).once('value').then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                const product = childSnapshot.val();
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.innerHTML = `
                    <img src="${product.productImageUrl}" alt="${product.productName}">
                    <div class="product-info">
                        <h3>${product.productName}</h3>
                        <p>${product.productDesc}</p>
                        <p>Price: ₱${product.productPrice}</p>
                        <p>Stock: ${product.productStock}</p>
                        <button class="edit-btn" onclick="editProduct('${childSnapshot.key}')">Edit</button>
                        <button class="delete-btn" onclick="deleteProduct('${childSnapshot.key}')">Delete</button>
                    </div>
                `;
                productList.appendChild(productItem);
            });
        }).catch(function (error) {
            console.error('Error fetching products:', error);
        });
    }

    window.deleteProduct = function (productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            firebase.database().ref('products/' + productId).remove().then(function () {
                alert('Product deleted successfully!');
                displayProducts();
            }).catch(function (error) {
                console.error('Error deleting product:', error);
            });
        }
    };

    function resetForm() {
        document.getElementById('productId').value = '';
        document.getElementById('productName').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productStock').value = '';
        document.getElementById('productImage').value = '';

        formTitle.textContent = 'Add New Product';
        submitButton.textContent = 'Add Product';
    }

    displayProducts();
});
