const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Data structures status endpoint
app.get('/api/data-structures/status', (req, res) => {
  const { userActionStack, orderProcessingQueue, productCache } = require('./models/dataStructures');
  
  res.json({
    user_action_stack: {
      size: userActionStack.size(),
      can_undo: !userActionStack.isEmpty(),
      last_action: userActionStack.isEmpty() ? null : userActionStack.peek().action
    },
    order_processing_queue: {
      size: orderProcessingQueue.size(),
      next_order: orderProcessingQueue.isEmpty() ? null : orderProcessingQueue.front().order_id
    },
    product_cache: {
      size: 0, // HashTable size would need to be calculated
      has_all_products: productCache.has('all_products')
    }
  });
});

app.get('/', (req, res) => res.send('E-commerce backend running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
