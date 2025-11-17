import express, { type NextFunction, type Request, type Response, type Router } from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenAPIDocument } from "@/api-docs/openAPIDocumentGenerator";
import { ENV } from "@/common/utils/config";

const protectSwagger = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Basic ")) {
		res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Docs"');
		res.status(401).send("Authentication required.");
		return;
	}

	const base64Credentials = authHeader.split(" ")[1];
	const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
	const [username, password] = credentials.split(":");

	const SWAGGER_USER = ENV.SWAGGER_USER;
	const SWAGGER_PASS = ENV.SWAGGER_PASS;

	if (username === SWAGGER_USER && password === SWAGGER_PASS) {
		next();
		return;
	} else {
		res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Docs"');
		res.status(401).send("Invalid credentials.");
		return;
	}
};

export const openAPIRouter: Router = express.Router();
const openAPIDocument = generateOpenAPIDocument();

openAPIRouter.get("/api/docs/swagger.json", protectSwagger, (_req: Request, res: Response) => {
	res.setHeader("Content-Type", "application/json");
	res.send(openAPIDocument);
});

openAPIRouter.use("/api/docs", protectSwagger, swaggerUi.serve, swaggerUi.setup(openAPIDocument));
