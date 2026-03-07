const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie');

const pathToPublicKey = path.join(__dirname, '../utils', 'public.pem');
const PUBLIC_KEY = fs.readFileSync(pathToPublicKey, 'utf8');

const authenticateUser = async (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return res.status(401).json({ message: 'Unauthorized - No cookies found' });
    }

    const cookies = cookieParser.parse(cookieHeader);
    const rawTokenCookie = cookies.token;

    if (!rawTokenCookie) {
      return res.status(401).json({ message: 'Unauthorized - No token found' });
    }

    // `res.cookie("token", { token: "Bearer ..." })` is serialized as `j:{...}`.
    // Also support plain string token cookie for forward compatibility.
    const normalizedCookie = rawTokenCookie.startsWith('j:')
      ? rawTokenCookie.replace(/^j:/, '')
      : rawTokenCookie;

    let tokenFromCookie = '';

    try {
      const cookieJson = JSON.parse(normalizedCookie);
      tokenFromCookie = cookieJson?.token || '';
    } catch (_error) {
      tokenFromCookie = normalizedCookie;
    }

    if (!tokenFromCookie || typeof tokenFromCookie !== 'string') {
      return res.status(401).json({ message: 'Unauthorized - Token not found inside cookie' });
    }

    const tokenBody = tokenFromCookie.startsWith('Bearer ')
      ? tokenFromCookie.split(' ')[1]
      : tokenFromCookie;

    if (!tokenBody) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    jwt.verify(tokenBody, PUBLIC_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = authenticateUser;
