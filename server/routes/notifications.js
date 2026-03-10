const router = require('express').Router();
const authenticateUser = require('../middleware/authenticator');
const {
  getNotificationCount,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  enqueueTestNotification,
} = require('../controller/notificationsController');

router.get('/count', authenticateUser, getNotificationCount);
router.get('/', authenticateUser, getNotifications);
router.put('/read-all', authenticateUser, markAllNotificationsAsRead);
router.put('/:id/read', authenticateUser, markNotificationAsRead);
router.post('/enqueue-test', authenticateUser, enqueueTestNotification);

module.exports = router;
