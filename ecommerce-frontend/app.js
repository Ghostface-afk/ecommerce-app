const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let products = [];
let cart = [];
let categories = [];

// Utility functions
function showMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => element.style.display = 'none', 3000);
    }
}

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // Load page-specific data
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
            }
            break;
    }
}

// Authentication
document.getElementById('login-form').addEventListener('submit', async (e) => {
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
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
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
});

function updateNavigation() {
    const authLink = document.getElementById('auth-link');
    const adminLink = document.getElementById('admin-link');
    
    if (currentUser) {
        authLink.textContent = 'Logout';
        authLink.onclick = logout;
        
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        }
    } else {
        authLink.textContent = 'Login';
        authLink.onclick = () => showPage('login');
        adminLink.style.display = 'none';
    }
}

function logout() {
    currentUser = null;
    removeToken();
    updateNavigation();
    showPage('login');
}

// Products
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
            <div class="product-price">$${product.price}</div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${product.product_id})">
                    Add to Cart
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
                <p>$${item.price} each</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartItem(${item.cart_id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItem(${item.cart_id}, ${item.quantity + 1})">+</button>
                </div>
                <div>$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="btn btn-danger" onclick="removeFromCart(${item.cart_id})">Remove</button>
            </div>
        </div>
    `).join('');
    
    totalElement.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
}

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
            loadCart();
            loadUndoInfo();
            alert('Product added to cart!');
        }
    } catch (error) {
        console.error('Failed to add to cart:', error);
    }
}

async function updateCartItem(cartId, quantity) {
    if (quantity < 1) {
        removeFromCart(cartId);
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
            loadCart();
            loadUndoInfo();
        }
    } catch (error) {
        console.error('Failed to update cart:', error);
    }
}

async function removeFromCart(cartId) {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE}/cart/remove/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadCart();
            loadUndoInfo();
        }
    } catch (error) {
        console.error('Failed to remove from cart:', error);
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
        }
    } catch (error) {
        console.error('Failed to clear cart:', error);
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
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
            alert(`Undid ${result.undone_action}`);
        }
    } catch (error) {
        console.error('Failed to undo:', error);
    }
}

// Checkout
async function checkout() {
    showPage('checkout');
    
    const summary = document.getElementById('checkout-summary');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    summary.innerHTML = `
        <h3>Order Summary</h3>
        ${cart.map(item => `
            <div style="display:flex;justify-content:space-between;margin:0.5rem 0;">
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('')}
        <hr>
        <div style="display:flex;justify-content:space-between;font-weight:bold;">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;
}

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
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
            alert(`Order placed successfully! Order ID: ${data.order_id}`);
            cart = [];
            updateCartCount();
            showPage('orders');
        } else {
            alert('Order failed: ' + data.message);
        }
    } catch (error) {
        alert('Checkout failed: ' + error.message);
    }
});

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
                View Details
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
    
    container.innerHTML = `
        <p>Orders in queue: ${queueInfo.queue_length}</p>
        ${queueInfo.orders_in_queue.map(order => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>Order #${order.order_id}</h4>
                    <p>User: ${order.user_id}</p>
                    <p>Total: $${order.total_amount}</p>
                    <p>Position: ${order.position}</p>
                </div>
            </div>
        `).join('')}
    `;
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
            alert(result.message);
            loadOrdersQueue();
        }
    } catch (error) {
        console.error('Failed to process order:', error);
    }
}

async function loadAdminProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            const products = await response.json();
            displayAdminProducts(products.products || products);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

function displayAdminProducts(products) {
    const container = document.getElementById('admin-products-list');
    
    container.innerHTML = products.map(product => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${product.name}</h4>
                <p>$${product.price} | Stock: ${product.stock_quantity}</p>
                <p>${product.description}</p>
            </div>
            <div>
                <button class="btn btn-danger" onclick="deleteProduct(${product.product_id})">Delete</button>
            </div>
        </div>
    `).join('');
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
            alert('Product deleted successfully');
            loadAdminProducts();
        }
    } catch (error) {
        console.error('Failed to delete product:', error);
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

document.getElementById('add-product-form').addEventListener('submit', async (e) => {
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
            alert('Product added successfully');
            closeAddProductModal();
            loadAdminProducts();
        } else {
            const error = await response.json();
            alert('Failed to add product: ' + error.message);
        }
    } catch (error) {
        alert('Failed to add product: ' + error.message);
    }
});

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
        </div>
    `).join('');
}

document.getElementById('add-category-form').addEventListener('submit', async (e) => {
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
            alert('Category added successfully');
            document.getElementById('add-category-form').reset();
            loadCategories();
        }
    } catch (error) {
        alert('Failed to add category: ' + error.message);
    }
});

// Image Upload
document.getElementById('upload-image-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('image-file');
    const fileName = document.getElementById('image-filename').value;
    
    if (!fileInput.files[0]) {
        alert('Please select a file');
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
                        Image uploaded successfully!<br>
                        URL: <input type="text" value="${result.url}" readonly style="width:100%;margin-top:0.5rem;">
                    </div>
                `;
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
});

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
                    Add to Cart
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
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    
    const addProductModal = document.getElementById('add-product-modal');
    if (event.target === addProductModal) {
        addProductModal.style.display = 'none';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = getToken();
    if (token) {
        // Verify token and get user info
        fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                removeToken();
                throw new Error('Invalid token');
            }
        })
        .then(user => {
            currentUser = user;
            updateNavigation();
            showPage('products');
        })
        .catch(error => {
            console.error('Token verification failed:', error);
            showPage('login');
        });
    } else {
        showPage('login');
    }
    
    // Close modal with X button
    document.querySelector('.close').addEventListener('click', closeModal);
});