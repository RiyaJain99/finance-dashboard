import { AuthorizationError } from '../utils/errors.js';

const ROLE_HIERARCHY = { viewer: 0, analyst: 1, admin: 2 };

/**
 * Grants access to users whose role level meets or exceeds the minimum required.
 * authorize('analyst') → allows analyst and admin
 * authorize('admin')   → allows admin only
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userLevel = ROLE_HIERARCHY[req.user.role];
    const hasAccess = allowedRoles.some(
      (role) => userLevel >= ROLE_HIERARCHY[role]
    );

    if (!hasAccess) {
      throw new AuthorizationError(
        `Role '${req.user.role}' is not authorized for this action`
      );
    }
    next();
  };
};

/**
 * Strict role check — user must have exactly one of the specified roles.
 * Useful for admin-only endpoints where analyst must be excluded.
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Role '${req.user.role}' is not authorized for this action`
      );
    }
    next();
  };
};
