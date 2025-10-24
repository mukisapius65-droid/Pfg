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
