// pages/api/auth/login.js
// User login dimatikan. Hanya admin yang bisa login di /admin/login

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    success: false,
    message: 'User login is disabled. Please use admin login at /admin/login.',
  });
}
