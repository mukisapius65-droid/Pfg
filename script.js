
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
// ===== MULTI-WHATSAPP NUMBER SYSTEM =====
const whatsappNumbers = [
    '+256703055329', // Original number
    '+256703055329', // New number 1
    '+256703055329', // New number 2
    '+256703055329'  // New number 3
];

let usedNumbers = JSON.parse(localStorage.getItem('pfgChapatiUsedNumbers')) || [];

function getNextWhatsAppNumber() {
    // If all numbers have been used, reset the tracking
    if (usedNumbers.length >= whatsappNumbers.length) {
        usedNumbers = [];
    }
    
    // Find numbers that haven't been used recently
    const availableNumbers = whatsappNumbers.filter(num => !usedNumbers.includes(num));
    
    let nextNumber;
    
    if (availableNumbers.length > 0) {
        // Use a number that hasn't been used recently
        nextNumber = availableNumbers[0];
    } else {
        // If all numbers have been used, pick the least recently used
        nextNumber = whatsappNumbers[0];
        usedNumbers = usedNumbers.filter(num => num !== nextNumber);
    }
    
    // Add to used numbers and save
    usedNumbers.push(nextNumber);
    localStorage.setItem('pfgChapatiUsedNumbers', JSON.stringify(usedNumbers));
    
    console.log('📱 Selected WhatsApp number:', nextNumber);
    console.log('📊 Used numbers history:', usedNumbers);
    
    return nextNumber;
}

function getWhatsAppNumberStats() {
    const stats = {
        totalNumbers: whatsappNumbers.length,
        recentlyUsed: usedNumbers.length,
        available: whatsappNumbers.length - usedNumbers.length,
        nextNumber: getNextWhatsAppNumber(false) // Peek without affecting rotation
    };
    return stats;
}

// ===== ENHANCED WHATSAPP ORDER SYSTEM =====
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
            
            const selectedNumber = getNextWhatsAppNumber();
            const orderMessage = generateOrderMessage();
            const encodedMessage = encodeURIComponent(orderMessage);
            const whatsappUrl = `https://wa.me/${selectedNumber}?text=${encodedMessage}`;
            
            console.log(`📞 Opening WhatsApp for number: ${selectedNumber}`);
            
            // Show which number is being used
            showMessage(`📱 Opening WhatsApp (${getNumberDisplay(selectedNumber)})`, 'info');
            
            window.open(whatsappUrl, '_blank');
            
            // Track the order
            trackEvent('Order', 'WhatsApp Order', `Number: ${selectedNumber}, Items: ${cart.length}`);
        });
    });
    
    console.log('✅ WhatsApp Order System Initialized with', whatsappNumbers.length, 'numbers');
}

function getNumberDisplay(phoneNumber) {
    // Format number for display (last 4 digits)
    const lastFour = phoneNumber.slice(-4);
    return `***${lastFour}`;
}

function showNumberRotationInfo() {
    const stats = getWhatsAppNumberStats();
    console.log('📊 WhatsApp Number Stats:', stats);
}

// ===== ADMIN DASHBOARD (Optional - for debugging) =====
function showAdminPanel() {
    if (confirm('Show WhatsApp number rotation info? (Admin)')) {
        const stats = getWhatsAppNumberStats();
        const message = 
            `📊 WhatsApp Number Rotation\n\n` +
            `Total Numbers: ${stats.totalNumbers}\n` +
            `Recently Used: ${stats.recentlyUsed}\n` +
            `Available: ${stats.available}\n\n` +
            `Numbers:\n${whatsappNumbers.map(num => `• ${getNumberDisplay(num)} ${usedNumbers.includes(num) ? '🟡' : '🟢'}`).join('\n')}`;
        
        alert(message);
    }
}

// Add admin shortcut (Ctrl+Shift+W)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        showAdminPanel();
    }
});
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
    
    message += `\n\n_Ordered via PFG Chapati Website_`;
    message += `\n_Thank you! Looking forward to my delicious chapatis!_ 🥞`;
    
    return message;
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
    
    message += `\n\n_Ordered via PFG Chapati Website_`;
    message += `\n_Thank you! Looking forward to my delicious chapatis!_ 🥞`;
    
    return message;
}
// ===== ENHANCED ADMIN PANEL =====
function showEnhancedAdminPanel() {
    const stats = getWhatsAppNumberStats();
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    const message = 
        `📊 PFG CHAPATI ADMIN PANEL\n` +
        `⏰ ${timeStr}\n\n` +
        `📱 WHATSAPP NUMBERS:\n` +
        `Total: ${stats.totalNumbers} numbers\n` +
        `Active: ${stats.available} available\n` +
        `Used: ${stats.recentlyUsed} recently\n\n` +
        `🔢 NUMBER STATUS:\n${whatsappNumbers.map((num, index) => 
            `${index + 1}. ${getNumberDisplay(num)} ${usedNumbers.includes(num) ? '🔴 Recently Used' : '🟢 Available'}`
        ).join('\n')}\n\n` +
        `🛒 CART STATUS:\n` +
        `Items: ${cart.length}\n` +
        `Total: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} UGX`;
    
    // Create a nice admin panel instead of alert
    const adminDiv = document.createElement('div');
    adminDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        font-family: Arial, sans-serif;
        border: 3px solid var(--primary-color);
    `;
    
    adminDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <h3 style="color: var(--primary-color); margin: 0 0 10px 0;">PFG Chapati Admin</h3>
            <small style="color: #666;">${timeStr}</small>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">📱 WhatsApp Numbers</h4>
            <div style="font-size: 12px; line-height: 1.4;">
                <div>Total: <strong>${stats.totalNumbers}</strong> numbers</div>
                <div>Available: <strong style="color: green;">${stats.available}</strong></div>
                <div>Recently used: <strong style="color: red;">${stats.recentlyUsed}</strong></div>
            </div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">🔢 Number Status</h4>
            <div style="font-size: 11px; line-height: 1.6;">
                ${whatsappNumbers.map((num, index) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>${index + 1}. ${getNumberDisplay(num)}</span>
                        <span style="color: ${usedNumbers.includes(num) ? 'red' : 'green'}; font-weight: bold;">
                            ${usedNumbers.includes(num) ? '🔴 Used' : '🟢 Available'}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div style="text-align: center;">
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Close</button>
            <button onclick="resetNumberRotation()" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-left: 10px;
            ">Reset Rotation</button>
        </div>
    `;
    
    document.body.appendChild(adminDiv);
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    overlay.onclick = () => {
        adminDiv.remove();
        overlay.remove();
    };
    document.body.appendChild(overlay);
}

function resetNumberRotation() {
    usedNumbers = [];
    localStorage.setItem('pfgChapatiUsedNumbers', JSON.stringify(usedNumbers));
    showMessage('🔄 WhatsApp number rotation reset!', 'success');
    setTimeout(() => location.reload(), 1000);
}

// Update the keyboard shortcut
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        showEnhancedAdminPanel();
    }
});
// ===== SERVICE WORKER REGISTRATION =====
function initializeServiceWorker() {
    console.log('🔧 Initializing Service Worker...');
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Service Worker update found!');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🆕 New content is available; please refresh.');
                            showServiceWorkerUpdate();
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('❌ Service Worker registration failed:', error);
            });

        // Listen for controlled page
        navigator.serviceWorker.ready.then((registration) => {
            console.log('🎯 Service Worker is ready to control the page');
        });

        // Handle messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📨 Message from Service Worker:', event.data);
            
            if (event.data.type === 'CACHE_UPDATED') {
                showMessage('🔄 New content available!', 'info');
            }
        });
    } else {
        console.warn('⚠️ Service Workers are not supported');
    }
}

function showServiceWorkerUpdate() {
    const updateDiv = document.createElement('div');
    updateDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #17a2b8;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: bold;
    `;
    
    updateDiv.innerHTML = `
        <span>🆕 New version available!</span>
        <button onclick="window.location.reload()" style="
            background: white;
            color: #17a2b8;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        ">Refresh</button>
    `;
    
    document.body.appendChild(updateDiv);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (updateDiv.parentNode) {
            updateDiv.remove();
        }
    }, 10000);
}

// ===== OFFLINE DETECTION =====
function initializeOfflineDetection() {
    console.log('📡 Initializing Offline Detection...');
    
    // Update UI based on connection status
    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        
        if (isOnline) {
            document.body.classList.remove('offline');
            document.body.classList.add('online');
            console.log('🌐 Online');
        } else {
            document.body.classList.remove('online');
            document.body.classList.add('offline');
            console.log('📴 Offline');
            showOfflineIndicator();
        }
    }
    
    // Create offline indicator
    function showOfflineIndicator() {
        // Remove existing indicator
        const existingIndicator = document.getElementById('offlineIndicator');
        if (existingIndicator) existingIndicator.remove();
        
        const indicator = document.createElement('div');
        indicator.id = 'offlineIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc3545;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            z-index: 10000;
            animation: slideDown 0.3s ease;
        `;
        indicator.innerHTML = `
            <i class="fas fa-wifi"></i>
            You are currently offline. Some features may be limited.
        `;
        
        document.body.appendChild(indicator);
    }
    
    // Listen for connection changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
}

// ===== OFFLINE CART MANAGEMENT =====
function initializeOfflineCart() {
    console.log('🛒 Initializing Offline Cart...');
    
    // Save cart to localStorage with timestamp
    function saveCartToStorage() {
        const cartData = {
            items: cart,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        try {
            localStorage.setItem('pfgChapatiCart', JSON.stringify(cartData));
            
            // If online, also try to sync with server
            if (navigator.onLine) {
                syncCartWithServer();
            }
        } catch (error) {
            console.error('❌ Failed to save cart:', error);
        }
    }
    
    // Load cart from localStorage
    function loadCartFromStorage() {
        try {
            const savedData = localStorage.getItem('pfgChapatiCart');
            if (savedData) {
                const cartData = JSON.parse(savedData);
                cart = cartData.items || [];
                console.log('📥 Cart loaded from storage');
                
                // If cart is old, you might want to handle it differently
                const savedTime = new Date(cartData.timestamp);
                const now = new Date();
                const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff > 24) {
                    console.log('🕒 Cart data is over 24 hours old');
                    // Optionally clear old cart data
                    // cart = [];
                }
            }
        } catch (error) {
            console.error('❌ Failed to load cart:', error);
            cart = [];
        }
    }
    
    // Sync cart with server (when online)
    function syncCartWithServer() {
        if (!navigator.onLine) return;
        
        // Here you would typically send cart data to your backend
        console.log('🔄 Syncing cart with server...');
        
        // Simulate API call
        setTimeout(() => {
            console.log('✅ Cart synced with server');
        }, 1000);
    }
    
    // Override the updateCart function to include offline saving
    const originalUpdateCart = updateCart;
    updateCart = function() {
        originalUpdateCart();
        saveCartToStorage();
    };
    
    // Load cart on startup
    loadCartFromStorage();
}

// ===== BACKGROUND SYNC FOR ORDERS =====
function initializeBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
            // Register for background sync
            registration.sync.register('background-sync')
                .then(() => {
                    console.log('🔄 Background sync registered');
                })
                .catch((error) => {
                    console.log('❌ Background sync registration failed:', error);
                });
        });
    }
}

// ===== UPDATE YOUR DOMCONTENTLOADED FUNCTION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Fully Loaded - Initializing Features');
    
    initializeElements();
    initializeMobileMenu();
    initializeCartSystem();
    initializeEnhancedCartIcon();
    initializeCustomerInfo();
    initializeWhatsAppOrder();
    initializeCheckoutSystem();
    initializeSmoothScrolling();
    initializeImageLoading();
    initializeLocationDetection();
    initializeContactForm();
    initializeCookieConsent();
    initializeBlueIncBranding();
    
    // Add these new initializations
    initializeServiceWorker();
    initializeOfflineDetection();
    initializeOfflineCart();
    initializeBackgroundSync();
    
    updateCart();
    
    console.log('✅ All Features Initialized');
});
// Simple pancake animation - ADD THIS
document.addEventListener('DOMContentLoaded', function() {
    // Find the pancake emoji 🥞 and make it bounce
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (node.nodeValue.includes('🥞')) {
            // Wrap the pancake in a span with animation
            const span = document.createElement('span');
            span.className = 'bouncing-pancake';
            span.innerHTML = '🥞';
            span.style.cssText = 'display: inline-block; animation: pancakeBounce 2s infinite ease-in-out;';
            node.parentNode.replaceChild(span, node);
            break; // Stop after first pancake (your logo)
        }
    }
});
// vendors.js - PFG Chapati Vendor Directory
// ===== VENDOR DATA =====
const vendorsData = [
    {
        id: 1,
        name: "Mama Nalongo Chapati",
        location: "Nakasero Market, Kampala",
        area: "Nakasero",
        latitude: 0.3163,
        longitude: 32.5822,
        price: 500,
        rating: 4.7,
        reviews: 128,
        description: "Freshly made every morning. Special masala option available.",
        tags: ["🔥 Hot Now", "🛵 Delivery"],
        image: "vendor1.jpg",
        services: ["Pickup", "Delivery"],
        hours: "6:00 AM - 9:00 PM",
        specialties: ["Plain Chapati", "Masala Chapati", "Rolex"],
        contact: "+256 700 123 456"
    },
    {
        id: 2,
        name: "Kampala Chapati Hub",
        location: "Kololo, Kampala",
        area: "Kololo",
        latitude: 0.3271,
        longitude: 32.5871,
        price: 600,
        rating: 4.5,
        reviews: 89,
        description: "Family-run stall since 2015. Famous for chapati-rolex combos.",
        tags: ["🏆 Top Rated", "🍛 With Stew"],
        image: "vendor2.jpg",
        services: ["Pickup", "Delivery"],
        hours: "7:00 AM - 10:00 PM",
        specialties: ["Chapati with Beans", "Rolex", "Kikomando"],
        contact: "+256 700 789 012"
    },
    {
        id: 3,
        name: "Fresh Bites Chapati",
        location: "Wandegeya, Kampala",
        area: "Wandegeya",
        latitude: 0.3341,
        longitude: 32.5735,
        price: 450,
        rating: 4.8,
        reviews: 210,
        description: "Student favorite. Open late for night owls.",
        tags: ["🕒 Open Late", "📱 Online Orders"],
        image: "vendor3.jpg",
        services: ["Pickup", "Delivery"],
        hours: "24/7",
        specialties: ["Chapati Plain", "Mandazi", "Tea/Coffee"],
        contact: "+256 700 345 678"
    },
    {
        id: 4,
        name: "Royal Chapati Palace",
        location: "Makerere, Kampala",
        area: "Makerere",
        latitude: 0.3380,
        longitude: 32.5704,
        price: 700,
        rating: 4.9,
        reviews: 156,
        description: "Premium chapati with organic ingredients.",
        tags: ["🌿 Organic", "👑 Premium"],
        image: "vendor4.jpg",
        services: ["Pickup", "Delivery"],
        hours: "8:00 AM - 8:00 PM",
        specialties: ["Organic Chapati", "Whole Wheat", "Special Fillings"],
        contact: "+256 700 901 234"
    },
    {
        id: 5,
        name: "Street Chapati Express",
        location: "Kalerwe Market, Kampala",
        area: "Kalerwe",
        latitude: 0.3478,
        longitude: 32.5856,
        price: 300,
        rating: 4.3,
        reviews: 95,
        description: "Best value for money. Quick street-style chapati.",
        tags: ["💰 Budget", "⚡ Quick"],
        image: "vendor5.jpg",
        services: ["Pickup Only"],
        hours: "5:00 AM - 11:00 PM",
        specialties: ["Street Chapati", "Simple Rolex"],
        contact: "+256 700 567 890"
    },
    {
        id: 6,
        name: "Garden City Chapati💎",
        location: "Garden City Mall, Kampala",
        area: "Garden City",
        latitude: 0.3187,
        longitude: 32.5864,
        price: 800,
        rating: 4.6,
        reviews: 100789,
        description: "Modern chapati spot in shopping mall.",
        tags: ["🏬 Mall", "📦 Takeaway"],
        image: "images/hero.jpg",
        services: ["Pickup", "Delivery"],
        hours: "9:00 AM - 9:00 PM",
        specialties: ["Gourmet Chapati", "Pizza Chapati", "Dessert Chapati"],
        contact: "+256 700 123 789"
    },
    {
        id: 7,
        name: "Acramzy Muwomya Fresh Chapati",
        location: "Kawanda, Kirinnyabigo",
        area: "Kawanda road",
        latitude: 0.3187,
        longitude: 32.5864,
        price: 1000,
        rating: 1.1,
        reviews: 2,
        description: "Locally made chapati but with a different taste, soft & has no effect to those who doesn't like too much cooking oil..",
        tags: ["🌮 rolex", "📦 Takeaway"],
        image: "images/Vendors/vendor7.jpg",
        services: ["Pickup", "Delivery"],
        hours: "9:00 AM - 9:00 PM",
        specialties: ["Plain oiless Chapati", "Local Pizza", "Oily Chapati"],
        contact: "+256 701 697 658"
    },
    {
        id: 8,
        name: "PFG-CHAPATI💎",
        location: "BUSEGA, KITAKA",
        area: "OPPOSITE STABEX GAS STATION",
        latitude: 0.3187,
        longitude: 32.5864,
        price: 1000,
        rating: 4.5,
        reviews: 100000,
        description: "Fresh chapati delivery at your doorstep in just 10 minutes",
        tags: ["👑 VIP", "💯 SAFE"],
        image: "images/Vendors/pfgchapati1.png",
        services: ["Pickup", "Delivery"],
        hours: "9:00am-9:00pm",
        specialties: ["Plain oiless Chapati", "Local Pizza", "Oily Chapati"],
        contact: "+256 703 055 329"
    }
];

// ===== DOM ELEMENTS =====
const vendorSearchInput = document.querySelector('.vendor-search-filter .search-input');
const vendorFilterSelect = document.querySelector('.vendor-search-filter .filter-select');
const vendorSearchBtn = document.querySelector('.vendor-search-filter .search-btn');
const vendorGrid = document.querySelector('.vendor-grid');
const vendorCTA = document.querySelector('.vendor-cta');

// ===== USER LOCATION (for proximity sorting) =====
let userLocation = {
    latitude: null,
    longitude: null,
    address: null
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeVendorDirectory();
    setupVendorEventListeners();
    requestUserLocation();
});

// ===== VENDOR DIRECTORY FUNCTIONS =====
function initializeVendorDirectory() {
    renderVendors(vendorsData);
    updateVendorCount();
}

function renderVendors(vendors) {
    if (!vendorGrid) return;
    
    if (vendors.length === 0) {
        vendorGrid.innerHTML = `
            <div class="no-vendors-found">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                <h3>No vendors found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    vendorGrid.innerHTML = '';
    
    vendors.forEach(vendor => {
        const vendorCard = document.createElement('div');
        vendorCard.className = 'vendor-card';
        vendorCard.setAttribute('data-vendor-id', vendor.id);
        vendorCard.setAttribute('data-area', vendor.area.toLowerCase());
        vendorCard.setAttribute('data-price', vendor.price);
        vendorCard.setAttribute('data-rating', vendor.rating);
        
        // Calculate distance if user location is available
        let distanceInfo = '';
        if (userLocation.latitude && userLocation.longitude) {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                vendor.latitude,
                vendor.longitude
            );
            distanceInfo = `<span class="vendor-distance">📍 ${distance.toFixed(1)} km away</span>`;
        }
        
        vendorCard.innerHTML = `
            <div class="vendor-image">
                <img src="${vendor.image}" alt="${vendor.name}" loading="lazy" 
                     onerror="this.src='https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80'">
                <span class="rating-badge">⭐ ${vendor.rating}</span>
            </div>
            <div class="vendor-info">
                <h3>${vendor.name}</h3>
                <p class="vendor-location">📍 ${vendor.location}</p>
                ${distanceInfo}
                <p class="vendor-price">UGX ${vendor.price.toLocaleString()} ${vendor.price === 600 ? '(with beans)' : 'per chapati'}</p>
                <p class="vendor-desc">${vendor.description}</p>
                <div class="vendor-tags">
                    ${vendor.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="vendor-stats">
                    <span class="review-count"><i class="fas fa-comment"></i> ${vendor.reviews} reviews</span>
                    <span class="vendor-hours"><i class="fas fa-clock"></i> ${vendor.hours}</span>
                </div>
                <button class="view-vendor-btn" data-vendor-id="${vendor.id}">
                    <i class="fas fa-shopping-cart"></i> View Details & Order
                </button>
            </div>
        `;
        
        vendorGrid.appendChild(vendorCard);
    });
    
    // Re-attach event listeners to new buttons
    attachVendorButtonListeners();
}

function updateVendorCount() {
    if (!vendorCTA) return;
    
    const count = vendorsData.length;
    vendorCTA.innerHTML = `
        <p>${count} trusted chapati makers listed. 
        Are you a chapati maker? <a href="#vendor-signup">List your business here</a> — reach more customers!</p>
    `;
}

// ===== SEARCH & FILTER FUNCTIONS =====
function setupVendorEventListeners() {
    // Search functionality
    if (vendorSearchInput) {
        vendorSearchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (vendorSearchBtn) {
        vendorSearchBtn.addEventListener('click', handleSearch);
    }
    
    // Filter functionality
    if (vendorFilterSelect) {
        vendorFilterSelect.addEventListener('change', handleFilter);
    }
    
    // Enter key search
    if (vendorSearchInput) {
        vendorSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

function handleSearch() {
    const searchTerm = vendorSearchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        renderVendors(vendorsData);
        return;
    }
    
    const filteredVendors = vendorsData.filter(vendor => {
        return (
            vendor.name.toLowerCase().includes(searchTerm) ||
            vendor.location.toLowerCase().includes(searchTerm) ||
            vendor.area.toLowerCase().includes(searchTerm) ||
            vendor.description.toLowerCase().includes(searchTerm) ||
            vendor.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            vendor.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm))
        );
    });
    
    renderVendors(filteredVendors);
    showSearchResultsCount(filteredVendors.length, searchTerm);
}

function handleFilter() {
    const filterValue = vendorFilterSelect.value;
    let sortedVendors = [...vendorsData];
    
    switch(filterValue) {
        case 'price_low':
            sortedVendors.sort((a, b) => a.price - b.price);
            break;
        case 'price_high':
            sortedVendors.sort((a, b) => b.price - a.price);
            break;
        case 'nearest':
            if (userLocation.latitude && userLocation.longitude) {
                sortedVendors.sort((a, b) => {
                    const distanceA = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        a.latitude,
                        a.longitude
                    );
                    const distanceB = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        b.latitude,
                        b.longitude
                    );
                    return distanceA - distanceB;
                });
            } else {
                showNotification('Enable location to sort by distance', 'info');
                return;
            }
            break;
        case 'rating_high':
        default:
            sortedVendors.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    renderVendors(sortedVendors);
}

function showSearchResultsCount(count, searchTerm) {
    if (count === 0) {
        showNotification(`No vendors found for "${searchTerm}"`, 'info');
    } else if (searchTerm !== '') {
        showNotification(`Found ${count} vendor${count === 1 ? '' : 's'} for "${searchTerm}"`, 'success');
    }
}

// ===== VENDOR DETAILS & ORDERING =====
function attachVendorButtonListeners() {
    document.querySelectorAll('.view-vendor-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const vendorId = parseInt(button.getAttribute('data-vendor-id'));
            const vendor = vendorsData.find(v => v.id === vendorId);
            
            if (vendor) {
                openVendorModal(vendor);
            }
        });
    });
    
    // Make entire vendor card clickable
    document.querySelectorAll('.vendor-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('view-vendor-btn') && 
                !e.target.closest('.view-vendor-btn')) {
                const vendorId = parseInt(card.getAttribute('data-vendor-id'));
                const vendor = vendorsData.find(v => v.id === vendorId);
                
                if (vendor) {
                    openVendorModal(vendor);
                }
            }
        });
    });
}

function openVendorModal(vendor) {
    // Create modal HTML
    const modalHTML = `
        <div class="vendor-modal-overlay">
            <div class="vendor-modal">
                <button class="close-vendor-modal">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="vendor-modal-header">
                    <div class="vendor-modal-image">
                        <img src="${vendor.image}" alt="${vendor.name}">
                        <span class="modal-rating-badge">⭐ ${vendor.rating} (${vendor.reviews} reviews)</span>
                    </div>
                    <div class="vendor-modal-title">
                        <h2>${vendor.name}</h2>
                        <p class="modal-location">📍 ${vendor.location}</p>
                        <p class="modal-price">UGX ${vendor.price.toLocaleString()} per chapati</p>
                    </div>
                </div>
                
                <div class="vendor-modal-content">
                    <div class="modal-section">
                        <h3><i class="fas fa-info-circle"></i> About</h3>
                        <p>${vendor.description}</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-tags"></i> Specialties</h3>
                        <div class="specialties-tags">
                            ${vendor.specialties.map(specialty => 
                                `<span class="specialty-tag">${specialty}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-clock"></i> Hours</h3>
                        <p>${vendor.hours}</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-phone"></i> Contact</h3>
                        <p>${vendor.contact}</p>
                    </div>
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-concierge-bell"></i> Services</h3>
                        <div class="services-list">
                            ${vendor.services.map(service => 
                                `<span class="service-badge ${service === 'Delivery' ? 'delivery-badge' : ''}">${service}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="vendor-modal-footer">
                    <button class="whatsapp-order-vendor" 
                            onclick="window.open('https://wa.me/${vendor.contact.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(vendor.name)}!%20I%20would%20like%20to%20order%20chapati', '_blank')">
                        <i class="fab fa-whatsapp"></i> Order via WhatsApp
                    </button>
                    <button class="call-vendor" 
                            onclick="window.location.href='tel:${vendor.contact}'">
                        <i class="fas fa-phone"></i> Call Vendor
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Add modal styling
    addModalStyles();
    
    // Add event listeners
    const closeBtn = document.querySelector('.close-vendor-modal');
    const overlay = document.querySelector('.vendor-modal-overlay');
    
    closeBtn.addEventListener('click', closeVendorModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeVendorModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVendorModal();
        }
    });
}

function closeVendorModal() {
    const modal = document.querySelector('.vendor-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function addModalStyles() {
    if (!document.querySelector('#vendor-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'vendor-modal-styles';
        style.textContent = `
            .vendor-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
                padding: 20px;
            }
            
            .vendor-modal {
                background: white;
                border-radius: 20px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .close-vendor-modal {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--gray);
                cursor: pointer;
                z-index: 10;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .close-vendor-modal:hover {
                background: var(--gray-light);
                color: var(--danger);
            }
            
            .vendor-modal-header {
                padding: 30px 30px 20px;
                border-bottom: 2px solid var(--gray-light);
            }
            
            .vendor-modal-image {
                position: relative;
                width: 100%;
                height: 200px;
                border-radius: 15px;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .vendor-modal-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .modal-rating-badge {
                position: absolute;
                bottom: 15px;
                right: 15px;
                background: rgba(255,255,255,0.95);
                padding: 8px 15px;
                border-radius: 25px;
                font-weight: 700;
                color: var(--dark);
                backdrop-filter: blur(5px);
            }
            
            .vendor-modal-title h2 {
                font-size: 1.8rem;
                color: var(--primary);
                margin-bottom: 10px;
            }
            
            .modal-location {
                color: var(--gray);
                margin-bottom: 5px;
            }
            
            .modal-price {
                color: var(--secondary);
                font-size: 1.3rem;
                font-weight: 700;
            }
            
            .vendor-modal-content {
                padding: 20px 30px;
            }
            
            .modal-section {
                margin-bottom: 25px;
            }
            
            .modal-section h3 {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--dark);
                margin-bottom: 10px;
                font-size: 1.2rem;
            }
            
            .specialties-tags, .services-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            
            .specialty-tag {
                background: var(--gray-light);
                color: var(--gray-dark);
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
            }
            
            .service-badge {
                background: var(--primary);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
            }
            
            .delivery-badge {
                background: var(--secondary);
            }
            
            .vendor-modal-footer {
                padding: 20px 30px;
                border-top: 2px solid var(--gray-light);
                display: flex;
                gap: 15px;
            }
            
            .vendor-modal-footer button {
                flex: 1;
                padding: 15px;
                border: none;
                border-radius: 10px;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .whatsapp-order-vendor {
                background: #25D366;
                color: white;
            }
            
            .whatsapp-order-vendor:hover {
                background: #128C7E;
            }
            
            .call-vendor {
                background: var(--primary);
                color: white;
            }
            
            .call-vendor:hover {
                background: var(--primary-dark);
            }
            
            @media (max-width: 768px) {
                .vendor-modal {
                    max-width: 95%;
                }
                
                .vendor-modal-footer {
                    flex-direction: column;
                }
                
                .vendor-modal-header {
                    padding: 20px 20px 15px;
                }
                
                .vendor-modal-content {
                    padding: 15px 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== LOCATION FUNCTIONS =====
function requestUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation.latitude = position.coords.latitude;
                userLocation.longitude = position.coords.longitude;
                console.log('User location detected:', userLocation);
                
                // Reverse geocode to get address
                getAddressFromCoordinates(
                    userLocation.latitude,
                    userLocation.longitude
                );
            },
            (error) => {
                console.log('Location permission denied or error:', error);
                // Fallback to Kampala center coordinates
                userLocation.latitude = 0.3163;
                userLocation.longitude = 32.5822;
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
}

function getAddressFromCoordinates(lat, lng) {
    // Using Nominatim (OpenStreetMap) for reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                userLocation.address = data.display_name;
                console.log('User address:', userLocation.address);
            }
        })
        .catch(error => console.log('Reverse geocoding error:', error));
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula to calculate distance in kilometers
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ===== UTILITY FUNCTIONS =====
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

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.vendor-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `vendor-notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .vendor-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                color: var(--dark);
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 2000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                border-left: 5px solid var(--primary);
            }
            
            .vendor-notification.success {
                border-left-color: var(--success);
            }
            
            .vendor-notification.info {
                border-left-color: var(--primary);
            }
            
            .vendor-notification.warning {
                border-left-color: var(--warning);
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .close-notification {
                background: none;
                border: none;
                color: var(--gray);
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }
            
            .close-notification:hover {
                background: var(--gray-light);
                color: var(--dark);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ===== VENDOR STATS & ANALYTICS =====
function trackVendorInteraction(vendorId, action) {
    // This would typically send data to your analytics platform
    console.log(`Vendor ${vendorId} - ${action}`);
    
    // Store in localStorage for basic analytics
    const interactions = JSON.parse(localStorage.getItem('vendorInteractions')) || [];
    interactions.push({
        vendorId,
        action,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('vendorInteractions', JSON.stringify(interactions));
}

// ===== INITIALIZE ON PAGE LOAD =====
// Check if we're on the vendors page
if (window.location.hash === '#vendors' || document.querySelector('.vendor-directory')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay to ensure all elements are loaded
        setTimeout(() => {
            // Highlight active filter if present in URL
            const urlParams = new URLSearchParams(window.location.search);
            const filter = urlParams.get('filter');
            if (filter && vendorFilterSelect) {
                vendorFilterSelect.value = filter;
                handleFilter();
            }
            
            const search = urlParams.get('search');
            if (search && vendorSearchInput) {
                vendorSearchInput.value = search;
                handleSearch();
            }
        }, 100);
    });
}

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.VendorDirectory = {
    searchVendors: handleSearch,
    filterVendors: handleFilter,
    openVendorModal: openVendorModal,
    getUserLocation: () => userLocation
};
