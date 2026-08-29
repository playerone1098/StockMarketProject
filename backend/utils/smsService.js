const axios = require('axios');

/**
 * Send SMS OTP using configured gateway or Dev Fallback
 * @param {string} phone - Target phone number
 * @param {string} otp - 6-digit OTP code
 */
const sendSMS = async (phone, otp) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  // 1. Twilio Integration
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
      await twilio.messages.create({
        body: `Your JodhpurTraders verification code is ${otp}. Valid for 5 minutes. Do not share it with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      console.log(`[Twilio SMS] OTP successfully sent to ${formattedPhone}`);
      return { success: true, provider: 'twilio' };
    } catch (err) {
      console.error('[Twilio SMS Error]:', err.message);
      // Fall through to dev mode if Twilio fails
    }
  }

  // 2. Fast2SMS Integration (Popular in India)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const rawNumber = cleanPhone.replace(/^\+91/, '').replace(/\D/g, '');
      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          variables_values: otp,
          route: 'otp',
          numbers: rawNumber
        },
        {
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY
          }
        }
      );
      if (response.data && response.data.return) {
        console.log(`[Fast2SMS] OTP successfully sent to ${rawNumber}`);
        return { success: true, provider: 'fast2sms' };
      }
    } catch (err) {
      console.error('[Fast2SMS Error]:', err.message);
    }
  }

  // 3. 2Factor.in Integration (Indian SMS Gateway)
  if (process.env.TWO_FACTOR_API_KEY) {
    try {
      const rawNumber = cleanPhone.replace(/^\+91/, '').replace(/\D/g, '');
      const url = `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${rawNumber}/${otp}/OTP1`;
      const response = await axios.get(url);
      if (response.data && response.data.Status === 'Success') {
        console.log(`[2Factor] OTP successfully sent to ${rawNumber}`);
        return { success: true, provider: '2factor' };
      }
    } catch (err) {
      console.error('[2Factor Error]:', err.message);
    }
  }

  // 4. Development / Demo Fallback Mode
  console.log(`\n==================================================`);
  console.log(`[DEV MODE SMS SERVICE]`);
  console.log(`Phone Target : ${cleanPhone}`);
  console.log(`Generated OTP : ${otp}`);
  console.log(`Note: To send real SMS, configure TWILIO, FAST2SMS, or 2FACTOR keys in backend/.env`);
  console.log(`==================================================\n`);

  return {
    success: true,
    provider: 'demo',
    isDemo: true,
    otp // returned in dev mode for convenient instant testing
  };
};

module.exports = {
  sendSMS
};
