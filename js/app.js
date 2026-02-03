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
// Update your existing cart.js or add to app.js
class CartSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('pfgCart')) || [];
        this.init();
    }
    
    init() {
        this.updateCartDisplay();
        this.setupCartListeners();
    }
    
    setupCartListeners() {
        // Cart toggle
        document.getElementById('cartToggle').addEventListener('click', () => {
            document.querySelector('.cart-sidebar').classList.add('active');
        });
        
        // Close cart
        document.querySelector('.close-cart').addEventListener('click', () => {
            document.querySelector('.cart-sidebar').classList.remove('active');
        });
        
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || 
                e.target.closest('.add-to-cart')) {
                const button = e.target.classList.contains('add-to-cart') ? 
                    e.target : e.target.closest('.add-to-cart');
                
                const item = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    price: parseFloat(button.dataset.price),
                    image: button.dataset.image,
                    quantity: 1
                };
                
                this.addToCart(item);
            }
        });
    }
    
    addToCart(item) {
        const existingItem = this.cart.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(item);
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showAddedNotification(item.name);
    }
    
    saveCart() {
        localStorage.setItem('pfgCart', JSON.stringify(this.cart));
        this.triggerCartUpdated();
    }
    
    triggerCartUpdated() {
        const event = new CustomEvent('cartUpdated', {
            detail: { cart: this.cart }
        });
        document.dispatchEvent(event);
    }
    
    updateCartDisplay() {
        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = totalItems;
        
        // Update cart items display
        this.renderCartItems();
        
        // Update order summary
        this.updateOrderSummary();
    }
    
    renderCartItems() {
        const container = document.getElementById('cartItems');
        
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="#menu" class="btn-primary">Browse Menu</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} UGX</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn increase">+</button>
                        </div>
                        <button class="remove-item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to quantity buttons
        this.addQuantityListeners();
    }
    
    updateOrderSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal > 10000 ? 0 : 2000;
        const total = subtotal + deliveryFee;
        
        // Update display
        document.getElementById('cartSubtotal').textContent = `${subtotal.toLocaleString()} UGX`;
        document.getElementById('cartDelivery').textContent = 
            deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} UGX`;
        document.getElementById('cartTotal').textContent = `${total.toLocaleString()} UGX`;
        
        // Update free delivery notice
        const notice = document.getElementById('freeDeliveryNotice');
        if (subtotal < 10000) {
            const amountNeeded = 10000 - subtotal;
            notice.innerHTML = `
                <i class="fas fa-truck"></i>
                <span>Add <strong>${amountNeeded.toLocaleString()}</strong> UGX more for FREE delivery!</span>
            `;
            notice.classList.remove('free');
        } else {
            notice.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>You qualify for FREE delivery! 🎉</span>
            `;
            notice.classList.add('free');
        }
    }
    
    addQuantityListeners() {
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemElement = e.target.closest('.cart-item');
                const itemId = itemElement.dataset.id;
                const item = this.cart.find(i => i.id === itemId);
                
                if (e.target.classList.contains('increase')) {
                    item.quantity += 1;
                } else if (e.target.classList.contains('decrease')) {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                    } else {
                        // Remove item if quantity becomes 0
                        this.cart = this.cart.filter(i => i.id !== itemId);
                    }
                }
                
                this.saveCart();
                this.updateCartDisplay();
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.cart-item').dataset.id;
                this.cart = this.cart.filter(i => i.id !== itemId);
                this.saveCart();
                this.updateCartDisplay();
            });
        });
    }
    
    showAddedNotification(itemName) {
        const notification = document.createElement('div');
        notification.className = 'item-added-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${itemName} added to cart!</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }
}

// Initialize cart system
let cartSystem;

document.addEventListener('DOMContentLoaded', () => {
    cartSystem = new CartSystem();
    window.CartSystem = cartSystem;
});
