// js/order-system.js - Complete Order Processing System
import { db, auth } from './firebase-init.js';
import { 
    collection, 
    addDoc, 
    doc, 
    updateDoc,
    getDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

class OrderSystem {
    constructor() {
        this.ordersRef = collection(db, 'orders');
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadUserOrders();
    }
    
    setupEventListeners() {
        // Place Order Button
        const placeOrderBtn = document.getElementById('checkoutBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => this.processOrder());
        }
        
        // WhatsApp Order Button
        const whatsappOrderBtn = document.getElementById('whatsappCartBtn');
        if (whatsappOrderBtn) {
            whatsappOrderBtn.addEventListener('click', () => this.sendOrderViaWhatsApp());
        }
        
        // Listen for cart updates
        document.addEventListener('cartUpdated', () => {
            this.updateOrderSummary();
        });
    }
    
    async processOrder() {
        try {
            // 1. Validate customer info
            if (!this.validateCustomerInfo()) {
                return;
            }
            
            // 2. Validate cart
            if (!this.validateCart()) {
                this.showNotification('Your cart is empty!', 'error');
                return;
            }
            
            // 3. Get order data
            const orderData = this.prepareOrderData();
            
            // 4. Show loading state
            const btn = document.getElementById('checkoutBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;
            
            // 5. Save to Firebase
            const orderId = await this.saveOrderToFirebase(orderData);
            
            // 6. Send notifications
            await this.sendOrderNotifications(orderData, orderId);
            
            // 7. Clear cart and show success
            this.clearCart();
            this.showOrderConfirmation(orderId, orderData);
            
            // 8. Award beans for order
            this.awardOrderBeans(orderData.total);
            
        } catch (error) {
            console.error('Order processing error:', error);
            this.showNotification('Order failed. Please try again.', 'error');
        } finally {
            const btn = document.getElementById('checkoutBtn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-credit-card"></i> Place Order';
                btn.disabled = false;
            }
        }
    }
    
    validateCustomerInfo() {
        const requiredFields = [
            { id: 'customerName', name: 'Full Name' },
            { id: 'customerPhone', name: 'Phone Number' },
            { id: 'deliveryAddress', name: 'Delivery Address' }
        ];
        
        const missingFields = [];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                missingFields.push(field.name);
            }
        });
        
        if (missingFields.length > 0) {
            this.showNotification(`Please fill in: ${missingFields.join(', ')}`, 'error');
            return false;
        }
        
        // Validate phone number (Ugandan format)
        const phone = document.getElementById('customerPhone').value;
        const ugandanPhoneRegex = /^(\+256|0)[17]\d{8}$/;
        
        if (!ugandanPhoneRegex.test(phone.replace(/\s/g, ''))) {
            this.showNotification('Please enter a valid Ugandan phone number (e.g., +256 700 123 456 or 0700 123 456)', 'error');
            return false;
        }
        
        return true;
    }
    
    validateCart() {
        const cart = JSON.parse(localStorage.getItem('pfgCart')) || [];
        return cart.length > 0;
    }
    
    prepareOrderData() {
        const cart = JSON.parse(localStorage.getItem('pfgCart')) || [];
        const userId = auth.currentUser?.uid || 'guest';
        const userName = auth.currentUser?.displayName || document.getElementById('customerName').value;
        
        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal > 10000 ? 0 : 2000; // Free delivery above 10,000 UGX
        const total = subtotal + deliveryFee;
        
        return {
            userId: userId,
            userName: userName,
            userEmail: document.getElementById('customerEmail')?.value || '',
            userPhone: document.getElementById('customerPhone').value,
            deliveryAddress: document.getElementById('deliveryAddress').value,
            specialInstructions: document.getElementById('specialInstructions')?.value || '',
            
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
                image: item.image
            })),
            
            summary: {
                subtotal: subtotal,
                deliveryFee: deliveryFee,
                total: total,
                itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
            },
            
            status: 'pending',
            paymentMethod: 'cash_on_delivery',
            paymentStatus: 'pending',
            
            location: {
                type: 'manual',
                coordinates: null,
                timestamp: new Date().toISOString()
            },
            
            timestamps: {
                created: new Date().toISOString(),
                estimatedDelivery: this.calculateDeliveryTime()
            },
            
            metadata: {
                source: 'web',
                userAgent: navigator.userAgent,
                ip: 'unknown' // Would get from server in production
            }
        };
    }
    
    async saveOrderToFirebase(orderData) {
        try {
            // Add order to Firestore
            const orderRef = await addDoc(this.ordersRef, {
                ...orderData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                orderNumber: this.generateOrderNumber()
            });
            
            console.log('Order saved to Firebase:', orderRef.id);
            
            // Update user's order count
            await this.updateUserOrderStats(orderData.userId);
            
            return orderRef.id;
            
        } catch (error) {
            console.error('Firebase save error:', error);
            throw error;
        }
    }
    
    async sendOrderNotifications(orderData, orderId) {
        // 1. WhatsApp message to you (PFG Admin)
        await this.sendWhatsAppNotification(orderData, orderId);
        
        // 2. WhatsApp confirmation to customer
        await this.sendCustomerConfirmation(orderData, orderId);
        
        // 3. Email notification (if email provided)
        if (orderData.userEmail) {
            await this.sendEmailNotification(orderData, orderId);
        }
        
        // 4. In-app notification
        this.showNotification('Order placed successfully! We\'ll contact you soon.', 'success');
    }
    
    async sendWhatsAppNotification(orderData, orderId) {
        // Your WhatsApp number
        const adminWhatsApp = '256703055329';
        
        // Format order details for WhatsApp
        const itemsText = orderData.items.map(item => 
            `• ${item.quantity}x ${item.name} - ${item.total.toLocaleString()} UGX`
        ).join('\n');
        
        const message = `📦 *NEW ORDER #${orderId}* 📦

👤 *Customer Details:*
• Name: ${orderData.userName}
• Phone: ${orderData.userPhone}
• ${orderData.userEmail ? `Email: ${orderData.userEmail}` : ''}
• Location: ${orderData.deliveryAddress}

🛒 *Order Items:*
${itemsText}

💰 *Order Summary:*
• Subtotal: ${orderData.summary.subtotal.toLocaleString()} UGX
• Delivery: ${orderData.summary.deliveryFee.toLocaleString()} UGX
• *Total: ${orderData.summary.total.toLocaleString()} UGX*

📍 *Delivery Details:*
• Address: ${orderData.deliveryAddress}
• Instructions: ${orderData.specialInstructions || 'None'}
• Estimated Delivery: ${orderData.timestamps.estimatedDelivery}

⏰ *Order Time:* ${new Date().toLocaleString('en-UG', { 
    timeZone: 'Africa/Kampala',
    hour12: true 
})}

📱 *Order ID:* ${orderId}

---
🚀 *Action Required:* Please confirm receipt and process order!`;

        // Encode message for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab (admin will see the message)
        window.open(whatsappUrl, '_blank');
        
        // Also log to console for debugging
        console.log('WhatsApp message prepared:', message);
    }
    
    async sendCustomerConfirmation(orderData, orderId) {
        const customerPhone = orderData.userPhone.replace(/\D/g, ''); // Remove non-digits
        
        const message = `✅ *PFG Chapati Order Confirmation*

Thank you for your order, ${orderData.userName.split(' ')[0]}! 🥞

📋 *Order #:* ${orderId.slice(-6).toUpperCase()}
💰 *Amount:* ${orderData.summary.total.toLocaleString()} UGX
📍 *Delivery to:* ${orderData.deliveryAddress}
⏰ *Estimated delivery:* ${orderData.timestamps.estimatedDelivery}

📞 *Contact:* +256 703 055 329
⏳ *Status:* Being prepared

We'll notify you when your order is on the way! 🛵

_For order updates, reply to this message._`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodedMessage}`;
        
        // Note: This opens WhatsApp for customer confirmation
        // You might want to send this via a backend service instead
        // window.open(whatsappUrl, '_blank');
        
        console.log('Customer confirmation message:', message);
    }
    
    async sendEmailNotification(orderData, orderId) {
        // This would typically be done via backend
        // For now, we'll log it
        console.log('Email notification would be sent to:', orderData.userEmail);
        
        // You can implement this with EmailJS or your own backend
        // Example with EmailJS (requires setup):
        /*
        emailjs.send('service_id', 'template_id', {
            to_email: orderData.userEmail,
            order_id: orderId,
            customer_name: orderData.userName,
            total_amount: orderData.summary.total,
            delivery_address: orderData.deliveryAddress
        });
        */
    }
    
    clearCart() {
        localStorage.removeItem('pfgCart');
        
        // Update cart display
        const cartUpdatedEvent = new CustomEvent('cartUpdated', {
            detail: { cart: [] }
        });
        document.dispatchEvent(cartUpdatedEvent);
        
        // Close cart sidebar
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
        }
    }
    
    showOrderConfirmation(orderId, orderData) {
        // Create confirmation modal
        const confirmationHTML = `
        <div class="order-confirmation-modal active">
            <div class="confirmation-content">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                
                <h2>Order Confirmed! 🎉</h2>
                <p class="order-id">Order #: <strong>${orderId.slice(-6).toUpperCase()}</strong></p>
                
                <div class="confirmation-details">
                    <div class="detail-row">
                        <span class="label">Amount:</span>
                        <span class="value">${orderData.summary.total.toLocaleString()} UGX</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Delivery to:</span>
                        <span class="value">${orderData.deliveryAddress}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Estimated delivery:</span>
                        <span class="value">${orderData.timestamps.estimatedDelivery}</span>
                    </div>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn-primary" id="trackOrderBtn">
                        <i class="fas fa-map-marker-alt"></i> Track Order
                    </button>
                    <button class="btn-secondary" id="viewOrderDetails">
                        <i class="fas fa-receipt"></i> View Details
                    </button>
                    <a href="https://wa.me/256703055329" class="btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                    </a>
                </div>
                
                <p class="confirmation-note">
                    <i class="fas fa-info-circle"></i>
                    We've sent confirmation to your WhatsApp. Our team will contact you shortly.
                </p>
                
                <button class="btn-close-confirmation">
                    Continue Shopping
                </button>
            </div>
        </div>
        `;
        
        // Add to page
        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
        
        // Add event listeners
        document.getElementById('trackOrderBtn').addEventListener('click', () => {
            this.showOrderTracking(orderId);
        });
        
        document.getElementById('viewOrderDetails').addEventListener('click', () => {
            this.showOrderDetails(orderId, orderData);
        });
        
        document.querySelector('.btn-close-confirmation').addEventListener('click', () => {
            document.querySelector('.order-confirmation-modal').remove();
        });
        
        // Add styles if not already added
        this.addConfirmationStyles();
    }
    
    async sendOrderViaWhatsApp() {
        const cart = JSON.parse(localStorage.getItem('pfgCart')) || [];
        
        if (cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // Get customer info
        const name = document.getElementById('customerName')?.value || 'Customer';
        const phone = document.getElementById('customerPhone')?.value || '';
        const address = document.getElementById('deliveryAddress')?.value || '';
        
        // Format order message
        const itemsText = cart.map(item => 
            `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toLocaleString()} UGX`
        ).join('%0A');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = total > 10000 ? 0 : 2000;
        const grandTotal = total + deliveryFee;
        
        const message = `*PFG CHAPATI ORDER*%0A%0A` +
                       `*Customer:* ${name}%0A` +
                       `*Phone:* ${phone}%0A` +
                       `*Address:* ${address}%0A%0A` +
                       `*Order Items:*%0A${itemsText}%0A%0A` +
                       `*Subtotal:* ${total.toLocaleString()} UGX%0A` +
                       `*Delivery:* ${deliveryFee.toLocaleString()} UGX%0A` +
                       `*Total:* ${grandTotal.toLocaleString()} UGX%0A%0A` +
                       `*Special Instructions:*%0A${document.getElementById('specialInstructions')?.value || 'None'}`;
        
        // Your WhatsApp number
        const whatsappNumber = '256703055329';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Also save to Firebase
        try {
            const orderData = this.prepareOrderData();
            const orderId = await this.saveOrderToFirebase(orderData);
            console.log('WhatsApp order saved to Firebase:', orderId);
        } catch (error) {
            console.error('Failed to save WhatsApp order:', error);
        }
    }
    
    generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PFG-${timestamp}${random}`;
    }
    
    calculateDeliveryTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // 30 minutes delivery time
        
        return now.toLocaleTimeString('en-UG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
    
    async updateUserOrderStats(userId) {
        if (userId === 'guest') return;
        
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
                const currentCount = userDoc.data().totalOrders || 0;
                await updateDoc(userRef, {
                    totalOrders: currentCount + 1,
                    lastOrderDate: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }
    
    awardOrderBeans(totalAmount) {
        // Award 1 bean per 100 UGX spent
        const beansEarned = Math.floor(totalAmount / 100);
        
        // Trigger beans earning event
        const beansEvent = new CustomEvent('beansEarned', {
            detail: {
                amount: beansEarned,
                reason: 'Order Completed',
                metadata: { amountSpent: totalAmount }
            }
        });
        document.dispatchEvent(beansEvent);
    }
    
    updateOrderSummary() {
        const cart = JSON.parse(localStorage.getItem('pfgCart')) || [];
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal > 10000 ? 0 : 2000;
        const total = subtotal + deliveryFee;
        
        // Update display
        const totalElement = document.querySelector('.total-amount');
        if (totalElement) {
            totalElement.textContent = `${total.toLocaleString()} UGX`;
        }
        
        // Show delivery fee info
        const deliveryInfo = document.getElementById('deliveryFeeInfo');
        if (!deliveryInfo) {
            const cartTotal = document.querySelector('.cart-total');
            if (cartTotal) {
                const infoHTML = `
                <div class="delivery-info" id="deliveryFeeInfo">
                    <span>Delivery:</span>
                    <span>${deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} UGX`}</span>
                </div>
                `;
                cartTotal.insertAdjacentHTML('beforebegin', infoHTML);
            }
        }
    }
    
    async loadUserOrders() {
        const user = auth.currentUser;
        if (!user) return;
        
        try {
            const q = query(
                this.ordersRef,
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            
            const querySnapshot = await getDocs(q);
