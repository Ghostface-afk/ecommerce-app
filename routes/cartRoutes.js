const express = require('express');
const router = express.Router();
const Cart = require('../models/cartModel');
const { verifyToken } = require('../utils/auth');

router.get('/', verifyToken, async (req,res)=>{ const items=await Cart.getCartItems(req.user.id); res.json(items); });
router.post('/add', verifyToken, async (req,res)=>{ const {product_id,quantity}=req.body; const cart_id=await Cart.addToCart(req.user.id,product_id,quantity); res.json({message:'Added',cart_id}); });
router.put('/update', verifyToken, async (req,res)=>{ await Cart.updateCartItem(req.body.cart_id, req.body.quantity); res.json({message:'Updated'}); });
router.delete('/remove/:cart_id', verifyToken, async (req,res)=>{ await Cart.removeCartItem(req.params.cart_id); res.json({message:'Removed'}); });
router.delete('/clear', verifyToken, async (req,res)=>{ await Cart.clearCart(req.user.id); res.json({message:'Cleared'}); });

module.exports = router;
