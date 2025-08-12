import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { CreateUserSchema, GetUserSchema, LoginUserSchema, UpdateUserSchema, UserSchema } from '@/api/user/userModel';
import { API_ROUTES, VERSION_1 } from '@/common/utils/apiRoutes';
import { validateRequest } from '@/common/utils/httpHandlers';
import { authenticate, authorize } from '@/common/middleware/authMiddleware'; // Import auth middleware
import { userController } from './userController';

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register('User', UserSchema);

userRegistry.registerPath({
  method: 'get',
  path: VERSION_1 + API_ROUTES.USERS,
  tags: ['User'],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.array(UserSchema), 'Success')
});

userRouter.get('/', authenticate, authorize(['admin']), userController.getUsers);

userRegistry.registerPath({
  method: 'get',
  path: VERSION_1 + API_ROUTES.USERS + '/{id}',
  tags: ['User'],
  security: [{ BearerAuth: [] }],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, 'Success')
});

userRouter.get('/:id', authenticate, validateRequest(GetUserSchema), userController.getUser);

userRegistry.registerPath({
  method: 'get',
  path: VERSION_1 + API_ROUTES.USERS + '/email/{email}',
  tags: ['User'],
  security: [{ BearerAuth: [] }],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, 'Success')
});

userRouter.get('/email/:email', validateRequest(GetUserSchema), userController.findByEmail);

userRegistry.registerPath({
  method: 'get',
  path: VERSION_1 + API_ROUTES.USERS + '/phone-number/{phoneNumber}',
  tags: ['User'],
  security: [{ BearerAuth: [] }],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, 'Success')
});

userRouter.get('/phone-number/:phoneNumber', validateRequest(GetUserSchema), userController.findByPhoneNumber);

userRegistry.registerPath({
  method: 'post',
  path: VERSION_1 + API_ROUTES.USERS,
  tags: ['User'],
  security: [],
  request: { body: { content: { 'application/json': { schema: CreateUserSchema } } } },
  responses: createApiResponse(UserSchema, 'Success')
});

userRouter.post('/', validateRequest(CreateUserSchema), userController.createUser);

userRegistry.registerPath({
  method: 'put',
  path: VERSION_1 + API_ROUTES.USERS + '/{id}',
  tags: ['User'],
  security: [{ BearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: UpdateUserSchema } } } },
  responses: createApiResponse(UserSchema, 'Success')
});

userRouter.put(
  '/:id',
  authenticate,
  authorize(['admin', 'user']),
  validateRequest(UpdateUserSchema),
  userController.updateUser
);

userRegistry.registerPath({
  method: 'delete',
  path: VERSION_1 + API_ROUTES.USERS + '/{id}',
  tags: ['User'],
  security: [{ BearerAuth: [] }],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, 'Success')
});

userRouter.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateRequest(GetUserSchema),
  userController.deleteUser
);

userRegistry.registerPath({
  method: 'post',
  path: VERSION_1 + API_ROUTES.USERS + '/login',
  tags: ['User'],
  security: [],
  request: { body: { content: { 'application/json': { schema: LoginUserSchema } } } },
  responses: createApiResponse(UserSchema, 'Success')
});

userRouter.post('/login', validateRequest(LoginUserSchema), userController.login);
