// pages/api/auth/verify-mfa.js
// MFA untuk user dimatikan. Aplikasi ini hanya mendukung admin login.

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    success: false,
    message: 'User MFA is disabled. Please use admin login at /admin/login.',
  });
}
