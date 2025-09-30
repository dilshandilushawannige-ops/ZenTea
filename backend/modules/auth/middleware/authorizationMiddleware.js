export const authorize = (roles = []) => (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized for this role' });
    }

    next();
};
