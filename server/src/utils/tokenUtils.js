import jwt from 'jsonwebtoken';

/**
 * Generate JWT token and set HttpOnly cookie
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Set token cookie options
 */
export const getCookieOptions = () => {
  return {
    expires: new Date(
      Date.now() + (parseInt(process.env.COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  };
};

/**
 * Send token response with cookie
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  const cookieOptions = getCookieOptions();

  // Remove password from output
  const userData = user.toObject();
  delete userData.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: userData
    });
};

/**
 * Clear token cookie
 */
export const clearTokenCookie = (res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
};

export default {
  generateToken,
  getCookieOptions,
  sendTokenResponse,
  clearTokenCookie
};
