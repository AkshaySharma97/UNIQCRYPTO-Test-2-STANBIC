const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        allowNull: false,
        unique: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    referral_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    passcode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    sessions: { type: DataTypes.JSON, defaultValue: [] }
}, {
    hooks: {
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt(10);
            user.passcode = await bcrypt.hash(user.passcode, salt);
        }
    },
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
});

module.exports = User;