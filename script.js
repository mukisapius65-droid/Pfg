// ===== DEBUG CONSOLE LOG =====
console.log('🚀 PFG Chapati JS Initializing...');

// ===== GLOBAL VARIABLES =====
let cart = JSON.parse(localStorage.getItem('pfgChapatiCart')) || [];
let isCartOpen = false;

// ===== DOM ELEMENTS =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.querySelector('.cart-sidebar');
const closeCartBtn = document.querySelector('.close-cart');
const overlay = document.querySelector('.overlay');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const totalAmount = document.querySelector('.total-amount');
const checkoutBtn = document.querySelector('.checkout-btn');
const loadingSpinner = document.getElementById('loadingSpinner');
const deliveryAddressInput = document.getElementById('deliveryAddress');
const detectLocationBtn = document.getElementById('detectLocationBtn');
const whatsappCartBtn = document.getElementById('whatsappCartBtn');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Fully Loaded - Initializing Features');
    
    initializeMobileMenu();
    initializeCartSystem();
    initializeWhatsAppOrder();
    initializeCheckoutSystem();
    initializeSmoothScrolling();
    initializeImageLoading();
    initializeLocationDetection();
    
    updateCart();
    
    console.log('✅ All Features Initialized');
});

// ===== MOBILE MENU FUNCTIONALITY =====
function initializeMobileMenu() {
    if (!mobileMenuBtn || !navLinks) {
        console.error('❌ Mobile menu elements not found');
        return;
    }
    
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('📱 Mobile menu toggled');
        navLinks.classList.toggle('active');
        this.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
}

// ===== CART SYSTEM =====
function initializeCartSystem() {
    console.log('🛒 Initializing Cart System...');
    
    // Cart Icon Click
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
        console.log('✅ Cart icon event listener added');
    }
    
    // Close Cart Button
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
        console.log('✅ Close cart event listener added');
    }
    
    // Overlay Click
    if (overlay) {
        overlay.addEventListener('click', closeCart);
        console.log('✅ Overlay event listener added');
    }
    
    // Add to Cart Buttons
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach((button, index) => {
            button.addEventListener('click', handleAddToCart);
            console.log(`✅ Add to cart button ${index + 1} initialized`);
        });
    } else {
        console.warn('⚠️ No add-to-cart buttons found');
    }
    
    // Escape key to close cart
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isCartOpen) {
            closeCart();
        }
    });
}

function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🛍️ Add to Cart clicked');
    
    const button = e.currentTarget;
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseInt(button.getAttribute('data-price'));
    const image = button.getAttribute('data-image');
    
    console.log('📦 Product Details:', { id, name, price, image });
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].quantity += 1;
        console.log(`📈 Increased quantity for ${name} to ${cart[existingItemIndex].quantity}`);
    } else {
        // Add new item
        cart.push({
            id,
            name,
            price,
            image,
            quantity: 1
        });
        console.log(`🆕 Added new item: ${name}`);
    }
    
    updateCart();
    openCart();
    showMessage(`✅ ${name} added to cart!`, 'success');
}

function openCart() {
    console.log('📖 Opening cart sidebar');
    
    if (cartSidebar) cartSidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    isCartOpen = true;
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    console.log('📕 Closing cart sidebar');
    
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    isCartOpen = false;
    document.body.style.overflow = '';
}

function updateCart() {
    console.log('🔄 Updating cart display');
    
    if (!cartItemsContainer || !cartCount || !totalAmount) {
        console.error('❌ Cart display elements not found');
        return;
    }
    
    let total = 0;
    let itemCount = 0;
    
    // Clear current items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <p class="empty-cart-subtitle">Add some delicious chapatis! 🥞</p>
            </div>
        `;
    } else {
        cart.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${item.price.toLocaleString()} UGX</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
    }
    
    // Update totals
    totalAmount.textContent = `${total.toLocaleString()} UGX`;
    cartCount.textContent = itemCount;
    
    // Update cart buttons state
    updateCartButtonsState();
    
    // Add event listeners to dynamic elements
    attachCartItemEvents();
    
    // Save to localStorage
    localStorage.setItem('pfgChapatiCart', JSON.stringify(cart));
}

function attachCartItemEvents() {
    // Decrease quantity
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                updateCart();
            }
        });
    });
    
    // Increase quantity
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            
            if (item) {
                item.quantity += 1;
                updateCart();
            }
        });
    });
    
    // Remove item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            cart = cart.filter(item => item.id !== id);
            updateCart();
        });
    });
}

function updateCartButtonsState() {
    const isEmpty = cart.length === 0;
    
    if (checkoutBtn) {
        checkoutBtn.disabled = isEmpty;
        checkoutBtn.style.opacity = isEmpty ? '0.6' : '1';
        checkoutBtn.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
    }
    
    if (whatsappCartBtn) {
        whatsappCartBtn.disabled = isEmpty;
        whatsappCartBtn.style.opacity = isEmpty ? '0.6' : '1';
        whatsappCartBtn.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
    }
}

// ===== WHATSAPP ORDER SYSTEM =====
function initializeWhatsAppOrder() {
    console.log('📱 Initializing WhatsApp Order System...');
    
    // All WhatsApp buttons
    const whatsappButtons = document.querySelectorAll('.whatsapp-float, .whatsapp-hero-btn, .whatsapp-large-btn, #whatsappCartBtn');
    
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // If it's a cart-specific button and cart is empty, show error
            if ((this.classList.contains('whatsapp-float') || this.id === 'whatsappCartBtn') && cart.length === 0) {
                showMessage('🛒 Your cart is empty! Add some items first.', 'error');
                openCart();
                return;
            }
            
            const orderMessage = generateOrderMessage();
            const encodedMessage = encodeURIComponent(orderMessage);
            const whatsappUrl = `https://wa.me/256703055329?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
            showMessage('📱 Opening WhatsApp with your order!', 'success');
        });
    });
}

function generateOrderMessage() {
    const deliveryAddress = deliveryAddressInput ? deliveryAddressInput.value : '📍 Please specify delivery location';
    
    let message = "🥞 *PFG CHAPATI ORDER* 🥞\n\n";
    message += "Hello! I would like to order:\n\n";
    
    if (cart.length > 0) {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            message += `${index + 1}. ${item.name} x${item.quantity} - ${itemTotal.toLocaleString()} UGX\n`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n💰 *Total: ${total.toLocaleString()} UGX*`;
    } else {
        message += "Please help me with the menu and prices.\n";
    }
    
    message += `\n\n📍 *Delivery Location:* ${deliveryAddress}`;
    message += `\n👤 *Customer Name:* ________`;
    message += `\n📞 *Phone Number:* ________`;
    message += `\n💬 *Special Instructions:* ________`;
    message += `\n\n_Thank you! Looking forward to my delicious chapatis!_ 🥞`;
    
    return message;
}

// ===== CHECKOUT SYSTEM =====
function initializeCheckoutSystem() {
    if (!checkoutBtn) {
        console.error('❌ Checkout button not found');
        return;
    }
    
    checkoutBtn.addEventListener('click', handleCheckout);
}

function handleCheckout() {
    if (cart.length === 0) {
        showMessage('🛒 Your cart is empty! Please add some items first.', 'error');
        return;
    }
    
    const deliveryAddress = deliveryAddressInput ? deliveryAddressInput.value.trim() : '';
    
    if (!deliveryAddress) {
        showMessage('📍 Please enter your delivery location!', 'error');
        if (deliveryAddressInput) {
            deliveryAddressInput.focus();
        }
        return;
    }
    
    showLoading();
    
    // Simulate order processing
    setTimeout(() => {
        hideLoading();
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderDetails = cart.map(item => 
            `${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} UGX`
        ).join('\n');
        
        const confirmationMessage = 
            `✅ Order Confirmed!\n\n` +
            `Items:\n${orderDetails}\n\n` +
            `💰 Total: ${total.toLocaleString()} UGX\n` +
            `📍 Delivery: ${deliveryAddress}\n\n` +
            `We will call you shortly to confirm your order!`;
        
        alert(confirmationMessage);
        
        // Clear cart and close sidebar
        cart = [];
        updateCart();
        closeCart();
        
        showMessage('🎉 Order placed successfully! We will call you shortly.', 'success');
    }, 1500);
}

// ===== LOCATION DETECTION =====
function initializeLocationDetection() {
    if (!detectLocationBtn) return;
    
    detectLocationBtn.addEventListener('click', detectUserLocation);
}

function detectUserLocation() {
    if (!navigator.geolocation) {
        showMessage('📍 Location detection not supported by your browser', 'error');
        return;
    }
    
    showMessage('📍 Detecting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            const locationText = `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Near Busega)`;
            
            if (deliveryAddressInput) {
                deliveryAddressInput.value = locationText;
            }
            
            showMessage('✅ Location detected successfully!', 'success');
        },
        function(error) {
            let errorMessage = '📍 Could not detect your location. ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'An unknown error occurred.';
                    break;
            }
            
            showMessage(errorMessage, 'error');
        }
    );
}

// ===== UTILITY FUNCTIONS =====
function showLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.add('active');
    }
}

function hideLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.remove('active');
    }
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    
    // Add styles
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        ${type === 'success' ? 'background-color: #28a745;' : ''}
        ${type === 'error' ? 'background-color: #dc3545;' : ''}
        ${type === 'info' ? 'background-color: #17a2b8;' : ''}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 4000);
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
}

// ===== IMAGE LOADING OPTIMIZATION =====
function initializeImageLoading() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Handle already loaded images
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .empty-cart {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .empty-cart i {
        font-size: 50px;
        margin-bottom: 15px;
        color: #ddd;
    }
    
    .empty-cart-subtitle {
        font-size: 14px;
        margin-top: 5px;
    }
`;
document.head.appendChild(style);

console.log('🎉 PFG Chapati JS Loaded Successfully!');
