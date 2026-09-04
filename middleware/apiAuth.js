const User = require('../models/user');
const { verifyAccess } = require('../services/tokenService');

module.exports = async function apiAuth(req, res, next) {
  try {
    const match = req.get('authorization')?.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ data: null, error: { code: 'AUTH_REQUIRED', message: 'Authentication required.' }, meta: {} });
    const payload = verifyAccess(match[1]);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ data: null, error: { code: 'INVALID_TOKEN', message: 'The access token is no longer valid.' }, meta: {} });
    req.user = user; next();
  } catch {
    return res.status(401).json({ data: null, error: { code: 'INVALID_TOKEN', message: 'The access token is expired or invalid.' }, meta: {} });
  }
};
