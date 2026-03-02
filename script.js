// ===== PFG Chapati - COMPLETE PRODUCTION SCRIPT =====
// WITH EMAIL/PASSWORD AUTHENTICATION
// ====================================================

(function() {
    'use strict';

    // -------------------- FIREBASE CONFIG --------------------
    const firebaseConfig = {
        apiKey: "AIzaSyAGyOqUe-t04O2M6cU6Iqg8MV4V8S_a_mk",
        authDomain: "pfg-chapati.firebaseapp.com",
        projectId: "pfg-chapati",
        storageBucket: "pfg-chapati.firebasestorage.app",
        messagingSenderId: "903359666880",
        appId: "1:903359666880:web:3f0c4e659a97336b40eb25",
        measurementId: "G-241GDRBG8N"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // -------------------- GLOBAL VARIABLES --------------------
    let currentUser = null;
    let userRole = null;
    let cart = [];
    let rewards = { points: 0, beansCount: 0 };
    let userLocation = null;
    let currentLang = 'en';
    let isCartOpen = false;
    let map = null;
    let riderMarker = null;
    let orderListener = null;
    let menuItems = [];
    let vendors = [];
    let riderOnline = false;

    const elements = {};

    // -------------------- TRANSLATIONS (ENGLISH) --------------------
    const translations = {
        en: {
            site_name: 'PFG Chapati',
            home: 'Home', menu: 'Menu', why: 'Why PFG', vendors: 'Vendors',
            rider_dashboard: 'Rider Dashboard', vendor_dashboard: 'Vendor Dashboard',
            my_orders: 'My Orders', login: 'Login', logout: 'Logout',
            profile: 'Profile', settings: 'Settings', order_now: 'Order Now',
            hero_title: 'Fresh Chapatis Delivered in 10 Minutes',
            hero_subtitle: 'Order delicious, hot chapatis from anywhere in Kampala and get them delivered to your doorstep in just 10 minutes!',
            why_title: 'Why Choose PFG Chapati?',
            feature1_title: '10-Minute Delivery',
            feature1_desc: 'We guarantee delivery within 10 minutes anywhere in Kampala. Fresh and hot!',
            feature2_title: 'Fresh Ingredients',
            feature2_desc: 'We connect you with makers who use only the freshest ingredients.',
            feature3_title: 'Free Delivery',
            feature3_desc: 'Free delivery on orders above 10,000 UGX. No hidden charges.',
            feature4_title: 'Variety of Options',
            feature4_desc: 'From plain chapati to rolex and rolipizza – we have it all.',
            our_menu: 'Our Menu', breakfast: 'Breakfast', lunch: 'Lunch',
            dinner: 'Dinner', drinks: 'Drinks',
            find_vendors: 'Find Trusted Chapati Makers in Kampala',
            vendors_sub: 'Fresh, hot, and ready — connect with the best local vendors near you.',
            detect_location: 'Detect my location', search: 'Search',
            your_cart: 'Your Cart', subtotal: 'Subtotal', discount: 'Discount',
            delivery_fee: 'Delivery Fee', total: 'Total',
            checkout: 'Proceed to Checkout', whatsapp_order: 'Order via WhatsApp',
            call_now: 'Call Now', add_to_cart: 'Add to Cart',
            added_to_cart: '{name} added to cart!', empty_cart: 'Your cart is empty',
            delivery_details: 'Delivery Details', payment_method: 'Payment Method',
            cash_on_delivery: 'Cash on Delivery', mobile_money: 'Mobile Money',
            credit_card: 'Credit Card', place_order: 'Place Order',
            order_placed: 'Order placed successfully!', order_failed: 'Failed to place order',
            login_required: 'Please login first', fill_details: 'Please fill in all required fields',
            points_earned: 'You have {points} points ({beansCount} Kikomando orders)',
            redeem: 'Redeem 100 points for 1000 UGX off', discount_applied: 'Discount applied at checkout!',
            status_pending: 'Pending', status_assigned: 'Assigned', status_delivered: 'Delivered',
            accept: 'Accept', mark_delivered: 'Mark Delivered', today_earnings: 'Today\'s Earnings',
            total_earnings: 'Total Earnings', deliveries_today: 'Deliveries Today',
            rating: 'Rating', assigned_orders: 'Assigned Orders', delivery_history: 'Delivery History',
            recent_orders: 'Recent Orders', pending_orders: 'Pending Orders',
            today_orders: 'Today\'s Orders', total_sales: 'Total Sales',
            average_rating: 'Average Rating', update_menu: 'Update Menu',
            view_reviews: 'View Reviews', earnings_report: 'Earnings Report',
            full_name: 'Full Name', phone_number: 'Phone Number', email: 'Email',
            default_address: 'Default Delivery Address', save_changes: 'Save Changes',
            change_photo: 'Change Photo', business_info: 'Business Information',
            business_name: 'Business Name', business_address: 'Business Address',
            business_hours: 'Business Hours', vehicle_info: 'Vehicle Information',
            vehicle_type: 'Vehicle Type', license_plate: 'License Plate',
            notifications: 'Notifications', push_notifications: 'Push Notifications',
            sms_notifications: 'SMS Notifications', email_notifications: 'Email Notifications',
            language: 'Language', payment_methods: 'Payment Methods',
            privacy_security: 'Privacy & Security', change_password: 'Change Password',
            delete_account: 'Delete Account', quick_links: 'Quick Links',
            contact: 'Contact', privacy: 'Privacy Policy', terms: 'Terms of Service',
            cookies: 'Cookie Policy',
            footer_desc: 'Bridging snack centers and customers in Kampala with a 10-minute guarantee.',
            download_app: 'Download App', all_orders: 'All Orders',
            cancelled: 'Cancelled', track_order: 'Track Your Order',
            rider_location: 'Rider Location', preparing: 'Preparing',
            out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
            accepted: 'Accepted', offline: 'Offline', online: 'Online',
            customer: 'Customer', rider: 'Rider', vendor: 'Vendor',
            save: 'Save', km_away: '{distance} km away',
            location_detected: 'Location detected!', location_failed: 'Unable to detect location',
            login_email: 'Login with Email', signup: 'Sign Up',
            confirm_password: 'Confirm Password', forgot_password: 'Forgot Password?',
            reset_password: 'Reset Password', no_account: 'Don\'t have an account? Sign Up',
            have_account: 'Already have an account? Login',
            password_mismatch: 'Passwords do not match', login_success: 'Logged in successfully!',
            signup_success: 'Account created successfully!', reset_email_sent: 'Password reset email sent. Check your inbox.',
            auth_modal_title: 'Login / Sign Up', close: 'Close',
            verify_email: 'Please verify your email before logging in.',
            reset_instructions: 'Enter your email to receive a password reset link.',
            add_item: 'Add Item', edit_item: 'Edit Item', delete_item: 'Delete Item',
            item_name: 'Item Name', item_description: 'Description', item_price: 'Price',
            item_category: 'Category', item_image: 'Image URL',
            go_online: 'Go Online', go_offline: 'Go Offline',
            accept_order: 'Accept Order', order_accepted: 'Order accepted',
            order_delivered: 'Order marked as delivered'
        },
        fr: {
            site_name: 'PFG Chapati', home: 'Accueil', menu: 'Menu',
            why: 'Pourquoi PFG', vendors: 'Vendeurs',
            rider_dashboard: 'Tableau de bord livreur',
            vendor_dashboard: 'Tableau de bord vendeur',
            my_orders: 'Mes commandes', login: 'Se connecter',
            logout: 'Se déconnecter', profile: 'Profil',
            settings: 'Paramètres', order_now: 'Commander',
            hero_title: 'Chapatis frais livrés en 10 minutes',
            hero_subtitle: 'Commandez des chapatis chauds et délicieux de n\'importe où à Kampala et faites-les livrer à votre porte en seulement 10 minutes!',
            why_title: 'Pourquoi choisir PFG Chapati?',
            feature1_title: 'Livraison en 10 minutes',
            feature1_desc: 'Livraison garantie en 10 minutes partout à Kampala. Frais et chauds!',
            feature2_title: 'Ingrédients frais',
            feature2_desc: 'Nous vous connectons avec des artisans qui utilisent les ingrédients les plus frais.',
            feature3_title: 'Livraison gratuite',
            feature3_desc: 'Livraison gratuite pour les commandes de plus de 10 000 UGX. Sans frais cachés.',
            feature4_title: 'Variété de choix',
            feature4_desc: 'Du simple chapati au rolex et rolipizza – nous avons tout.',
            our_menu: 'Notre menu', breakfast: 'Petit-déjeuner',
            lunch: 'Déjeuner', dinner: 'Dîner', drinks: 'Boissons',
            find_vendors: 'Trouvez des vendeurs de chapati fiables à Kampala',
            vendors_sub: 'Frais, chauds et prêts — connectez-vous avec les meilleurs vendeurs locaux près de chez vous.',
            detect_location: 'Détecter ma position', search: 'Rechercher',
            your_cart: 'Votre panier', subtotal: 'Sous-total',
            discount: 'Remise', delivery_fee: 'Frais de livraison',
            total: 'Total', checkout: 'Commander',
            whatsapp_order: 'Commander via WhatsApp', call_now: 'Appeler',
            add_to_cart: 'Ajouter au panier',
            added_to_cart: '{name} ajouté au panier!',
            empty_cart: 'Votre panier est vide',
            delivery_details: 'Détails de livraison',
            payment_method: 'Méthode de paiement',
            cash_on_delivery: 'Paiement à la livraison',
            mobile_money: 'Mobile Money', credit_card: 'Carte de crédit',
            place_order: 'Passer la commande',
            order_placed: 'Commande passée avec succès!',
            order_failed: 'Échec de la commande',
            login_required: 'Veuillez vous connecter d\'abord',
            fill_details: 'Veuillez remplir tous les champs requis',
            points_earned: 'Vous avez {points} points ({beansCount} commandes Kikomando)',
            redeem: 'Échanger 100 points pour 1000 UGX de réduction',
            discount_applied: 'Réduction appliquée!',
            status_pending: 'En attente', status_assigned: 'Assigné',
            status_delivered: 'Livré', accept: 'Accepter',
            mark_delivered: 'Marquer comme livré', today_earnings: 'Gains du jour',
            total_earnings: 'Gains totaux', deliveries_today: 'Livraisons aujourd\'hui',
            rating: 'Évaluation', assigned_orders: 'Commandes assignées',
            delivery_history: 'Historique des livraisons',
            recent_orders: 'Commandes récentes', pending_orders: 'Commandes en attente',
            today_orders: 'Commandes aujourd\'hui', total_sales: 'Ventes totales',
            average_rating: 'Note moyenne', update_menu: 'Mettre à jour le menu',
            view_reviews: 'Voir les avis', earnings_report: 'Rapport de gains',
            full_name: 'Nom complet', phone_number: 'Numéro de téléphone',
            email: 'E-mail', default_address: 'Adresse de livraison par défaut',
            save_changes: 'Enregistrer', change_photo: 'Changer la photo',
            business_info: 'Informations commerciales',
            business_name: 'Nom de l\'entreprise',
            business_address: 'Adresse de l\'entreprise',
            business_hours: 'Heures d\'ouverture',
            vehicle_info: 'Informations sur le véhicule',
            vehicle_type: 'Type de véhicule', license_plate: 'Plaque d\'immatriculation',
            notifications: 'Notifications', push_notifications: 'Notifications push',
            sms_notifications: 'Notifications SMS',
            email_notifications: 'Notifications e-mail',
            language: 'Langue', payment_methods: 'Moyens de paiement',
            privacy_security: 'Confidentialité et sécurité',
            change_password: 'Changer le mot de passe',
            delete_account: 'Supprimer le compte',
            quick_links: 'Liens rapides', contact: 'Contact',
            privacy: 'Politique de confidentialité', terms: 'Conditions d\'utilisation',
            cookies: 'Politique de cookies',
            footer_desc: 'Relier les snacks et les clients à Kampala avec une garantie de 10 minutes.',
            download_app: 'Télécharger l\'app', all_orders: 'Toutes les commandes',
            cancelled: 'Annulé', track_order: 'Suivre votre commande',
            rider_location: 'Position du livreur', preparing: 'Préparation',
            out_for_delivery: 'En cours de livraison', delivered: 'Livré',
            accepted: 'Accepté', offline: 'Hors ligne', online: 'En ligne',
            customer: 'Client', rider: 'Livreur', vendor: 'Vendeur',
            save: 'Enregistrer', km_away: 'À {distance} km',
            location_detected: 'Position détectée!',
            location_failed: 'Impossible de détecter la position',
            login_email: 'Connexion avec Email', signup: 'S\'inscrire',
            confirm_password: 'Confirmer le mot de passe',
            forgot_password: 'Mot de passe oublié?',
            reset_password: 'Réinitialiser le mot de passe',
            no_account: 'Pas de compte? Inscrivez-vous',
            have_account: 'Déjà un compte? Connectez-vous',
            password_mismatch: 'Les mots de passe ne correspondent pas',
            login_success: 'Connecté avec succès!',
            signup_success: 'Compte créé avec succès!',
            reset_email_sent: 'Email de réinitialisation envoyé.',
            auth_modal_title: 'Connexion / Inscription', close: 'Fermer',
            verify_email: 'Veuillez vérifier votre email avant de vous connecter.',
            reset_instructions: 'Entrez votre email pour recevoir un lien de réinitialisation.',
            add_item: 'Ajouter un article', edit_item: 'Modifier',
            delete_item: 'Supprimer', item_name: 'Nom',
            item_description: 'Description', item_price: 'Prix',
            item_category: 'Catégorie', item_image: 'URL de l\'image',
            go_online: 'En ligne', go_offline: 'Hors ligne',
            accept_order: 'Accepter', order_accepted: 'Commande acceptée',
            order_delivered: 'Commande marquée comme livrée'
        }
    };
        // CONTINUATION OF translations OBJECT
        zh: {
            site_name: 'PFG Chapati', home: '首页', menu: '菜单',
            why: '为什么选择PFG', vendors: '供应商',
            rider_dashboard: '骑手面板', vendor_dashboard: '商家面板',
            my_orders: '我的订单', login: '登录', logout: '退出',
            profile: '个人资料', settings: '设置', order_now: '立即订购',
            hero_title: '10分钟内送达新鲜薄饼',
            hero_subtitle: '从坎帕拉任何地方订购美味热薄饼，10分钟内送达您家门口！',
            why_title: '为什么选择PFG Chapati？',
            feature1_title: '10分钟送达',
            feature1_desc: '我们保证在坎帕拉任何地方10分钟内送达。新鲜热乎！',
            feature2_title: '新鲜食材',
            feature2_desc: '我们为您联系使用最新鲜食材的制作者。',
            feature3_title: '免费配送',
            feature3_desc: '订单超过10,000 UGX免配送费。无隐藏费用。',
            feature4_title: '多种选择',
            feature4_desc: '从普通薄饼到rollex和rolipizza – 我们应有尽有。',
            our_menu: '我们的菜单', breakfast: '早餐', lunch: '午餐',
            dinner: '晚餐', drinks: '饮料',
            find_vendors: '寻找坎帕拉值得信赖的薄饼制作者',
            vendors_sub: '新鲜、热乎、即食 — 与您附近最好的本地供应商联系。',
            detect_location: '检测我的位置', search: '搜索',
            your_cart: '您的购物车', subtotal: '小计', discount: '折扣',
            delivery_fee: '配送费', total: '总计', checkout: '去结算',
            whatsapp_order: '通过WhatsApp订购', call_now: '立即致电',
            add_to_cart: '加入购物车', added_to_cart: '{name}已加入购物车！',
            empty_cart: '您的购物车是空的', delivery_details: '配送详情',
            payment_method: '支付方式', cash_on_delivery: '货到付款',
            mobile_money: '移动支付', credit_card: '信用卡',
            place_order: '下订单', order_placed: '订单成功！',
            order_failed: '下单失败', login_required: '请先登录',
            fill_details: '请填写所有必填字段',
            points_earned: '您有{points}积分（{beansCount}次Kikomando订单）',
            redeem: '用100积分抵扣1000 UGX', discount_applied: '折扣已应用！',
            status_pending: '待处理', status_assigned: '已分配',
            status_delivered: '已送达', accept: '接受',
            mark_delivered: '标记为已送达', today_earnings: '今日收入',
            total_earnings: '总收入', deliveries_today: '今日配送',
            rating: '评分', assigned_orders: '已分配订单',
            delivery_history: '配送历史', recent_orders: '最近订单',
            pending_orders: '待处理订单', today_orders: '今日订单',
            total_sales: '总销售额', average_rating: '平均评分',
            update_menu: '更新菜单', view_reviews: '查看评论',
            earnings_report: '收入报告', full_name: '全名',
            phone_number: '电话号码', email: '邮箱',
            default_address: '默认配送地址', save_changes: '保存更改',
            change_photo: '更改照片', business_info: '商家信息',
            business_name: '商家名称', business_address: '商家地址',
            business_hours: '营业时间', vehicle_info: '车辆信息',
            vehicle_type: '车辆类型', license_plate: '车牌号',
            notifications: '通知', push_notifications: '推送通知',
            sms_notifications: '短信通知', email_notifications: '邮件通知',
            language: '语言', payment_methods: '支付方式',
            privacy_security: '隐私与安全', change_password: '更改密码',
            delete_account: '删除账户', quick_links: '快速链接',
            contact: '联系方式', privacy: '隐私政策', terms: '服务条款',
            cookies: 'Cookie政策',
            footer_desc: '连接坎帕拉的零食中心和顾客，10分钟保证。',
            download_app: '下载应用', all_orders: '所有订单',
            cancelled: '已取消', track_order: '追踪订单',
            rider_location: '骑手位置', preparing: '准备中',
            out_for_delivery: '配送中', delivered: '已送达',
            accepted: '已接受', offline: '离线', online: '在线',
            customer: '顾客', rider: '骑手', vendor: '商家',
            save: '保存', km_away: '{distance}公里外',
            location_detected: '位置已检测！', location_failed: '无法检测位置',
            login_email: '邮箱登录', signup: '注册',
            confirm_password: '确认密码', forgot_password: '忘记密码？',
            reset_password: '重置密码', no_account: '没有账号？立即注册',
            have_account: '已有账号？登录', password_mismatch: '两次输入的密码不一致',
            login_success: '登录成功！', signup_success: '注册成功！',
            reset_email_sent: '密码重置邮件已发送。',
            auth_modal_title: '登录 / 注册', close: '关闭',
            verify_email: '请先验证您的邮箱再登录。',
            reset_instructions: '输入您的邮箱以接收密码重置链接。',
            add_item: '添加商品', edit_item: '编辑', delete_item: '删除',
            item_name: '商品名称', item_description: '描述', item_price: '价格',
            item_category: '分类', item_image: '图片URL',
            go_online: '上线', go_offline: '下线', accept_order: '接受订单',
            order_accepted: '订单已接受', order_delivered: '订单已标记为送达'
        },
        sw: {
            site_name: 'PFG Chapati', home: 'Nyumbani', menu: 'Menyu',
            why: 'Kwanini PFG', vendors: 'Wauzaji',
            rider_dashboard: 'Dashibodi ya Mwendesha',
            vendor_dashboard: 'Dashibodi ya Muuzaji',
            my_orders: 'Maagizo Yangu', login: 'Ingia', logout: 'Toka',
            profile: 'Wasifu', settings: 'Mipangilio', order_now: 'Agiza Sasa',
            hero_title: 'Chapati Safi Zinazotumwa kwa Dakika 10',
            hero_subtitle: 'Agiza chapati moto kutoka popote Kampala na zifike mlangoni mwako kwa dakika 10 tu!',
            why_title: 'Kwanini Uchague PFG Chapati?',
            feature1_title: 'Uwasilishaji wa Dakika 10',
            feature1_desc: 'Tunahakikisha uwasilishaji ndani ya dakika 10 popote Kampala. Safi na moto!',
            feature2_title: 'Viungo Safi',
            feature2_desc: 'Tunakuunganisha na watengenezaji wanaotumia viungo safi zaidi.',
            feature3_title: 'Uwasilishaji Bure',
            feature3_desc: 'Uwasilishaji bure kwa maagizo zaidi ya 10,000 UGX. Hakuna malipo ya siri.',
            feature4_title: 'Chaguzi Mbalimbali',
            feature4_desc: 'Kutoka chapati plain hadi rolex na rolipizza – tunazo zote.',
            our_menu: 'Menyu Yetu', breakfast: 'Kiamsha kinywa',
            lunch: 'Chakula cha mchana', dinner: 'Chakula cha jioni',
            drinks: 'Vinywaji',
            find_vendors: 'Tafuta Watengenezaji Chapati Wanaoaminika Kampala',
            vendors_sub: 'Safi, moto, na tayari — ungana na wauzaji bora wa karibu nawe.',
            detect_location: 'Gundua eneo langu', search: 'Tafuta',
            your_cart: 'Rada Yako', subtotal: 'Jumla ndogo',
            discount: 'Punguzo', delivery_fee: 'Ada ya uwasilishaji',
            total: 'Jumla', checkout: 'Endelea na Malipo',
            whatsapp_order: 'Agiza kupitia WhatsApp', call_now: 'Piga Sasa',
            add_to_cart: 'Ongeza kwenye Rada',
            added_to_cart: '{name} imeongezwa kwenye rada!',
            empty_cart: 'Rada yako haina kitu',
            delivery_details: 'Maelezo ya Uwasilishaji',
            payment_method: 'Njia ya Malipo',
            cash_on_delivery: 'Malipo ya mkononi',
            mobile_money: 'Mobile Money', credit_card: 'Kadi ya mkopo',
            place_order: 'Weka Agizo',
            order_placed: 'Agizo limewekwa kwa mafanikio!',
            order_failed: 'Imeshindwa kuweka agizo',
            login_required: 'Tafadhali ingia kwanza',
            fill_details: 'Tafadhali jaza sehemu zote zinazohitajika',
            points_earned: 'Una pointi {points} (maagizo {beansCount} ya Kikomando)',
            redeem: 'Komboa pointi 100 kwa punguzo la 1000 UGX',
            discount_applied: 'Punguzo limetumika!',
            status_pending: 'Inasubiri', status_assigned: 'Imepewa',
            status_delivered: 'Imetolewa', accept: 'Kubali',
            mark_delivered: 'Weka kama imetolewa', today_earnings: 'Mapato ya Leo',
            total_earnings: 'Jumla ya Mapato', deliveries_today: 'Uwasilishaji Leo',
            rating: 'Ukadiriaji', assigned_orders: 'Maagizo Yaliyokabidhiwa',
            delivery_history: 'Historia ya Uwasilishaji',
            recent_orders: 'Maagizo ya Hivi Karibuni',
            pending_orders: 'Maagizo Yanayosubiri',
            today_orders: 'Maagizo ya Leo', total_sales: 'Jumla ya Mauzo',
            average_rating: 'Wastani wa Ukadiriaji',
            update_menu: 'Sasisha Menyu', view_reviews: 'Tazama Maoni',
            earnings_report: 'Ripoti ya Mapato', full_name: 'Jina Kamili',
            phone_number: 'Nambari ya Simu', email: 'Barua pepe',
            default_address: 'Anwani ya Uwasilishaji Chaguo-msingi',
            save_changes: 'Hifadhi Mabadiliko', change_photo: 'Badilisha Picha',
            business_info: 'Taarifa za Biashara',
            business_name: 'Jina la Biashara',
            business_address: 'Anwani ya Biashara',
            business_hours: 'Saa za Kazi',
            vehicle_info: 'Taarifa za Gari', vehicle_type: 'Aina ya Gari',
            license_plate: 'Nambari ya Leseni', notifications: 'Arifa',
            push_notifications: 'Arifa za Push', sms_notifications: 'Arifa za SMS',
            email_notifications: 'Arifa za Barua Pepe', language: 'Lugha',
            payment_methods: 'Njia za Malipo',
            privacy_security: 'Faragha na Usalama',
            change_password: 'Badilisha Nenosiri', delete_account: 'Futa Akaunti',
            quick_links: 'Viungo vya Haraka', contact: 'Wasiliana',
            privacy: 'Sera ya Faragha', terms: 'Masharti ya Huduma',
            cookies: 'Sera ya Vidakuzi',
            footer_desc: 'Kuunganisha vituo vya vitafunwa na wateja Kampala kwa dhamana ya dakika 10.',
            download_app: 'Pakua Programu', all_orders: 'Maagizo Yote',
            cancelled: 'Imeghairiwa', track_order: 'Fuatilia Agizo Lako',
            rider_location: 'Mahali pa Mwendesha', preparing: 'Inatayarishwa',
            out_for_delivery: 'Imetoka kwa uwasilishaji', delivered: 'Imetolewa',
            accepted: 'Imekubaliwa', offline: 'Nje ya mtandao', online: 'Mtandaoni',
            customer: 'Mteja', rider: 'Mwendesha', vendor: 'Muuzaji',
            save: 'Hifadhi', km_away: '{distance} km mbali',
            location_detected: 'Eneo limegunduliwa!', location_failed: 'Imeshindwa kugundua eneo',
            login_email: 'Ingia kwa Barua Pepe', signup: 'Jisajili',
            confirm_password: 'Thibitisha Nenosiri', forgot_password: 'Umesahau Nenosiri?',
            reset_password: 'Weka upya Nenosiri', no_account: 'Huna akaunti? Jisajili',
            have_account: 'Tayari una akaunti? Ingia', password_mismatch: 'Nenosiri hazilingani',
            login_success: 'Umeingia kwa mafanikio!', signup_success: 'Akaunti imeundwa kwa mafanikio!',
            reset_email_sent: 'Barua pepe ya kuweka upya nenosiri imetumwa.',
            auth_modal_title: 'Ingia / Jisajili', close: 'Funga',
            verify_email: 'Tafadhali thibitisha barua pepe yako kabla ya kuingia.',
            reset_instructions: 'Weka barua pepe yako kupokea kiungo cha kuweka upya nenosiri.',
            add_item: 'Ongeza Bidhaa', edit_item: 'Hariri', delete_item: 'Futa',
            item_name: 'Jina la Bidhaa', item_description: 'Maelezo', item_price: 'Bei',
            item_category: 'Aina', item_image: 'URL ya Picha',
            go_online: 'Nenda Mtandaoni', go_offline: 'Nje ya Mtandao',
            accept_order: 'Kubali Agizo', order_accepted: 'Agizo limekubaliwa',
            order_delivered: 'Agizo limewekwa kama limetolewa'
        },
        lg: {
            site_name: 'PFG Chapati', home: 'Maka', menu: 'Menu',
            why: 'Lwaki PFG', vendors: 'Abatundisi',
            rider_dashboard: 'Rider Dashboard', vendor_dashboard: 'Vendor Dashboard',
            my_orders: 'Ebiragiro Byange', profile: 'Profilu Yange',
            settings: 'Enteekateeka', login: 'Yingira', logout: 'Fuluma',
            save: 'Kwatira', save_changes: 'Kwatira Enkyusakyusa',
            cancel: 'Ggyako', confirm: 'Kakasa', loading: 'Kitunulwa...',
            error: 'Ensobi', success: 'Byakola', warning: 'Okwegendereza',
            info: 'Amakulu', order_now: 'Gula Kati',
            hero_title: 'Emmere Emiyo Egijja Mu Ddakiika 10',
            hero_subtitle: 'Gula emmere emiyo okuva mu Kampala yetuuke ewammwe mu ddakiika 10!',
            why_title: 'Lwaki Olonda PFG Chapati?',
            feature1_title: 'Okutuusa mu Ddakiika 10',
            feature1_desc: 'Tusuubira okutuusa mu ddakiika 10 wonna mu Kampala. Emiyo!',
            feature2_title: 'Ebirungo Ebiyaka',
            feature2_desc: 'Tukuwaganya n\'abakola abakozesa ebirungo ebiyaka.',
            feature3_title: 'Okutuusa Bwerere',
            feature3_desc: 'Okutuusa bwerere ku biragiro waggulu wa 10,000 UGX. Tewali nsasula zikusisa.',
            feature4_title: 'Enjawulo z\'Emmere',
            feature4_desc: 'Okuva ku chapati bulayi okutuuka ku rolex ne rolipizza – tulina byonna.',
            our_menu: 'Ebyokulya Byaffe', breakfast: 'Ekyenkya',
            lunch: 'Emisana', dinner: 'Ekiro', drinks: 'Ebyokunywa',
            find_vendors: 'Noonya Abatundisi Abeesigwa mu Kampala',
            vendors_sub: 'Emmere emiyo, etuuse – kwata ku batundisi abasinga okuba okumpi naawe.',
            detect_location: 'Noonya wendi', search: 'Noonya',
            your_cart: 'Ekitundu kyo', subtotal: 'Omuwendo gwonna',
            discount: 'Okukendeza', delivery_fee: 'Essasula y\'okutuusa',
            total: 'Omuwendo gwonna', checkout: 'Sasula',
            whatsapp_order: 'Gula ku WhatsApp', call_now: 'Kuba Essimu',
            add_to_cart: 'Teka mu Kikapu',
            added_to_cart: '{name} yateekebwa mu kikapu!',
            empty_cart: 'Ekitundu kyo kyangufu',
            delivery_details: 'Ebiriraga okutuusa',
            payment_method: 'Enkola y\'okusasula',
            cash_on_delivery: 'Sasula nga ofunye',
            mobile_money: 'Mobile Money', credit_card: 'Kaadi ya kukopa',
            place_order: 'Teeka Obulago',
            order_placed: 'Obulago buteekeddwa bulungi!',
            order_failed: 'Okuteeka obulago kugwa',
            login_required: 'Sooka yingira', fill_details: 'Jjuza ebifo byonna',
            points_earned: 'Olina pointi {points} (ebiragiro {beansCount} bya Kikomando)',
            redeem: 'Kozesa pointi 100 okkendeze 1000 UGX',
            discount_applied: 'Okukendeza kutekeddwa mu nkola!',
            status_pending: 'Kirinda', status_assigned: 'Kiweebwa',
            status_delivered: 'Kituuse', accept: 'Kkiriza',
            mark_delivered: 'Laga nti kituuse', today_earnings: 'Ebyenfuna Byolero',
            total_earnings: 'Ebyenfuna Byonna', deliveries_today: 'Ebyatuusibwa Olwaleero',
            rating: 'Okugezesebwa', assigned_orders: 'Ebiragiro Ebiweebwa',
            delivery_history: 'Ebyafaayo by\'Okutuusa',
            recent_orders: 'Ebiragiro Ebyasemba',
            pending_orders: 'Ebiragiro Ebirinda',
            today_orders: 'Ebiragiro Byolero', total_sales: 'Omuwendo gwonna ogutundiddwa',
            average_rating: 'Okugezesebwa okwawukana',
            update_menu: 'Fuuwa Menu', view_reviews: 'Laba Ebirowoozo',
            earnings_report: 'Lipoti ly\'Ebyenfuna', full_name: 'Erinnya Lyonna',
            phone_number: 'Essimu', email: 'Email',
            default_address: 'Endagiriro yo eya bulijjo',
            save_changes: 'Kwatira Enkyusa', change_photo: 'Kyusa Ekifaananyi',
            business_info: 'Amakulu g\'Obusuubuzi',
            business_name: 'Erinnya ly\'Obusuubuzi',
            business_address: 'Endagiriro y\'Obusuubuzi',
            business_hours: 'Essawa z\'Okukola',
            vehicle_info: 'Amakulu g\'Ekkubo', vehicle_type: 'Ekika ky\'Ekkubo',
            license_plate: 'Namba y\'Ekkubo', notifications: 'Okutegeza',
            push_notifications: 'Okutegeza kwa Push', sms_notifications: 'Okutegeza kwa SMS',
            email_notifications: 'Okutegeza kwa Email', language: 'Olulimi',
            payment_methods: 'Enkola z\'Okusasula',
            privacy_security: 'Ebyekyama n\'Obukuumi',
            change_password: 'Kyusa Ekigobyo', delete_account: 'Sanguwo Akaunti',
            quick_links: 'Empimo Ennyangu', contact: 'Okutukirira',
            privacy: 'Ebyekyama bya Policy', terms: 'Empisa z\'Okukozesa',
            cookies: 'Policy ya Cookies',
            footer_desc: 'Okwegatta ebyokulya n\'abaguzi mu Kampala n\'okukakasa ddakiika 10.',
            download_app: 'Wanuna App', all_orders: 'Ebiragiro Byonna',
            cancelled: 'Biziyiddwa', track_order: 'Londola Obulago Bwo',
            rider_location: 'Waliwo Omutambuza', preparing: 'Bitandika',
            out_for_delivery: 'Byakuyo', delivered: 'Bituuse',
            accepted: 'Byakkirizibwa', offline: 'Offline', online: 'Online',
            customer: 'Omuguzi', rider: 'Omutambuza', vendor: 'Omutundisi',
            save: 'Kwatira', km_away: '{distance} km nga wala',
            location_detected: 'Endagiriro yazuulibwa!', location_failed: 'Okuzuula endagiriro kwagwa',
            login_email: 'Yingira n\'Email', signup: 'Wewandyise',
            confirm_password: 'Kakasa Ekigobyo', forgot_password: 'Werabiddwa Ekigobyo?',
            reset_password: 'Ddamu Ekigobyo', no_account: 'Tolina akaunti? Wewandyise',
            have_account: 'Olina akaunti? Yingira', password_mismatch: 'Ebigobyo tebikwatagana',
            login_success: 'Oyingidde bulungi!', signup_success: 'Akaunti yo eteekeddwawo bulungi!',
            reset_email_sent: 'Email okuddamu ekigobyo yetumiddwa.',
            auth_modal_title: 'Yingira / Wewandyise', close: 'Ggalawo',
            verify_email: 'Kakasa email yo osooka oyingire.',
            reset_instructions: 'Teeka email yo okufuna link okuddamu ekigobyo.',
            add_item: 'Teka Ekintu', edit_item: 'Kyusa', delete_item: 'Sanguwo',
            item_name: 'Erinnya ly\'Ekintu', item_description: 'Okunnyonnyola',
            item_price: 'Omuwendo', item_category: 'Ekika', item_image: 'URL y\'Ekifaananyi',
            go_online: 'Yingira Online', go_offline: 'Fuluma',
            accept_order: 'Kkiriza Obulago', order_accepted: 'Obulago bukkiriziddwa',
            order_delivered: 'Obulago bulagiddwa nti butuuse'
        }
    };
    // -------------------- HELPER FUNCTIONS --------------------
    function translate(key, params = {}) {
        let text = translations[currentLang]?.[key] || translations.en[key] || key;
        for (const [param, value] of Object.entries(params)) {
            text = text.replace(`{${param}}`, value);
        }
        return text;
    }

    function updateUILanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = translate(key);
        });
    }

    function showNotification(message, type = 'info') {
        alert(message);
    }

    function formatCurrency(amount) {
        return 'UGX ' + amount.toLocaleString();
    }

    // -------------------- AUTH FUNCTIONS --------------------
    async function handleLogin(email, password) {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            showNotification(translate('login_success'), 'success');
            closeAuthModal();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    async function handleSignup(email, password, confirmPassword) {
        if (password !== confirmPassword) {
            showNotification(translate('password_mismatch'), 'error');
            return;
        }
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.sendEmailVerification();
            showNotification(translate('signup_success') + ' ' + translate('verify_email'), 'success');
            closeAuthModal();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    async function handlePasswordReset(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            showNotification(translate('reset_email_sent'), 'success');
            closeAuthModal();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    function openAuthModal() {
        if (elements.authModal) {
            elements.authModal.style.display = 'block';
            showLoginTab();
        }
    }

    function closeAuthModal() {
        if (elements.authModal) {
            elements.authModal.style.display = 'none';
            if (document.getElementById('loginEmail')) {
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';
                document.getElementById('signupEmail').value = '';
                document.getElementById('signupPassword').value = '';
                document.getElementById('signupConfirm').value = '';
            }
        }
    }

    function showLoginTab() {
        elements.authTabs.forEach(tab => tab.classList.remove('active'));
        elements.authForms.forEach(form => form.classList.remove('active'));
        document.querySelector('[data-auth-tab="login"]').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    }

    function showSignupTab() {
        elements.authTabs.forEach(tab => tab.classList.remove('active'));
        elements.authForms.forEach(form => form.classList.remove('active'));
        document.querySelector('[data-auth-tab="signup"]').classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }

    // -------------------- AUTH STATE OBSERVER --------------------
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        if (user) {
            elements.userInfo.style.display = 'flex';
            elements.loginBtn.style.display = 'none';
            elements.userName.textContent = user.email.split('@')[0];
            elements.userPhoto.src = user.photoURL || 'images/default-avatar.png';

            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                userRole = userDoc.data().role || 'customer';
                if (userDoc.data().role) {
                    elements.roleSelector.style.display = 'none';
                } else {
                    elements.roleSelector.style.display = 'flex';
                }
            } else {
                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    role: 'customer',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                userRole = 'customer';
                elements.roleSelector.style.display = 'none';
            }

            updateRoleBasedUI();
            loadUserSpecificData();
        } else {
            elements.userInfo.style.display = 'none';
            elements.loginBtn.style.display = 'flex';
            userRole = null;
            updateRoleBasedUI();
            if (elements.riderDashboard) elements.riderDashboard.style.display = 'none';
            if (elements.vendorDashboard) elements.vendorDashboard.style.display = 'none';
            document.getElementById('my-orders').style.display = 'none';
        }
    });

    function updateRoleBasedUI() {
        document.getElementById('riderLink').style.display = 'none';
        document.getElementById('vendorLink').style.display = 'none';
        document.getElementById('ordersLink').style.display = 'none';

        if (currentUser) {
            if (userRole === 'rider') {
                document.getElementById('riderLink').style.display = 'block';
                if (elements.riderDashboard) elements.riderDashboard.style.display = 'block';
            } else if (userRole === 'vendor') {
                document.getElementById('vendorLink').style.display = 'block';
                if (elements.vendorDashboard) elements.vendorDashboard.style.display = 'block';
            } else {
                document.getElementById('ordersLink').style.display = 'block';
                document.getElementById('my-orders').style.display = 'block';
            }
        }
    }

    async function loadUserSpecificData() {
        if (!currentUser) return;
        if (userRole === 'customer') {
            loadCustomerOrders();
        } else if (userRole === 'rider') {
            loadRiderDashboard();
        } else if (userRole === 'vendor') {
            loadVendorDashboard();
        }
                }
