// Libs
const Verifier = require("email-verifier");

// set endpoint and your access key
const access_key = process.env.ACCESS_KEY_EMAIL_VERIFIER_API;
 
let emailVerifier = new Verifier(access_key, {
    checkCatchAll: true,
    checkDisposable: true,
    checkFree: true,
    validateDNS: true,
    validateSMTP: true,
});

// const NeverBounce = require('neverbounce');

// // Initialize NeverBounce client
// const clientEmailVerifier = new NeverBounce({apiKey: process.env.NEVEROUNCE_API_KEY});

module.exports = { 'emailVerifier': emailVerifier }