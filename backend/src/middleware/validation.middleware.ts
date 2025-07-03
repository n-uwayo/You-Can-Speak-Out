
import { body,param, query } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['STUDENT', 'INSTRUCTOR', 'ADMIN'])
    .withMessage('Invalid role')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const createCourseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

export const updateCourseValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid course ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

export const enrollmentValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid course ID'),
  body('studentId')
    .optional()
    .isUUID()
    .withMessage('Invalid student ID')
];

export const progressValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid course ID'),
  body('progress')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100')
];

export const bulkUpdateValidation = [
  body('courseIds')
    .isArray({ min: 1 })
    .withMessage('courseIds must be a non-empty array'),
  body('courseIds.*')
    .isUUID()
    .withMessage('Each course ID must be valid'),
  body('isPublished')
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const courseQueryValidation = [
  ...paginationValidation,
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('instructorId')
    .optional()
    .isUUID()
    .withMessage('Invalid instructor ID'),
  query('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a positive number'),
  query('sortBy')
    .optional()
    .isIn(['title', 'price', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

export const createModuleValidation = [
  param('courseId').isUUID().withMessage('Valid course ID is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

export const updateModuleValidation = [
  param('id').isUUID().withMessage('Valid module ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

export const reorderModulesValidation = [
  param('courseId').isUUID().withMessage('Valid course ID is required'),
  body('moduleOrders')
    .isArray({ min: 1 })
    .withMessage('moduleOrders must be a non-empty array'),
  body('moduleOrders.*.moduleId')
    .isUUID()
    .withMessage('Each moduleId must be a valid UUID'),
  body('moduleOrders.*.order')
    .isInt({ min: 1 })
    .withMessage('Each order must be a positive integer')
];

export const bulkUpdateStatusValidation = [
  param('courseId').isUUID().withMessage('Valid course ID is required'),
  body('moduleIds')
    .isArray({ min: 1 })
    .withMessage('moduleIds must be a non-empty array'),
  body('moduleIds.*')
    .isUUID()
    .withMessage('Each module ID must be a valid UUID'),
  body('isPublished')
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

export const duplicateModuleValidation = [
  param('id').isUUID().withMessage('Valid module ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
];

export const moduleQueryValidation = [
  param('courseId').isUUID().withMessage('Valid course ID is required'),
  query('includeUnpublished')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeUnpublished must be true or false')
];
