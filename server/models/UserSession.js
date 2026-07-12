const mongoose = require('mongoose');

/**
 * A login session. One document is created per successful login and stores the
 * hashed refresh token so sessions can be invalidated on logout / rotation.
 */
const userSessionSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  token: { type: String, unique: true, required: true }, // hashed refresh token
  login_at: { type: Date, default: Date.now },
  logout_at: { type: Date, default: null },
  ip_address: String,
  user_agent: String,
});

module.exports = mongoose.model('UserSession', userSessionSchema);
