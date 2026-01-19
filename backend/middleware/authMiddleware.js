import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  console.log('authMiddleware called');
  console.log('Headers:', req.headers);
  
  const auth = req.headers.authorization;
  console.log('Authorization header:', auth);
  
  if (!auth || !auth.startsWith('Bearer ')) {
    console.log('No token provided or invalid format');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = auth.split(' ')[1];
  console.log('Token extracted:', token ? 'Token present' : 'No token');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
