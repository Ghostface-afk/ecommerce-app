const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let products = [];
let cart = [];
let categories = [];
let allUsers = [];
let allProducts = [];
let sidebarCollapsed = false;

// Initialize the application
function initApp() {
    initializeSidebar();
    setupEventListeners();
    checkAuthentication();
}

// Sidebar functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleSidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Toggle sidebar
    function toggleSidebar() {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
        mainContent.classList.toggle('collapsed', sidebarCollapsed);
        mainContent.classList.toggle('expanded', !sidebarCollapsed);
        
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    }

    // Mobile toggle
    function toggleMobileSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    // Event listeners
    toggleBtn.addEventListener('click', toggleSidebar);
    mobileToggle.addEventListener('click', toggleMobileSidebar);
    overlay.addEventListener('click', toggleMobileSidebar);

    // Load saved state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebarCollapsed = true;
        sidebar.classList.add('collapsed');
        mainContent.classList.add('collapsed');
    } else {
        mainContent.classList.add('expanded');
    }

    // Close sidebar on mobile when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMobileSidebar();
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    document.getElementById('add-category-form').addEventListener('submit', handleAddCategory);
    document.getElementById('upload-image-form').addEventListener('submit', handleImageUpload);

    // Image preview
    document.getElementById('image-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('preview-img').src = e.target.result;
                document.getElementById('image-preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });

    // Window click handlers
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
}

// Authentication check
function checkAuthentication() {
    const token = getToken();
    if (token) {
        verifyToken(token);
    } else {
        showPage('login');
    }
}

// Verify token and get user info
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            updateNavigation();
            showPage('products');
        } else {
            throw new Error('Invalid token');
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        removeToken();
        showPage('login');
    }
}

// Enhanced page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update page title
    updatePageTitle(pageId);
    
    // Load page-specific data
    loadPageData(pageId);
}

function updatePageTitle(pageId) {
    const pageTitle = document.getElementById('page-title');
    const titles = {
        'products': 'Our Products',
        'cart': 'Shopping Cart',
        'orders': 'My Orders',
        'admin': 'Admin Dashboard',
        'login': 'Login to Your Account',
        'register': 'Create Account',
        'checkout': 'Checkout'
    };
    
    pageTitle.textContent = titles[pageId] || 'ShopEasy';
}

function loadPageData(pageId) {
    switch(pageId) {
        case 'products':
            loadProducts();
            loadDataStructuresInfo();
            break;
        case 'cart':
            loadCart();
            loadUndoInfo();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'admin':
            if (currentUser && currentUser.role === 'admin') {
                loadAdminData();
            } else {
                showPage('products');
            }
            break;
    }
}

// Enhanced navigation update
function updateNavigation() {
    const authLink = document.getElementById('auth-link');
    const authText = document.getElementById('auth-text');
    const adminLink = document.getElementById('admin-link');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    
    if (currentUser) {
        // Update auth link for logout
        authText.textContent = 'Logout';
        authLink.onclick = handleLogout;
        
        // Show user info
        userInfo.style.display = 'flex';
        userName.textContent = currentUser.name;
        userRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        
        // Show/hide admin link
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'flex';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        // Reset to login state
        authText.textContent = 'Login';
        authLink.onclick = () => showPage('login');
        userInfo.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// Utility functions
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function showMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => element.style.display = 'none', 3000);
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 4px;
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#4caf50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#2196f3';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Auth handlers
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            setToken(data.token);
            currentUser = data.user;
            updateNavigation();
            showMessage('login-message', 'Login successful!', 'success');
            setTimeout(() => showPage('products'), 1000);
        } else {
            showMessage('login-message', data.message);
        }
    } catch (error) {
        showMessage('login-message', 'Login failed: ' + error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        phone: document.getElementById('register-phone').value,
        address: document.getElementById('register-address').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('register-message', 'Registration successful! Please login.', 'success');
            setTimeout(() => showPage('login'), 2000);
        } else {
            showMessage('register-message', data.message);
        }
    } catch (error) {
        showMessage('register-message', 'Registration failed: ' + error.message);
    }
}

function handleLogout() {
    currentUser = null;
    removeToken();
    updateNavigation();
    showPage('login');
}

// Products functions
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const data = await response.json();
        
        if (response.ok) {
            products = data.products || data;
            displayProducts(products);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

// Enhanced Product Display with Ksh Currency
function displayProducts(productsToDisplay) {
    const grid = document.getElementById('products-grid');
    
    if (!productsToDisplay || productsToDisplay.length === 0) {
        grid.innerHTML = '<p>No products found.</p>';
        return;
    }
    
    grid.innerHTML = productsToDisplay.map(product => `
        <div class="product-card" onclick="showProductDetails(${product.product_id})">
            ${product.image_url ? 
                `<img src="${product.image_url}" alt="${product.name}" class="product-image">` : 
                '<div class="product-image" style="background:#eee;display:flex;align-items:center;justify-content:center;">No Image</div>'
            }
            <h3>${product.name}</h3>
            <p>${product.description || 'No description available'}</p>
            <div class="product-price">${product.price}</div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${product.product_id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
    );
    displayProducts(filtered);
}

// Cart Functions
async function loadCart() {
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            cart = await response.json();
            displayCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Failed to load cart:', error);
    }
}

// Enhanced Cart Display with Ksh Currency
function displayCart() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cart || cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalElement.textContent = '0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Ksh ${item.price} each</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartItem(${item.cart_id}, ${item.quantity - 1})">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItem(${item.cart_id}, ${item.quantity + 1})">+</button>
                </div>
                <div style="font-weight: bold;">Ksh ${(item.price * item.quantity).toFixed(2)}</div>
                <button class="btn btn-danger" onclick="removeFromCart(${item.cart_id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    totalElement.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
}

// Enhanced Add to Cart with immediate feedback
async function addToCart(productId) {
    const token = getToken();
    if (!token) {
        showPage('login');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        
        if (response.ok) {
            await loadCart(); // Wait for cart to reload
            loadUndoInfo();
            showNotification('Product added to cart!', 'success');
            
            // Update cart count immediately
            updateCartCount();
        }
    } catch (error) {
        console.error('Failed to add to cart:', error);
        showNotification('Failed to add product to cart', 'error');
    }
}


// Enhanced Update Cart Item
async function updateCartItem(cartId, quantity) {
    if (quantity < 1) {
        await removeFromCart(cartId);
        return;
    }
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cart_id: cartId, quantity })
        });
        
        if (response.ok) {
            await loadCart(); // Wait for cart to reload
            loadUndoInfo();
            
            // Update cart count immediately
            updateCartCount();
        }
    } catch (error) {
        console.error('Failed to update cart:', error);
    }
}

// Enhanced Remove from Cart
async function removeFromCart(cartId) {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/cart/remove/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            await loadCart(); // Wait for cart to reload
            loadUndoInfo();
            showNotification('Product removed from cart', 'success');
            
            // Update cart count immediately
            updateCartCount();
        }
    } catch (error) {
        console.error('Failed to remove from cart:', error);
        showNotification('Failed to remove product from cart', 'error');
    }
}

async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/cart/clear`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadCart();
            loadUndoInfo();
            showNotification('Cart cleared successfully!', 'success');
        }
    } catch (error) {
        console.error('Failed to clear cart:', error);
    }
}

// Enhanced Cart Count Management
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    cartCountElement.textContent = count;
    
    // Add animation when count changes
    if (count > parseInt(cartCountElement.dataset.prevCount || 0)) {
        cartCountElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCountElement.style.transform = 'scale(1)';
        }, 300);
    }
    cartCountElement.dataset.prevCount = count;
}

// Undo functionality
async function loadUndoInfo() {
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/cart/undo-info`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const info = await response.json();
            const undoBtn = document.getElementById('undo-btn');
            undoBtn.disabled = !info.can_undo;
            
            if (info.can_undo) {
                undoBtn.title = `Undo: ${info.last_action}`;
            }
        }
    } catch (error) {
        console.error('Failed to load undo info:', error);
    }
}

async function undoLastAction() {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/cart/undo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            loadCart();
            loadUndoInfo();
            showNotification(`Undid ${result.undone_action}`, 'success');
        }
    } catch (error) {
        console.error('Failed to undo:', error);
    }
}

// Enhanced Checkout Summary with Ksh
function checkout() {
    showPage('checkout');
    
    const summary = document.getElementById('checkout-summary');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    summary.innerHTML = `
        <h3>Order Summary</h3>
        ${cart.map(item => `
            <div style="display:flex;justify-content:space-between;margin:0.5rem 0;padding:0.5rem;background:#f8f9fa;border-radius:6px;">
                <span>${item.name} x ${item.quantity}</span>
                <span style="font-weight:bold;">Ksh ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <hr>
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:1.1rem;padding:1rem 0;">
            <span>Total:</span>
            <span>Ksh ${total.toFixed(2)}</span>
        </div>
    `;
}

// Initialize tooltips
function initializeTooltips() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tooltips = {
        'products': 'Products',
        'cart': 'Shopping Cart',
        'orders': 'My Orders',
        'admin': 'Admin Dashboard',
        'auth-link': 'Login/Logout'
    };
    
    navLinks.forEach(link => {
        const page = link.onclick ? link.onclick.toString().match(/showPage\('(\w+)'\)/)?.[1] : null;
        if (page && tooltips[page]) {
            link.setAttribute('data-tooltip', tooltips[page]);
        } else if (link.id === 'auth-link') {
            link.setAttribute('data-tooltip', tooltips['auth-link']);
        }
    });
}

async function handleCheckout(e) {
    e.preventDefault();
    
    const paymentMethod = document.getElementById('payment-method').value;
    const token = getToken();
    
    try {
        const response = await fetch(`${API_BASE}/orders/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ payment_method: paymentMethod })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Order placed successfully! Order ID: ${data.order_id}`, 'success');
            cart = [];
            updateCartCount();
            setTimeout(() => showPage('orders'), 2000);
        } else {
            showNotification('Order failed: ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('Checkout failed: ' + error.message, 'error');
    }
}

// Orders
async function loadOrders() {
    const token = getToken();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE}/orders/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const orders = await response.json();
            displayOrders(orders);
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p>No orders found.</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>Order #${order.order_id}</h4>
                <p>Date: ${new Date(order.order_date).toLocaleDateString()}</p>
                <p>Total: $${order.total_amount}</p>
                <p>Status: ${order.status}</p>
            </div>
            <button class="btn btn-primary" onclick="viewOrderDetails(${order.order_id})">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `).join('');
}

async function viewOrderDetails(orderId) {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const details = await response.json();
            alert(`Order Details:\n${details.map(item => 
                `${item.product_name} x ${item.quantity} - $${item.price_at_purchase} each`
            ).join('\n')}`);
        }
    } catch (error) {
        console.error('Failed to load order details:', error);
    }
}

// Data Structures Info
async function loadDataStructuresInfo() {
    try {
        const response = await fetch(`${API_BASE}/data-structures/status`);
        if (response.ok) {
            const status = await response.json();
            
            document.getElementById('stack-info').textContent = 
                `Stack: ${status.user_action_stack.size} actions`;
            
            document.getElementById('queue-info').textContent = 
                `Queue: ${status.order_processing_queue.size} orders`;
            
            document.getElementById('cache-info').textContent = 
                `Cache: ${status.product_cache.has_all_products ? 'Active' : 'Inactive'}`;
        }
    } catch (error) {
        console.error('Failed to load data structures info:', error);
    }
}

// Admin Functions
function openAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.currentTarget.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'users') {
        loadUsers();
    }
}

async function loadAdminData() {
    await loadOrdersQueue();
    await loadAdminProducts();
    await loadCategories();
}

async function loadOrdersQueue() {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/orders/queue-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const queueInfo = await response.json();
            displayOrdersQueue(queueInfo);
        }
    } catch (error) {
        console.error('Failed to load orders queue:', error);
    }
}

function displayOrdersQueue(queueInfo) {
    const container = document.getElementById('orders-queue');
    
    if (!queueInfo.orders_in_queue || queueInfo.orders_in_queue.length === 0) {
        container.innerHTML = '<p>No orders in the processing queue.</p>';
        return;
    }
    
    container.innerHTML = queueInfo.orders_in_queue.map(order => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>Order #${order.order_id}</h4>
                <p>User ID: ${order.user_id}</p>
                <p>Total: $${order.total_amount}</p>
                <p>Items: ${order.items.length} products</p>
                <p>Position in queue: ${order.position}</p>
                <p>Added: ${new Date(order.timestamp).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

async function processNextOrder() {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/orders/process-next`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(result.message, 'success');
            loadOrdersQueue();
        }
    } catch (error) {
        showNotification('Failed to process order: ' + error.message, 'error');
    }
}

async function loadAdminProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            const data = await response.json();
            allProducts = data.products || data;
            displayAdminProducts(allProducts);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

// Enhanced Admin Products Display with Edit Button
function displayAdminProducts(products) {
    const container = document.getElementById('admin-products-list');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${product.name}</h4>
                <p>Ksh ${product.price} | Stock: ${product.stock_quantity}</p>
                <p>${product.description || 'No description'}</p>
                <p>Status: <span class="status-badge ${product.status}">${product.status}</span></p>
                ${product.image_url ? `
                    <img src="${product.image_url}" alt="${product.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-top: 0.5rem;">
                ` : ''}
            </div>
            <div class="product-actions">
                <button class="btn btn-warning" onclick="editProduct(${product.product_id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.product_id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <button class="btn btn-secondary" onclick="toggleProductStatus(${product.product_id}, '${product.status}')">
                    <i class="fas fa-power-off"></i> ${product.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `).join('');
}

// Toggle Product Status
async function toggleProductStatus(productId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this product?`)) return;
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showNotification(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
            loadAdminProducts();
        } else {
            const error = await response.json();
            showNotification('Failed to update product status: ' + error.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to update product status: ' + error.message, 'error');
    }
}

// Order Status Management for Admin
async function loadAllOrders() {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const orders = await response.json();
            displayAllOrders(orders);
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

function displayAllOrders(orders) {
    const container = document.getElementById('orders-queue');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p>No orders found.</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>Order #${order.order_id}</h4>
                <p>Customer: ${order.customer_name || `User ${order.user_id}`}</p>
                <p>Date: ${new Date(order.order_date).toLocaleDateString()}</p>
                <p>Total: Ksh ${order.total_amount}</p>
                <p>Items: ${order.items_count || 'N/A'}</p>
            </div>
            <div class="order-actions">
                <select id="status-select-${order.order_id}" onchange="updateOrderStatus(${order.order_id})">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="viewOrderDetails(${order.order_id})">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function updateOrderStatus(orderId) {
    const select = document.getElementById(`status-select-${orderId}`);
    const newStatus = select.value;
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showNotification(`Order status updated to ${newStatus}`, 'success');
        } else {
            const data = await response.json();
            showNotification('Failed to update order status: ' + data.message, 'error');
            // Reset to original value
            loadAllOrders();
        }
    } catch (error) {
        showNotification('Failed to update order status: ' + error.message, 'error');
        // Reset to original value
        loadAllOrders();
    }
}



// Product Edit Functionality
let editingProductId = null;

function editProduct(productId) {
    editingProductId = productId;
    const product = allProducts.find(p => p.product_id === productId);
    
    if (product) {
        document.getElementById('edit-product-id').value = product.product_id;
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-desc').value = product.description || '';
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-stock').value = product.stock_quantity;
        document.getElementById('edit-product-image').value = product.image_url || '';
        document.getElementById('edit-product-status').value = product.status || 'active';
        
        // Load categories for dropdown
        loadCategoriesForEditSelect().then(() => {
            document.getElementById('edit-product-category').value = product.category_id || '';
        });
        
        document.getElementById('edit-product-modal').style.display = 'block';
    }
}

function closeEditProductModal() {
    document.getElementById('edit-product-modal').style.display = 'none';
    editingProductId = null;
    document.getElementById('edit-product-form').reset();
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showNotification('Product deleted successfully', 'success');
            loadAdminProducts();
        }
    } catch (error) {
        showNotification('Failed to delete product: ' + error.message, 'error');
    }
}

function showAddProductForm() {
    document.getElementById('add-product-modal').style.display = 'block';
    loadCategoriesForSelect();
}

function closeAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'none';
}

async function loadCategoriesForSelect() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
            categories = await response.json();
            const select = document.getElementById('product-category');
            select.innerHTML = '<option value="">Select Category</option>' +
                categories.map(cat => 
                    `<option value="${cat.category_id}">${cat.category_name}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadCategoriesForEditSelect() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
            const categories = await response.json();
            const select = document.getElementById('edit-product-category');
            select.innerHTML = '<option value="">Select Category</option>' +
                categories.map(cat => 
                    `<option value="${cat.category_id}">${cat.category_name}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Handle Edit Product Form Submission
document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('edit-product-name').value,
        description: document.getElementById('edit-product-desc').value,
        price: parseFloat(document.getElementById('edit-product-price').value),
        stock_quantity: parseInt(document.getElementById('edit-product-stock').value),
        image_url: document.getElementById('edit-product-image').value || null,
        category_id: parseInt(document.getElementById('edit-product-category').value) || null,
        status: document.getElementById('edit-product-status').value
    };
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/admin/products/${editingProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Product updated successfully', 'success');
            closeEditProductModal();
            loadAdminProducts();
        } else {
            const error = await response.json();
            showNotification('Failed to update product: ' + error.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to update product: ' + error.message, 'error');
    }
});

async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-desc').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock_quantity: parseInt(document.getElementById('product-stock').value),
        image_url: document.getElementById('product-image').value,
        category_id: parseInt(document.getElementById('product-category').value)
    };
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/admin/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Product added successfully', 'success');
            closeAddProductModal();
            document.getElementById('add-product-form').reset();
            loadAdminProducts();
        } else {
            const error = await response.json();
            showNotification('Failed to add product: ' + error.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to add product: ' + error.message, 'error');
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
            categories = await response.json();
            displayCategories(categories);
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function displayCategories(categories) {
    const container = document.getElementById('categories-list');
    
    container.innerHTML = categories.map(cat => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${cat.category_name}</h4>
                <p>${cat.description || 'No description'}</p>
            </div>
            <div class="category-actions">
                <button class="btn btn-danger" onclick="deleteCategory(${cat.category_id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function handleAddCategory(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-desc').value
    };
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/admin/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Category added successfully', 'success');
            document.getElementById('add-category-form').reset();
            loadCategories();
        } else {
            const error = await response.json();
            showNotification('Failed to add category: ' + error.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to add category: ' + error.message, 'error');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showNotification('Category deleted successfully', 'success');
            loadCategories();
        } else {
            const data = await response.json();
            showNotification('Failed to delete category: ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to delete category: ' + error.message, 'error');
    }
}

// User Management
async function loadUsers() {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            allUsers = await response.json();
            displayUsers(allUsers);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

function displayUsers(users) {
    const container = document.getElementById('users-list');
    
    if (!users || users.length === 0) {
        container.innerHTML = '<p>No users found.</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${user.name} (${user.email})</h4>
                <p>Phone: ${user.phone || 'N/A'} | Role: 
                    <span class="role-badge ${user.role}">${user.role}</span>
                </p>
                <p>Registered: ${new Date(user.date_created).toLocaleDateString()}</p>
                <p>Address: ${user.address || 'N/A'}</p>
            </div>
            <div class="user-actions">
                <select id="role-select-${user.user_id}" onchange="updateUserRole(${user.user_id})">
                    <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="showUserDetails(${user.user_id})">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function searchUsers() {
    const query = document.getElementById('user-search').value.toLowerCase();
    
    if (!query) {
        displayUsers(allUsers);
        return;
    }
    
    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query)) ||
        user.role.toLowerCase().includes(query)
    );
    
    displayUsers(filteredUsers);
}

async function updateUserRole(userId) {
    const select = document.getElementById(`role-select-${userId}`);
    const newRole = select.value;
    const user = allUsers.find(u => u.user_id === userId);
    
    if (!confirm(`Change ${user.name}'s role from ${user.role} to ${newRole}?`)) {
        // Reset to original value
        select.value = user.role;
        return;
    }
    
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update local data
            user.role = newRole;
            showNotification(`Successfully updated ${user.name}'s role to ${newRole}`, 'success');
        } else {
            showNotification('Failed to update role: ' + data.message, 'error');
            // Reset select to original value
            select.value = user.role;
        }
    } catch (error) {
        showNotification('Failed to update role: ' + error.message, 'error');
        // Reset select to original value
        select.value = user.role;
    }
}

// Image Upload
async function handleImageUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('image-file');
    const fileName = document.getElementById('image-filename').value;
    
    if (!fileInput.files[0]) {
        showNotification('Please select a file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64 = e.target.result.split(',')[1];
        
        const token = getToken();
        try {
            const response = await fetch(`${API_BASE}/admin/upload-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    image_file: base64,
                    fileName: fileName || fileInput.files[0].name
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                document.getElementById('upload-result').innerHTML = `
                    <div class="message success">
                        <h4>Image uploaded successfully!</h4>
                        <p><strong>URL:</strong></p>
                        <input type="text" value="${result.url}" readonly 
                               style="width:100%;padding:0.5rem;margin:0.5rem 0;border:1px solid #ddd;border-radius:4px;">
                        <p><strong>File ID:</strong> ${result.fileId}</p>
                        <button onclick="copyToClipboard('${result.url}')" class="btn btn-secondary" style="margin-top:0.5rem;">
                            <i class="fas fa-copy"></i> Copy URL
                        </button>
                    </div>
                `;
                showNotification('Image uploaded successfully!', 'success');
            } else {
                document.getElementById('upload-result').innerHTML = `
                    <div class="message error">
                        Upload failed: ${result.message}
                    </div>
                `;
            }
        } catch (error) {
            document.getElementById('upload-result').innerHTML = `
                <div class="message error">
                    Upload failed: ${error.message}
                </div>
            `;
        }
    };
    
    reader.readAsDataURL(fileInput.files[0]);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('URL copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy URL', 'error');
    });
}

// Product Details Modal
async function showProductDetails(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        if (response.ok) {
            const product = (await response.json()).product;
            
            const modal = document.getElementById('product-modal');
            const content = document.getElementById('modal-product-details');
            
            content.innerHTML = `
                <h2>${product.name}</h2>
                ${product.image_url ? 
                    `<img src="${product.image_url}" alt="${product.name}" style="width:100%;max-height:300px;object-fit:cover;margin:1rem 0;">` : 
                    ''
                }
                <p><strong>Description:</strong> ${product.description || 'No description available'}</p>
                <p><strong>Price:</strong> $${product.price}</p>
                <p><strong>Stock:</strong> ${product.stock_quantity} available</p>
                <button class="btn btn-primary" onclick="addToCart(${product.product_id}); closeModal()">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            `;
            
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to load product details:', error);
    }
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    document.getElementById('add-product-modal').style.display = 'none';
}

// Initialize the app when DOM is loaded
// Update initialization to include tooltips
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    initializeTooltips();
});