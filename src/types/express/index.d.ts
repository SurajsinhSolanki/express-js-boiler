import "express";
import { JwtPayload } from "../../common/utils/jwt";

declare global {
	namespace Express {
		interface Request {
			id: string;
			user?: JwtPayload;
			t: (key: string, options?: object) => string;
			file?: Express.Multer.File;
			files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
		}
	}
}
