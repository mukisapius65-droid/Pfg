// js/firebase-order.js - Complete Order System with Firebase

import { db } from './firebase-init.js';
import { 
    collection, 
    addDoc, 
    serverTimestamp,
    doc,
    updateDoc,
    getDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

class FirebaseOrderSystem {
    constructor() {
        this.db = db;
        this.auth = getAuth();
        this.ordersRef = collection(this.db, 'orders');
        this.cart = JSON.parse(localStorage.getItem('pfgCart')) || [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateCartCount();
    }
    
    setupEventListeners() {
        // Place Order Button
        const placeOrderBtn = document.getElementById('checkoutBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.processOrder();
            });
        }
        
        // WhatsApp Order Button
        const whatsappBtn = document.getElementById('whatsappCartBtn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendWhatsAppOrder();
            });
        }
        
        // Location Detection
        const detectLocationBtn = document.getElementById('detectLocationBtn');
        if (detectLocationBtn) {
            detectLocationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.detectLocation();
            });
        }
        
        // Listen for cart updates
        window.addEventListener('cartUpdated', () => {
            this.cart = JSON.parse(localStorage.getItem('pfgCart')) || [];
            this.updateCartCount();
        });
    }
    
    async processOrder() {
        // Show loading state
        const btn = document.getElementById('checkoutBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;
        
        try {
            // 1. Validate cart
            if (!this.validateCart()) {
                this.showNotification('Your cart is empty!', 'error');
                return;
            }
            
            // 2. Validate customer info
            const customerData = this.getCustomerData();
            if (!customerData.valid) {
                this.showNotification(customerData.error, 'error');
                return;
            }
            
            // 3. Prepare order data
            const orderData = this.prepareOrderData(customerData.data);
            
            // 4. Save to Firebase
            const orderId = await this.saveOrderToFirebase(orderData);
            
            // 5. Send WhatsApp notification to you
            await this.sendAdminWhatsAppNotification(orderData, orderId);
            
            // 6. Send confirmation to customer
            this.sendCustomerConfirmation(customerData.data.phone, orderData, orderId);
            
            // 7. Award beans if user is logged in
            await this.awardOrderBeans(orderData.summary.total);
            
            // 8. Clear cart and show success
            this.clearCart();
            this.showOrderSuccess(orderData, orderId);
            
            // 9. Track order in analytics
            this.trackOrder(orderData, orderId);
            
        } catch (error) {
            console.error('Order processing error:', error);
            this.showNotification('Order failed. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    
    validateCart() {
        return this.cart.length > 0;
    }
    
    getCustomerData() {
        const name = document.getElementById('customerName')?.value.trim();
        const phone = document.getElementById('customerPhone')?.value.trim();
        const email = document.getElementById('customerEmail')?.value.trim();
        const address = document.getElementById('deliveryAddress')?.value.trim();
        const instructions = document.getElementById('specialInstructions')?.value.trim();
        
        // Validate required fields
        if (!name) {
            return { valid: false, error: 'Please enter your full name' };
        }
        
        if (!phone) {
            return { valid: false, error: 'Please enter your phone number' };
        }
        
        // Validate Ugandan phone number
        const phoneRegex = /^(\+256|0)[17]\d{8}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return { valid: false, error: 'Please enter a valid Ugandan phone number (e.g., +256 700 123 456)' };
        }
        
        if (!address) {
            return { valid: false, error: 'Please enter your delivery address' };
        }
        
        return {
            valid: true,
            data: {
                name,
                phone,
                email: email || '',
                address,
                instructions: instructions || ''
            }
        };
    }
    
    prepareOrderData(customerData) {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal >= 10000 ? 0 : 2000;
        const total = subtotal + deliveryFee;
        const user = this.auth.currentUser;
        
        return {
            // Order ID (generated by Firebase)
            orderNumber: this.generateOrderNumber(),
            
            // Customer Information
            customer: {
                name: customerData.name,
                phone: customerData.phone,
                email: customerData.email,
                address: customerData.address,
                instructions: customerData.instructions
            },
            
            // Order Items
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
                image: item.image || ''
            })),
            
            // Order Summary
            summary: {
                subtotal: subtotal,
                deliveryFee: deliveryFee,
                total: total,
                itemCount: this.cart.reduce((sum, item) => sum + item.quantity, 0)
            },
            
            // Order Status
            status: 'pending',
            paymentMethod: 'cash_on_delivery',
            paymentStatus: 'pending',
            
            // User Info (if logged in)
            userId: user ? user.uid : 'guest',
            userEmail: user ? user.email : '',
            
            // Timestamps
            createdAt: serverTimestamp(),
            estimatedDelivery: this.calculateDeliveryTime(),
            
            // Location Data (if detected)
            location: this.userLocation || null,
            
            // Metadata
            metadata: {
                source: 'web',
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            }
        };
    }
    
    async saveOrderToFirebase(orderData) {
        try {
            // Add to Firestore
            const docRef = await addDoc(this.ordersRef, {
                ...orderData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            console.log('Order saved to Firebase with ID:', docRef.id);
            
            // If user is logged in, update their stats
            if (this.auth.currentUser) {
                const userRef = doc(this.db, 'users', this.auth.currentUser.uid);
                await updateDoc(userRef, {
                    totalOrders: increment(1),
                    lastOrderDate: serverTimestamp(),
                    totalSpent: increment(orderData.summary.total)
                });
            }
            
            return docRef.id;
            
        } catch (error) {
            console.error('Error saving order to Firebase:', error);
            throw error;
        }
    }
    
    async sendAdminWhatsAppNotification(orderData, orderId) {
        // Your WhatsApp number
        const adminNumber = '256703055329';
        
        // Format items for display
        const itemsList = orderData.items.map(item => 
            `• ${item.quantity}x ${item.name} - ${item.total.toLocaleString()} UGX`
        ).join('\n');
        
        // Create message
        const message = `📦 *NEW ORDER - PFG CHAPATI* 📦
━━━━━━━━━━━━━━━━━━━━━

📋 *Order ID:* #${orderId.slice(-6).toUpperCase()}

👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━━
• Name: ${orderData.customer.name}
• Phone: ${orderData.customer.phone}
${orderData.customer.email ? `• Email: ${orderData.customer.email}` : ''}
• Address: ${orderData.customer.address}
${orderData.customer.instructions ? `• Notes: ${orderData.customer.instructions}` : ''}

🛒 *ORDER ITEMS*
━━━━━━━━━━━━━━━━━━━━━
${itemsList}

💰 *PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━━
• Subtotal: ${orderData.summary.subtotal.toLocaleString()} UGX
• Delivery: ${orderData.summary.deliveryFee === 0 ? 'FREE 🎉' : orderData.summary.deliveryFee.toLocaleString() + ' UGX'}
• *TOTAL: ${orderData.summary.total.toLocaleString()} UGX*

⏰ *ORDER TIME*
━━━━━━━━━━━━━━━━━━━━━
• Placed: ${new Date().toLocaleString('en-UG', { timeZone: 'Africa/Kampala', hour12: true })}
• Est. Delivery: ${orderData.estimatedDelivery}

📱 *CUSTOMER CONTACT*
━━━━━━━━━━━━━━━━━━━━━
• Click to call: tel:${orderData.customer.phone}
• Click to WhatsApp: https://wa.me/${orderData.customer.phone.replace(/\D/g, '')}

━━━━━━━━━━━━━━━━━━━━━
🚀 *Action Required: Process this order*
✅ Reply "CONFIRM" to accept
❌ Reply "CANCEL" to reject`;

        // Encode for WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        return whatsappUrl;
    }
    
    sendCustomerConfirmation(phoneNumber, orderData, orderId) {
        // Format customer message
        const itemsList = orderData.items.slice(0, 3).map(item => 
            `• ${item.quantity}x ${item.name}`
        ).join('\n');
        
        const moreItems = orderData.items.length > 3 ? 
            `\n• ...and ${orderData.items.length - 3} more items` : '';
        
        const message = `✅ *PFG CHAPATI - ORDER CONFIRMED*

Thank you for ordering, ${orderData.customer.name.split(' ')[0]}! 🥞

📋 *Order #:* ${orderId.slice(-6).toUpperCase()}
⏰ *Est. Delivery:* ${orderData.estimatedDelivery}
💰 *Total:* ${orderData.summary.total.toLocaleString()} UGX

🛒 *Your Items:*
${itemsList}${moreItems}

📍 *Delivery to:* ${orderData.customer.address}

📞 *Need help?* WhatsApp: wa.me/256703055329

We'll notify you when your order is on the way! 🛵

_Reply STOP to opt out of updates_`;

        // Encode for WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const customerWhatsApp = phoneNumber.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${customerWhatsApp}?text=${encodedMessage}`;
        
        // Open in new tab (optional - you might want to send via backend instead)
        // window.open(whatsappUrl, '_blank');
        
        console.log('Customer confirmation message prepared:', message);
    }
    
    generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PFG-${timestamp}${random}`;
    }
    
    calculateDeliveryTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // 30 minutes delivery
        
        return now.toLocaleTimeString('en-UG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
    
    async awardOrderBeans(totalAmount) {
        if (!this.auth.currentUser) return;
        
        try {
            const beansEarned = Math.floor(totalAmount / 100); // 1 bean per 100 UGX
            
            const userRef = doc(this.db, 'users', this.auth.currentUser.uid);
            await updateDoc(userRef, {
                beans: increment(beansEarned)
            });
            
            // Trigger beans event
            const beansEvent = new CustomEvent('beansEarned', {
                detail: {
                    amount: beansEarned,
                    reason: 'Order Completed',
                    total: totalAmount
                }
            });
            window.dispatchEvent(beansEvent);
            
        } catch (error) {
            console.error('Error awarding beans:', error);
        }
    }
    
    detectLocation() {
        if (!navigator.geolocation) {
            this.showNotification('Geolocation is not supported by your browser', 'error');
            return;
        }
        
        const detectBtn = document.getElementById('detectLocationBtn');
        const originalText = detectBtn.innerHTML;
        detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
        detectBtn.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    // Store location
                    this.userLocation = { latitude, longitude };
                    
                    // Reverse geocode to get address
                    const address = await this.reverseGeocode(latitude, longitude);
                    
                    // Update address field
                    const addressInput = document.getElementById('deliveryAddress');
                    if (addressInput) {
                        addressInput.value = address;
                    }
                    
                    this.showNotification('Location detected! Please verify address.', 'success');
                    
                } catch (error) {
                    console.error('Location detection error:', error);
                    this.showNotification('Could not detect location. Please enter manually.', 'error');
                } finally {
                    detectBtn.innerHTML = originalText;
                    detectBtn.disabled = false;
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                
                let errorMessage = 'Could not detect location. Please enter manually.';
                if (error.code === 1) {
                    errorMessage = 'Location permission denied. Please enter address manually.';
                } else if (error.code === 3) {
                    errorMessage = 'Location detection timed out. Please enter manually.';
                }
                
                this.showNotification(errorMessage, 'error');
                
                detectBtn.innerHTML = originalText;
                detectBtn.disabled = false;
            }
        );
    }
    
    async reverseGeocode(lat, lon) {
        try {
            // Using OpenStreetMap Nominatim (free, no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'PFG Chapati App'
                    }
                }
            );
            
            const data = await response.json();
            
            if (data.display_name) {
                // Format a shorter address
                const address = data.address;
                const parts = [];
                
                if (address.road) parts.push(address.road);
                if (address.suburb) parts.push(address.suburb);
                if (address.city || address.town || address.village) {
                    parts.push(address.city || address.town || address.village);
                }
                
                return parts.join(', ') || data.display_name;
            }
            
            return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return `${lat.toFixed(6)}, ${lon.toFixed(6)} (Please add full address)`;
        }
    }
    
    clearCart() {
        localStorage.removeItem('pfgCart');
        this.cart = [];
        
        // Update cart display
        const cartItems = document.querySelector('.cart-items');
        if (cartItems) {
            cartItems.innerHTML = ''; // Clear items
        }
        
        // Update total
        const totalElement = document.querySelector('.total-amount');
        if (totalElement) {
            totalElement.textContent = '0 UGX';
        }
        
        // Dispatch event
        const event = new CustomEvent('cartUpdated', { detail: { cart: [] } });
        window.dispatchEvent(event);
    }
    
    updateCartCount() {
        const cartItems = document.querySelector('.cart-items');
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; opacity: 0.5; margin-bottom: 15px;"></i>
                    <p>Your cart is empty</p>
                    <a href="#menu" class="browse-menu-btn" style="display: inline-block; padding: 10px 25px; background: #e4002b; color: white; border-radius: 25px; text-decoration: none; margin-top: 15px;">Browse Menu</a>
                </div>
            `;
        }
    }
    
    showOrderSuccess(orderData, orderId) {
        // Create success modal
        const modalHTML = `
        <div class="order-success-modal" id="orderSuccessModal">
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Order Placed Successfully! 🎉</h2>
                <p class="order-id">Order #${orderId.slice(-6).toUpperCase()}</p>
                
                <div class="order-details-summary">
                    <div class="summary-row">
                        <span>Total Amount:</span>
                        <strong>${orderData.summary.total.toLocaleString()} UGX</strong>
                    </div>
                    <div class="summary-row">
                        <span>Delivery to:</span>
                        <span>${orderData.customer.address}</span>
                    </div>
                    <div class="summary-row">
                        <span>Est. Delivery:</span>
                        <span>${orderData.estimatedDelivery}</span>
                    </div>
                </div>
                
                <div class="success-actions">
                    <a href="https://wa.me/256703055329" class="whatsapp-action" target="_blank">
                        <i class="fab fa-whatsapp"></i> Contact Support
                    </a>
                    <button class="continue-shopping" onclick="document.getElementById('orderSuccessModal').remove(); document.querySelector('.cart-sidebar').classList.remove('active');">
                        Continue Shopping
                    </button>
                </div>
                
                <p class="success-note">
                    <i class="fas fa-info-circle"></i>
                    We've sent order details to your WhatsApp. You'll receive updates shortly.
                </p>
            </div>
        </div>
        `;
        
        // Add to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add styles
        this.addSuccessModalStyles();
        
        // Auto close after 10 seconds
        setTimeout(() => {
            const modal = document.getElementById('orderSuccessModal');
            if (modal) modal.remove();
        }, 10000);
    }
    
    addSuccessModalStyles() {
        if (document.getElementById('order-success-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'order-success-styles';
        style.textContent = `
            .order-success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .success-content {
                background: white;
                border-radius: 20px;
                padding: 40px 30px;
                max-width: 450px;
                width: 100%;
                text-align: center;
                animation: slideUp 0.5s ease;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .success-icon {
                font-size: 5rem;
                color: #28a745;
                margin-bottom: 20px;
                animation: bounce 1s ease;
            }
            
            @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            
            .success-content h2 {
                color: #333;
                margin-bottom: 10px;
                font-size: 1.8rem;
            }
            
            .order-id {
                color: #e4002b;
                font-weight: 700;
                font-size: 1.2rem;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #eee;
            }
            
            .order-details-summary {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin: 25px 0;
                text-align: left;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #ddd;
            }
            
            .summary-row:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }
            
            .summary-row span:first-child {
                color: #666;
                font-weight: 600;
            }
            
            .summary-row span:last-child {
                color: #333;
                font-weight: 600;
            }
            
            .success-actions {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin: 25px 0;
            }
            
            .whatsapp-action {
                background: #25D366;
                color: white;
                padding: 15px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.3s;
            }
            
            .whatsapp-action:hover {
                background: #128C7E;
                transform: translateY(-2px);
            }
            
            .continue-shopping {
                background: white;
                color: #e4002b;
                border: 2px solid #e4002b;
                padding: 15px;
                border-radius: 10px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .continue-shopping:hover {
                background: #e4002b;
                color: white;
            }
            
            .success-note {
                color: #666;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
            
            .success-note i {
                color: #e4002b;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.order-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `order-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles if not present
        if (!document.querySelector('#order-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'order-notification-styles';
            style.textContent = `
                .order-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-left: 5px solid var(--primary);
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    z-index: 11000;
                    min-width: 300px;
                    max-width: 450px;
                    animation: slideInRight 0.3s ease;
                }
                
                .order-notification.success {
                    border-left-color: #28a745;
                }
                
                .order-notification.error {
                    border-left-color: #dc3545;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .notification-content i {
                    font-size: 1.3rem;
                }
                
                .order-notification.success i {
                    color: #28a745;
                }
                
                .order-notification.error i {
                    color: #dc3545;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                
                .notification-close:hover {
                    background: #f0f0f0;
                    color: #333;
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @media (max-width: 768px) {
                    .order-notification {
                        top: auto;
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        min-width: auto;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    sendWhatsAppOrder() {
        if (!this.validateCart()) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        const customerData = this.getCustomerData();
        if (!customerData.valid) {
            this.showNotification('Please fill in your details first', 'error');
            
            // Scroll to customer info
            document.querySelector('.customer-info-section').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            return;
        }
        
        const orderData = this.prepareOrderData(customerData.data);
        const orderId = 'PFG' + Date.now().toString().slice(-6);
        
        this.sendAdminWhatsAppNotification(orderData, orderId);
        this.sendCustomerConfirmation(customerData.data.phone, orderData, orderId);
    }
    
    trackOrder(orderData, orderId) {
        // Track in localStorage for analytics
        const orders = JSON.parse(localStorage.getItem('pfgOrderHistory') || '[]');
        orders.push({
            orderId: orderId,
            total: orderData.summary.total,
            items: orderData.summary.itemCount,
            timestamp: new Date().toISOString(),
            customer: {
                name: orderData.customer.name,
                phone: orderData.customer.phone
            }
        });
        
        // Keep last 50 orders
        if (orders.length > 50) orders.shift();
        localStorage.setItem('pfgOrderHistory', JSON.stringify(orders));
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.firebaseOrderSystem = new FirebaseOrderSystem();
});

// Export for use in other modules
export { FirebaseOrderSystem };
