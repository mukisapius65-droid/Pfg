// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Cart Functionality
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

let cart = [];

// Show loading spinner
function showLoading() {
    loadingSpinner.classList.add('active');
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.classList.remove('active');
}

// Open Cart
cartIcon.addEventListener('click', () => {
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
});

// Close Cart
closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
});

// Close Cart when clicking on overlay
overlay.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
});

// Add to Cart
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'));
        const image = button.getAttribute('data-image');
        
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                image,
                quantity: 1
            });
        }
        
        updateCart();
        
        // Show cart sidebar when adding an item
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
        
        // Show success message
        showMessage(`${name} added to cart!`, 'success');
    });
});

// Update Cart
function updateCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Your cart is empty</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${item.price.toLocaleString()} UGX</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
    }
    
    totalAmount.textContent = `${total.toLocaleString()} UGX`;
    cartCount.textContent = count;
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(item => item.id !== id);
            }
            
            updateCart();
        });
    });
    
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            item.quantity += 1;
            updateCart();
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            cart = cart.filter(item => item.id !== id);
            updateCart();
            showMessage(`${item.name} removed from cart`, 'info');
        });
    });
}

// Show message function
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background-color: #28a745;' : ''}
        ${type === 'error' ? 'background-color: #dc3545;' : ''}
        ${type === 'info' ? 'background-color: #17a2b8;' : ''}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Add CSS for message animations
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

// Checkout Process
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showMessage('Your cart is empty. Please add some items before checking out.', 'error');
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
        
        const message = `PFG Chapati Order\n\nItems:\n${orderDetails}\n\nTotal: ${total.toLocaleString()} UGX\n\nPlease call +256703055329 to confirm your delivery details.`;
        
        // Show order confirmation
        if (confirm(`${message}\n\nClick OK to proceed with your order.`)) {
            // In a real implementation, you would send this data to your backend
            console.log('Order placed:', cart);
            
            showMessage('Order placed successfully! We will call you shortly.', 'success');
            
            // Clear cart after successful order
            cart = [];
            updateCart();
            
            // Close cart sidebar
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    }, 2000);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            navLinks.classList.remove('active');
        }
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Image loading optimization
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Set initial opacity to 0 for fade-in effect
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        // Force load images that might already be cached
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
});

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCart();
    
    // Check if there's a hash in the URL and scroll to it
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            setTimeout(() => {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
});

// Add analytics tracking (example)
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track add to cart events
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        trackEvent('Products', 'Add to Cart', name);
    });
});

// Track checkout events
checkoutBtn.addEventListener('click', () => {
    trackEvent('Checkout', 'Begin Checkout', `Items: ${cart.length}`);
});

// Track phone calls
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        trackEvent('Contact', 'Phone Call', 'Header Phone');
    });
});

document.querySelector('.call-now').addEventListener('click', () => {
    trackEvent('Contact', 'Phone Call', 'Floating Button');
});
// Add to script.js - Real order submission
async function submitOrder(orderData) {
    const response = await fetch('your-backend-url/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    return await response.json();
}

// Form data to collect:
const customerInfo = {
    name: 'required',
    phone: 'required', 
    location: 'required',
    deliveryInstructions: 'optional'
};
const marketingStrategy = {
    online: [
        'Share on local Facebook groups',
        'WhatsApp status updates',
        'Instagram food pages',
        'Google My Business listing'
    ],
    offline: [
        'Flyers in Busega area',
        'Word of mouth referrals',
        'Local radio ads (if budget allows)',
        'Partnership with nearby businesses'
    ]
};
// Image optimization
const optimizeImages = async () => {
    // Convert images to WebP format
    // Implement lazy loading
    // Compress images for faster loading
};

// Add service worker for offline functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
// Basic success metrics
const metrics = {
    daily: ['orders', 'revenue', 'new customers'],
    weekly: ['repeat customers', 'popular items', 'delivery times'],
    monthly: ['growth rate', 'customer satisfaction', 'profit margins']
};
// Enhanced WhatsApp Order Functionality with Mobile Optimization
function setupWhatsAppOrder() {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const whatsappCartBtn = document.getElementById('whatsappCartBtn');
    
    // Floating button functionality
    whatsappFloat.addEventListener('click', function(e) {
        if (cart.length === 0) {
            e.preventDefault();
            showMessage('Please add items to your cart first!', 'error');
            cartSidebar.classList.add('active');
            overlay.classList.add('active');
            return;
        }
        
        const orderMessage = generateOrderMessage();
        const encodedMessage = encodeURIComponent(orderMessage);
        this.href = `https://wa.me/256703055329?text=${encodedMessage}`;
        
        // Track WhatsApp order click
        trackEvent('Order', 'WhatsApp Order', `Items: ${cart.length}`);
    });
    
    // Cart button functionality
    whatsappCartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (cart.length === 0) {
            showMessage('Your cart is empty! Please add some items first.', 'error');
            return;
        }
        
        const orderMessage = generateOrderMessage();
        const encodedMessage = encodeURIComponent(orderMessage);
        const whatsappUrl = `https://wa.me/256703055329?text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Close cart sidebar on mobile
        if (window.innerWidth <= 768) {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
        
        showMessage('Opening WhatsApp with your order! 📱', 'success');
        
        // Track cart WhatsApp order
        trackEvent('Order', 'Cart WhatsApp Order', `Items: ${cart.length}`);
    });
}

function generateOrderMessage() {
    const deliveryAddress = deliveryAddressInput?.value || 
                           localStorage.getItem('userLocation') || 
                           '📍 Please specify delivery location';
    
    let message = "🥞 *PFG CHAPATI ORDER* 🥞\n\n";  // ← CHANGED
    message += "Hello! I would like to order:\n\n";  // ← CHANGED
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} UGX\n`;  // ← CHANGED
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n💰 *Total: ${total.toLocaleString()} UGX*`;  // ← CHANGED
    message += `\n\n📍 *Delivery Location:* ${deliveryAddress}`;  // ← CHANGED
    message += `\n👤 *Customer Name:* `;  // ← CHANGED
    message += `\n📞 *Phone Number:* `;  // ← CHANGED
    message += `\n💬 *Special Instructions:* `;  // ← CHANGED
    message += `\n\n_Thank you! Looking forward to my delicious chapatis!_ 🥞`;  // ← CHANGED
    
    return message;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupWhatsAppOrder();
    
    // Add touch feedback for mobile
    const whatsappBtn = document.querySelector('.whatsapp-float');
    whatsappBtn.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    whatsappBtn.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
    });
});
// Enhanced order management
function setupOrderSystem() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const whatsappBtn = document.getElementById('whatsappCartBtn');
    
    checkoutBtn.addEventListener('click', function() {
        showOrderForm();
    });
    
    whatsappBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (cart.length === 0) {
            showMessage('Your cart is empty!', 'error');
            return;
        }
        
        const orderMessage = generateOrderMessage();
        const whatsappUrl = `https://wa.me/256703055329?text=${encodeURIComponent(orderMessage)}`;
        window.open(whatsappUrl, '_blank');
        
        // Clear cart after order
        setTimeout(() => {
            cart = [];
            updateCart();
            showMessage('Order sent via WhatsApp! We will confirm soon.', 'success');
        }, 1000);
    });
}

function showOrderForm() {
    // Simple form for customer details
    const name = prompt('Please enter your name:');
    if (!name) return;
    
    const phone = prompt('Please enter your phone number:');
    if (!phone) return;
    
    const location = prompt('Please enter your delivery location:');
    if (!location) return;
    
    // Process order
    processOrder({ name, phone, location, items: cart });
}

function processOrder(orderData) {
    // Here you would normally send to your backend
    // For now, just show confirmation
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    alert(`Order Confirmed!\\n\\nName: ${orderData.name}\\nPhone: ${orderData.phone}\\nLocation: ${orderData.location}\\nTotal: ${total.toLocaleString()} UGX\\n\\nWe will call you to confirm delivery!`);
    
    // Clear cart
    cart = [];
    updateCart();
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
}
// Enhanced WhatsApp Order System
function setupWhatsAppOrder() {
    const whatsappButtons = document.querySelectorAll('.whatsapp-float, .whatsapp-hero-btn, .whatsapp-large-btn');
    
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // If it's the floating button, check cart
            if (this.classList.contains('whatsapp-float') && cart.length === 0) {
                e.preventDefault();
                showMessage('Please add items to your cart first!', 'error');
                // Scroll to menu section
                document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
                return;
            }
            
            // Generate order message if cart has items
            if (cart.length > 0) {
                e.preventDefault();
                const orderMessage = generateOrderMessage();
                const encodedMessage = encodeURIComponent(orderMessage);
                const whatsappUrl = `https://wa.me/256703055329?text=${encodedMessage}`;
                
                window.open(whatsappUrl, '_blank');
                
                // Track the order
                trackEvent('Order', 'WhatsApp Order', `From: ${this.className}, Items: ${cart.length}`);
            }
            // If cart is empty but it's a CTA button, let it proceed with basic message
        });
    });
}

// Enhanced order message with location
function generateOrderMessage() {
    const deliveryAddress = document.getElementById('deliveryAddress')?.value || 
                           localStorage.getItem('userLocation') || 
                           '📍 Please specify delivery location';
    
    let message = "🥞 *PFG CHAPATI ORDER* 🥞\n";
    message += "Hello! I would like to order:\n";
    
    if (cart.length > 0) {
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} UGX\n`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n💰 *Total: ${total.toLocaleString()} UGX*`;
    } else {
        message += "Please help me with the menu and prices.\n";
    }
    
    message += `\n📍 *Delivery Location:* ${deliveryAddress}`;
    message += `\n👤 *Customer Name:* `;
    message += `\n📞 *Phone Number:* `;
    message += `\n💬 *Special Instructions:* `;
    message += `\n_Thank you! Looking forward to my delicious chapatis!_ 🥞`;
    
    return message;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupWhatsAppOrder();
});
// Fix Checkout Button Functionality
function setupCheckoutButton() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showMessage('Your cart is empty! Please add some items first.', 'error');
            return;
        }
        
        // Get delivery address
        const deliveryAddress = document.getElementById('deliveryAddress')?.value || 
                               localStorage.getItem('userLocation') || 
                               'Location not specified';
        
        if (deliveryAddress === 'Location not specified') {
            showMessage('Please enter your delivery location!', 'error');
            document.getElementById('deliveryAddress')?.focus();
            return;
        }
        
        // Process the order
        processCheckoutOrder(deliveryAddress);
    });
}

function processCheckoutOrder(deliveryAddress) {
    showLoading();
    
    // Simulate order processing
    setTimeout(() => {
        hideLoading();
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Show order confirmation
        const orderDetails = cart.map(item => 
            `${item.name} x${item.quantity} - ${(item.price * item.quantity).toLocaleString()} UGX`
        ).join('\n');
        
        const confirmationMessage = `Order Confirmed! 🎉\n\nItems:\n${orderDetails}\n\nTotal: ${total.toLocaleString()} UGX\nDelivery: ${deliveryAddress}\n\nWe will call you at +256703055329 to confirm your order!`;
        
        alert(confirmationMessage);
        
        // Clear cart and close sidebar
        cart = [];
        updateCart();
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
        
        showMessage('Order placed successfully! We will call you shortly.', 'success');
        
        // Track the order
        trackEvent('Order', 'Checkout', `Items: ${cart.length}, Total: ${total}`);
        
    }, 1500);
}

// Initialize checkout button when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupCheckoutButton();
});
// ===== SIMPLE BACK BUTTON =====
function initializeBackButton() {
    const backButton = document.querySelector('.back-button');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            closeCartSidebar();
        });
    }
}

// Add to your DOMContentLoaded function
document.addEventListener('DOMContentLoaded', function() {
    // ... your other initializations
    initializeBackButton(); // Add this line
});
// Debug security issues
function debugSecurityIssues() {
    console.log('=== SECURITY DEBUG INFO ===');
    console.log('Protocol:', window.location.protocol);
    console.log('Host:', window.location.host);
    
    // Check all images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
        console.log(`Image ${index}:`, img.src);
        
        const testImg = new Image();
        testImg.onload = () => console.log(`✅ Image ${index} loads OK`);
        testImg.onerror = () => console.log(`❌ Image ${index} FAILED: ${img.src}`);
        testImg.src = img.src;
    });
}

document.addEventListener('DOMContentLoaded', debugSecurityIssues);
// ===== MINIMAL MOBILE CLOSE BUTTON =====
document.addEventListener('DOMContentLoaded', function() {
    // Create and add mobile close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-close-btn';
    closeBtn.innerHTML = '<i class="fas fa-times"></i> Close Cart';
    closeBtn.onclick = closeCartSidebar;
    
    // ===== ENHANCED WHATSAPP CART BUTTON =====
function addEnhancedWhatsAppButton() {
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'cart-buttons-container';
    
    // Create WhatsApp button
    const whatsappBtn = document.createElement('button');
    whatsappBtn.className = 'cart-btn whatsapp-cart-btn';
    whatsappBtn.innerHTML = `
        <i class="fab fa-whatsapp"></i>
        <span>Order via WhatsApp</span>
    `;
    
    // Create Checkout button reference
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Add WhatsApp button functionality
    whatsappBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showMessage('🛒 Your cart is empty! Add some items first.', 'error');
            return;
        }
        
        const deliveryAddress = document.getElementById('deliveryAddress')?.value || 'Location not specified';
        if (deliveryAddress === 'Location not specified') {
            showMessage('📍 Please enter your delivery location first!', 'error');
            document.getElementById('deliveryAddress')?.focus();
            return;
        }
        
        const orderMessage = generateOrderMessage();
        const whatsappUrl = `https://wa.me/256703055329?text=${encodeURIComponent(orderMessage)}`;
        
        window.open(whatsappUrl, '_blank');
        showMessage('📱 Opening WhatsApp with your order!', 'success');
    });
    
    // Create container and add buttons
    buttonContainer.appendChild(whatsappBtn);
    if (checkoutBtn) {
        checkoutBtn.parentNode.insertBefore(buttonContainer, checkoutBtn);
        buttonContainer.appendChild(checkoutBtn);
    }
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .cart-buttons-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
        }
        
