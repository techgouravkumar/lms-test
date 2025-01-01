import mongoose, { Document, Schema } from "mongoose";
import CourseModel from "./Course.model";

export interface SubjectDocument extends Document {
	name: string;
	description: string;
	imageUrl?: string;
	courseId: Schema.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const SubjectSchema: Schema<SubjectDocument> = new Schema(
	{
		name: {
			type: String,
			required: [true, "Subject name is required"],
			trim: true,
			unique: true,
			minlength: [2, "Subject name must be at least 2 characters long"],
			maxlength: [50, "Subject name cannot exceed 50 characters"],
			index: true,
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			trim: true,
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		imageUrl: {
			type: String,
			validate: {
				validator: function (v: string) {
					return (
						!v ||
						/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(
							v,
						)
					);
				},
				message: "Please enter a valid URL",
			},
		},
		courseId: {
			type: Schema.Types.ObjectId,
			ref: CourseModel,
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

const SubjectModel =
	mongoose.models.Subject ||
	mongoose.model<SubjectDocument>("Subject", SubjectSchema);
export default SubjectModel;
