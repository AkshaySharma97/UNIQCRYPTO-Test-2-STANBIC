const axios = require('axios');
const logger = require('../utils/logger');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { log } = require('console');

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;  
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;  
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;  

const sendTelegramOTP = async (chatId, otp) => {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const messagePayload = {
      chat_id: chatId,  
      text: `Your OTP for STANBIC is: ${otp}`,
    };

    const response = await axios.post(telegramApiUrl, messagePayload);
    return response.status === 200;
  } catch (error) {
    logger.error('Telegram OTP sending failed:', error);
    return false;
  }
};

const sendWhatsAppOTP = async (phone, otp) => {
  try {
    const whatsappApiUrl = `https://graph.facebook.com/v14.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: phone,  
      text: {
        body: `Your OTP for STANBIC is: ${otp}`,
      },
    };

    const response = await axios.post(whatsappApiUrl, messagePayload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    return response.status === 200;
  } catch (error) {
    logger.error('WhatsApp OTP sending failed:', error);
    return false;
  }
};

const sendOTP = async (platform, recipient, otp) => {
  let success = false;
  
  if (platform === 'telegram') {
    success = await sendTelegramOTP(recipient, otp);
  } else if (platform === 'whatsapp') {
    success = await sendWhatsAppOTP(recipient, otp);
  }

  if (success) {
    console.log(`OTP sent successfully to ${platform}`);
  } else {
    console.log(`Failed to send OTP to ${platform}`);
  }

  return success;
};

exports.createSession = async (user, deviceInfo, refreshToken) => {
    let sessions = user.sessions || [];
    sessions.push({ device: deviceInfo, token: refreshToken, createdAt: Date.now() });

    user.sessions = sessions;
    await user.save();
};

const blacklist = new Set();

/**
 * Add a token to the blacklist
 */
exports.addToBlacklist = (token) => {
    blacklist.add(token);
    setTimeout(() => {
        blacklist.delete(token);
    }, process.env.JWT_EXPIRATION_TIME * 1000);
};

/**
 * Check if token is blacklisted
 */
exports.isBlacklisted = (token) => blacklist.has(token);
