const AuditLog = require('../models/AuditLog');

const logAudit = async (user, action, entity, entityId, details, req) => {
  try {
    await AuditLog.create({
      user: user ? user._id : null,
      userName: user ? user.name : 'System',
      userRole: user ? user.role : 'System',
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      details,
      ipAddress: req ? req.ip : '127.0.0.1'
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

module.exports = { logAudit };
