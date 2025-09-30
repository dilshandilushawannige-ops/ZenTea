import jwt from 'jsonwebtoken';

// Simple middleware version without User model for now
export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const token = authHeader.split(' ')[1];
        
        // Mock authentication for testing
        // TODO: Implement proper JWT verification
        req.user = { role: 'Admin' };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized' });
    }
};
