export default function fakeTokenDecode(encodedString) {
    // Decode the URL-encoded string
    const decodedString = decodeURIComponent(encodedString);
  
    // Split the string by '&&' to separate different key-value pairs
    const params = decodedString.split('&&');
  
    // Extract the supplierId, supplierName, and role using string manipulation
    let supplierId = null;
    let supplierName = null;
    let role = null;
  
    params.forEach(param => {
      // Ensure we're looking for the correct parameter names
      if (param.includes('supplerid=')) {
        supplierId = param.split('=')[1];  // Extract supplierId
      }
      if (param.includes('suppliername=')) {
        supplierName = param.split('=')[1];  // Extract supplierName
      }
      if (param.includes('role=')) {
        role = param.split('=')[1];  // Extract role
      }
    });
  
    // Return the extracted values
    return { supplierId, supplierName, role };
  }
  

//   import jwt from 'jsonwebtoken'; // Use `import` instead of `require`



// export const generateToken = (res) => {

//     const user = {
//         id: 1,
//         name: 'digikala',
//         role: 'user',
      
      
//       };
      
//   const payload = {
//     id: user.id,
//     name: user.name,
//     role: user.role,
//   };

//   const secretKey = 'yourSecretKey';  // Use an environment variable in production
//   const options = { expiresIn: '100h' };

//   const token = jwt.sign(payload, secretKey, options);



//   res.cookie('user', token, {
//     httpOnly: true,
//     secure: true,       // Set to `true` in production (HTTPS)
//     sameSite: "Strict",
//     maxAge: 3600000,     // 1 hour expiration
//   });

//   res.json({ message: 'JWT has been set in the cookie', token });
// };


// // Example user data
// // const user = {
// //   id: 1,
// //   name: 'digikala',
// //   role: 'user',
// // };

// // // Generate the JWT
// // const token = generateToken(user);


// // export const verifyToken = (req, res, next) => {
// //   const token = req.cookies['user']; // Ensure the correct cookie name

// //   if (!token) {
// //     return res.status(403).json({ message: 'Token is required' });
// //   }

// //   const secretKey = 'yourSecretKey'; // Use an environment variable in production

// //   jwt.verify(token, secretKey, (err, decoded) => {
// //     if (err) {
// //       return res.status(403).json({ message: 'Invalid or expired token' });
// //     }

// //     if (!decoded.id || !decoded.name || !decoded.role) {
// //       return res.status(403).json({ message: 'Invalid token structure' });
// //     }

// //     // Attach user details to request object
// //     req.user = { id: decoded.id, name: decoded.name, role: decoded.role };

// //     // ✅ Ensure `next()` is called properly
// //     return next();
// //   });
// // };


// // // Example of a protected route using the verifyToken middleware
// // // app.get('/protected', verifyToken, (req, res) => {
// // //   res.json({ message: 'This is a protected route', user: req.user });
// // // });
