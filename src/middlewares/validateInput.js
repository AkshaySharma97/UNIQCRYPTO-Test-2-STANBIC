const { body, validationResult } = require('express-validator');
const { log } = require('winston');

exports.validateRegistration = [
    body('username')
        .isString().withMessage('Username must be a string')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('phone')
        .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
    body('dob')
        .isDate().withMessage('Invalid date of birth')
        .custom((value) => {
            const today = new Date();
            const dob = new Date(value);
            let age = today.getFullYear() - dob.getFullYear();
            const month = today.getMonth() - dob.getMonth();
            if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            if (age < 18) {
                throw new Error('User must be at least 18 years old.');
            }
            
            return true;
        }),
    body('passcode')
        .isLength({ min: 6 }).withMessage('Passcode must be at least 6 characters'),
    body('platform')
        .isIn(['telegram', 'whatsapp']).withMessage('Platform must be either "telegram", or "whatsapp"'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateLogin = [
    body('phone')
        .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
    body('passcode')
        .isLength({ min: 6 }).withMessage('Passcode must be at least 6 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateLogout = [
    body('phone')
        .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
