import mongoose, { Document, Schema, Types } from "mongoose";
import CourseModel from "./Course.model";
import StudentModel from "./Student.model";

export interface IPayment extends Document {
	studentId: Types.ObjectId;
	courseId: Types.ObjectId;
	amount: number;
	paymentDate: Date;
	paymentMethod: string;
	transactionId: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
	{
		studentId: {
			type: Schema.Types.ObjectId,
			ref: StudentModel,
			required: true,
		},
		courseId: {
			type: Schema.Types.ObjectId,
			ref: CourseModel,
			required: true,
		},
		amount: { type: Number, required: true },
		paymentDate: {
			type: Date,
			required: true,
			default: Date.now,
		},
		paymentMethod: {
			type: String,
			required: true,
		},
		transactionId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "success", "failed"],
			default: "pending",
		},
	},
	{ timestamps: true },
);

const PaymentModel =
	mongoose.models.Payment ||
	mongoose.model<IPayment>("Payment", PaymentSchema);
	
export default PaymentModel;
