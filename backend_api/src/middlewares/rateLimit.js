const rateLimit = require('express-rate-limit');

exports.limitLoginAttempts = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Please try again later.",
    headers: true,
});

exports.limitOTPRequests = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3, 
    message: "Too many OTP requests. Please try again later.",
});
