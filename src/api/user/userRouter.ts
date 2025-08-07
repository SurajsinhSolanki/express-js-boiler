import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { GetUserSchema, UserSchema } from '@/api/user/userModel';
import { API_ROUTES, VERSION_1 } from '@/common/utils/apiRoutes';
import { validateRequest } from '@/common/utils/httpHandlers';
import { userController } from './userController';

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register('User', UserSchema);

userRegistry.registerPath({
  method: 'get',
  path: VERSION_1 + API_ROUTES.USERS,
  tags: ['User'],
  responses: createApiResponse(z.array(UserSchema), 'Success')
});

userRouter.get('/', userController.getUsers);

userRegistry.registerPath({
  method: 'get',
  path: VERSION_1 + API_ROUTES.USERS + '/{id}',
  tags: ['User'],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, 'Success')
});

userRouter.get('/:id', validateRequest(GetUserSchema), userController.getUser);
