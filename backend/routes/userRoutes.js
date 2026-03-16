const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const dataMasking = require('../middleware/dataMasking')();
const { body } = require('express-validator');

// Validation middleware
const signupValidation = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('levelId').isInt({ min: 0, max: 7 }).withMessage('Invalid user level'),
];

// User authentication routes
router.post('/login', userController.login);
router.post('/signup', signupValidation, userController.signup);

// Protected routes (require authentication middleware)
router.post('/verify', userController.verifyUser);
router.post('/supreme-override', userController.supremeOverride);

// User profile routes with data masking
router.get('/profile/:userId',
  dataMasking.maskSensitiveData,
  userController.getUserProfile
);

router.get('/verification-status/:userId', userController.getVerificationStatus);

// Data masking status endpoint
router.get('/masking-status', dataMasking.getMaskingStatus);

module.exports = router;