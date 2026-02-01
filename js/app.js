// js/app.js - STARTER TEMPLATE
console.log('PFG Chapati app.js loaded');

// Global variables
let cart = JSON.parse(localStorage.getItem('pfgCart')) || [];
let userBeans = 0;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Setup event listeners
    setupEventListeners();
    
    // Load saved data
    loadSavedData();
    
    // Initialize UI
    updateCartDisplay();
    updateBeansDisplay();
});

function setupEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const item = {
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image
            };
            addToCart(item);
        });
    });
    
    // Cart toggle
    document.querySelector('.cart-toggle').addEventListener('click', toggleCart);
    
    // Checkout button
    document.querySelector('.checkout-btn').addEventListener('click', processCheckout);
}

function addToCart(item) {
    cart.push(item);
    saveCart();
    updateCartDisplay();
    showNotification(`${item.name} added to cart!`);
}

function saveCart() {
    localStorage.setItem('pfgCart', JSON.stringify(cart));
}

function updateCartDisplay() {
    // Update cart UI
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) cartCount.textContent = cart.length;
}

function showNotification(message) {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// More functions as needed...
