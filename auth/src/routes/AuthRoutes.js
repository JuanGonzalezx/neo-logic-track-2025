const express = require('express');
const router = express.Router();
const { signIn,
    signUp,
    verifyCode,
    resendVerificationCode,
    secondFactorAuthentication,
    changePassword,
    resendSMS,
    verifyPassCode,
    resetPassword,
    ChangeResetPassword,
    getUserFromToken } = require('../controllers/AuthController');

router.post('/signup', signUp);

router.post('/signin', signIn);

router.post('/verify', verifyCode);

router.post('/resend', resendVerificationCode);

router.post("/2fa", secondFactorAuthentication);

router.patch("/changepassword/:id", changePassword);

router.patch("/resendsms", resendSMS);

router.post("/verifyPassCode", verifyPassCode);

router.post("/resetPassword", resetPassword);

router.put("/ChangeResetPassword", ChangeResetPassword);

router.post("/getUserByToken", getUserFromToken);

module.exports = router;