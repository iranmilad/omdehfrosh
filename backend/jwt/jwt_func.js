import jwt from 'jsonwebtoken'; // Use `import` instead of `require`


export const generateToken = (res, userId, role) => {
  const payload = {
    id: userId,
    role: role,
  };

  const secretKey = process.env.JWT_SECRET || "yourSecretKey"; // Use .env variable in production
  const options = { expiresIn: "100h" };

  const token = jwt.sign(payload, secretKey, options);

  res.cookie("user", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production
    sameSite: "Strict",
    maxAge: 100 * 60 * 60 * 1000, // 100 hours
    path: "/",
  });

  return token; // Return token for JSON response
};


// Example user data
// const user = {
//   id: 1,
//   name: 'digikala',
//   role: 'user',
// };

// // Generate the JWT
// const token = generateToken(user);


export const verifyToken = (req, res, next) => {
  const token = req.cookies['user']; // Ensure the correct cookie name

  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  const secretKey = 'yourSecretKey'; // Use an environment variable in production

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    if (!decoded.id || !decoded.name || !decoded.role) {
      return res.status(403).json({ message: 'Invalid token structure' });
    }

    // Attach user details to request object
    req.user = { id: decoded.id, name: decoded.name, role: decoded.role };

    // ✅ Ensure `next()` is called properly
    return next();
  });
};


// Example of a protected route using the verifyToken middleware
// app.get('/protected', verifyToken, (req, res) => {
//   res.json({ message: 'This is a protected route', user: req.user });
// });
