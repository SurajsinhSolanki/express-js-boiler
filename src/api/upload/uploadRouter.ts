import path from "node:path";
import express, { type Router } from "express";
import multer from "multer";
import { z } from "zod";
import { API_VERSION, buildRoute, ROUTES } from "@/constants";
import { uploadController } from "./uploadController";

export const uploadRouter: Router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		// Ensure the 'uploads' directory exists. You might want to make this configurable.
		const uploadPath = path.join(__dirname, "../../../public/uploads");
		// In a real application, you'd create this directory if it doesn't exist
		// fs.mkdirSync(uploadPath, { recursive: true });
		cb(null, uploadPath);
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
	},
});

const upload = multer({ storage: storage });

uploadRouter.post(
	buildRoute(ROUTES.UPLOAD, "/single"),
	upload.single("file"),
	uploadController.uploadSingleFile,
);

uploadRouter.post(
	buildRoute(ROUTES.UPLOAD, "/multiple"),
	upload.array("files", 10),
	uploadController.uploadMultipleFiles,
); // Max 10 files

export const uploadPaths = {
	[buildRoute(API_VERSION.V1, ROUTES.UPLOAD, "/single")]: {
		post: {
			tags: ["Upload"],
			summary: "Upload a single file",
			requestBody: {
				content: {
					"multipart/form-data": {
						schema: {
							type: "object",
							properties: {
								file: { type: "string", format: "binary" },
							},
							required: ["file"],
						},
					},
				},
			},
			responses: {
				200: {
					description: "File uploaded successfully",
					content: {
						"application/json": {
							schema: z.object({
								filename: z.string(),
								originalname: z.string(),
								mimetype: z.string(),
								size: z.number(),
								path: z.string(),
							}),
						},
					},
				},
			},
		},
	},
	[buildRoute(API_VERSION.V1, ROUTES.UPLOAD, "/multiple")]: {
		post: {
			tags: ["Upload"],
			summary: "Upload multiple files",
			requestBody: {
				content: {
					"multipart/form-data": {
						schema: {
							type: "object" as const,
							properties: {
								files: {
									type: "array" as const,
									items: {
										type: "string" as const,
										format: "binary" as const,
									},
								},
							},
							required: ["files"],
						},
					},
				},
			},
			responses: {
				200: {
					description: "Files uploaded successfully",
					content: {
						"application/json": {
							schema: z.array(
								z.object({
									filename: z.string(),
									originalname: z.string(),
									mimetype: z.string(),
									size: z.number(),
									path: z.string(),
								}),
							),
						},
					},
				},
			},
		},
	},
};
