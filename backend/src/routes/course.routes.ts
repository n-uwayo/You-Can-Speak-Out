import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getCourseEnrollments,
  getCoursesByInstructor,
  getStudentCourses,
  updateCourseProgress,
  bulkUpdateCourseStatus
} from '../controllers/course.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { bulkUpdateValidation, courseQueryValidation, createCourseValidation, enrollmentValidation, progressValidation, updateCourseValidation } from '../middleware/validation.middleware';


const router = Router();


// Public routes (no authentication required)
router.get(
  '/',
  courseQueryValidation,
  getAllCourses
);

router.get(
  '/:id',
  authMiddleware, // Optional auth for enrollment info
  getCourseById
);

// Protected routes (authentication required)

// Create course - Instructors and Admins only
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  createCourseValidation,
  createCourse
);

// Update course - Course owner or Admin only
router.put(
  '/:id',
  authMiddleware,
  updateCourseValidation,
  updateCourse
);

// Delete course - Course owner or Admin only
router.delete(
  '/:id',
  authMiddleware,
    roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  deleteCourse
);

// Enrollment routes

// Enroll in course - Any authenticated user
router.post(
  '/:id/enroll',
  authMiddleware,
  enrollmentValidation,
  enrollStudent
);

// Unenroll from course - Any authenticated user
router.delete(
  '/:id/enroll',
  authMiddleware,
  enrollmentValidation,
  enrollStudent
);

// Unenroll from course - Any authenticated user
router.delete(
  '/:id/enroll',
  authMiddleware,
  unenrollStudent
);

// Get course enrollments - Course instructor or Admin only
router.get(
  '/:id/enrollments',
  authMiddleware,
  roleMiddleware(['INSTRUCTOR', 'ADMIN']),
  getCourseEnrollments
);

// Update course progress - Enrolled student only
router.put(
  '/:id/progress',
  authMiddleware,
  progressValidation,
  updateCourseProgress
);

// Instructor routes

// Get courses by instructor
router.get(
  '/instructor/:instructorId',
    authMiddleware,
  getCoursesByInstructor
);

// Student routes

// Get student's enrolled courses
router.get(
  '/student/my-courses',
  authMiddleware,
  getStudentCourses
);

// Admin routes

// Bulk update course status - Admin only
router.patch(
  '/bulk/status',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  bulkUpdateValidation,
  bulkUpdateCourseStatus
);

export default router;