import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1]; // Expected "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    if (!verified) {
      return res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }

    req.user = verified.id;
    req.userRole = verified.role; // Add role to request
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default auth;