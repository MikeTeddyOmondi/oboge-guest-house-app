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

module.exports = { 'emailVerifier': emailVerifier }