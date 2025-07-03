import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createModule,
  getCourseModules,
  getModuleById,
  updateModule,
  deleteModule,
  reorderModules,
  bulkUpdateModuleStatus,
  duplicateModule
} from '../controllers/module.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { bulkUpdateStatusValidation, createModuleValidation, duplicateModuleValidation, moduleQueryValidation, reorderModulesValidation, updateModuleValidation } from '../middleware/validation.middleware';

const router = Router();

// Validation middleware

// Routes

// Get all modules for a course - Public (with filtering for unpublished content)
router.get(
  '/course/:courseId',
  moduleQueryValidation,
  getCourseModules
);

// Get single module by ID - Public (with access control)
router.get(
  '/:id',
  param('id').isUUID().withMessage('Valid module ID is required'),
  getModuleById
);

// Protected routes (authentication required)

// Create module - Course instructor or Admin only
router.post(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  createModuleValidation,
  createModule
);

// Update module - Course instructor or Admin only
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  updateModuleValidation,
  updateModule
);

// Delete module - Course instructor or Admin only
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  param('id').isUUID().withMessage('Valid module ID is required'),
  deleteModule
);

// Reorder modules - Course instructor or Admin only
router.patch(
  '/course/:courseId/reorder',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  reorderModulesValidation,
  reorderModules
);

// Bulk update module status - Course instructor or Admin only
router.patch(
  '/course/:courseId/bulk/status',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  bulkUpdateStatusValidation,
  bulkUpdateModuleStatus
);

// Duplicate module - Course instructor or Admin only
router.post(
  '/:id/duplicate',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  duplicateModuleValidation,
  duplicateModule
);

export default router;