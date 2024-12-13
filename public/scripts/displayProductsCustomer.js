document.addEventListener('DOMContentLoaded', function() {
    const productList = document.getElementById('productList');
    const pagination = document.getElementById('pagination');
    const storeFilters = document.getElementById('storeFilters');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const productsPerPage = 9; // Number of products per page
    let currentPage = 1;
    let totalProducts = 0;
    let totalPages = 0;
    let selectedStore = '';
    let searchQuery = '';

    // Check if user is signed in
    const userId = localStorage.getItem('userUID');
    if (!userId) {
        alert('You are not signed in. You can view products, but you need to log in to add products to your cart.');
    }

    function displayProducts(page) {
        productList.innerHTML = '';

        database.ref('products').once('value', function(snapshot) {
            let products = [];
            snapshot.forEach(function(childSnapshot) {
                const product = { id: childSnapshot.key, ...childSnapshot.val() };
                if ((selectedStore === '' || product.sellerId === selectedStore) &&
                    (searchQuery === '' || product.productName.toLowerCase().includes(searchQuery.toLowerCase()))) {
                    products.push(product);
                }
            });

            totalProducts = products.length;
            totalPages = Math.ceil(totalProducts / productsPerPage);
            const start = (page - 1) * productsPerPage;
            const end = start + productsPerPage;
            const paginatedProducts = products.slice(start, end);

            paginatedProducts.forEach(function(product) {
                database.ref('users/' + product.sellerId).once('value', function(userSnapshot) {
                    const userData = userSnapshot.exists() ? userSnapshot.val() : null;
                    const storeName = userData && userData.store_name ? userData.store_name : 'Unknown Store';
                    const storeLocation = userData && userData.store_location ? userData.store_location : 'Unknown Location';
            
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item';
                    productItem.innerHTML = `
                        <img src="${product.productImageUrl}" alt="${product.productName}">
                        <h3>${product.productName}</h3>
                        <p>${product.productDesc}</p>
                        <p>Price: ₱${product.productPrice}</p>
                        <p>Stock: ${product.productStock}</p>
                        <p>Store: ${storeName}</p>
                        <p>Location: ${storeLocation}</p>
                        <label for="quantity-${product.id}">Quantity:</label>
                        <input type="number" id="quantity-${product.id}" name="quantity" min="1" max="${product.productStock}" value="1">
                        <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
                    `;
                    productList.appendChild(productItem);
                }).catch(function(error) {
                    console.error('Error fetching user data:', error);
            
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item';
                    productItem.innerHTML = `
                        <img src="${product.productImageUrl}" alt="${product.productName}">
                        <h3>${product.productName}</h3>
                        <p>${product.productDesc}</p>
                        <p>Price: ₱${product.productPrice}</p>
                        <p>Stock: ${product.productStock}</p>
                        <p>Store: Unknown Store</p>
                        <p>Location: Unknown Location</p>
                        <label for="quantity-${product.id}">Quantity:</label>
                        <input type="number" id="quantity-${product.id}" name="quantity" min="1" max="${product.productStock}" value="1">
                        <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
                    `;
                    productList.appendChild(productItem);
                });
            });
            renderPagination();
        });
    }

    function renderPagination() {
        pagination.innerHTML = '';

        const createPageButton = (text, isActive = false, isDisabled = false) => {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-btn';
            if (isActive) pageButton.classList.add('active');
            if (isDisabled) pageButton.classList.add('disabled');
            pageButton.textContent = text;
            return pageButton;
        };

        const addEllipsis = () => {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        };

        const addPageButton = (page) => {
            const pageButton = createPageButton(page, page === currentPage);
            pageButton.onclick = function() {
                currentPage = page;
                displayProducts(currentPage);
            };
            pagination.appendChild(pageButton);
        };

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                addPageButton(i);
            }
        } else {
            if (currentPage > 3) addPageButton(1);
            if (currentPage > 4) addEllipsis();

            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);

            for (let i = startPage; i <= endPage; i++) {
                addPageButton(i);
            }

            if (currentPage < totalPages - 3) addEllipsis();
            if (currentPage < totalPages - 2) addPageButton(totalPages);
        }

        if (currentPage > 1) {
            const prevButton = createPageButton('<', false, false);
            prevButton.onclick = function() {
                currentPage--;
                displayProducts(currentPage);
            };
            pagination.insertBefore(prevButton, pagination.firstChild);
        }

        if (currentPage < totalPages) {
            const nextButton = createPageButton('>', false, false);
            nextButton.onclick = function() {
                currentPage++;
                displayProducts(currentPage);
            };
            pagination.appendChild(nextButton);
        }
    }

    // Show or hide the button when scrolling
    window.addEventListener('scroll', function() {
        const backToTopButton = document.getElementById('backToTopButton');
        if (window.scrollY > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    // Scroll to the top when the button is clicked
    document.getElementById('backToTopButton').addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    function loadStoreFilters() {
        storeFilters.innerHTML = '';

        database.ref('users').once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                const user = childSnapshot.val();
                if (user.user_type === 'seller') {
                    const storeFilter = document.createElement('div');
                    storeFilter.className = 'store-filter';
                    storeFilter.innerHTML = `
                        <input type="radio" name="store" id="store-${childSnapshot.key}" value="${childSnapshot.key}" class="store-radio">
                        <label for="store-${childSnapshot.key}">${user.store_name}</label>
                    `;
                    storeFilters.appendChild(storeFilter);

                    storeFilter.querySelector('.store-radio').addEventListener('change', function() {
                        selectedStore = this.value;
                        displayProducts(currentPage);
                    });
                }
            });

            // Add an option to show all stores
            const allStoresFilter = document.createElement('div');
            allStoresFilter.className = 'store-filter';
            allStoresFilter.innerHTML = `
                <input type="radio" name="store" id="store-all" value="" class="store-radio" checked>
                <label for="store-all">All Stores</label>
            `;
            storeFilters.insertBefore(allStoresFilter, storeFilters.firstChild);

            allStoresFilter.querySelector('.store-radio').addEventListener('change', function() {
                selectedStore = '';
                displayProducts(currentPage);
            });
        });
    }

    searchButton.addEventListener('click', function() {
        searchQuery = searchInput.value;
        displayProducts(currentPage);
    });

    function addToCart(productId) {
        const quantityInput = document.getElementById('quantity-' + productId);
        const quantity = parseInt(quantityInput.value);
        const userId = localStorage.getItem('userUID');

        if (!userId) {
            alert('You need to log in to add products to your cart.');
            return;
        }

        const cartRef = database.ref('carts/' + userId + '/' + productId);

        cartRef.transaction(function(currentData) {
            if (currentData === null) {
                return { quantity: quantity };
            } else {
                return { quantity: currentData.quantity + quantity };
            }
        }, function(error, committed, snapshot) {
            if (error) {
                console.error('Transaction failed: ', error);
            } else if (!committed) {
                console.log('Transaction not committed.');
            } else {
                console.log('Item added to cart!');
                // No need to call updateCartBadge here as it will be updated in real-time
            }
        });
    }

    function updateCartBadge() {
        const userId = localStorage.getItem('userUID');
        if (!userId) return;

        const cartRef = database.ref('carts/' + userId);
        cartRef.on('value', function(snapshot) {
            let itemCount = 0;
            snapshot.forEach(function(childSnapshot) {
                itemCount += childSnapshot.val().quantity;
            });
            const cartBadge = document.getElementById('cart-badge');
            if (itemCount > 0) {
                cartBadge.textContent = itemCount;
                cartBadge.style.display = 'inline';
            } else {
                cartBadge.style.display = 'none';
            }
        });
    }

    // Initial display of products and load filters
    updateCartBadge();
    displayProducts(currentPage);
    loadStoreFilters();
});
