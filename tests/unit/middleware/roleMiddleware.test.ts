import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response, NextFunction } from 'express';
import { Request } from '@/types/express'; // Import the extended Request type
import { authorizeRoles, UserRole } from '@/common/middleware/roleMiddleware';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { StatusCodes } from '@/common/utils/statusCodes';

describe('authorizeRoles Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
  });

  it('should return 401 if no user is found in request', () => {
    const middleware = authorizeRoles([UserRole.ADMIN]);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith(
      ServiceResponse.failure('Unauthorized: Authentication required.', null, StatusCodes.UNAUTHORIZED)
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow access for ADMIN to ADMIN-only route', () => {
    (mockRequest as Request).user = { id: 1, email: 'admin@example.com', isAdmin: true, role: 'admin' };
    const middleware = authorizeRoles([UserRole.ADMIN]);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should deny access for USER to ADMIN-only route', () => {
    (mockRequest as Request).user = { id: 2, email: 'user@example.com', isAdmin: false, role: 'user' };
    const middleware = authorizeRoles([UserRole.ADMIN]);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      ServiceResponse.failure('Forbidden: Insufficient permissions.', null, StatusCodes.FORBIDDEN)
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should allow access for ADMIN to USER-allowed route', () => {
    (mockRequest as Request).user = { id: 1, email: 'admin@example.com', isAdmin: true, role: 'admin' };
    const middleware = authorizeRoles([UserRole.USER]);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow access for USER to USER-allowed route', () => {
    (mockRequest as Request).user = { id: 2, email: 'user@example.com', isAdmin: false, role: 'user' };
    const middleware = authorizeRoles([UserRole.USER]);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should allow access for USER to route allowing both USER and ADMIN', () => {
    (mockRequest as Request).user = { id: 2, email: 'user@example.com', isAdmin: false, role: 'user' };
    const middleware = authorizeRoles([UserRole.ADMIN, UserRole.USER]);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should deny access if user role is not in allowed roles', () => {
    (mockRequest as Request).user = { id: 3, email: 'guest@example.com', isAdmin: false, role: 'guest' as any }; // Simulate an unexpected role
    const middleware = authorizeRoles([UserRole.ADMIN]);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
