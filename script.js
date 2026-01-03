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
// Maker response templates
const makerTemplates = {
    'order-confirmed': `✅ ORDER CONFIRMED ✅

Order ID: #{orderId}
Customer: {customerName}
Items: {orderItems}
Total: UGX {amount}
ETA: {eta} minutes
Status: Preparing

We'll notify you when it's out for delivery!`,

    'on-the-way': `🚗 ORDER ON THE WAY!

Your order #{orderId} is with our delivery rider {riderName}.

Rider Phone: {riderPhone}
ETA: {eta} minutes
Live Tracking: {trackingLink}

Please have payment ready.`,

    'delay-notice': `⚠️ DELAY NOTICE

Order #{orderId} is slightly delayed due to {reason}.

New ETA: {newEta} minutes
We apologize for the inconvenience.

We'll keep you updated!`
};
// WhatsApp Template System
const whatsappTemplates = {
    'new-order': `Hello PFG Chapati! I want to order:

🍽️ Order Details:
- Plain Chapati: 2 pieces
- Butter Chapati: 1 piece  
- Egg Chapati: 1 piece

📍 Delivery Address: [Your Address Here]
📱 Phone: [Your Number]
💰 Payment Method: Cash on Delivery

Please confirm availability and total price.`,

    'track-order': `Hello PFG Chapati! 

I'd like to check the status of my order.

📦 Order ID: [Your Order Number]
📱 My Number: [Your Phone Number]

Please let me know:
1. Current status of my order
2. Estimated delivery time
3. Which maker is preparing it

Thank you!`,

    'urgent-order': `URGENT ORDER NEEDED!

⚡ NEED CHAPATIS ASAP!

I need:
- [Number] chapatis
- Type: [Plain/Butter/Egg]
- For: [Number] people

📍 I'm at: [Your Location]
📱 Call me: [Your Number]

Can you deliver within 10 minutes? Price is not an issue!`,

    'address-change': `Hello! I need to update my delivery address.

Old Address: [Previous Address]
New Address: [New Full Address]

Order ID: [If applicable]
My Number: [Your Phone Number]

Please confirm you can deliver to the new location.`,

    'special-request': `Hello! I have a special request for my order:

Order: [Chapati Type & Quantity]
Special Request: 
- Extra crispy
- Less oil
- More filling
- [Your specific request]

Please let me know if this is possible and any extra charges.

Thank you!`,

    'become-maker': `Hello PFG Chapati Team!

I'm interested in joining as a chapati maker on your platform.

👨🍳 About Me:
- Location: [Your Area, Kampala]
- Experience: [Years making chapatis]
- Capacity: [Chapatis per hour]
- Specialty: [Plain/Butter/Egg/Special]

Please send me more details about:
1. Registration process
2. Commission rates  
3. Equipment needed
4. Training/support

Looking forward to partnering with you!`
};

// Current selected template
let currentTemplate = null;

// Copy template to clipboard
function copyTemplate(templateId) {
    const template = whatsappTemplates[templateId];
    if (!template) return;
    
    // Copy to clipboard
    navigator.clipboard.writeText(template).then(() => {
        // Update button state
        const button = document.querySelector(`[data-template="${templateId}"] .copy-btn`);
        const originalText = button.textContent;
        
        button.textContent = '✅ Copied!';
        button.classList.add('copied');
        
        // Update direct WhatsApp link
        updateWhatsAppLink(templateId, template);
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
        
        // Show success message
        showNotification('Template copied to clipboard! Paste in WhatsApp.');
        
    }).catch(err => {
        console.error('Copy failed:', err);
        showNotification('Failed to copy. Please select and copy manually.');
    });
}

// Update WhatsApp direct link
function updateWhatsAppLink(templateId, template) {
    currentTemplate = templateId;
    
    // Encode template for URL
    const encodedTemplate = encodeURIComponent(template);
    const whatsappLink = document.getElementById('whatsappLink');
    
    // Update href
    whatsappLink.href = `https://wa.me/256703055329?text=${encodedTemplate}`;
    
    // Highlight selected card
    document.querySelectorAll('.template-card').forEach(card => {
        card.style.background = card.dataset.template === templateId ? '#e8f5e9' : '#f8f9fa';
        card.style.borderLeftColor = card.dataset.template === templateId ? '#25D366' : '#25D366';
    });
}

// Show notification
function showNotification(message) {
    // Remove existing notification
    const existing = document.getElementById('template-notification');
    if (existing) existing.remove();
    
    // Create new notification
    const notification = document.createElement('div');
    notification.id = 'template-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        ">
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Auto-fill templates with order details
function populateTemplateWithOrder(templateId, orderData) {
    let template = whatsappTemplates[templateId];
    
    if (orderData) {
        // Replace placeholders with actual data
        template = template
            .replace('[Your Address Here]', orderData.address || '')
            .replace('[Your Number]', orderData.phone || '')
            .replace('[Your Order Number]', orderData.orderId || '')
            .replace('[Your Location]', orderData.location || '')
            .replace('[Chapati Type & Quantity]', orderData.items || '');
    }
    
    return template;
}

// Auto-detect order from page
function getCurrentOrderData() {
    try {
        // Try to get data from cart/order form
        const items = Array.from(document.querySelectorAll('.cart-item'))
            .map(item => item.textContent.trim())
            .join(', ');
            
        const address = document.getElementById('deliveryAddress')?.value || '';
        const phone = document.getElementById('customerPhone')?.value || '';
        
        return {
            items: items || 'Mixed Chapati Order',
            address: address,
            phone: phone,
            orderId: 'PFG-' + Date.now().toString().slice(-6),
            location: localStorage.getItem('userLocation') || ''
        };
    } catch (e) {
        return null;
    }
}

// Initialize with current order data
document.addEventListener('DOMContentLoaded', function() {
    const orderData = getCurrentOrderData();
    
    if (orderData) {
        // Update all templates with order data
        Object.keys(whatsappTemplates).forEach(templateId => {
            whatsappTemplates[templateId] = populateTemplateWithOrder(templateId, orderData);
        });
        
        // Auto-select "new-order" template if we have order data
        setTimeout(() => {
            const firstTemplate = document.querySelector('.template-card');
            if (firstTemplate) {
                const templateId = firstTemplate.dataset.template;
                updateWhatsAppLink(templateId, whatsappTemplates[templateId]);
            }
        }, 500);
    }
});
