const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const Cart = require('../models/cartModel');
const { verifyToken, authorizeRoles } = require('../utils/auth');

router.post('/place', verifyToken, async (req,res)=>{
  const user_id=req.user.id; const { payment_method }=req.body;
  const cartItems = await Cart.getCartItems(user_id);
  if(!cartItems.length) return res.status(400).json({message:'Cart empty'});
  const total = cartItems.reduce((sum,item)=>sum+item.price*item.quantity,0);
  const payment_id = await Payment.createPayment({order_id:null,amount:total,payment_method,status:'pending'});
  const order_id = await Order.createOrder(user_id,payment_id,total,'pending');
  for(const i of cartItems) await Order.addOrderItem(order_id,i.product_id,i.quantity,i.price);
  await Payment.updatePaymentOrder(payment_id,order_id,'completed');
  await Cart.clearCart(user_id);
  res.json({message:'Order placed', order_id, total});
});

router.get('/my', verifyToken, async (req,res)=>{ const orders = await Order.getOrdersByUser(req.user.id); res.json(orders); });
router.get('/:orderId', verifyToken, async (req,res)=>{ const d=await Order.getOrderDetails(req.params.orderId); res.json(d); });
router.get('/', verifyToken, authorizeRoles('admin'), async (req,res)=>{ const orders=await Order.getAllOrders(); res.json(orders); });

module.exports = router;
