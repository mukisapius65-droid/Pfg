// ===== DEBUG CONSOLE LOG =====
console.log('🚀 PFG Chapati JS Initializing...');

// ===== GLOBAL VARIABLES =====
let cart = JSON.parse(localStorage.getItem('pfgChapatiCart')) || [];
let isCartOpen = false;

// ===== DOM ELEMENTS =====
let mobileMenuBtn, navLinks, cartIcon, cartSidebar, closeCartBtn, overlay;
let addToCartButtons, cartItemsContainer, cartCount, totalAmount, checkoutBtn;
let loadingSpinner, deliveryAddressInput, detectLocationBtn, whatsappCartBtn;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Fully Loaded - Initializing Features');
    
    initializeElements();
    initializeMobileMenu();
    initializeCartSystem();
    initializeCustomerInfo();
    initializeWhatsAppOrder();
    initializeCheckoutSystem();
    initializeSmoothScrolling();
    initializeImageLoading();
    initializeLocationDetection();
    
    updateCart();
    
    console.log('✅ All Features Initialized');
});

function initializeElements() {
    console.log('🔍 Initializing DOM elements...');
    
    mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    navLinks = document.querySelector('.nav-links');
    cartIcon = document.querySelector('.cart-icon');
    cartSidebar = document.querySelector('.cart-sidebar');
    closeCartBtn = document.querySelector('.close-cart');
    overlay = document.querySelector('.overlay');
    addToCartButtons = document.querySelectorAll('.add-to-cart');
    cartItemsContainer = document.querySelector('.cart-items');
    cartCount = document.querySelector('.cart-count');
    totalAmount = document.querySelector('.total-amount');
    checkoutBtn = document.querySelector('.checkout-btn');
    loadingSpinner = document.getElementById('loadingSpinner');
    deliveryAddressInput = document.getElementById('deliveryAddress');
    detectLocationBtn = document.getElementById('detectLocationBtn');
    whatsappCartBtn = document.getElementById('whatsappCartBtn');

    console.log('📋 Elements initialized:', {
        mobileMenuBtn: !!mobileMenuBtn,
        navLinks: !!navLinks,
        cartIcon: !!cartIcon,
        cartSidebar: !!cartSidebar,
        closeCartBtn: !!closeCartBtn,
        overlay: !!overlay,
        addToCartButtons: addToCartButtons.length,
        cartItemsContainer: !!cartItemsContainer,
        cartCount: !!cartCount,
        totalAmount: !!totalAmount,
        checkoutBtn: !!checkoutBtn,
        loadingSpinner: !!loadingSpinner,
        deliveryAddressInput: !!deliveryAddressInput,
        detectLocationBtn: !!detectLocationBtn,
        whatsappCartBtn: !!whatsappCartBtn
    });
}

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
    } else {
        console.error('❌ Cart icon not found');
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
    
    // Add to Cart Buttons - FIXED: Use proper event delegation
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach((button, index) => {
            // Remove any existing listeners first
            button.replaceWith(button.cloneNode(true));
        });
        
        // Re-select buttons after clone
        const freshButtons = document.querySelectorAll('.add-to-cart');
        freshButtons.forEach((button, index) => {
            button.addEventListener('click', handleAddToCart);
            console.log(`✅ Add to cart button ${index + 1} initialized`);
            
            // Add mobile touch styles
            button.style.cursor = 'pointer';
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
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
    
    if (!id || !name || isNaN(price)) {
        console.error('❌ Invalid product data');
        showMessage('Error adding item to cart. Please try again.', 'error');
        return;
    }
    
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
            image: image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij5JbWFnZTwvdGV4dD4KPHN2Zz4=',
            quantity: 1
        });
        console.log(`🆕 Added new item: ${name}`);
    }
    
    updateCart();
    openCart();
    showMessage(`✅ ${name} added to cart!`, 'success');
    
    // Add visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

function openCart() {
    console.log('📖 Opening cart sidebar');
    
    if (cartSidebar) cartSidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    isCartOpen = true;
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Cart opened successfully');
}

function closeCart() {
    console.log('📕 Closing cart sidebar');
    
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    isCartOpen = false;
    document.body.style.overflow = '';
    
    console.log('✅ Cart closed successfully');
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

// ===== CUSTOMER INFORMATION MANAGEMENT =====
function initializeCustomerInfo() {
    console.log('👤 Initializing Customer Information System...');
    
    // Load saved customer info
    loadCustomerInfo();
    
    // Auto-save when user types (with debouncing)
    const customerInputs = document.querySelectorAll('.customer-input');
    customerInputs.forEach(input => {
        input.addEventListener('input', debounce(saveCustomerInfo, 1000));
    });
    
    console.log('✅ Customer Information System Initialized');
}

function saveCustomerInfo() {
    const customerData = {
        name: document.getElementById('customerName')?.value || '',
        phone: document.getElementById('customerPhone')?.value || '',
        email: document.getElementById('customerEmail')?.value || '',
        address: document.getElementById('deliveryAddress')?.value || '',
        instructions: document.getElementById('specialInstructions')?.value || ''
    };
    
    try {
        localStorage.setItem('pfgChapatiCustomerInfo', JSON.stringify(customerData));
        console.log('💾 Customer info saved');
    } catch (error) {
        console.error('❌ Failed to save customer info:', error);
    }
}

function loadCustomerInfo() {
    try {
        const savedData = localStorage.getItem('pfgChapatiCustomerInfo');
        if (savedData) {
            const customerData = JSON.parse(savedData);
            
            if (document.getElementById('customerName')) 
                document.getElementById('customerName').value = customerData.name || '';
            if (document.getElementById('customerPhone')) 
                document.getElementById('customerPhone').value = customerData.phone || '';
            if (document.getElementById('customerEmail')) 
                document.getElementById('customerEmail').value = customerData.email || '';
            if (document.getElementById('deliveryAddress')) 
                document.getElementById('deliveryAddress').value = customerData.address || '';
            if (document.getElementById('specialInstructions')) 
                document.getElementById('specialInstructions').value = customerData.instructions || '';
            
            console.log('📥 Customer info loaded from storage');
        }
    } catch (error) {
        console.error('❌ Failed to load customer info:', error);
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
    const customerName = document.getElementById('customerName')?.value || 'Not provided';
    const customerPhone = document.getElementById('customerPhone')?.value || 'Not provided';
    const customerEmail = document.getElementById('customerEmail')?.value || '';
    const deliveryAddress = document.getElementById('deliveryAddress')?.value || 'Not provided';
    const specialInstructions = document.getElementById('specialInstructions')?.value || '';
    
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
    
    message += `\n\n👤 *Customer Information:*`;
    message += `\n📛 Name: ${customerName}`;
    message += `\n📞 Phone: ${customerPhone}`;
    if (customerEmail) {
        message += `\n📧 Email: ${customerEmail}`;
    }
    message += `\n📍 Delivery: ${deliveryAddress}`;
    if (specialInstructions) {
        message += `\n💬 Instructions: ${specialInstructions}`;
    }
    
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
    
    const customerName = document.getElementById('customerName')?.value.trim();
    const customerPhone = document.getElementById('customerPhone')?.value.trim();
    const deliveryAddress = document.getElementById('deliveryAddress')?.value.trim();
    
    if (!customerName) {
        showMessage('❌ Please enter your full name', 'error');
        document.getElementById('customerName')?.focus();
        return;
    }
    
    if (!customerPhone) {
        showMessage('❌ Please enter your phone number', 'error');
        document.getElementById('customerPhone')?.focus();
        return;
    }
    
    if (!deliveryAddress) {
        showMessage('❌ Please enter your delivery address', 'error');
        document.getElementById('deliveryAddress')?.focus();
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
            `👤 Customer: ${customerName}\n` +
            `📞 Phone: ${customerPhone}\n` +
            `📍 Delivery: ${deliveryAddress}\n\n` +
            `We will call you shortly to confirm your order!`;
        
        alert(confirmationMessage);
        
        // Clear cart but keep customer info
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
            
            const locationText = `📍 Detected Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Near Busega, Kampala)`;
            
            if (document.getElementById('deliveryAddress')) {
                document.getElementById('deliveryAddress').value = locationText;
                saveCustomerInfo();
            }
            
            showMessage('✅ Location detected successfully!', 'success');
        },
        function(error) {
            let errorMessage = '📍 Could not detect your location. ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information unavailable. Please enter manually.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out. Please try again.';
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
    
    /* Ensure add to cart buttons are clickable */
    .add-to-cart {
        cursor: pointer !important;
        min-height: 44px !important;
        min-width: 44px !important;
        position: relative !important;
        z-index: 1 !important;
    }
    
    /* Prevent any overlay from blocking buttons */
    .menu-item {
        position: relative;
        z-index: 1;
    }
    
    .menu-item-content {
        position: relative;
        z-index: 2;
    }
`;
document.head.appendChild(style);

console.log('🎉 PFG Chapati JS Loaded Successfully!');
