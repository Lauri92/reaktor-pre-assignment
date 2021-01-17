'use strict';

const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

// Request updating cache
router.get('/allproducts', productController.get_all_product_info);

// Request for a specific category
router.get('/specific/:category', productController.get_product_category);

module.exports = router;