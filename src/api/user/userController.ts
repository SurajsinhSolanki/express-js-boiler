import type { Request, RequestHandler, Response } from 'express';

import { userService } from '@/api/user/userService';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createUser: RequestHandler = async (req: Request, res: Response) => {
    const user = req.body;
    const serviceResponse = await userService.create(user);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const user = req.body;
    const serviceResponse = await userService.update(id, user);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.delete(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public findByEmail: RequestHandler = async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const serviceResponse = await userService.findByEmail(email);
    return handleServiceResponse(serviceResponse, res);
  };

  public findByPhoneNumber: RequestHandler = async (req: Request, res: Response) => {
    const phoneNumber = req.params.phoneNumber as string;
    const serviceResponse = await userService.findByPhoneNumber(phoneNumber);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const userController = new UserController();
