const express = require('express');
const router = express.Router();
const Cart = require('../models/cartModel');
const { userActionStack } = require('../models/dataStructures');
const { verifyToken } = require('../utils/auth');

// Helper to push action to stack
const pushAction = (action, data) => {
  userActionStack.push({
    action,
    data,
    timestamp: new Date()
  });
  console.log(`Action '${action}' pushed to stack. Stack size: ${userActionStack.size()}`);
};

// Get cart items
router.get('/', verifyToken, async (req, res) => {
  const items = await Cart.getCartItems(req.user.id);
  res.json(items);
});

// Add to cart with undo tracking
router.post('/add', verifyToken, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  
  try {
    // Get current cart state for undo
    const currentCart = await Cart.getCartItems(req.user.id);
    
    const cart_id = await Cart.addToCart(req.user.id, product_id, quantity);
    
    // Push undo action
    pushAction('add_to_cart', {
      previous_state: currentCart,
      added_item: { product_id, quantity },
      user_id: req.user.id
    });

    res.json({ message: 'Added to cart', cart_id, stack_size: userActionStack.size() });
  } catch (err) {
    res.status(500).json({ message: 'Add to cart failed', error: err.message });
  }
});

// Update cart item with undo tracking
router.put('/update', verifyToken, async (req, res) => {
  const { cart_id, quantity } = req.body;
  
  try {
    // Get current state for undo
    const currentCart = await Cart.getCartItems(req.user.id);
    const itemToUpdate = currentCart.find(item => item.cart_id === cart_id);
    
    if (!itemToUpdate) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await Cart.updateCartItem(cart_id, quantity);
    
    // Push undo action
    pushAction('update_cart', {
      previous_state: currentCart,
      updated_item: { cart_id, old_quantity: itemToUpdate.quantity, new_quantity: quantity },
      user_id: req.user.id
    });

    res.json({ message: 'Cart updated', stack_size: userActionStack.size() });
  } catch (err) {
    res.status(500).json({ message: 'Cart update failed', error: err.message });
  }
});

// Remove from cart with undo tracking
router.delete('/remove/:cart_id', verifyToken, async (req, res) => {
  try {
    // Get current state for undo
    const currentCart = await Cart.getCartItems(req.user.id);
    const itemToRemove = currentCart.find(item => item.cart_id === parseInt(req.params.cart_id));
    
    if (!itemToRemove) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await Cart.removeCartItem(req.params.cart_id);
    
    // Push undo action
    pushAction('remove_from_cart', {
      previous_state: currentCart,
      removed_item: itemToRemove,
      user_id: req.user.id
    });

    res.json({ message: 'Item removed from cart', stack_size: userActionStack.size() });
  } catch (err) {
    res.status(500).json({ message: 'Remove from cart failed', error: err.message });
  }
});

// Undo last action
router.post('/undo', verifyToken, async (req, res) => {
  try {
    const lastAction = userActionStack.pop();
    
    if (!lastAction) {
      return res.status(400).json({ message: 'No actions to undo' });
    }

    console.log(`Undoing action: ${lastAction.action}`);
    
    // Clear current cart
    await Cart.clearCart(req.user.id);
    
    // Restore previous state
    if (lastAction.data.previous_state && lastAction.data.previous_state.length > 0) {
      for (const item of lastAction.data.previous_state) {
        await Cart.addToCart(req.user.id, item.product_id, item.quantity);
      }
    }

    res.json({
      message: `Undid ${lastAction.action}`,
      undone_action: lastAction.action,
      remaining_actions: userActionStack.size()
    });

  } catch (err) {
    res.status(500).json({ message: 'Undo failed', error: err.message });
  }
});

// Get undo stack info
router.get('/undo-info', verifyToken, async (req, res) => {
  const stackInfo = {
    size: userActionStack.size(),
    can_undo: !userActionStack.isEmpty(),
    last_action: userActionStack.isEmpty() ? null : userActionStack.peek().action
  };
  
  res.json(stackInfo);
});

// Clear cart with undo tracking
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    // Get current state for undo
    const currentCart = await Cart.getCartItems(req.user.id);
    
    await Cart.clearCart(req.user.id);
    
    // Push undo action
    pushAction('clear_cart', {
      previous_state: currentCart,
      user_id: req.user.id
    });

    res.json({ message: 'Cart cleared', stack_size: userActionStack.size() });
  } catch (err) {
    res.status(500).json({ message: 'Clear cart failed', error: err.message });
  }
});

module.exports = router;