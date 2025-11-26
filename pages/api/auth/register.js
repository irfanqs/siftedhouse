// pages/api/auth/register.js
// Registrasi user dimatikan. Aplikasi ini hanya mendukung admin login.

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    success: false,
    message: 'User registration is disabled. This app only supports admin login.',
  });
}
