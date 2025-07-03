// middleware/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Role-based authorization middleware
 * Checks if user has required role(s) to access the route
 */
export const roleMiddleware = (allowedRoles: UserRole | UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const userRole = req.user.role;
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user has required role
      if (!rolesArray.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
        return;
      }

      next();

    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = roleMiddleware(UserRole.ADMIN);

/**
 * Instructor only middleware
 */
export const instructorOnly = roleMiddleware(UserRole.INSTRUCTOR);

/**
 * Student only middleware
 */
export const studentOnly = roleMiddleware(UserRole.STUDENT);

/**
 * Instructor or Admin middleware
 */
export const instructorOrAdmin = roleMiddleware([UserRole.INSTRUCTOR, UserRole.ADMIN]);

/**
 * Student or Instructor middleware
 */
export const studentOrInstructor = roleMiddleware([UserRole.STUDENT, UserRole.INSTRUCTOR]);

/**
 * All roles middleware (basically just checks authentication)
 */
export const allRoles = roleMiddleware([UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]);

/**
 * Custom role checker - useful for more complex authorization logic
 */
export const checkRole = (
  req: AuthRequest, 
  allowedRoles: UserRole | UserRole[]
): boolean => {
  if (!req.user) return false;
  
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return rolesArray.includes(req.user.role);
};

/**
 * Resource ownership middleware
 * Checks if the authenticated user owns the resource or has admin privileges
 */
export const ownershipMiddleware = (resourceUserIdField: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const userId = req.user.id;
      const userRole = req.user.role;
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

      // Admin can access any resource
      if (userRole === UserRole.ADMIN) {
        next();
        return;
      }

      // Check ownership
      if (userId !== resourceUserId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own resources'
        });
        return;
      }

      next();

    } catch (error) {
      console.error('Ownership middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Course instructor middleware
 * Checks if user is the instructor of a specific course or admin
 */
export const courseInstructorMiddleware = (courseIdField: string = 'courseId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const userId = req.user.id;
      const userRole = req.user.role;
      const courseId = req.params[courseIdField] || req.body[courseIdField];

      // Admin can access any course
      if (userRole === UserRole.ADMIN) {
        next();
        return;
      }

      // Only instructors can be course instructors
      if (userRole !== UserRole.INSTRUCTOR) {
        res.status(403).json({
          success: false,
          message: 'Only instructors can perform this action'
        });
        return;
      }

      // Check if user is the course instructor
      // Note: You'll need to import PrismaClient here
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true }
      });

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      if (course.instructorId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You are not the instructor of this course'
        });
        return;
      }

      next();

    } catch (error) {
      console.error('Course instructor middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};