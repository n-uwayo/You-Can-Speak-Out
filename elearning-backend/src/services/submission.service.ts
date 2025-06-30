import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { PermissionUtils } from '../utils/permissions.utils';
import {
  SubmitTaskData,
  GradeSubmissionData,
  SubmissionFilters
} from '../types/task.types';

export class SubmissionService {
  private permissionUtils: PermissionUtils;

  constructor(private prisma: PrismaClient) {
    this.permissionUtils = new PermissionUtils(prisma);
  }

  async submitTask(data: SubmitTaskData): Promise<any> {
    const { taskId, studentId, textSubmission, comment, files } = data;

    // Check if task exists and student has access
    const { hasAccess, task, error } = await this.permissionUtils.checkTaskAccess(
      studentId,
      taskId,
      'STUDENT'
    );

    if (!hasAccess) {
      throw new AppError(error || 'Access denied', 403);
    }

    // Check if already submitted
    const existingSubmission = await this.prisma.taskSubmission.findFirst({
      where: {
        taskId,
        studentId
      }
    });

    if (existingSubmission) {
      throw new AppError('Task already submitted', 400);
    }

    // Check if task is still active and not past due
    if (task.status !== 'ACTIVE') {
      throw new AppError('Task is not active', 400);
    }

    if (new Date() > new Date(task.dueDate)) {
      throw new AppError('Task submission deadline has passed', 400);
    }

    // Validate submission based on task type
    const fileUrls = files ? files.map(file => `/uploads/${file.filename}`) : [];

    if (task.taskType === 'TEXT' && !textSubmission) {
      throw new AppError('Text submission required', 400);
    }

    if (task.taskType === 'FILE' && fileUrls.length === 0) {
      throw new AppError('File submission required', 400);
    }

    if (task.taskType === 'BOTH' && !textSubmission && fileUrls.length === 0) {
      throw new AppError('Text or file submission required', 400);
    }

    const submission = await this.prisma.taskSubmission.create({
      data: {
        textSubmission,
        fileUrls,
        comment,
        status: 'SUBMITTED',
        taskId,
        studentId
      },
      include: {
        task: {
          select: { title: true, points: true }
        },
        student: {
          select: { name: true, email: true }
        }
      }
    });

    return submission;
  }

  async getSubmissions(
    taskId: string,
    userId: string,
    userRole: string,
    filters: SubmissionFilters
  ): Promise<{ submissions: any[]; pagination: any }> {
    const { hasAccess, task, error } = await this.permissionUtils.checkTaskAccess(
      userId,
      taskId,
      userRole
    );

    if (!hasAccess) {
      throw new AppError(error || 'Access denied', 403);
    }

    const { status, page, limit } = filters;
    const skip = (page - 1) * limit;

    let where: any = { taskId };

    if (userRole === 'STUDENT') {
      where.studentId = userId;
    } else {
      if (status) where.status = status;
    }

    const [submissions, total] = await Promise.all([
      this.prisma.taskSubmission.findMany({
        where,
        include: {
          student: {
            select: { id: true, name: true, email: true }
          },
          task: {
            select: { title: true, points: true, dueDate: true }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.taskSubmission.count({ where })
    ]);

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSubmissionById(
    submissionId: string,
    userId: string,
    userRole: string
  ): Promise<any> {
    const { hasAccess, submission, error } = await this.permissionUtils.checkSubmissionAccess(
      userId,
      submissionId,
      userRole
    );

    if (!hasAccess) {
      throw new AppError(error || 'Access denied', 403);
    }

    const submissionDetails = await this.prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        task: {
          select: { 
            id: true, 
            title: true, 
            points: true, 
            dueDate: true,
            taskType: true
          }
        }
      }
    });

    return submissionDetails;
  }

  async gradeSubmission(data: GradeSubmissionData): Promise<any> {
    const { submissionId, userId, userRole, grade, feedback } = data;

    const { hasAccess, submission, error } = await this.permissionUtils.checkSubmissionAccess(
      userId,
      submissionId,
      userRole
    );

    if (!hasAccess) {
      throw new AppError(error || 'Access denied', 403);
    }

    // Validate grade against task points
    if (grade > submission.task.points) {
      throw new AppError(
        `Grade cannot exceed ${submission.task.points} points`,
        400
      );
    }

    const gradedSubmission = await this.prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
        status: 'GRADED',
        gradedAt: new Date()
      },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        task: {
          select: { title: true, points: true }
        }
      }
    });

    return gradedSubmission;
  }
}
