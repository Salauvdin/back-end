// Middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
    const userId = decoded.userId || decoded.id || decoded.registerId;
    const tokenTenantId = decoded.tenantId || decoded.tenantid || decoded.tenant_id;
    const isSuperAdmin = decoded.isSuperAdmin === true || Number(userId) === 19;
    const requestedTenantId = req.headers["x-tenant-id"];
    const tenantId = isSuperAdmin && requestedTenantId !== undefined && requestedTenantId !== ""
      ? requestedTenantId
      : tokenTenantId;

    if (!userId || !decoded.role || (tenantId === undefined || tenantId === null || tenantId === "") && !isSuperAdmin) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = {
      ...decoded,
      userId,
      id: userId,
      role: decoded.role,
      tenantId: tenantId ?? 0,
      tokenTenantId: tokenTenantId ?? 0,
      selectedTenantId: tenantId ?? 0,
      isSuperAdmin
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
