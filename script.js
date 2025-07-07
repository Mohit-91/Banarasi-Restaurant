const app = {
    // Data Management
    userData: {},
    currentUser: null,
    cartItems: [],
    isLoggedIn: false,
    currentFilter: 'All',
    menuData: [
        {
            id: 1,
            name: 'Chicken Biryani',
            price: 200,
            img: 'https://ministryofcurry.com/wp-content/uploads/2024/06/chicken-biryani-5.jpg',
            category: 'Non-Veg',
            reviews: [
                { userId: 'DemoUser', rating: 5, review: 'Fantastic biryani, perfectly spiced!' },
                { userId: 'AdminUser', rating: 4, review: 'Very good, a bit less chicken than expected.' }
            ]
        },
        {
            id: 2,
            name: 'Paneer Butter Masala',
            price: 180,
            img: 'https://www.vegrecipesofindia.com/wp-content/uploads/2020/01/paneer-butter-masala-5.jpg',
            category: 'Veg',
            reviews: [
                { userId: 'DemoUser', rating: 5, review: 'Creamy and rich, my favorite veg dish here.' }
            ]
        },
        {
            id: 3,
            name: 'Veggie Pizza',
            price: 250,
            img: 'https://images.ctfassets.net/j8tkpy1gjhi5/5OvVmigx6VIUsyoKz1EHUs/b8173b7dcfbd6da341ce11bcebfa86ea/Salami-pizza-hero.jpg',
            category: 'Veg',
            reviews: []
        },
        {
            id: 4,
            name: 'Masala Dosa',
            price: 90,
            img: 'https://www.cookwithmanali.com/wp-content/uploads/2020/05/Masala-Dosa-500x500.jpg',
            category: 'Veg',
            reviews: [
                { userId: 'AdminUser', rating: 4, review: 'Crispy and authentic, good with the sambar.' }
            ]
        },
        {
            id: 5,
            name: 'Gulab Jamun',
            price: 60,
            img: 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2016/10/gulab-jamun-using-mix.jpg?w=1200&ssl=1',
            category: 'Dessert',
            reviews: []
        },
        {
            id: 6,
            name: 'Butter Naan',
            price: 40,
            img: 'https://t3.ftcdn.net/jpg/08/95/50/04/360_F_895500474_IDUMxbOGEBn29tyPyjG8oLEEWlK8ZlOg.jpg',
            category: 'Bread',
            reviews: []
        },
        {
            id: 7,
            name: 'Cold Coffee',
            price: 100,
            img: 'https://www.cookwithmanali.com/wp-content/uploads/2022/04/Cold-Coffee.jpg',
            category: 'Drink',
            reviews: []
        },
        {
            id: 8,
            name: 'Mango Lassi',
            price: 80,
            img: 'https://media.istockphoto.com/id/980036596/photo/mango-lassi-indian-popular-summer-drink-in-a-terracotta-glass-selective-focus.jpg?s=612x612&w=0&k=20&c=N_bJG45HbVRgQly73hnYyOSH-yiTtoE0ulGVMNPMyMM=' ,
            category: 'Drink',
            reviews: [
                { userId: 'DemoUser', rating: 5, review: 'Refreshing and not too sweet. Perfect summer drink.' }
            ]
        },
        {
            id: 9,
            name: 'Chicken Kebab',
            price: 160,
            img: 'https://spicecravings.com/wp-content/uploads/2021/03/Chicken-Seekh-Kebab-Featured-1.jpg',
            category: 'Non-Veg',
            reviews: []
        },
        {
            id: 10,
            name: 'Pav Bhaji',
            price: 120,
            img: 'https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Instant-Pot-Mumbai-Pav-Bhaji.jpg',
            category: 'Veg',
            reviews: [
                { userId: 'DemoUser', rating: 4, review: 'Good street food flavor, could be spicier.' }
            ]
        }
    ],
    nextMenuItemId: 11,
    // userOrders: [], // Orders are now stored within userData
    nextOrderId: 1,
    searchTimeout: null,
    currentReviewRating: 0, // To store the selected rating for a review

    // DOM Elements (Caching)
    elements: {
        menuGrid: document.getElementById("menuGrid"),
        popupOverlay: document.getElementById("popupOverlay"),
        popupContainer: document.getElementById("popupContainer"),
        userDropdown: document.getElementById("userDropdown"),
        cartDropdown: document.getElementById("cartDropdown"),
        restaurant: document.getElementById("restaurant"),
        cartCount: document.getElementById("cartCount"),
        userImage: document.getElementById("userImage"),
        cartList: document.getElementById("cartList"),
        cartTotal: document.getElementById("cartTotal"),
        searchBar: document.getElementById("searchBar"),
        categoryFilters: document.getElementById("categoryFilters"),
        authButton: document.getElementById("authButton"),
        signupButton: document.getElementById("signupButton")
    },

    // Initialization
    init: function() {
        this.loadData(); // Load data from localStorage
        this.renderCategories();
        this.renderMenu();
        this.updateAuthUI();
        this.elements.searchBar.addEventListener('input', () => this.debouncedSearch()); // Event listener for search

        // Close dropdowns/popups when clicking outside
        document.addEventListener('click', (event) => {
            if (this.elements.userDropdown.style.display === "block" && !this.elements.userDropdown.contains(event.target) && !this.elements.userImage.contains(event.target)) {
                this.elements.userDropdown.style.display = "none";
                this.elements.restaurant.classList.remove("blur");
            }
            if (this.elements.cartDropdown.style.display === "flex" && !this.elements.cartDropdown.contains(event.target) && !event.target.closest('.cart-icon')) {
                 // Check if the click is not inside cartDropdown AND not on the cart icon or its children
                if (!this.elements.popupOverlay.contains(event.target)) { // Don't close if a popup is open on top
                    this.elements.cartDropdown.style.display = "none";
                    this.elements.restaurant.classList.remove("blur");
                }
            }
            if (this.elements.popupOverlay.style.display === "flex" && !this.elements.popupContainer.contains(event.target) && event.target === this.elements.popupOverlay) {
                // Only close popup if clicking directly on overlay, not its content
                this.hidePopup();
            }
        });
    },

    // Data Persistence
    saveData: function() {
        localStorage.setItem('userData', JSON.stringify(this.userData));
        localStorage.setItem('currentUser', this.currentUser);
        localStorage.setItem('menuData', JSON.stringify(this.menuData)); // Save menu data (for reviews)
    },

    loadData: function() {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            this.userData = JSON.parse(storedUserData);
        }
        const storedCurrentUser = localStorage.getItem('currentUser');
        if (storedCurrentUser && this.userData[storedCurrentUser]) {
            this.currentUser = storedCurrentUser;
            this.isLoggedIn = true;
        }
        const storedMenuData = localStorage.getItem('menuData');
        if (storedMenuData) {
            this.menuData = JSON.parse(storedMenuData);
        }
        // Restore nextOrderId if needed (optional, could be based on current highest order ID)
        let maxOrderId = 0;
        for (const userEmail in this.userData) {
            if (this.userData[userEmail].orders) {
                this.userData[userEmail].orders.forEach(order => {
                    if (order.id > maxOrderId) {
                        maxOrderId = order.id;
                    }
                });
            }
        }
        this.nextOrderId = maxOrderId + 1;
    },

    // Helper Functions for Ratings/Reviews
    calculateAverageRating: function(reviews) {
        if (!reviews || reviews.length === 0) return 0;
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        return (totalRating / reviews.length).toFixed(1); // One decimal place
    },

    renderStars: function(rating) {
        const fullStars = '★'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(5 - Math.ceil(rating));
        return `<span class="rating">${fullStars}${emptyStars}</span>`;
    },

    // UI Rendering Functions
    renderMenu: function(data = this.menuData) {
        let filteredData = data;
        if (this.currentFilter !== 'All') {
            filteredData = data.filter(item => item.category === this.currentFilter);
        }

        const searchText = this.elements.searchBar.value.toLowerCase().trim();
        if (searchText) {
            filteredData = filteredData.filter(item => item.name.toLowerCase().includes(searchText));
        }

        this.elements.menuGrid.innerHTML = filteredData.map(item => {
            const avgRating = this.calculateAverageRating(item.reviews);
            const ratingHtml = item.reviews && item.reviews.length > 0
                ? `<div class="rating-clickable" onclick="app.openReviewsPopup(${item.id})">${this.renderStars(avgRating)} (${avgRating}) <small>(${item.reviews.length} reviews)</small></div>`
                : `<p class="rating-clickable" onclick="app.openReviewsPopup(${item.id})" style="color:#7f8c8d;">No ratings yet. Be the first!</p>`;

            return `
                <div class="menu-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="details">
                        <h3>${item.name}</h3>
                        ${ratingHtml}
                        <p>Price: ₹${item.price}</p>
                        <button onclick="app.addToCart(${item.id})">Add to Cart</button>
                    </div>
                </div>`;
        }).join('');
    },

    renderCategories: function() {
        const categories = ['All', ...new Set(this.menuData.map(item => item.category))].filter(Boolean);
        
        this.elements.categoryFilters.innerHTML = categories.map(category => `
            <button onclick="app.filterMenu('${category}')" class="${this.currentFilter === category ? 'active' : ''}">
                ${category}
            </button>
        `).join('');
    },

    updateCartDisplay: function() {
        const list = this.cartItems.map(item => `
            <li>
                ${item.name}
                <span>
                    <button onclick="app.changeQty(${item.id}, -1)">-</button>
                    <input type="number" value="${item.quantity}" min="0" onchange="app.setQty(${item.id}, this.value)">
                    <button onclick="app.changeQty(${item.id}, 1)">+</button>
                </span>
            </li>
        `).join('');
        const total = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        this.elements.cartList.innerHTML = list;
        this.elements.cartTotal.textContent = `Total: ₹${total}`;
        this.updateCartCount(); // Ensure count is updated immediately
    },

    updateCartCount: function() {
        const count = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        this.elements.cartCount.textContent = count;
    },

    updateAuthUI: function() {
        if (this.isLoggedIn) {
            this.elements.authButton.textContent = 'Logout';
            this.elements.authButton.onclick = () => this.logoutUser();
            this.elements.signupButton.style.display = 'none';
            // Ensure the image URL from userData is used, with a fallback
            this.elements.userImage.src = this.userData[this.currentUser]?.image || "https://i.pravatar.cc/100";
        } else {
            this.elements.authButton.textContent = 'Login';
            this.elements.authButton.onclick = () => this.openLogin();
            this.elements.signupButton.style.display = 'block';
            this.elements.signupButton.textContent = 'Sign Up';
            this.elements.signupButton.onclick = () => this.openSignup();
            this.elements.userImage.src = "https://i.pravatar.cc/100"; // Reset user image to default
        }
    },

    // Event Handlers
    debouncedSearch: function() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.renderMenu();
        }, 300);
    },

    filterMenu: function(category) {
        this.currentFilter = category;
        this.elements.searchBar.value = '';
        this.renderCategories();
        this.renderMenu();
    },

    toggleDropdown: function() {
        this.elements.userDropdown.style.display = this.elements.userDropdown.style.display === "block" ? "none" : "block";
        if (this.elements.userDropdown.style.display === "block") {
            this.elements.cartDropdown.style.display = "none";
            this.elements.restaurant.classList.add("blur"); // Blur main content when dropdown opens
        } else {
            this.elements.restaurant.classList.remove("blur"); // Unblur when it closes
        }
    },

    showPopup: function(innerHTML) {
        this.elements.popupContainer.innerHTML = innerHTML;
        this.elements.popupOverlay.style.display = "flex";
        this.elements.restaurant.classList.add("blur");
        this.elements.userDropdown.style.display = "none";
        this.elements.cartDropdown.style.display = "none";
    },

    hidePopup: function() {
        this.elements.popupOverlay.style.display = "none";
        this.elements.restaurant.classList.remove("blur");
    },

    goHome: function() {
        this.hidePopup();
        this.elements.userDropdown.style.display = "none";
        this.elements.cartDropdown.style.display = "none";
        this.elements.searchBar.value = '';
        this.filterMenu('All');
    },

    // Auth Functions
    getSignupHTML: function() {
        return `
            <div class="auth-container">
                <span class="close-btn" onclick="app.hidePopup()">&times;</span>
                <h2>Sign Up</h2>
                <input type="text" id="signupName" placeholder="Full Name">
                <input type="email" id="signupEmail" placeholder="Email">
                <input type="password" id="signupPassword" placeholder="Password">
                <label for="signupProfilePic" style="display: block; margin-bottom: 0.5rem; color: #555;">Profile Picture (optional):</label>
                <input type="file" id="signupProfilePic" accept="image/*" style="margin-bottom: 1rem;">
                <button onclick="app.processSignup()">Sign Up</button>
                <p style="text-align:center;">Already have an account? <a href="#" onclick="app.openLogin(); return false;">Login</a></p>
            </div>`;
    },

    getLoginHTML: function() {
        return `
            <div class="auth-container">
                <span class="close-btn" onclick="app.hidePopup()">&times;</span>
                <h2>Login</h2>
                <input type="text" id="loginUsername" placeholder="Username/Email">
                <input type="password" id="loginPassword" placeholder="Password">
                <button onclick="app.loginUser()">Login</button>
                <p style="text-align:center;">Don't have an account? <a href="#" onclick="app.openSignup(); return false;">Sign Up</a></p>
            </div>`;
    },

    openSignup: function() {
        this.showPopup(this.getSignupHTML());
    },

    openLogin: function() {
        this.showPopup(this.getLoginHTML());
    },

    processSignup: function() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const profilePicInput = document.getElementById('signupProfilePic');
        let imageUrl = "https://i.pravatar.cc/100"; // Default image

        if (!name || !email || !password) {
            alert('Please fill in all required fields (Name, Email, Password).');
            return;
        }
        if (this.userData[email]) {
            alert('User with this email already exists. Please login or use a different email.');
            return;
        }

        if (profilePicInput.files && profilePicInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageUrl = e.target.result;
                this.registerUser(name, email, password, imageUrl);
                this.openLogin(); // Open login after registration
            };
            reader.onerror = () => {
                alert('Could not read file. Using default profile picture.');
                this.registerUser(name, email, password, imageUrl); // Fallback to default
                this.openLogin();
            };
            reader.readAsDataURL(profilePicInput.files[0]);
        } else {
            this.registerUser(name, email, password, imageUrl);
            this.openLogin(); // Open login immediately if no file
        }
    },

    registerUser: function(name, email, password, image) { 
        this.userData[email] = { name: name, password: password, image: image, orders: [] };
        this.saveData(); // Save user data
        alert('Account created successfully! Please log in.');
    },

    loginUser: function() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (this.userData[username] && this.userData[username].password === password) {
            this.currentUser = username;
            this.isLoggedIn = true;
            this.saveData(); // Save current user
            this.updateAuthUI();
            this.hidePopup();
            alert('Logged in successfully!');
        } else {
            alert('Invalid username or password.');
        }
    },

    logoutUser: function() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.cartItems = []; // Clear cart on logout
        localStorage.removeItem('currentUser'); // Clear current user from storage
        this.updateCartCount();
        this.updateAuthUI();
        this.hidePopup();
        alert('Logged out successfully!');
    },

    // Cart Functions
    addToCart: function(itemId) {
        if (!this.isLoggedIn) {
            alert('Please login to add items to your cart.');
            this.openLogin();
            return;
        }
        const item = this.menuData.find(m => m.id === itemId);
        const existingCartItem = this.cartItems.find(c => c.id === itemId);

        if (existingCartItem) {
            existingCartItem.quantity++;
        } else {
            this.cartItems.push({ ...item, quantity: 1 });
        }
        this.updateCartCount();
        this.updateCartDisplay();
    },

    changeQty: function(itemId, delta) {
        const itemIndex = this.cartItems.findIndex(c => c.id === itemId);
        if (itemIndex > -1) {
            this.cartItems[itemIndex].quantity += delta;
            if (this.cartItems[itemIndex].quantity <= 0) {
                this.cartItems.splice(itemIndex, 1);
            }
        }
        this.updateCartCount();
        this.updateCartDisplay();
    },

    setQty: function(itemId, quantity) {
        const itemIndex = this.cartItems.findIndex(c => c.id === itemId);
        if (itemIndex > -1) {
            const newQty = parseInt(quantity);
            if (newQty > 0) {
                this.cartItems[itemIndex].quantity = newQty;
            } else {
                this.cartItems.splice(itemIndex, 1);
            }
        }
        this.updateCartCount();
        this.updateCartDisplay();
    },

    showCart: function() {
        if (this.elements.cartDropdown.style.display === "flex") {
            this.elements.cartDropdown.style.display = "none";
            this.elements.restaurant.classList.remove("blur");
        } else {
            this.updateCartDisplay();
            this.elements.cartDropdown.style.display = "flex";
            this.elements.restaurant.classList.add("blur");
            this.elements.userDropdown.style.display = "none"; // Hide user dropdown if cart opens
        }
    },

    // Checkout Functions
    openCheckout: function() {
        if (this.cartItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        if (!this.isLoggedIn) {
            alert('Please login to proceed to checkout.');
            this.openLogin();
            return;
        }

        const checkoutListHTML = this.cartItems.map(item => `
            <li>
                ${item.name} x ${item.quantity} <span>₹${item.price * item.quantity}</span>
            </li>
        `).join('');
        const total = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const checkoutHTML = `
            <div class="checkout-container">
                <span class="close-btn" onclick="app.hidePopup()">&times;</span>
                <h2>Checkout</h2>
                <h3>Items:</h3>
                <ul>${checkoutListHTML}</ul>
                <div class="checkout-total">Total: ₹${total}</div>
                <button class="place-order-btn" onclick="app.placeOrder()">Place Order</button>
            </div>`;
        this.showPopup(checkoutHTML);
    },

    placeOrder: function() {
        if (this.cartItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        if (!this.currentUser) {
            alert('Error: User not logged in.');
            return;
        }

        const order = {
            id: this.nextOrderId++,
            userId: this.currentUser,
            items: JSON.parse(JSON.stringify(this.cartItems)), // Deep copy cart items
            total: this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
            date: new Date().toLocaleString(),
            status: 'Pending' // Initial status
        };

        if (!this.userData[this.currentUser].orders) {
            this.userData[this.currentUser].orders = [];
        }
        this.userData[this.currentUser].orders.push(order);
        this.saveData(); // Save orders after placement
        this.cartItems = []; // Clear cart
        this.updateCartCount();
        this.updateCartDisplay();
        this.hidePopup();
        alert(`Order #${order.id} placed successfully!`);
        console.log('User Orders after placement:', this.userData[this.currentUser].orders);
    },

    // Order History Functions
    openOrderHistory: function() {
        if (!this.isLoggedIn) {
            alert('Please login to view your order history.');
            this.openLogin();
            return;
        }

        const userOrders = this.userData[this.currentUser]?.orders || [];
        let orderHistoryHTML = '<h2>Order History</h2>';

        if (userOrders.length === 0) {
            orderHistoryHTML += '<p style="text-align: center;">No orders yet.</p>';
        } else {
            // Sort orders by date, newest first
            userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

            userOrders.forEach(order => {
                const itemsList = order.items.map(item => `<li>${item.name} x ${item.quantity} (₹${item.price})</li>`).join('');
                orderHistoryHTML += `
                    <div class="order-card">
                        <h3>Order ID: #${order.id}</h3>
                        <p>Date: ${order.date}</p>
                        <p>Total: ₹${order.total}</p>
                        <p>Items:</p>
                        <div class="order-items"><ul>${itemsList}</ul></div>
                        <p>Status: <span class="order-status status-${order.status}">${order.status}</span></p>
                    </div>
                `;
            });
        }

        const fullHTML = `
            <div class="order-history-container">
                <span class="close-btn" onclick="app.hidePopup()">&times;</span>
                ${orderHistoryHTML}
            </div>`;
        this.showPopup(fullHTML);
    },

    // Reviews Functions
    openReviewsPopup: function(itemId) {
        const item = this.menuData.find(m => m.id === itemId);
        if (!item) {
            alert('Item not found.');
            return;
        }

        let reviewsHTML = `<h2>Reviews for ${item.name}</h2>`;
        const avgRating = this.calculateAverageRating(item.reviews);
        const avgRatingDisplay = avgRating > 0 ? `${this.renderStars(avgRating)} (${avgRating})` : 'No ratings yet';

        reviewsHTML += `<div class="average-rating">Average Rating: ${avgRatingDisplay}</div>`;

        reviewsHTML += '<div class="reviews-list">';
        if (item.reviews && item.reviews.length > 0) {
            item.reviews.forEach(review => {
                reviewsHTML += `
                    <div class="review-item">
                        <strong>${review.userId}</strong>
                        <div class="stars">${this.renderStars(review.rating)}</div>
                        <p>${review.review}</p>
                    </div>
                `;
            });
        } else {
            reviewsHTML += '<p style="text-align: center;">No reviews yet for this item.</p>';
        }
        reviewsHTML += '</div>'; // End reviews-list

        // Add review form
        if (this.isLoggedIn) {
            reviewsHTML += `
                <div class="add-review-form">
                    <h3>Add Your Review</h3>
                    <div class="star-rating-input" id="starRatingInput">
                        <span class="star" data-rating="1">★</span>
                        <span class="star" data-rating="2">★</span>
                        <span class="star" data-rating="3">★</span>
                        <span class="star" data-rating="4">★</span>
                        <span class="star" data-rating="5">★</span>
                    </div>
                    <textarea id="reviewText" placeholder="Write your review here..."></textarea>
                    <button onclick="app.submitReview(${item.id})">Submit Review</button>
                </div>
            `;
        } else {
            reviewsHTML += `<p style="text-align: center; margin-top: 1rem;">Please <a href="#" onclick="app.openLogin(); return false;">log in</a> to add a review.</p>`;
        }

        const fullHTML = `
            <div class="reviews-container">
                <span class="close-btn" onclick="app.hidePopup()">&times;</span>
                ${reviewsHTML}
            </div>`;
        this.showPopup(fullHTML);
        this.setupStarRatingListeners(); // Attach event listeners after rendering
    },

    setupStarRatingListeners: function() {
        const stars = document.querySelectorAll('#starRatingInput .star');
        // Reset selected state when opening the form
        stars.forEach(s => s.classList.remove('selected'));
        this.currentReviewRating = 0; // Reset stored rating

        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
                app.currentReviewRating = rating; // Store the selected rating
            });
        });
    },

    submitReview: function(itemId) {
        if (!this.isLoggedIn) {
            alert('You must be logged in to submit a review.');
            return;
        }

        const item = this.menuData.find(m => m.id === itemId);
        const reviewText = document.getElementById('reviewText').value.trim();
        const rating = this.currentReviewRating || 0; // Get the selected rating

        if (rating === 0) {
            alert('Please select a star rating.');
            return;
        }
        if (!reviewText) {
            alert('Please write your review.');
            return;
        }

        if (!item.reviews) {
            item.reviews = [];
        }

        // Check if user already reviewed this item
        const existingReviewIndex = item.reviews.findIndex(r => r.userId === this.currentUser);
        if (existingReviewIndex !== -1) {
            item.reviews[existingReviewIndex] = { userId: this.currentUser, rating: rating, review: reviewText };
            alert('Your review has been updated!');
        } else {
            item.reviews.push({ userId: this.currentUser, rating: rating, review: reviewText });
            alert('Thank you for your review!');
        }
        
        this.saveData(); // Save menu data after review
        this.hidePopup(); // Close the review popup
        this.renderMenu(); // Re-render menu to update average rating display
    }
};

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});