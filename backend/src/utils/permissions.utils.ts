import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

export class PermissionUtils {
  constructor(private prisma: PrismaClient) {}

  async checkTaskAccess(
    userId: string,
    taskId: string,
    userRole: string
  ): Promise<{
    hasAccess: boolean;
    task?: any;
    error?: string;
  }> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!task) {
      return { hasAccess: false, error: 'Task not found' };
    }

    // Admins have access to everything
    if (userRole === 'ADMIN') {
      return { hasAccess: true, task };
    }

    // Instructors can access tasks in their courses
    if (userRole === 'INSTRUCTOR') {
      if (task.module.course.instructorId === userId) {
        return { hasAccess: true, task };
      }
      return { hasAccess: false, error: 'Access denied' };
    }

    // Students can access tasks in courses they're enrolled in
    if (userRole === 'STUDENT') {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: task.module.courseId
          }
        }
      });

      if (!enrollment || enrollment.status !== 'ACTIVE') {
        return { hasAccess: false, error: 'Not enrolled in this course' };
      }

      return { hasAccess: true, task };
    }

    return { hasAccess: false, error: 'Invalid user role' };
  }

  async checkSubmissionAccess(
    userId: string,
    submissionId: string,
    userRole: string
  ): Promise<{
    hasAccess: boolean;
    submission?: any;
    error?: string;
  }> {
    const submission = await this.prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!submission) {
      return { hasAccess: false, error: 'Submission not found' };
    }

    // Admins have access to everything
    if (userRole === 'ADMIN') {
      return { hasAccess: true, submission };
    }

    // Instructors can access submissions in their courses
    if (userRole === 'INSTRUCTOR') {
      if (submission.task.module.course.instructorId === userId) {
        return { hasAccess: true, submission };
      }
      return { hasAccess: false, error: 'Access denied' };
    }

    // Students can only access their own submissions
    if (userRole === 'STUDENT') {
      if (submission.studentId === userId) {
        return { hasAccess: true, submission };
      }
      return { hasAccess: false, error: 'Access denied' };
    }

    return { hasAccess: false, error: 'Invalid user role' };
  }

  async checkModuleOwnership(
    userId: string,
    moduleId: string,
    userRole: string
  ): Promise<boolean> {
    if (userRole === 'ADMIN') {
      return true;
    }

    if (userRole === 'INSTRUCTOR') {
      const module = await this.prisma.module.findUnique({
        where: { id: moduleId },
        include: { course: true }
      });

      return module?.course.instructorId === userId;
    }

    return false;
  }
}