const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken');

const accessSecret = () => process.env.JWT_ACCESS_SECRET || (process.env.NODE_ENV !== 'production' ? 'development-access-secret-change-me' : null);
const refreshSecret = () => process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV !== 'production' ? 'development-refresh-secret-change-me' : null);
const hash = token => crypto.createHash('sha256').update(token).digest('hex');

function assertSecrets() {
  if (!accessSecret() || !refreshSecret()) throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required.');
}

async function issueTokenPair(user, family = crypto.randomUUID()) {
  assertSecrets();
  const accessToken = jwt.sign({ sub: String(user._id), role: user.role, type: 'access' }, accessSecret(), { expiresIn: '15m', issuer: 'savour-api' });
  const refreshToken = jwt.sign({ sub: String(user._id), family, type: 'refresh', nonce: crypto.randomUUID() }, refreshSecret(), { expiresIn: '30d', issuer: 'savour-api' });
  await RefreshToken.create({ user: user._id, tokenHash: hash(refreshToken), family, expiresAt: new Date(Date.now() + 30 * 86400000) });
  return { accessToken, refreshToken, expiresIn: 900 };
}

async function rotate(refreshToken) {
  assertSecrets();
  const payload = jwt.verify(refreshToken, refreshSecret(), { issuer: 'savour-api' });
  if (payload.type !== 'refresh') throw new Error('Invalid token type.');
  const tokenHash = hash(refreshToken);
  const stored = await RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { revokedAt: new Date() } },
    { new: true }
  );
  if (!stored) {
    if (payload.family) await RefreshToken.updateMany({ family: payload.family, revokedAt: null }, { revokedAt: new Date() });
    throw new Error('Refresh token is expired or revoked.');
  }
  const user = await require('../models/user').findById(payload.sub);
  if (!user) throw new Error('User no longer exists.');
  const next = await issueTokenPair(user, stored.family);
  stored.replacedByHash = hash(next.refreshToken); await stored.save();
  return { ...next, user };
}

async function revoke(refreshToken) {
  if (refreshToken) await RefreshToken.findOneAndUpdate({ tokenHash: hash(refreshToken), revokedAt: null }, { revokedAt: new Date() });
}

function verifyAccess(token) { assertSecrets(); return jwt.verify(token, accessSecret(), { issuer: 'savour-api' }); }
module.exports = { issueTokenPair, rotate, revoke, verifyAccess };
