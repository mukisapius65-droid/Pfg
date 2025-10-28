// ===== DEBUG CONSOLE LOG =====
console.log('🚀 PFG Chapati JS Initializing...');

// ===== GLOBAL VARIABLES =====
let cart = [];
let isCartOpen = false;

// ===== DOM ELEMENTS =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.querySelector('.cart-sidebar');
const closeCart = document.querySelector('.close-cart');
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

// ===== DEBUG: CHECK ELEMENT EXISTENCE =====
console.log('🔍 Element Check:', {
    mobileMenuBtn: !!mobileMenuBtn,
    navLinks: !!navLinks,
    cartIcon: !!cartIcon,
    cartSidebar: !!cartSidebar,
    closeCart: !!closeCart,
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
    
    // Load cart from localStorage if available
    loadCartFromStorage();
    
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
    
    // Check if required elements exist
    if (!cartIcon || !cartSidebar || !closeCart || !overlay) {
        console.error('❌ Critical cart elements missing');
        return;
    }
    
    // Cart Icon Click
    cartIcon.addEventListener('click', openCart);
    console.log('✅ Cart icon event listener added');
    
    // Close Cart Button
    closeCart.addEventListener('click', closeCart);
    console.log('✅ Close cart event listener added');
    
    // Overlay Click
    overlay.addEventListener('click', closeCart);
    console.log('✅ Overlay event listener added');
    
    // Add to Cart Buttons
    if (addToCartButtons.length === 0) {
        console.warn('⚠️ No add-to-cart buttons found');
    } else {
        addToCartButtons.forEach((button, index) => {
            button.addEventListener('click', handleAddToCart);
            console.log(`✅ Add to cart button ${index + 1} initialized`);
        });
    }
    
    // Escape key to close cart
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isCartOpen) {
            closeCart();
        }
    });
    
    console.log('✅ Cart System Initialized');
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
    
    // Validate data
    if (!id || !name || !price || !image) {
        console.error('❌ Missing product data');
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
            image,
            quantity: 1
        });
        console.log(`🆕 Added new item: ${name}`);
    }
    
    updateCart();
    openCart();
    showMessage(`✅ ${name} added to cart!`, 'success');
    
    // Track analytics
    trackEvent('Products', 'Add to Cart', name);
}

function openCart() {
    console.log('📖 Opening cart sidebar');
    
    if (!cartSidebar || !overlay) {
        console.error('❌ Cart sidebar or overlay not found');
        return;
    }
    
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    isCartOpen = true;
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Cart opened successfully');
}

function closeCart() {
    console.log('📕 Closing cart sidebar');
    
    if (!cartSidebar || !overlay) {
        console.error('❌ Cart sidebar or overlay not found');
        return;
    }
    
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
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
        console.log('🛒 Cart is empty');
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij5JbWFnZTwvdGV4dD4KPHN2Zz4='">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${item.price.toLocaleString()} UGX</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}" title="Decrease quantity">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}" title="Increase quantity">+</button>
                        <button class="remove-item" data-id="${item.id}" title="Remove item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        console.log(`📊 Cart updated: ${cart.length} items, ${itemCount} total quantity`);
    }
    
    // Update totals
    totalAmount.textContent = `${total.toLocaleString()} UGX`;
    cartCount.textContent = itemCount;
    
    // Update cart buttons state
    updateCartButtonsState();
    
    // Add event listeners to dynamic elements
    attachCartItemEvents();
    
    // Save to localStorage
    saveCartToStorage();
}

function attachCartItemEvents() {
    // Decrease quantity
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                console.log(`📉 Decreased ${item.name} quantity to ${item.quantity}`);
                updateCart();
                showMessage(`📉 Decreased ${item.name} quantity`, 'info');
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
                console.log(`📈 Increased ${item.name} quantity to ${item.quantity}`);
                updateCart();
                showMessage(`📈 Increased ${item.name} quantity`, 'info');
            }
        });
    });
    
    // Remove item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const itemIndex = cart.findIndex(item => item.id === id);
            
            if (itemIndex > -1) {
                const removedItem = cart[itemIndex];
                cart.splice(itemIndex, 1);
                console.log(`🗑️ Removed ${removedItem.name} from cart`);
                updateCart();
                showMessage(`🗑️ ${removedItem.name} removed from cart`, 'info');
            }
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
    
    // Floating WhatsApp button
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', handleWhatsAppOrder);
        console.log('✅ Floating WhatsApp button initialized');
    }
    
    // Hero WhatsApp button
    const whatsappHeroBtn = document.querySelector('.whatsapp-hero-btn');
    if (whatsappHeroBtn) {
        whatsappHeroBtn.addEventListener('click', handleWhatsAppOrder);
        console.log('✅ Hero WhatsApp button initialized');
    }
    
    // Large CTA WhatsApp button
    const whatsappLargeBtn = document.querySelector('.whatsapp-large-btn');
    if (whatsappLargeBtn) {
        whatsappLargeBtn.addEventListener('click', handleWhatsAppOrder);
        console.log('✅ Large CTA WhatsApp button initialized');
    }
    
    // Cart WhatsApp button
    if (whatsappCartBtn) {
        whatsappCartBtn.addEventListener('click', handleWhatsAppOrder);
        console.log('✅ Cart WhatsApp button initialized');
    }
    
    console.log('✅ WhatsApp Order System Initialized');
}

function handleWhatsAppOrder(e) {
    e.preventDefault();
    
    console.log('📞 WhatsApp Order initiated');
    
    // If cart is empty and it's a cart-specific button, show error
    if ((e.target.closest('.whatsapp-float') || e.target.closest('#whatsappCartBtn')) && cart.length === 0) {
        showMessage('🛒 Your cart is empty! Add some items first.', 'error');
        openCart();
        return;
    }
    
    const orderMessage = generateOrderMessage();
    const encodedMessage = encodeURIComponent(orderMessage);
    const whatsappUrl = `https://wa.me/256703055329?text=${encodedMessage}`;
    
    console.log('🔗 Opening WhatsApp URL');
    window.open(whatsappUrl, '_blank');
    
    // Track the order
    trackEvent('Order', 'WhatsApp Order', `Items: ${cart.length}`);
    
    // Show success message
    showMessage('📱 Opening WhatsApp with your order!', 'success');
    
    // Close cart on mobile after ordering
    if (window.innerWidth <= 768) {
        setTimeout(closeCart, 1000);
    }
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
    
    console.log('📝 Generated order message');
    return message;
}

// ===== CHECKOUT SYSTEM =====
function initializeCheckoutSystem() {
    console.log('💳 Initializing Checkout System...');
    
    if (!checkoutBtn) {
        console.error('❌ Checkout button not found');
        return;
    }
    
    checkoutBtn.addEventListener('click', handleCheckout);
    console.log('✅ Checkout button initialized');
}

function handleCheckout() {
    console.log('🛒 Checkout process started');
    
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
        
        // Track the order
        trackEvent('Order', 'Checkout', `Items: ${cart.length}, Total: ${total}`);
        
        console.log('✅ Checkout completed successfully');
    }, 2000);
}

// ===== LOCATION DETECTION =====
function initializeLocationDetection() {
    if (!detectLocationBtn) {
        console.warn('⚠️ Location detection button not found');
        return;
    }
    
    detectLocationBtn.addEventListener('click', detectUserLocation);
    console.log('✅ Location detection initialized');
}

function detectUserLocation() {
    console.log('📍 Detecting user location...');
    
    if (!navigator.geolocation) {
        showMessage('📍 Location detection not supported by your browser', 'error');
        return;
    }
    
    showMessage('📍 Detecting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            // Reverse geocoding would go here - for now, just show coordinates
            const locationText = `📍 Detected Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            
            if (deliveryAddressInput) {
                deliveryAddressInput.value = locationText;
            }
            
            showMessage('✅ Location detected successfully!', 'success');
            console.log('📍 Location detected:', { latitude, longitude });
        },
        function(error) {
            console.error('❌ Location detection failed:', error);
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
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// ===== UTILITY FUNCTIONS =====
function showLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.add('active');
        console.log('⏳ Loading spinner shown');
    }
}

function hideLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.remove('active');
        console.log('✅ Loading spinner hidden');
    }
}

function showMessage(message, type = 'info') {
    console.log(`💬 ${type.toUpperCase()}: ${message}`);
    
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
        ${type === 'warning' ? 'background-color: #ffc107; color: #000;' : ''}
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
                
                console.log(`🎯 Scrolled to: ${targetId}`);
                
                // Close mobile menu if open
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
    
    console.log('✅ Smooth scrolling initialized');
}

// ===== IMAGE LOADING OPTIMIZATION =====
function initializeImageLoading() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Set initial opacity for fade-in effect
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Handle already loaded images
        if (img.complete) {
            img.style.opacity = '1';
        }
        
        // Handle image errors
        img.addEventListener('error', function() {
            console.warn(`⚠️ Image failed to load: ${this.src}`);
            this.style.opacity = '1';
        });
    });
    
    console.log(`✅ Image loading optimized for ${images.length} images`);
}

// ===== LOCAL STORAGE FUNCTIONS =====
function saveCartToStorage() {
    try {
        localStorage.setItem('pfgChapatiCart', JSON.stringify(cart));
        console.log('💾 Cart saved to localStorage');
    } catch (error) {
        console.error('❌ Failed to save cart to localStorage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('pfgChapatiCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCart();
            console.log('📥 Cart loaded from localStorage:', cart.length, 'items');
        }
    } catch (error) {
        console.error('❌ Failed to load cart from localStorage:', error);
        cart = []; // Reset cart on error
    }
}

// ===== ANALYTICS TRACKING =====
function trackEvent(category, action, label) {
    console.log(`📊 Analytics: ${category} - ${action} - ${label}`);
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', action, {
            content_category: category,
            content_name: label
        });
    }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce function for resize events
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

// Handle window resize
window.addEventListener('resize', debounce(function() {
    console.log('🔄 Window resized:', window.innerWidth, 'x', window.innerHeight);
    
    // Close cart on mobile when resizing to desktop
    if (window.innerWidth > 768 && isCartOpen) {
        closeCart();
    }
}, 250));

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('🚨 Global Error:', e.error);
    showMessage('Something went wrong. Please refresh the page.', 'error');
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('🔧 ServiceWorker registered:', registration);
            })
            .catch(function(error) {
                console.log('❌ ServiceWorker registration failed:', error);
            });
    });
}

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cart,
        updateCart,
        showMessage,
        trackEvent
    };
}

console.log('🎉 PFG Chapati JS Successfully Loaded!');
