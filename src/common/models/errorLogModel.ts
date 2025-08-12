import mongoose, { Schema, Document } from 'mongoose';

export interface IErrorLog extends Document {
  message: string;
  stack?: string;
  level: string;
  timestamp: Date;
  environment: string;
  statusCode?: number;
  requestUrl?: string;
  requestMethod?: string;
  userId?: mongoose.Types.ObjectId; // Assuming user IDs are MongoDB ObjectIds
  ipAddress?: string;
  additionalInfo?: object;
}

const ErrorLogSchema: Schema = new Schema({
  message: { type: String, required: true },
  stack: { type: String },
  level: { type: String, required: true, default: 'error' },
  timestamp: { type: Date, default: Date.now },
  environment: { type: String, required: true },
  statusCode: { type: Number },
  requestUrl: { type: String },
  requestMethod: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to a User model if applicable
  ipAddress: { type: String },
  additionalInfo: { type: Object }
});

const ErrorLog = mongoose.model<IErrorLog>('ErrorLog', ErrorLogSchema);

export default ErrorLog;
