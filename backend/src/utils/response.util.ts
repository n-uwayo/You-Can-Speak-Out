import { Response } from 'express';
import { ApiResponse } from '../types/common.types';

export class ResponseUtil {
  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 400, error?: string): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response, 
    data: T[], 
    totalItems: number, 
    currentPage: number, 
    itemsPerPage: number,
    message: string = 'Data retrieved successfully'
  ): Response {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return res.json({
      success: true,
      message,
      data,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    });
  }
}