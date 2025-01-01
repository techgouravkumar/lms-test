import mongoose, { Schema, Document, Types } from "mongoose";
import CourseModel from "./Course.model";

export interface Student extends Document {
	fullName: string;
	email: string;
	password: string;
	phoneNumber: string;
	isSubscribed: boolean;
	subscriptionEndDate: Date;
	enrolledCourses: Types.ObjectId[];
	gender: string;
	token: string;
	isVerified: boolean;
	verifyCode: string;
	verifyCodeExpiry: Date;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
	isLoggingIn: boolean;
}

const StudentSchema: Schema<Student> = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			match: [/.+\@.+\..+/, "Please use a valid email address"],
			lowercase: true,
			trim: true,
			index: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		phoneNumber: {
			type: String,
			required: [true, "Phone number is required"],
			trim: true,
			match: [/^\d{10}$/, "Please use a valid 10-digit phone number"],
		},
		isSubscribed: {
			type: Boolean,
			default: false,
		},
		subscriptionEndDate: {
			type: Date,
			default: null,
		},
		enrolledCourses: {
			type: [Schema.Types.ObjectId],
			ref: CourseModel,
			default: [],
		},
		gender: {
			type: String,
			enum: ["male", "female", "other"],
			required: [true, "Gender is required"],
		},
		token: {
			type: String,
		},
		verifyCode: {
			type: String,
		},
		verifyCodeExpiry: {
			type: Date,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isLoggingIn: {
			type: Boolean,
			default: false, // Default value is false
		},
	},
	{ timestamps: true },
);

const StudentModel =
	(mongoose.models.Student as mongoose.Model<Student>) ||
	mongoose.model<Student>("Student", StudentSchema);

export default StudentModel;
