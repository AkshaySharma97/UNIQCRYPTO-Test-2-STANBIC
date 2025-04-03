const express = require('express');
const router = express.Router();
const { isAdmin, authenticateToken } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const { limitLoginAttempts, limitOTPRequests } = require('../middlewares/rateLimit');
const { validateRegistration, validateLogin, validateLogout } = require('../middlewares/validateInput');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and session management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user via Telegram or WhatsApp
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - phone
 *               - dob
 *               - referral_code
 *               - passcode
 *               - platform
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               referral_code:
 *                 type: string
 *                 example: "ABC123"
 *               passcode:
 *                 type: string
 *                 example: "securepass123"
 *               platform:
 *                 type: string
 *                 enum: [telegram, whatsapp]
 *                 example: telegram
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/register', limitOTPRequests, validateRegistration, authController.register);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for user registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP or expired
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login with passcode
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - phone
 *               - passcode
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               passcode:
 *                 type: string
 *                 example: securepass123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
router.post('/login', limitLoginAttempts, validateLogin, authController.login);

/**
 * @swagger
 * /api/auth/send-mfa-otp:
 *   post:
 *     summary: Send OTP for Multi-Factor Authentication (MFA)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - phone
 *               - platform
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [telegram, whatsapp]
 *                 example: telegram
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: MFA OTP sent successfully
 *       400:
 *         description: Error in sending OTP
 */
router.post('/send-mfa-otp', authController.sendMFAOTP);

/**
 * @swagger
 * /api/auth/verify-mfa-otp:
 *   post:
 *     summary: Verify MFA OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               otp:
 *                 type: string
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: MFA OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-mfa-otp', authController.verifyMFAOTP);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - refreshToken
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               refreshToken:
 *                 type: string
 *                 example: "token here"
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       403:
 *         description: Forbidden - Invalid or expired token
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and invalidate session
 *     tags: [Auth]
 *     description: |
 *       This endpoint logs out the user by invalidating their session.
 *       The user must provide a valid JWT token in the Authorization header.
 *       The token should be passed in the format: `Bearer <your_token_here>`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Error in logout
 *       401:
 *         description: Unauthorized - No token provided or token is invalid
 *       403:
 *         description: Forbidden - Token is blacklisted
 *       500:
 *         description: Internal Server Error
 *     security:
 *       - bearerAuth: []
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post('/logout', validateLogout, authenticateToken, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user data
 *     description: Returns details of the authenticated user based on the Bearer token.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized - No token provided or invalid token
 *     security:
 *       - bearerAuth: []
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get('/me', authenticateToken, authController.getUserData);

/** 
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Request an OTP for Password Reset
 *     description: Sends an OTP to the provided phone number for Password Reset. The platform (Telegram or WhatsApp) to receive the OTP is also specified.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - phone
 *               - platform
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [telegram, whatsapp]
 *                 example: telegram
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: OTP successfully sent for Password Reset.
 *       400:
 *         description: Failed to send OTP. Please check the input or try again.
 */
router.post('/request-password-reset', authController.requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-passcode:
 *   post:
 *     summary: Validate the OTP to reset the passcode
 *     description: Verifies the OTP sent to the user's phone for the Password Reset process, allowing passcode reset.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - phone
 *               - otp
 *               - newPasscode
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               otp:
 *                 type: string
 *                 example: "654321"
 *               newPasscode:
 *                 type: string
 *                 example: "securepass123"
 *     responses:
 *       200:
 *         description: Password Reset OTP successfully verified. Passcode reset can proceed.
 *       400:
 *         description: OTP is invalid or expired. Please request a new OTP.
 */
router.post('/reset-passcode', authController.resetPasscode);

/**
 * @swagger
 * /api/auth/dashboard:
 *   get:
 *     summary: Fetch admin dashboard (Requires Admin Access)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       403:
 *         description: Forbidden - Admin access required
 *     security:
 *       - bearerAuth: []
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get('/dashboard', authenticateToken, isAdmin, authController.getDashboard);

module.exports = router;