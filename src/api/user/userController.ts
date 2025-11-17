import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class UserController {
	public getUsers: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await userService.findAll();
		handleServiceResponse(serviceResponse, res);
	};

	public getUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.findById(id);
		handleServiceResponse(serviceResponse, res);
	};

	public createUser: RequestHandler = async (req: Request, res: Response) => {
		const user = req.body;
		const serviceResponse = await userService.create(user);
		handleServiceResponse(serviceResponse, res);
	};

	public updateUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const user = req.body;
		const serviceResponse = await userService.update(id, user);
		handleServiceResponse(serviceResponse, res);
	};

	public deleteUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.delete(id);
		handleServiceResponse(serviceResponse, res);
	};

	public findByEmail: RequestHandler = async (req: Request, res: Response) => {
		const email = req.params.email as string;
		const serviceResponse = await userService.findByEmail(email);
		handleServiceResponse(serviceResponse, res);
	};

	public findByPhoneNumber: RequestHandler = async (req: Request, res: Response) => {
		const phoneNumber = req.params.phoneNumber as string;
		const serviceResponse = await userService.findByPhoneNumber(phoneNumber);
		handleServiceResponse(serviceResponse, res);
	};

	public login = async (req: Request, res: Response): Promise<void> => {
		const credentials = req.body;
		const serviceResponse = await userService.login(credentials);
		handleServiceResponse(serviceResponse, res);
	};

	public requestEmailChange = async (req: Request, res: Response): Promise<void> => {
		const id = Number.parseInt(req.params.id as string, 10);
		const { newEmail } = req.body;
		const serviceResponse = await userService.requestEmailChange(id, newEmail);
		handleServiceResponse(serviceResponse, res);
	};

	public verifyEmailChange = async (req: Request, res: Response): Promise<void> => {
		const { token } = req.body;
		const serviceResponse = await userService.verifyEmailChange(token);
		handleServiceResponse(serviceResponse, res);
	};

	public refreshTokens = async (req: Request, res: Response): Promise<void> => {
		const { refreshToken } = req.body;
		const serviceResponse = await userService.refreshAccessToken(refreshToken);
		handleServiceResponse(serviceResponse, res);
	};
}

export const userController = new UserController();
