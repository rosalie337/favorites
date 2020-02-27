const jwt = require('jsonwebtoken');
const APP_SECRET = process.env.APP_SECRET || 'CHANGEMENNOW';

module.exports = {
    sign(profile) {
        return jwt.sign({ id:profile.id }, APP_SECRET);
    },
    verify(token) {
        return jwt.token(token, APP_SECRET);
    }
};
