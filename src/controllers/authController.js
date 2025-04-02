const User = require('../models/User');
const authService = require('../services/authService');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, phone, dob, referral_code, passcode, platform } = req.body;

        if (!username || !phone || !dob || !passcode || !platform) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        const existingUser = await User.findOne({ where: { phone } });

        if (existingUser) {
            return res.status(400).json({ message: "User already registered with this phone number." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

        const sent = await authService.sendOTP(phone, platform, otp);
        if (!sent) {
            return res.status(500).json({ message: "Failed to send OTP." });
        }

        await User.create({
            uuid: uuidv4(),
            username,
            phone,
            dob,
            referral_code,
            passcode: passcode.trim(),
            otp,
            otp_expires_at,
            is_verified: false,
        });

        return res.status(201).json({
            message: `OTP sent to ${platform}`
        });

    } catch (error) {
        logger.error("Registration Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone and OTP are required." });
        }

        const user = await User.findOne({ where: { phone } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: "User is already verified." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        user.is_verified = true;
        user.otp = null;
        user.otp_expires_at = null;
        await user.save();

        return res.status(200).json({ message: "User verified successfully. You can now log in." });

    } catch (error) {
        logger.error("OTP Verification Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

let failedLoginAttempts = {};
exports.login = async (req, res) => {
    try {
        const { phone, passcode } = req.body;
        const ip = req.ip;

        if (failedLoginAttempts[phone] >= 2) {
            return res.status(403).json({ message: "CAPTCHA required", captchaRequired: true });
        }

        const user = await User.findOne({ where: { phone } });

        if (!user) {
            logger.warn(`Failed login attempt - Phone: ${phone}, IP: ${ip}`);
            failedLoginAttempts[phone] = (failedLoginAttempts[phone] || 0) + 1;
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.is_verified) {
            logger.warn(`Unverified login attempt - Phone: ${phone}, IP: ${ip}`);
            return res.status(400).json({ message: "User is not verified. Complete OTP verification first." });
        }

        const isMatch = await bcrypt.compare(passcode.trim(), user.passcode.trim());
        if (!isMatch) {
            failedLoginAttempts[phone] = (failedLoginAttempts[phone] || 0) + 1;
            logger.warn(`Invalid passcode attempt - Phone: ${phone}, IP: ${ip}`);
            return res.status(401).json({ message: "Invalid credentials." });
        }

        failedLoginAttempts[phone] = 0;

        const { accessToken, refreshToken } = generateTokens(user);
        user.refresh_token = refreshToken;
        await user.save();

        logger.info(`User logged in - Phone: ${phone}, IP: ${ip}`);
        return res.status(200).json({ message: "Login successful.", accessToken, refreshToken });

    } catch (error) {
        logger.error("Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { uuid: user.uuid, phone: user.phone, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { uuid: user.uuid },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY }
    );

    return { accessToken, refreshToken };
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken, phone } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token required." });
        }

        const user = await User.findOne({ where: { phone } });

        if (!user) {
            return res.status(403).json({ message: "Invalid refresh token." });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired refresh token." });
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

            return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
        });

    } catch (error) {
        logger.error("Refresh Token Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};


exports.sendMFAOTP = async (req, res) => {
    try {
        const { phone, platform } = req.body;

        if (!phone || !platform) {
            return res.status(400).json({ message: "Phone and platform are required." });
        }

        const user = await User.findOne({ where: { phone } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

        const sent = await authService.sendOTP(phone, platform, otp);
        if (!sent) {
            return res.status(500).json({ message: "Failed to send OTP." });
        }

        user.otp = otp;
        user.otp_expires_at = otp_expires_at;
        await user.save();

        return res.status(200).json({
            message: `MFA OTP sent via ${platform}`
        });

    } catch (error) {
        logger.error("MFA OTP Sending Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

exports.verifyMFAOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone and OTP are required." });
        }

        const user = await User.findOne({ where: { phone } });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        user.otp = null;
        user.otp_expires_at = null;
        await user.save();

        return res.status(200).json({ message: "MFA verification successful." });

    } catch (error) {
        logger.error("MFA OTP Verification Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized - No token provided." });
        }

        const token = authHeader.split(' ')[1];
        const { phone } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: { phone } });

        if (!user || user.uuid !== decoded.uuid) {
            return res.status(404).json({ message: "User not found or mismatch." });
        }

        authService.addToBlacklist(token);

        return res.status(200).json({ message: "Logged out successfully." });

    } catch (error) {
        logger.error("Logout Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

exports.logoutFromDevice = async (req, res) => {
    try {
        const { device } = req.body;
        let user = req.user;

        user.sessions = user.sessions.filter(session => session.device !== device);
        await user.save();

        return res.status(200).json({ message: "Logged out from device" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { phone, platform } = req.body;
    const user = await User.findOne({ where: { phone } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
    const sent = await authService.sendOTP(user.phone, platform, otp);
    if (!sent) {
        return res.status(500).json({ message: "Failed to send OTP." });
    }

    user.otp = otp;
    user.otp_expires_at = otp_expires_at;
    await user.save();

    return res.json({ message: "OTP sent to Telegram/WhatsApp" });
};


exports.resetPasscode = async (req, res) => {
    const { phone, otp, newPasscode } = req.body;
    const user = await User.findOne({ where: { phone } });

    if (!user || user.otp !== otp || Date.now() > user.otp_expires_at) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.passcode = await bcrypt.hash(newPasscode, 10);
    user.otp = null;
    user.otp_expires_at = null;
    await user.save();

    return res.json({ message: "Passcode reset successfully" });
};

exports.getUserData = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized - No token provided." });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const uuid = decoded.uuid;
        const user = await User.findOne({ where: { uuid } }, {
            attributes: [ `id`, `uuid`, `username`, `phone`, `dob`, `referral_code`, `passcode`, `role`, `is_verified`, `otp`, `otp_expires_at`, `sessions`, `created_at`, `updated_at`],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json(user);
    } catch (error) {
        logger.error("User Data Fetch Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        
        const users = await User.findAll({
            where: {
                role: 'user'
            },
            attributes: [
                'id', 'uuid', 'username', 'phone', 'dob', 'referral_code', 'passcode', 'role', 'is_verified',
                'otp', 'otp_expires_at', 'sessions', 'created_at', 'updated_at'
            ]
        });

        return res.status(200).json(users);
    } catch (error) {
        logger.error("User Data Fetch Error:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};







