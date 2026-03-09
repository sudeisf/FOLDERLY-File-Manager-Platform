const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const { Server } = require('socket.io');

const pathToPublicKey = path.join(__dirname, '../utils', 'public.pem');
const PUBLIC_KEY = fs.readFileSync(pathToPublicKey, 'utf8');

let ioInstance = null;

const getTokenFromCookieHeader = (cookieHeader) => {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookie.parse(cookieHeader);
  const rawTokenCookie = cookies.token;

  if (!rawTokenCookie) {
    return null;
  }

  const normalizedCookie = rawTokenCookie.startsWith('j:')
    ? rawTokenCookie.replace(/^j:/, '')
    : rawTokenCookie;

  let tokenFromCookie = '';
  try {
    const parsed = JSON.parse(normalizedCookie);
    tokenFromCookie = parsed?.token || '';
  } catch (_error) {
    tokenFromCookie = normalizedCookie;
  }

  if (!tokenFromCookie || typeof tokenFromCookie !== 'string') {
    return null;
  }

  return tokenFromCookie.startsWith('Bearer ')
    ? tokenFromCookie.split(' ')[1]
    : tokenFromCookie;
};

const initSocketServer = (httpServer, allowedOrigins) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Socket CORS origin not allowed'));
      },
      credentials: true,
    },
    path: '/socket.io',
  });

  ioInstance.use((socket, next) => {
    try {
      const token = getTokenFromCookieHeader(socket.handshake.headers.cookie);
      if (!token) {
        return next(new Error('Unauthorized socket: missing token'));
      }

      const decoded = jwt.verify(token, PUBLIC_KEY);
      socket.data.user = decoded;
      return next();
    } catch (error) {
      return next(new Error('Unauthorized socket'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.data?.user?.sub || socket.data?.user?.id;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      // no-op: room cleanup is automatic.
    });
  });

  return ioInstance;
};

const emitNotificationToUser = (userId, payload) => {
  if (!ioInstance || !userId) {
    return;
  }

  ioInstance.to(`user:${userId}`).emit('notification:new', payload);
};

module.exports = {
  initSocketServer,
  emitNotificationToUser,
};
