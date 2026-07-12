const express = require('express');
const controller = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const { createBookingSchema, rescheduleSchema } = require('../validators/booking.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.listBookings);
router.get('/resource/:assetId', controller.listResourceBookings);

// Any authenticated employee can book a bookable resource.
router.post('/', upload.single('photo'), validate(createBookingSchema), controller.createBooking);
router.patch('/:id/cancel', controller.cancelBooking);
router.patch('/:id/complete', controller.completeBooking);
router.patch('/:id/reschedule', validate(rescheduleSchema), controller.rescheduleBooking);

module.exports = router;
