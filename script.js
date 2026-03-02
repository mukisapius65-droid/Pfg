// ===== PFG Chapati - Complete Production Script =====
(function() {
    'use strict';

    // -------------------- Firebase Configuration --------------------
const firebaseConfig = {
  apiKey: "AIzaSyAGyOqUe-t04O2M6cU6Iqg8MV4V8S_a_mk",
  authDomain: "pfg-chapati.firebaseapp.com",
  projectId: "pfg-chapati",
  storageBucket: "pfg-chapati.firebasestorage.app",
  messagingSenderId: "903359666880",
  appId: "1:903359666880:web:3f0c4e659a97336b40eb25",
  measurementId: "G-241GDRBG8N"
};

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // -------------------- Global Variables --------------------
    let currentUser = null;
    let userRole = null;               // 'customer', 'rider', 'vendor'
    let cart = [];
    let rewards = { points: 0, beansCount: 0 };
    let userLocation = null;            // { lat, lng }
    let currentLang = 'en';
    let isCartOpen = false;
    let map = null;
    let riderMarker = null;
    let orderListener = null;

    // DOM Elements (populated later)
    const elements = {};

    // -------------------- Language Translations --------------------
    const translations = {
        en: {
            site_name: 'PFG Chapati',
            home: 'Home',
            menu: 'Menu',
            why: 'Why PFG',
            vendors: 'Vendors',
            rider_dashboard: 'Rider Dashboard',
            vendor_dashboard: 'Vendor Dashboard',
            my_orders: 'My Orders',
            login: 'Login',
            logout: 'Logout',
            profile: 'Profile',
            settings: 'Settings',
            order_now: 'Order Now',
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
            our_menu: 'Our Menu',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            drinks: 'Drinks',
            find_vendors: 'Find Trusted Chapati Makers in Kampala',
            vendors_sub: 'Fresh, hot, and ready — connect with the best local vendors near you.',
            detect_location: 'Detect my location',
            search: 'Search',
            your_cart: 'Your Cart',
            subtotal: 'Subtotal',
            discount: 'Discount',
            delivery_fee: 'Delivery Fee',
            total: 'Total',
            checkout: 'Proceed to Checkout',
            whatsapp_order: 'Order via WhatsApp',
            call_now: 'Call Now',
            add_to_cart: 'Add to Cart',
            added_to_cart: '{name} added to cart!',
            empty_cart: 'Your cart is empty',
            delivery_details: 'Delivery Details',
            payment_method: 'Payment Method',
            cash_on_delivery: 'Cash on Delivery',
            mobile_money: 'Mobile Money',
            credit_card: 'Credit Card',
            place_order: 'Place Order',
            order_placed: 'Order placed successfully!',
            order_failed: 'Failed to place order',
            login_required: 'Please login first',
            fill_details: 'Please fill in all required fields',
            points_earned: 'You have {points} points ({beansCount} Kikomando orders)',
            redeem: 'Redeem 100 points for 1000 UGX off',
            discount_applied: 'Discount applied at checkout!',
            status_pending: 'Pending',
            status_assigned: 'Assigned',
            status_delivered: 'Delivered',
            accept: 'Accept',
            mark_delivered: 'Mark Delivered',
            today_earnings: 'Today\'s Earnings',
            total_earnings: 'Total Earnings',
            deliveries_today: 'Deliveries Today',
            rating: 'Rating',
            assigned_orders: 'Assigned Orders',
            delivery_history: 'Delivery History',
            recent_orders: 'Recent Orders',
            pending_orders: 'Pending Orders',
            today_orders: 'Today\'s Orders',
            total_sales: 'Total Sales',
            average_rating: 'Average Rating',
            update_menu: 'Update Menu',
            view_reviews: 'View Reviews',
            earnings_report: 'Earnings Report',
            full_name: 'Full Name',
            phone_number: 'Phone Number',
            email: 'Email',
            default_address: 'Default Delivery Address',
            save_changes: 'Save Changes',
            change_photo: 'Change Photo',
            business_info: 'Business Information',
            business_name: 'Business Name',
            business_address: 'Business Address',
            business_hours: 'Business Hours',
            vehicle_info: 'Vehicle Information',
            vehicle_type: 'Vehicle Type',
            license_plate: 'License Plate',
            notifications: 'Notifications',
            push_notifications: 'Push Notifications',
            sms_notifications: 'SMS Notifications',
            email_notifications: 'Email Notifications',
            language: 'Language',
            payment_methods: 'Payment Methods',
            privacy_security: 'Privacy & Security',
            change_password: 'Change Password',
            delete_account: 'Delete Account',
            quick_links: 'Quick Links',
            contact: 'Contact',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            cookies: 'Cookie Policy',
            footer_desc: 'Bridging snack centers and customers in Kampala with a 10-minute guarantee.',
            download_app: 'Download App',
            all_orders: 'All Orders',
            cancelled: 'Cancelled',
            track_order: 'Track Your Order',
            rider_location: 'Rider Location',
            preparing: 'Preparing',
            out_for_delivery: 'Out for Delivery',
            delivered: 'Delivered',
            accepted: 'Accepted',
            offline: 'Offline',
            online: 'Online',
            customer: 'Customer',
            rider: 'Rider',
            vendor: 'Vendor',
            save: 'Save',
            km_away: '{distance} km away',
            location_detected: 'Location detected!',
            location_failed: 'Unable to detect location'
        },
        fr: {
            // French translations (condensed for brevity – same keys as English)
            site_name: 'PFG Chapati',
            home: 'Accueil',
            menu: 'Menu',
            why: 'Pourquoi PFG',
            vendors: 'Vendeurs',
            rider_dashboard: 'Tableau de bord livreur',
            vendor_dashboard: 'Tableau de bord vendeur',
            my_orders: 'Mes commandes',
            login: 'Se connecter',
            logout: 'Se déconnecter',
            profile: 'Profil',
            settings: 'Paramètres',
            order_now: 'Commander',
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
            our_menu: 'Notre menu',
            breakfast: 'Petit-déjeuner',
            lunch: 'Déjeuner',
            dinner: 'Dîner',
            drinks: 'Boissons',
            find_vendors: 'Trouvez des vendeurs de chapati fiables à Kampala',
            vendors_sub: 'Frais, chauds et prêts — connectez-vous avec les meilleurs vendeurs locaux près de chez vous.',
            detect_location: 'Détecter ma position',
            search: 'Rechercher',
            your_cart: 'Votre panier',
            subtotal: 'Sous-total',
            discount: 'Remise',
            delivery_fee: 'Frais de livraison',
            total: 'Total',
            checkout: 'Commander',
            whatsapp_order: 'Commander via WhatsApp',
            call_now: 'Appeler',
            add_to_cart: 'Ajouter au panier',
            added_to_cart: '{name} ajouté au panier!',
            empty_cart: 'Votre panier est vide',
            delivery_details: 'Détails de livraison',
            payment_method: 'Méthode de paiement',
            cash_on_delivery: 'Paiement à la livraison',
            mobile_money: 'Mobile Money',
            credit_card: 'Carte de crédit',
            place_order: 'Passer la commande',
            order_placed: 'Commande passée avec succès!',
            order_failed: 'Échec de la commande',
            login_required: 'Veuillez vous connecter d\'abord',
            fill_details: 'Veuillez remplir tous les champs requis',
            points_earned: 'Vous avez {points} points ({beansCount} commandes Kikomando)',
            redeem: 'Échanger 100 points pour 1000 UGX de réduction',
            discount_applied: 'Réduction appliquée!',
            status_pending: 'En attente',
            status_assigned: 'Assigné',
            status_delivered: 'Livré',
            accept: 'Accepter',
            mark_delivered: 'Marquer comme livré',
            today_earnings: 'Gains du jour',
            total_earnings: 'Gains totaux',
            deliveries_today: 'Livraisons aujourd\'hui',
            rating: 'Évaluation',
            assigned_orders: 'Commandes assignées',
            delivery_history: 'Historique des livraisons',
            recent_orders: 'Commandes récentes',
            pending_orders: 'Commandes en attente',
            today_orders: 'Commandes aujourd\'hui',
            total_sales: 'Ventes totales',
            average_rating: 'Note moyenne',
            update_menu: 'Mettre à jour le menu',
            view_reviews: 'Voir les avis',
            earnings_report: 'Rapport de gains',
            full_name: 'Nom complet',
            phone_number: 'Numéro de téléphone',
            email: 'E-mail',
            default_address: 'Adresse de livraison par défaut',
            save_changes: 'Enregistrer',
            change_photo: 'Changer la photo',
            business_info: 'Informations commerciales',
            business_name: 'Nom de l\'entreprise',
            business_address: 'Adresse de l\'entreprise',
            business_hours: 'Heures d\'ouverture',
            vehicle_info: 'Informations sur le véhicule',
            vehicle_type: 'Type de véhicule',
            license_plate: 'Plaque d\'immatriculation',
            notifications: 'Notifications',
            push_notifications: 'Notifications push',
            sms_notifications: 'Notifications SMS',
            email_notifications: 'Notifications e-mail',
            language: 'Langue',
            payment_methods: 'Moyens de paiement',
            privacy_security: 'Confidentialité et sécurité',
            change_password: 'Changer le mot de passe',
            delete_account: 'Supprimer le compte',
            quick_links: 'Liens rapides',
            contact: 'Contact',
            privacy: 'Politique de confidentialité',
            terms: 'Conditions d\'utilisation',
            cookies: 'Politique de cookies',
            footer_desc: 'Relier les snacks et les clients à Kampala avec une garantie de 10 minutes.',
            download_app: 'Télécharger l\'app',
            all_orders: 'Toutes les commandes',
            cancelled: 'Annulé',
            track_order: 'Suivre votre commande',
            rider_location: 'Position du livreur',
            preparing: 'Préparation',
            out_for_delivery: 'En cours de livraison',
            delivered: 'Livré',
            accepted: 'Accepté',
            offline: 'Hors ligne',
            online: 'En ligne',
            customer: 'Client',
            rider: 'Livreur',
            vendor: 'Vendeur',
            save: 'Enregistrer',
            km_away: 'À {distance} km',
            location_detected: 'Position détectée!',
            location_failed: 'Impossible de détecter la position'
        },
        zh: {
            // Chinese (simplified) – keys as above, values translated (omitted for brevity in this response)
            // In actual implementation, include all keys.
        },
        sw: {
            // Swahili – include all keys
        },
        lg: {
    // General
    site_name: 'PFG Chapati',
    home: 'Maka',
    menu: 'Menu',
    why: 'Lwaki PFG',
    vendors: 'Abatundisi',
    rider_dashboard: 'Rider Dashboard',
    vendor_dashboard: 'Vendor Dashboard',
    my_orders: 'Ebiragiro Byange',
    profile: 'Profilu Yange',
    settings: 'Enteekateeka',
    login: 'Yingira',
    logout: 'Fuluma',
    save: 'Kwatira',
    save_changes: 'Kwatira Enkyusakyusa',
    cancel: 'Ggyako',
    confirm: 'Kakasa',
    loading: 'Kitunulwa...',
    error: 'Ensobi',
    success: 'Byakola',
    warning: 'Okwegendereza',
    info: 'Amawulire',
    
    // Hero Section
    hero_title: 'Emmere Emiyungu Eweerezebwa Mu Ddakiika 10',
    hero_subtitle: 'Gula emmere omuyungu okuva wonna mu Kampala era eweerezebwe ku luggi lwo mu ddakiika 10 zokka!',
    order_now: 'Gula Kati',
    
    // Features
    why_title: 'Lwaki Olonda PFG Chapati?',
    feature1_title: 'Okuweereza Mu Ddakiika 10',
    feature1_desc: 'Tukakasa okuweereza mu ddakiika 10 wonna mu Kampala. Emiyungu era ebuguma!',
    feature2_title: 'Ebirungo Ebirowooze',
    feature2_desc: 'Tukutuusa ku bakola abakozesa ebirungo ebirowooze ennyo.',
    feature3_title: 'Okuweereza Bwerere',
    feature3_desc: 'Okuweereza bwerere ku nsasula ezisukka 10,000 UGX. Tewali nsasula ekyama.',
    feature4_title: 'Enjawulo y\'Emmere',
    feature4_desc: 'Okuva ku chapati yokka okutuuka ku rolex ne rolipizza – tusobola byonna.',
    
    // Menu
    our_menu: 'Emmere Yaffe',
    breakfast: 'Ekyenkya',
    lunch: 'Emisana',
    dinner: 'Eggulo',
    drinks: 'Ebyokunywa',
    add_to_cart: 'Teka mu Kitooleero',
    added_to_cart: '{name} kitekeddwa mu kitooleero!',
    price: 'Omutego',
    quantity: 'Omuwendo',
    description: 'Okunnyonnyola',
    
    // Cart
    your_cart: 'Ekitoleero Kyo',
    empty_cart: 'Ekitoleero kyo kiri kereere',
    subtotal: 'Omugatte Omutono',
    discount: 'Ekkaato',
    delivery_fee: 'Essasula y\'okuweereza',
    total: 'Omugatte Gwonna',
    checkout: 'Genda ku Kugula',
    whatsapp_order: 'Gula ng\'okozesa WhatsApp',
    delivery_details: 'Eby\'okuweereza',
    payment_method: 'Enkola y\'okusasula',
    cash_on_delivery: 'Ssasula ng\'ofuna',
    mobile_money: 'Mobile Money',
    credit_card: 'Kaadi ya Ssimu',
    place_order: 'Sasula',
    
    // Customer Info
    full_name: 'Erinnya Lyonna',
    phone_number: 'Essimu',
    email: 'Imeyo',
    default_address: 'Endagiriro yo',
    delivery_address: 'Endagiriro y\'okuweereza',
    special_instructions: 'Ebiragiro Eby\'enjawulo',
    
    // Order Status
    status_pending: 'Kirinda',
    status_assigned: 'Kiweereddwa',
    status_accepted: 'Kikkiriziddwa',
    status_preparing: 'Kiteekebwa',
    status_out_for_delivery: 'Kiweerezebwa',
    status_delivered: 'Kiweereddwa',
    status_cancelled: 'Kusazibbwa',
    track_order: 'Londola Ebiragiro',
    
    // Vendor Directory
    find_vendors: 'Funa Abatundisi Abeesigwa mu Kampala',
    vendors_sub: 'Emyaka, emmere emiyungu — weeyungine n\'abatundisi abali okumpi naawe.',
    detect_location: 'Ndaba wendi',
    location_detected: 'Wendi Olabiddwa!',
    location_failed: 'Okulaba Wendi Kulemereddwa',
    search: 'Noonya',
    search_vendors: 'Noonya abatundisi',
    km_away: '{distance} km ku weewawo',
    rating: 'Akalulu',
    
    // Rider Dashboard
    rider_dashboard: 'Rider Dashboard',
    today_earnings: 'By\'ofunye Leero',
    total_earnings: 'By\'ofunye Byonna',
    deliveries_today: 'Ebiweerezeddwa Leero',
    deliveries_total: 'Ebiweerezeddwa Byonna',
    online: 'Ndi ku mutimbagano',
    offline: 'Ndi wabweru',
    assigned_orders: 'Ebiragiro By\'oteekeddwa',
    delivery_history: 'Ebyafaayo by\'Okuweereza',
    accept: 'Kkiriza',
    mark_delivered: 'Mannya ng\'ebiweereddwa',
    complete_delivery: 'Maliriza Okuweereza',
    rider_location: 'Waliwo Rider',
    
    // Vendor Dashboard
    vendor_dashboard: 'Vendor Dashboard',
    today_orders: 'Ebiragiro Bya Leero',
    total_sales: 'Ebyaguzze Byonna',
    pending_orders: 'Ebiragiro Ebirinda',
    recent_orders: 'Ebiragiro Ebipya',
    average_rating: 'Akalulu Akawereza',
    update_menu: 'Kyusa Menu',
    view_reviews: 'Laba Ebirowoozo',
    earnings_report: 'Lipoti y\'Ensasula',
    add_new_item: 'Teka Emere Empya',
    current_items: 'Eby\'okulya Ebiriwo',
    item_name: 'Erinnya ly\'Emmere',
    item_price: 'Omutego gw\'Emmere',
    item_category: 'Ekika ky\'Emmere',
    item_description: 'Okunnyonnyola kw\'Emmere',
    item_image: 'Ekifaananyi ky\'Emmere',
    
    // Profile
    profile: 'Profilu Yange',
    edit_profile: 'Kyusa Profilu',
    change_photo: 'Kyusa Ekifaananyi',
    personal_info: 'Ebyo ku Nze',
    business_info: 'Eby\'Obusuubuzi',
    business_name: 'Erinnya ly\'Obusuubuzi',
    business_address: 'Endagiriro y\'Obusuubuzi',
    business_hours: 'Essawa z\'Okukola',
    vehicle_info: 'Eby\'Ekkubo',
    vehicle_type: 'Ekika ky\'Ekkubo',
    bicycle: 'Egaali',
    motorcycle: 'Piki piki',
    car: 'Emotoka',
    license_plate: 'Namba y\'Ekkubo',
    
    // Settings
    settings: 'Enteekateeka',
    notifications: 'Okumanyisibwa',
    push_notifications: 'Okumanyisibwa mu Ppuusi',
    sms_notifications: 'Okumanyisibwa mu Ssimu',
    email_notifications: 'Okumanyisibwa mu Imeyo',
    language: 'Olulimi',
    payment_methods: 'Enkola z\'Okusasula',
    privacy_security: 'Ekyama n\'Okwerinda',
    change_password: 'Kyusa Kiyubiddwa',
    delete_account: 'Ggyako Akaawunti',
    delete_account_confirm: 'Okakasa n\'oyagala okuggyako akaawunti yo? Ekyo tokikyalidde!',
    
    // Order Tracking
    track_order: 'Londola Ebiragiro',
    order_details: 'Eby\'Ekiragiro',
    order_number: 'Namba y\'Ekiragiro',
    order_date: 'Olunaku lw\'Ekiragiro',
    estimated_delivery: 'Okuweereza Kuteekebwa',
    rider_info: 'Ebya Rider',
    rider_name: 'Erinnya lya Rider',
    rider_phone: 'Essimu ya Rider',
    order_timeline: 'Enkola y\'Ekiragiro',
    pending_time: 'Ekiseera ky\'Okulinda',
    accepted_time: 'Ekiseera ky\'Okukkiriza',
    preparing_time: 'Ekiseera ky\'Okuteekeba',
    out_for_delivery_time: 'Ekiseera ky\'Okuweereza',
    delivered_time: 'Ekiseera ky\'Okuweereza',
    
    // Footer
    quick_links: 'Empiisa',
    contact: 'Okutukirira',
    contact_us: 'Tukirire',
    privacy: 'Enkola y\'Ebyama',
    terms: 'Embiiko z\'Okukozesa',
    cookies: 'Enkola y\'Cookies',
    footer_desc: 'Okutuusa abatundisi n\'abaguzi mu Kampala n\'obukakafu bwa ddakiika 10.',
    download_app: 'Wanula App',
    app_store: 'App Store',
    play_store: 'Google Play',
    social_media: 'Emikutu gy\'Empandwiki',
    copyright: 'Eddembe lyonna likuumiddwa',
    
    // Ads
    advertisement: 'Okulangirira',
    sponsored: 'Eky\'ekitongole',
    
    // Buttons
    continue: 'Weeyongereyo',
    back: 'Komawo',
    next: 'Okuddiri',
    finish: 'Maliriza',
    try_again: 'Gezaako nate',
    
    // Form Validation
    required_field: 'Ekifo kino kyetaagisa',
    invalid_email: 'Imeyo entali ntuufu',
    invalid_phone: 'Namba ya ssimu entali ntuufu',
    password_mismatch: 'Ekiyubiddwa tekifaanana',
    
    // Time
    minutes: 'dakiika',
    hours: 'essaawa',
    days: 'naku',
    now: 'kati',
    today: 'leero',
    tomorrow: 'nkya',
    yesterday: 'jjjo',
    
    // Common Phrases
    welcome: 'Tukusanyukidde',
    thank_you: 'Weebale',
    please: 'Nsaba',
    sorry: 'Nsonyiwa',
    yes: 'Ye',
    no: 'Nedda',
    ok: 'Ok',
    close: 'Ggalawo',
    open: 'Ggulawo',
    view: 'Laba',
    edit: 'Kyusa',
    delete: 'Ggyako',
    add: 'Teka',
    remove: 'Ggyako',
    
    // Currency
    ugx: 'UGX',
    
    // Errors
    login_required: 'Nsaba yingira okusobola okweyongerayo',
    fill_details: 'Jjuza ebifo byonna ebibeetaagisa',
    order_placed: 'Okugula kuwedde bulungi!',
    order_failed: 'Okugula kulemereddwa',
    network_error: 'Ensobi y\'omutimbagano',
    try_again_later: 'Gezaako nate oluvannyuma',
    
    // Rewards
    points_earned: 'Olina pointi {points} (emiramwa {beansCount} gya Kikomando)',
    redeem: 'Kozesa pointi 100 okufuna ekkaato 1000 UGX',
    discount_applied: 'Ekkaato likozeddwa!',
    
    // Categories
    all: 'Byonna',
    popular: 'Eby\'amaanyi',
    recommended: 'Ebirowooze',
    new: 'Ekipya',
    
    // User Types
    customer: 'Omuguzi',
    rider: 'Rider',
    vendor: 'Omutundisi',
    guest: 'Omugenzi',
    
    // Address
    city: 'Kibuga',
    district: 'Disitulikiti',
    village: 'Kyalo',
    landmark: 'Akamenkafuna',
    
    // Payment
    payment_successful: 'Okusasula kuwedde bulungi',
    payment_failed: 'Okusasula kulemereddwa',
    confirm_payment: 'Kakasa okusasula',
    select_payment: 'Londa enkola y\'okusasula',
    
    // Order
    order_summary: 'Eby\'ekiragiro mu bwangu',
    items_ordered: 'Eby\'okulya eby\'aguzibwa',
    order_total: 'Omugatte gw\'Ekiragiro',
    
    // Time Slots
    asap: 'Amangu ago',
    schedule: 'Geteekateeke',
    estimated_time: 'Ekiseera ekyateekebwa',
    
    // Ratings
    write_review: 'Wandika ekirowoozo',
    your_rating: 'Akalulu ko',
    submit_review: 'Ssa Ekirowoozo',
    
    // Search
    search_placeholder: 'Noonya...',
    search_results: 'Ebizuddwa',
    no_results: 'Tewali kizuddwa',
    
    // Filters
    filter: 'Yingiza',
    sort_by: 'Tondeka ku',
    nearest: 'Okumpi ennyo',
    highest_rated: 'Akalulu akawagi',
    price_low_to_high: 'Omutego okuva wansi okudda waggulu',
    price_high_to_low: 'Omutego okuva waggulu okudda wansi',
    
    // Quantity
    quantity: 'Omuwendo',
    min: 'Wansi',
    max: 'Waggulu',
    
    // Cart Actions
    update_cart: 'Kyusa Ekitoleero',
    clear_cart: 'Ggyako byonna',
    cart_updated: 'Ekitoleero kikyusiddwa',
    
    // Checkout
    confirm_order: 'Kakasa Ekiragiro',
    order_confirmed: 'Ekiragiro kikakasiddwa',
    thank_you_order: 'Weebale okugula, ekiragiro kyo kikakasiddwa',
    
    // Delivery
    prepare_for_delivery: 'Teekeba okuweereza',
    out_for_delivery: 'Kiweerezebwa',
    delivered: 'Kiweereddwa',
    delivery_instructions: 'Ebiragiro by\'okuweereza',
    
    // Support
    customer_support: 'Obuyambi',
    faq: 'Ebibuuzo Ebitera Okubuzibwa',
    help_center: 'Ekitongole ky\'obuyambi',
    live_chat: 'Okuyomba',
    
    // Time Expressions
    just_now: 'kati kati',
    minutes_ago: 'dakiika {count} eziyise',
    hours_ago: 'essaawa {count} eziyise',
    days_ago: 'naku {count} eziyise',
    
    // Distance
    meters: 'mita',
    kilometers: 'kilomita',
    
    // Weather (optional, for delivery conditions)
    weather: 'Obudde',
    rain: 'Enkuba',
    sunny: 'Njuba',
    cloudy: 'Ebire',
    
    // Holidays
    holiday: 'Olukuŋŋwana',
    special_hours: 'Essawa ezenjawulo',
    
    // Emergency
    emergency: 'Okwanguwo',
    report_issue: 'Teekawo ekizibu',
    
    // Feedback
    feedback: 'Ekirowoozo',
    rate_experience: 'Londa akalulu ku lwa okukozesa',
    tell_us_more: 'Tubuulire ebisingawo',
    
    // Invitations
    invite_friend: 'Yita mukwano',
    share_app: 'Gaba App',
    referral_code: 'Koodi y\'okuyita',
    
    // Loyalty
    loyalty_points: 'Pointi z\'obwesigwa',
    vip_status: 'Ndidila ya VIP',
    
    // Announcements
    announcement: 'Okulangirira',
    read_more: 'Soma ebisingawo',
    
    // System
    system_update: 'Enteekateeka ekyusiddwa',
    app_version: 'Endandika ya App',
    check_for_updates: 'Kebera enkyusakyusa'
        }
    };

    // -------------------- Menu Items --------------------
    const menuItems = [
        // Breakfast
        { id: 'b1', category: 'breakfast', name: 'Chapati Plain', price: 1000, image: '/images/chapati.jpg', description: 'Soft, fluffy plain chapati made with premium wheat flour.' },
        { id: 'b2', category: 'breakfast', name: 'Mandazi', price: 500, image: '/images/mandazi.jpg', description: 'Soft, fluffy East African doughnuts that are slightly sweet.' },
        { id: 'b3', category: 'breakfast', name: 'Tea', price: 500, image: '/images/tea.jpg', description: 'Hot milk tea - perfect with chapati.' },
        // Lunch
        { id: 'l1', category: 'lunch', name: 'Kikomando', price: 1500, image: '/images/kikomando.jpg', description: 'Chapati served with delicious beans, a popular Ugandan street food.' },
        { id: 'l2', category: 'lunch', name: 'Rolex', price: 1500, image: '/images/rolex.jpg', description: 'Ugandan favorite - chapati wrapped around eggs, vegetables.' },
        { id: 'l3', category: 'lunch', name: 'Chapati Beans', price: 2000, image: '/images/chapati-beans.jpg', description: 'Chapati with extra beans and vegetables.' },
        // Dinner
        { id: 'd1', category: 'dinner', name: 'Pizza', price: 2500, image: '/images/pizza.jpg', description: 'Delicious pizza with a variety of toppings, chapati-style crust.' },
        { id: 'd2', category: 'dinner', name: 'Rolipizza', price: 2000, image: '/images/rolipizza.jpg', description: 'Our unique creation - chapati rolled with pizza toppings.' },
        { id: 'd3', category: 'dinner', name: 'Chapati Meal', price: 3000, image: '/images/chapati-meal.jpg', description: 'Chapati served with beans, vegetables, and your choice of meat.' },
        // Drinks
        { id: 'dr1', category: 'drinks', name: 'Water', price: 500, image: '/images/water.jpg', description: 'Pure drinking water (500ml)' },
        { id: 'dr2', category: 'drinks', name: 'Soda', price: 1000, image: '/images/soda.jpg', description: 'Chilled soda - Coke, Fanta, Sprite' },
        { id: 'dr3', category: 'drinks', name: 'Yoghurt', price: 1500, image: '/images/yoghurt.jpg', description: 'Creamy yoghurt - plain or strawberry' },
        { id: 'dr4', category: 'drinks', name: 'Juice', price: 1500, image: '/images/juice.jpg', description: 'Fresh fruit juice - passion, mango, pineapple' }
    ];

    // -------------------- Utility Functions --------------------
    function t(key, replacements = {}) {
        let text = translations[currentLang]?.[key] || translations['en'][key] || key;
        for (let r in replacements) {
            text = text.replace(`{${r}}`, replacements[r]);
        }
        return text;
    }

    function updateLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('pfgLang', lang);
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t(key);
            } else if (el.tagName === 'OPTION') {
                el.textContent = t(key);
            } else {
                el.textContent = t(key);
            }
        });
        // Update dynamic content
        updateCart();
        if (elements.menuGrid) renderMenu(document.querySelector('.category-btn.active')?.dataset.category || 'breakfast');
    }

    function showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `message-popup ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 24px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white; border-radius: 8px; z-index: 3000; animation: slideInRight 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function showLoading(show) {
        if (elements.loadingSpinner) {
            elements.loadingSpinner.classList.toggle('active', show);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function calculateSubtotal() {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function calculateDeliveryFee(subtotal) {
        return subtotal >= 10000 ? 0 : 2000; // Free delivery above 10,000 UGX
    }

    function calculateTotal() {
        const subtotal = calculateSubtotal();
        const delivery = calculateDeliveryFee(subtotal);
        const discount = parseInt(sessionStorage.getItem('discount') || '0');
        return subtotal + delivery - discount;
    }

    function getDistance(loc1, loc2) {
        if (!loc1 || !loc2) return Infinity;
        const R = 6371;
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(loc1.lat * Math.PI/180) * Math.cos(loc2.lat * Math.PI/180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // -------------------- DOM Element Initialization --------------------
    function initElements() {
        const ids = [
            'mobileMenuBtn', 'navLinks', 'cartIcon', 'cartSidebar', 'closeCartBtn', 'overlay',
            'cartItems', 'cartCount', 'subtotalAmount', 'totalAmount', 'discountDisplay',
            'discountAmount', 'deliveryFee', 'checkoutBtn', 'whatsappCartBtn',
            'loadingSpinner', 'rewardInfo', 'loginBtn', 'logoutBtn', 'userInfo',
            'userPhoto', 'userName', 'riderLink', 'vendorLink', 'ordersLink', 'langSelect',
            'detectLocationBtn', 'locationStatus', 'vendorSearch', 'searchVendorsBtn',
            'vendorGrid', 'menuGrid', 'riderMap', 'assignedOrders', 'vendorOrders',
            'customerOrders', 'adSpace', 'cartCustomerName', 'cartCustomerPhone',
            'cartDeliveryAddress', 'cartSpecialInstructions', 'roleSelector',
            'roleSelect', 'saveRoleBtn', 'profileName', 'profilePhone', 'profileEmail',
            'profileAddress', 'businessName', 'businessAddress', 'businessHours',
            'vehicleType', 'licensePlate', 'saveProfileBtn', 'changePhotoBtn',
            'pushNotifications', 'smsNotifications', 'emailNotifications',
            'settingsLangSelect', 'changePasswordBtn', 'deleteAccountBtn',
            'riderOnlineToggle', 'riderStatusText', 'todayEarnings', 'totalEarnings',
            'deliveriesToday', 'riderRating', 'vendorTodayOrders', 'vendorTotalSales',
            'vendorPendingOrders', 'vendorRating', 'updateMenuBtn', 'viewReviewsBtn',
            'earningsReportBtn', 'orderTrackingModal', 'trackingMap', 'riderPhoto',
            'riderName', 'riderPhone', 'pendingTime', 'acceptedTime', 'preparingTime',
            'outForDeliveryTime', 'deliveredTime', 'statusPending', 'statusAccepted',
            'statusPreparing', 'statusOutForDelivery', 'statusDelivered'
        ];
        ids.forEach(id => elements[id] = document.getElementById(id));
        elements.categoryButtons = document.querySelectorAll('.category-btn');
        elements.orderTabs = document.querySelectorAll('.order-tab');
    }

    // -------------------- Scroll Behavior (Hide header items on scroll down) --------------------
    function initScrollBehavior() {
        let lastScrollY = window.scrollY;
        const header = document.querySelector('header');
        const headerTop = document.querySelector('.header-top');
        const headerActions = document.querySelector('.header-actions');
        const logo = document.querySelector('.logo');

        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                // Scrolling down – hide header actions (language, user auth, phone) but keep logo
                if (headerActions) headerActions.style.transform = 'translateY(-100%)';
                if (headerTop) headerTop.style.paddingBottom = '5px';
            } else {
                // Scrolling up – show header actions
                if (headerActions) headerActions.style.transform = 'translateY(0)';
                if (headerTop) headerTop.style.paddingBottom = '15px';
            }
            lastScrollY = window.scrollY;
        });
    }

    // -------------------- Mobile Menu --------------------
    function initMobileMenu() {
        if (!elements.mobileMenuBtn || !elements.navLinks) return;
        elements.mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.navLinks.classList.toggle('active');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                elements.navLinks.classList.remove('active');
            });
        });
        document.addEventListener('click', (e) => {
            if (!elements.navLinks.contains(e.target) && !elements.mobileMenuBtn.contains(e.target)) {
                elements.navLinks.classList.remove('active');
            }
        });
    }

    // -------------------- Authentication --------------------
    function initAuth() {
        auth.onAuthStateChanged(async user => {
            if (user) {
                currentUser = user;
                elements.loginBtn.style.display = 'none';
                elements.userInfo.style.display = 'flex';
                elements.userPhoto.src = user.photoURL || '/images/default-avatar.png';
                elements.userName.textContent = user.displayName || user.email;

                // Load user data from Firestore
                await loadUserFromFirestore(user.uid);
                // Load cart from Firestore or merge with local
                await loadCartFromFirestore(user.uid);

                // Show role-specific links
                if (userRole === 'rider') elements.riderLink.style.display = 'list-item';
                if (userRole === 'vendor') elements.vendorLink.style.display = 'list-item';
                if (userRole === 'customer') elements.ordersLink.style.display = 'list-item';

                // Initialize dashboards if on correct page
                if (userRole === 'rider' && window.location.hash === '#rider-dashboard') initRiderDashboard();
                if (userRole === 'vendor' && window.location.hash === '#vendor-dashboard') initVendorDashboard();
            } else {
                currentUser = null;
                userRole = null;
                elements.loginBtn.style.display = 'flex';
                elements.userInfo.style.display = 'none';
                elements.riderLink.style.display = 'none';
                elements.vendorLink.style.display = 'none';
                elements.ordersLink.style.display = 'none';
                // Load cart from localStorage
                loadCartFromLocalStorage();
            }
            updateCart();
        });

        elements.loginBtn.addEventListener('click', () => {
            auth.signInWithPopup(googleProvider)
                .then(result => {
                    return db.collection('users').doc(result.user.uid).get();
                })
                .then(doc => {
                    if (!doc.exists) {
                        // New user – show role selector
                        elements.roleSelector.style.display = 'flex';
                    } else {
                        elements.roleSelector.style.display = 'none';
                    }
                })
                .catch(error => showMessage(error.message, 'error'));
        });

        elements.logoutBtn.addEventListener('click', () => auth.signOut());

        elements.saveRoleBtn.addEventListener('click', async () => {
            const role = elements.roleSelect.value;
            if (!currentUser) return;
            try {
                await db.collection('users').doc(currentUser.uid).set({
                    email: currentUser.email,
                    name: currentUser.displayName,
                    role: role,
                    rewards: { points: 0, beansCount: 0 },
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                userRole = role;
                elements.roleSelector.style.display = 'none';
                showMessage('Role saved!', 'success');
                location.reload(); // Refresh to show correct dashboard
            } catch (error) {
                showMessage('Error saving role', 'error');
            }
        });
    }

    async function loadUserFromFirestore(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                userRole = data.role || 'customer';
                rewards = data.rewards || { points: 0, beansCount: 0 };
                // Fill profile fields
                if (elements.profileName) elements.profileName.value = data.name || '';
                if (elements.profilePhone) elements.profilePhone.value = data.phone || '';
                if (elements.profileEmail) elements.profileEmail.value = currentUser.email;
                if (elements.profileAddress) elements.profileAddress.value = data.address || '';
                if (elements.businessName) elements.businessName.value = data.businessName || '';
                if (elements.businessAddress) elements.businessAddress.value = data.businessAddress || '';
                if (elements.businessHours) elements.businessHours.value = data.businessHours || '';
                if (elements.vehicleType) elements.vehicleType.value = data.vehicleType || 'motorcycle';
                if (elements.licensePlate) elements.licensePlate.value = data.licensePlate || '';
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }

    async function loadCartFromFirestore(uid) {
        try {
            const cartDoc = await db.collection('carts').doc(uid).get();
            if (cartDoc.exists) {
                cart = cartDoc.data().items || [];
            } else {
                const localCart = loadCartFromLocalStorage();
                if (localCart.length > 0) {
                    cart = localCart;
                    await saveCartToFirestore();
                }
            }
        } catch (error) {
            console.error('Error loading cart from Firestore:', error);
            loadCartFromLocalStorage();
        }
    }

    function loadCartFromLocalStorage() {
        const saved = localStorage.getItem('pfgCart');
        if (saved) {
            try {
                cart = JSON.parse(saved);
            } catch { cart = []; }
        } else {
            cart = [];
        }
        return cart;
    }

    async function saveCartToFirestore() {
        if (currentUser) {
            try {
                await db.collection('carts').doc(currentUser.uid).set({
                    items: cart,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (error) {
                console.error('Error saving cart:', error);
            }
        }
        localStorage.setItem('pfgCart', JSON.stringify(cart));
    }

    // -------------------- Menu Rendering --------------------
    function renderMenu(category = 'breakfast') {
        if (!elements.menuGrid) return;
        const filtered = menuItems.filter(item => item.category === category);
        elements.menuGrid.innerHTML = filtered.map(item => `
            <div class="menu-item">
                <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='/images/placeholder.jpg'">
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="price">
                        <span>${item.price.toLocaleString()} UGX</span>
                        <button class="add-to-cart" 
                            data-id="${item.id}" 
                            data-name="${item.name}" 
                            data-price="${item.price}" 
                            data-image="${item.image}">${t('add_to_cart')}</button>
                    </div>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', handleAddToCart);
        });
    }

    function initCategoryTabs() {
        elements.categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderMenu(btn.dataset.category);
            });
        });
    }

    // -------------------- Cart Functions --------------------
    function handleAddToCart(e) {
        const btn = e.currentTarget;
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        const image = btn.dataset.image;

        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }

        // Beans reward (Kikomando id = 'l1')
        if (id === 'l1') {
            rewards.beansCount += 1;
            rewards.points += 10;
            if (currentUser) {
                db.collection('users').doc(currentUser.uid).update({ rewards });
            }
        }

        updateCart();
        saveCartToFirestore();
        openCart();
        showMessage(t('added_to_cart', { name }), 'success');

        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 150);
    }

    function openCart() {
        if (elements.cartSidebar) elements.cartSidebar.classList.add('active');
        if (elements.overlay) elements.overlay.classList.add('active');
        isCartOpen = true;
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        if (elements.cartSidebar) elements.cartSidebar.classList.remove('active');
        if (elements.overlay) elements.overlay.classList.remove('active');
        isCartOpen = false;
        document.body.style.overflow = '';
    }

    function updateCart() {
        if (!elements.cartItems || !elements.cartCount || !elements.subtotalAmount || !elements.totalAmount) return;

        const subtotal = calculateSubtotal();
        const delivery = calculateDeliveryFee(subtotal);
        const discount = parseInt(sessionStorage.getItem('discount') || '0');
        const total = subtotal + delivery - discount;

        // Render cart items
        if (cart.length === 0) {
            elements.cartItems.innerHTML = `<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>${t('empty_cart')}</p></div>`;
        } else {
            elements.cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='/images/placeholder.jpg'">
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
                </div>
            `).join('');
        }

        elements.cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
        elements.subtotalAmount.textContent = `${subtotal.toLocaleString()} UGX`;
        elements.deliveryFee.textContent = `${delivery.toLocaleString()} UGX`;
        if (discount > 0) {
            elements.discountDisplay.style.display = 'flex';
            elements.discountAmount.textContent = `-${discount.toLocaleString()} UGX`;
        } else {
            elements.discountDisplay.style.display = 'none';
        }
        elements.totalAmount.textContent = `${total.toLocaleString()} UGX`;

        // Update reward info
        if (elements.rewardInfo) {
            if (rewards.points >= 100) {
                elements.rewardInfo.innerHTML = `
                    <span>🎉 ${t('points_earned', { points: rewards.points, beansCount: rewards.beansCount })}</span>
                    <button class="redeem-btn" id="redeemBtn">${t('redeem')}</button>
                `;
                document.getElementById('redeemBtn')?.addEventListener('click', () => {
                    if (rewards.points >= 100) {
                        sessionStorage.setItem('discount', '1000');
                        rewards.points -= 100;
                        if (currentUser) {
                            db.collection('users').doc(currentUser.uid).update({ rewards });
                        }
                        updateCart();
                        showMessage(t('discount_applied'), 'success');
                    }
                });
            } else if (rewards.points > 0) {
                elements.rewardInfo.innerHTML = `🎉 ${t('points_earned', { points: rewards.points, beansCount: rewards.beansCount })}`;
            } else {
                elements.rewardInfo.innerHTML = '';
            }
        }

        // Update cart buttons state
        const isEmpty = cart.length === 0;
        elements.checkoutBtn.disabled = isEmpty;
        elements.whatsappCartBtn.disabled = isEmpty;

        // Attach quantity events
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const item = cart.find(i => i.id === id);
                if (item) {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                    } else {
                        cart = cart.filter(i => i.id !== id);
                    }
                    updateCart();
                    saveCartToFirestore();
                }
            });
        });
        document.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const item = cart.find(i => i.id === id);
                if (item) {
                    item.quantity += 1;
                    updateCart();
                    saveCartToFirestore();
                }
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                cart = cart.filter(i => i.id !== id);
                updateCart();
                saveCartToFirestore();
            });
        });
    }

    // -------------------- Checkout (Firebase) --------------------
    async function placeOrder() {
        if (!currentUser) {
            showMessage(t('login_required'), 'error');
            return;
        }
        if (cart.length === 0) return;

        const name = elements.cartCustomerName.value.trim();
        const phone = elements.cartCustomerPhone.value.trim();
        const address = elements.cartDeliveryAddress.value.trim();
        if (!name || !phone || !address) {
            showMessage(t('fill_details'), 'error');
            return;
        }

        showLoading(true);
        const subtotal = calculateSubtotal();
        const delivery = calculateDeliveryFee(subtotal);
        const discount = parseInt(sessionStorage.getItem('discount') || '0');
        const total = subtotal + delivery - discount;

        const orderData = {
            userId: currentUser.uid,
            items: cart,
            subtotal,
            deliveryFee: delivery,
            discountApplied: discount,
            total,
            customer: {
                name,
                phone,
                address,
                instructions: elements.cartSpecialInstructions.value
            },
            rewards: { ...rewards },
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('orders').add(orderData);
            // Clear cart
            cart = [];
            sessionStorage.removeItem('discount');
            updateCart();
            await saveCartToFirestore();
            closeCart();
            showMessage(t('order_placed'), 'success');
        } catch (error) {
            console.error('Order error:', error);
            showMessage(t('order_failed'), 'error');
        } finally {
            showLoading(false);
        }
    }

    // -------------------- WhatsApp Order (fallback) --------------------
    function sendWhatsAppOrder() {
        if (cart.length === 0) return;
        const phone = '256703055329'; // Your WhatsApp number
        const itemsText = cart.map(i => `${i.quantity}x ${i.name} @ ${i.price} UGX`).join('%0A');
        const subtotal = calculateSubtotal();
        const delivery = calculateDeliveryFee(subtotal);
        const total = subtotal + delivery;
        const name = elements.cartCustomerName.value || 'Not provided';
        const phoneNum = elements.cartCustomerPhone.value || 'Not provided';
        const address = elements.cartDeliveryAddress.value || 'Not provided';
        const message = `New Order from PFG Chapati:%0A%0A${itemsText}%0A%0ASubtotal: ${subtotal} UGX%0ADelivery: ${delivery} UGX%0ATotal: ${total} UGX%0A%0ACustomer: ${name}%0APhone: ${phoneNum}%0AAddress: ${address}`;
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }

    // -------------------- Location Detection & Vendors --------------------
    function initLocationDetection() {
        if (!elements.detectLocationBtn) return;
        elements.detectLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                showLoading(true);
                navigator.geolocation.getCurrentPosition(
                    pos => {
                        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        elements.locationStatus.textContent = t('location_detected');
                        showLoading(false);
                        loadVendors();
                    },
                    err => {
                        elements.locationStatus.textContent = t('location_failed');
                        showLoading(false);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                alert('Geolocation not supported');
            }
        });
    }

    async function loadVendors() {
        if (!elements.vendorGrid) return;
        showLoading(true);
        try {
            const snapshot = await db.collection('vendors').get();
            let vendors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const searchTerm = elements.vendorSearch?.value.toLowerCase() || '';
            if (searchTerm) {
                vendors = vendors.filter(v => 
                    v.name?.toLowerCase().includes(searchTerm) || 
                    v.location?.toLowerCase().includes(searchTerm)
                );
            }
            if (userLocation) {
                vendors.forEach(v => {
                    if (v.coords) {
                        v.distance = getDistance(userLocation, v.coords);
                    } else {
                        v.distance = Infinity;
                    }
                });
                vendors.sort((a, b) => a.distance - b.distance);
            }
            renderVendors(vendors);
        } catch (error) {
            console.error('Error loading vendors:', error);
        } finally {
            showLoading(false);
        }
    }

    function renderVendors(vendors) {
        if (!elements.vendorGrid) return;
        if (vendors.length === 0) {
            elements.vendorGrid.innerHTML = '<p class="no-results">No vendors found</p>';
            return;
        }
        elements.vendorGrid.innerHTML = vendors.map(v => `
            <div class="vendor-card">
                <div class="vendor-image">
                    <img src="${v.image || '/images/vendor-placeholder.jpg'}" alt="${v.name}" loading="lazy">
                    <span class="rating-badge">⭐ ${v.rating || '4.5'}</span>
                </div>
                <div class="vendor-info">
                    <h3>${v.name}</h3>
                    <p class="vendor-location">📍 ${v.location || 'Kampala'}</p>
                    <p class="vendor-price">UGX ${v.pricePerChapati || 1000} per chapati</p>
                    ${v.distance ? `<p class="vendor-distance">${t('km_away', { distance: v.distance.toFixed(1) })}</p>` : ''}
                    <button class="order-from-vendor" data-id="${v.id}">${t('order_now')}</button>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.order-from-vendor').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // -------------------- Rider Dashboard --------------------
    async function initRiderDashboard() {
        if (!currentUser || userRole !== 'rider') return;

        // Initialize map
        if (elements.riderMap && !map) {
            map = L.map('riderMap').setView([0.3136, 32.5811], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);
        }

        // Load rider stats
        loadRiderStats();

        // Listen for assigned orders
        if (orderListener) orderListener();
        orderListener = db.collection('orders')
            .where('status', 'in', ['pending', 'assigned'])
            .onSnapshot(snapshot => {
                updateRiderOrders(snapshot);
            }, error => console.error('Order listener error:', error));

        // Online/offline toggle
        elements.riderOnlineToggle?.addEventListener('change', async (e) => {
            const online = e.target.checked;
            elements.riderStatusText.textContent = online ? t('online') : t('offline');
            if (currentUser) {
                await db.collection('riders').doc(currentUser.uid).set({
                    online,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        });
    }

    async function loadRiderStats() {
        if (!currentUser) return;
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayTimestamp = firebase.firestore.Timestamp.fromDate(today);

        // Total earnings
        const earningsSnap = await db.collection('riders').doc(currentUser.uid).get();
        if (earningsSnap.exists) {
            const data = earningsSnap.data();
            elements.totalEarnings.textContent = `UGX ${(data.earnings || 0).toLocaleString()}`;
            elements.riderRating.textContent = `⭐ ${(data.rating || 0).toFixed(1)}`;
        }

        // Today's earnings and deliveries
        const todayOrders = await db.collection('orders')
            .where('riderId', '==', currentUser.uid)
            .where('deliveredAt', '>=', todayTimestamp)
            .get();
        let todayEarnings = 0;
        todayOrders.forEach(doc => {
            todayEarnings += doc.data().total * 0.1; // 10% commission
        });
        elements.todayEarnings.textContent = `UGX ${todayEarnings.toLocaleString()}`;
        elements.deliveriesToday.textContent = todayOrders.size;
    }

    function updateRiderOrders(snapshot) {
        if (!elements.assignedOrders) return;
        elements.assignedOrders.innerHTML = '';
        snapshot.forEach(doc => {
            const order = doc.data();
            const orderId = doc.id;
            const card = document.createElement('div');
            card.className = 'order-card';
            card.innerHTML = `
                <h4>Order #${orderId.slice(0,6)}</h4>
                <p><strong>${t('customer')}:</strong> ${order.customer?.name}</p>
                <p><strong>${t('phone_number')}:</strong> ${order.customer?.phone}</p>
                <p><strong>${t('default_address')}:</strong> ${order.customer?.address}</p>
                <p><strong>${t('total')}:</strong> UGX ${order.total}</p>
                <p><strong>${t('status_pending')}:</strong> <span class="status status-${order.status}">${t('status_' + order.status)}</span></p>
                <div class="order-actions">
                    ${order.status === 'pending' ? `<button class="accept-order" data-id="${orderId}">${t('accept')}</button>` : ''}
                    ${order.status === 'assigned' && order.riderId === currentUser?.uid ? `<button class="complete-order" data-id="${orderId}">${t('mark_delivered')}</button>` : ''}
                </div>
            `;
            elements.assignedOrders.appendChild(card);
        });

        document.querySelectorAll('.accept-order').forEach(btn => {
            btn.addEventListener('click', async e => {
                const orderId = e.target.dataset.id;
                try {
                    await db.collection('orders').doc(orderId).update({
                        status: 'assigned',
                        riderId: currentUser.uid,
                        acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    showMessage('Order accepted', 'success');
                } catch (error) {
                    showMessage('Failed to accept order', 'error');
                }
            });
        });

        document.querySelectorAll('.complete-order').forEach(btn => {
            btn.addEventListener('click', async e => {
                const orderId = e.target.dataset.id;
                try {
                    await db.collection('orders').doc(orderId).update({
                        status: 'delivered',
                        deliveredAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    // Add earnings
                    const orderDoc = await db.collection('orders').doc(orderId).get();
                    const order = orderDoc.data();
                    const earnings = order.total * 0.1;
                    await db.collection('riders').doc(currentUser.uid).set({
                        earnings: firebase.firestore.FieldValue.increment(earnings),
                        deliveries: firebase.firestore.FieldValue.increment(1)
                    }, { merge: true });
                    loadRiderStats();
                    showMessage('Order delivered!', 'success');
                } catch (error) {
                    showMessage('Failed to update order', 'error');
                }
            });
        });
    }

    // -------------------- Vendor Dashboard --------------------
    function initVendorDashboard() {
        if (!currentUser || userRole !== 'vendor') return;
        loadVendorStats();
        db.collection('orders')
            .where('vendorId', '==', currentUser.uid)
            .onSnapshot(snapshot => {
                updateVendorOrders(snapshot);
            });
    }

    async function loadVendorStats() {
        if (!currentUser) return;
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayTimestamp = firebase.firestore.Timestamp.fromDate(today);

        const ordersToday = await db.collection('orders')
            .where('vendorId', '==', currentUser.uid)
            .where('createdAt', '>=', todayTimestamp)
            .get();
        let totalSales = 0;
        let pending = 0;
        ordersToday.forEach(doc => {
            totalSales += doc.data().total;
            if (doc.data().status === 'pending') pending++;
        });
        elements.vendorTodayOrders.textContent = ordersToday.size;
        elements.vendorTotalSales.textContent = `UGX ${totalSales.toLocaleString()}`;
        elements.vendorPendingOrders.textContent = pending;

        const vendorDoc = await db.collection('vendors').doc(currentUser.uid).get();
        if (vendorDoc.exists) {
            elements.vendorRating.textContent = `⭐ ${(vendorDoc.data().rating || 0).toFixed(1)}`;
        }
    }

    function updateVendorOrders(snapshot) {
        if (!elements.vendorOrders) return;
        elements.vendorOrders.innerHTML = '';
        snapshot.forEach(doc => {
            const order = doc.data();
            const orderId = doc.id;
            const card = document.createElement('div');
            card.className = 'order-card';
            card.innerHTML = `
                <h4>Order #${orderId.slice(0,6)}</h4>
                <p><strong>${t('items')}:</strong> ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                <p><strong>${t('total')}:</strong> UGX ${order.total}</p>
                <p><strong>${t('status')}:</strong> <span class="status status-${order.status}">${t('status_' + order.status)}</span></p>
                <p><strong>${t('rider')}:</strong> ${order.riderId || 'Not assigned'}</p>
            `;
            elements.vendorOrders.appendChild(card);
        });
    }

    // -------------------- Customer Orders --------------------
    function loadCustomerOrders(status = 'all') {
        if (!currentUser || !elements.customerOrders) return;
        let query = db.collection('orders').where('userId', '==', currentUser.uid);
        if (status !== 'all') {
            query = query.where('status', '==', status);
        }
        query.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            elements.customerOrders.innerHTML = '';
            snapshot.forEach(doc => {
                const order = doc.data();
                const orderId = doc.id;
                const card = document.createElement('div');
                card.className = 'order-card';
                card.innerHTML = `
                    <h4>Order #${orderId.slice(0,6)}</h4>
                    <p><strong>${t('items')}:</strong> ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                    <p><strong>${t('total')}:</strong> UGX ${order.total}</p>
                    <p><strong>${t('status')}:</strong> <span class="status status-${order.status}">${t('status_' + order.status)}</span></p>
                    <p><strong>${t('createdAt')}:</strong> ${order.createdAt?.toDate().toLocaleString()}</p>
                    ${order.status !== 'delivered' ? `<button class="track-order" data-id="${orderId}">${t('track_order')}</button>` : ''}
                `;
                elements.customerOrders.appendChild(card);
            });

            document.querySelectorAll('.track-order').forEach(btn => {
                btn.addEventListener('click', () => openOrderTracking(btn.dataset.id));
            });
        });
    }

    function initOrderTabs() {
        elements.orderTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                elements.orderTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                loadCustomerOrders(tab.dataset.orderStatus);
            });
        });
    }

    // -------------------- Order Tracking Modal --------------------
    async
