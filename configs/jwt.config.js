export default {
  secret: process.env.JWT_SECRET || 'my-fallback-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
};
