export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};

export const adminApprovalMiddleware = (req, res, next) => {
  if (req.user && req.user.isActive === false && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Account pending admin approval' });
  }
  next();
};
