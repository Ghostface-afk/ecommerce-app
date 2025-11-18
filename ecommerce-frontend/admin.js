// Separate JavaScript file for admin functionality
const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let allUsers = [];
let allProducts = [];
let categories = [];

// Check authentication and admin privileges
function checkAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        if (currentUser.role !== 'admin') {
            window.location.href = 'products.html';
            return;
        }
        updateNavigation();
        loadAdminData();
    } else {
        window.location.href = 'login.html';
    }
}

function updateNavigation() {
    const authLink = document.getElementById('auth-link');
    if (currentUser) {
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.onclick = logout;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Tab management
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
    switch(tabName) {
        case 'orders':
            loadOrdersQueue();
            break;
        case 'products':
            loadAdminProducts();
            break;
        case 'users':
            loadUsers();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}

// Load all admin data
async function loadAdminData() {
    await loadStats();
    await loadOrdersQueue();
    await loadAdminProducts();
    await loadUsers();
    await loadCategories();
}

// Stats loading
async function loadStats() {
    const token = localStorage.getItem('token');
    try {
        // Load orders for stats
        const ordersResponse = await fetch(`${API_BASE}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const queueResponse = await fetch(`${API_BASE}/orders/queue-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const productsResponse = await fetch(`${API_BASE}/products`);
        const usersResponse = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (ordersResponse.ok) {
            const orders = await ordersResponse.json();
            document.getElementById('total-orders').textContent = orders.length;
        }
        
        if (queueResponse.ok) {
            const queue = await queueResponse.json();
            document.getElementById('queue-orders').textContent = queue.queue_length;
        }
        
        if (productsResponse.ok) {
            const products = await productsResponse.json();
            document.getElementById('total-products').textContent = products.products ? products.products.length : products.length;
        }
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            document.getElementById('total-users').textContent = users.length;
        }
        
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Orders Queue functions
async function loadOrdersQueue() {
    const token = localStorage.getItem('token');
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
            <div class="order-actions">
                <button class="btn btn-primary" onclick="processSpecificOrder(${order.order_id})">
                    Process This Order
                </button>
            </div>
        </div>
    `).join('');
}

async function processNextOrder() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE}/orders/process-next`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(result.message, 'success');
            loadOrdersQueue();
            loadStats();
        } else {
            const data = await response.json();
            showNotification('Failed to process order: ' + data.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to process order: ' + error.message, 'error');
    }
}

async function processSpecificOrder(orderId) {
    if (!confirm('Process this specific order now?')) return;
    
    // This would require a separate endpoint in your backend
    showNotification('Feature coming soon!', 'info');
}

// Products Management
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
                <p>$${product.price} | Stock: ${product.stock_quantity}</p>
                <p>${product.description || 'No description'}</p>
                <p>Status: <span class="status-badge ${product.status}">${product.status}</span></p>
                ${product.image_url ? `
                    <img src="${product.image_url}" alt="${product.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-top: 0.5rem;">
                ` : ''}
            </div>
            <div class="product-actions">
                <button class="btn btn-danger" onclick="deleteProduct(${product.product_id})">
                    Delete
                </button>
                <button class="btn btn-warning" onclick="editProduct(${product.product_id})">
                    Edit
                </button>
                <button class="btn btn-secondary" onclick="toggleProductStatus(${product.product_id}, '${product.status}')">
                    ${product.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    `).join('');
}

function searchAdminProducts() {
    const query = document.getElementById('product-search').value.toLowerCase();
    
    if (!query) {
        displayAdminProducts(allProducts);
        return;
    }
    
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
    );
    
    displayAdminProducts(filtered);
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showNotification('Product deleted successfully', 'success');
            loadAdminProducts();
            loadStats();
        } else {
            const data = await response.json();
            showNotification('Failed to delete product: ' + data.message, 'error');
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

document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-desc').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock_quantity: parseInt(document.getElementById('product-stock').value),
        image_url: document.getElementById('product-image').value || null,
        category_id: parseInt(document.getElementById('product-category').value)
    };
    
    const token = localStorage.getItem('token');
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
            loadStats();
        } else {
            const error = await response.json();
            showNotification('Failed to add product: ' + error.message, 'error');
        }
    } catch (error) {
        showNotification('Failed to add product: ' + error.message, 'error');
    }
});

// User Management
async function loadUsers() {
    const token = localStorage.getItem('token');
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
                        Details
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
    
    const token = localStorage.getItem('token');
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

// Categories Management
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
    
    if (!categories || categories.length === 0) {
        container.innerHTML = '<p>No categories found.</p>';
        return;
    }
    
    container.innerHTML = categories.map(cat => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${cat.category_name}</h4>
                <p>${cat.description || 'No description'}</p>
            </div>
            <div class="category-actions">
                <button class="btn btn-danger" onclick="deleteCategory(${cat.category_id})">
                    Delete
                </button>
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
    
    const token = localStorage.getItem('token');
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
});

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const token = localStorage.getItem('token');
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

// Image Upload
document.getElementById('upload-image-form').addEventListener('submit', async (e) => {
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
        
        const token = localStorage.getItem('token');
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
                            Copy URL
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
});

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

// Utility functions
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

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('URL copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy URL', 'error');
    });
}

// Add CSS for notifications
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
    
    .admin-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
    }
    
    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .stat-card h3 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #3498db;
    }
    
    .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .inline-form {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        align-items: end;
    }
    
    .inline-form input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .upload-form {
        max-width: 500px;
    }
    
    .product-actions, .user-actions, .category-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 150px;
    }
    
    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }
    
    .role-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .role-badge.customer {
        background: #e3f2fd;
        color: #1976d2;
    }
    
    .role-badge.admin {
        background: #fff3e0;
        color: #f57c00;
    }
    
    .btn-warning {
        background: #ff9800;
        color: white;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('add-product-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});