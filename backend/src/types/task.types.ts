export interface CreateTaskData {
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  points?: number;
  taskType?: 'TEXT' | 'FILE' | 'BOTH';
  moduleId: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  instructions?: string;
  dueDate?: Date;
  points?: number;
  taskType?: 'TEXT' | 'FILE' | 'BOTH';
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface TaskFilters {
  moduleId?: string;
  courseId?: string;
  status?: string;
  taskType?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SubmitTaskData {
  taskId: string;
  studentId: string;
  textSubmission?: string;
  comment?: string;
  files?: Express.Multer.File[];
}

export interface GradeSubmissionData {
  submissionId: string;
  userId: string;
  userRole: string;
  grade: number;
  feedback?: string;
}

export interface SubmissionFilters {
  status?: string;
  page: number;
  limit: number;
}

export interface TaskStats {
  totalEnrolled: number;
  totalSubmissions: number;
  submissionRate: string;
  submissionStats: Record<string, number>;
  averageGrade: number;
  gradedCount: number;
}
