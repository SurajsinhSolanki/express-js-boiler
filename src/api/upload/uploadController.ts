import type { Request, Response } from "express";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { createChildLogger } from "@/common/utils/logger";
import { StatusCodes } from "@/constants";

const logger = createChildLogger("upload-controller");

export class UploadController {
	/**
	 * Handles single file uploads.
	 * @param req The Express request object.
	 * @param res The Express response object.
	 */
	public async uploadSingleFile(req: Request, res: Response): Promise<void> {
		// Change return type to Promise<void>
		try {
			if (!req.file) {
				logger.warn("No file uploaded for single file upload.");
				res
					.status(StatusCodes.BAD_REQUEST)
					.json(ServiceResponse.failure("No file uploaded.", null, StatusCodes.BAD_REQUEST));
				return; // Explicitly return void
			}

			logger.info(`Single file uploaded: ${req.file.originalname}`);
			res.status(StatusCodes.OK).json(
				ServiceResponse.success("File uploaded successfully.", {
					filename: req.file.filename,
					originalname: req.file.originalname,
					mimetype: req.file.mimetype,
					size: req.file.size,
					path: req.file.path, // Path where the file is stored
				}),
			);
			return; // Explicitly return void
		} catch (error) {
			logger.error({ error }, "Error during single file upload.");
			res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json(
					ServiceResponse.failure(
						"Failed to upload file.",
						null,
						StatusCodes.INTERNAL_SERVER_ERROR,
					),
				);
			return; // Explicitly return void
		}
	}

	/**
	 * Handles multiple file uploads.
	 * @param req The Express request object.
	 * @param res The Express response object.
	 */
	public async uploadMultipleFiles(req: Request, res: Response): Promise<void> {
		// Change return type to Promise<void>
		try {
			if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
				logger.warn("No files uploaded for multiple file upload.");
				res
					.status(StatusCodes.BAD_REQUEST)
					.json(ServiceResponse.failure("No files uploaded.", null, StatusCodes.BAD_REQUEST));
				return; // Explicitly return void
			}

			const uploadedFiles = Array.isArray(req.files)
				? req.files.map((file) => ({
						filename: file.filename,
						originalname: file.originalname,
						mimetype: file.mimetype,
						size: file.size,
						path: file.path,
					}))
				: Object.values(req.files)
						.flat()
						.map((file) => ({
							filename: file.filename,
							originalname: file.originalname,
							mimetype: file.mimetype,
							size: file.size,
							path: file.path,
						}));

			logger.info(`Multiple files uploaded: ${uploadedFiles.length} files`);
			res
				.status(StatusCodes.OK)
				.json(ServiceResponse.success("Files uploaded successfully.", uploadedFiles));
			return; // Explicitly return void
		} catch (error) {
			logger.error({ error }, "Error during multiple file upload.");
			res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json(
					ServiceResponse.failure(
						"Failed to upload files.",
						null,
						StatusCodes.INTERNAL_SERVER_ERROR,
					),
				);
			return; // Explicitly return void
		}
	}
}

export const uploadController = new UploadController();
