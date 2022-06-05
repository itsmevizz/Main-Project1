require('dotenv').config()
module.exports={
    serviceSID:process.env.OTP_serviceSID,
    accountSID:process.env.OTP_accountSID,
    authToken:process.env.OTP_authToken,
}