const passport = require('passport');
const { issueTokenPair, rotate, revoke } = require('../services/tokenService');

const ok = (res, data, status = 200) => res.status(status).json({ data, error: null, meta: {} });

exports.login = (req, res, next) => passport.authenticate('local', { session: false }, async (error, user) => {
  try {
    if (error) return next(error);
    if (!user) return res.status(401).json({ data: null, error: { code: 'INVALID_CREDENTIALS', message: 'Username or password is incorrect.' }, meta: {} });
    const tokens = await issueTokenPair(user);
    return ok(res, { ...tokens, user: { id: user._id, username: user.username, role: user.role } });
  } catch (tokenError) { return next(tokenError); }
})(req, res, next);

exports.refresh = async (req, res, next) => { try { const result = await rotate(String(req.body.refreshToken || '')); return ok(res, { accessToken: result.accessToken, refreshToken: result.refreshToken, expiresIn: result.expiresIn }); } catch (error) { error.statusCode = 401; error.code = 'INVALID_REFRESH_TOKEN'; next(error); } };
exports.logout = async (req, res, next) => { try { await revoke(String(req.body.refreshToken || '')); return ok(res, { revoked: true }); } catch (error) { next(error); } };
exports.me = (req, res) => ok(res, { id: req.user._id, displayName: req.user.username, username: req.user.username, city: 'Abuja, Nigeria', bio: 'Finding memorable food, one table at a time.', tasteTags: [] });
