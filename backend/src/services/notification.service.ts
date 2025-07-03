// services/notification.service.ts
import { PrismaClient } from '@prisma/client';

export class NotificationService {
  constructor(private prisma: PrismaClient) {}

  async createNotification(
    userId: string,
    type: 'COURSE_UPDATE' | 'TASK_DUE' | 'TASK_GRADED' | 'NEW_COMMENT' | 'ENROLLMENT' | 'GENERAL',
    title: string,
    message: string
  ): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message
        }
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  async notifyTaskDue(taskId: string): Promise<void> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          module: {
            include: {
              course: {
                include: {
                  enrollments: {
                    where: { status: 'ACTIVE' },
                    include: { student: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!task) return;

      const students = task.module.course.enrollments.map(e => e.student);

      for (const student of students) {
        await this.createNotification(
          student.id,
          'TASK_DUE',
          'Task Due Soon',
          `Task "${task.title}" is due soon in ${task.module.course.title}`
        );
      }
    } catch (error) {
      console.error('Failed to send due date notifications:', error);
    }
  }

  async notifyTaskGraded(submissionId: string): Promise<void> {
    try {
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

      if (!submission) return;

      await this.createNotification(
        submission.studentId,
        'TASK_GRADED',
        'Task Graded',
        `Your submission for "${submission.task.title}" has been graded`
      );
    } catch (error) {
      console.error('Failed to send grading notification:', error);
    }
  }

  async notifyNewTaskCreated(taskId: string): Promise<void> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          module: {
            include: {
              course: {
                include: {
                  enrollments: {
                    where: { status: 'ACTIVE' },
                    include: { student: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!task) return;

      const students = task.module.course.enrollments.map(e => e.student);

      for (const student of students) {
        await this.createNotification(
          student.id,
          'COURSE_UPDATE',
          'New Task Available',
          `A new task "${task.title}" has been posted in ${task.module.course.title}`
        );
      }
    } catch (error) {
      console.error('Failed to send new task notifications:', error);
    }
  }
}