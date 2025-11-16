const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../utils/auth');

// Placeholder: could combine admin management here
router.use(verifyToken, authorizeRoles('admin'), (req,res,next)=>next());
router.get('/', (req,res)=>res.json({message:'Admin area'}));

module.exports = router;
