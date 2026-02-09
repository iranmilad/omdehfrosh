import jwt from 'jsonwebtoken';

/** @param {object} req - Express request (required). @param {object} [res] - Optional, ignored. */
const getUserFromToken = (req, res) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      user_id: decoded.id,
      role: decoded.role,
      decoded,
    };
  } catch (err) {
    return null;
  }
};

export default getUserFromToken;
