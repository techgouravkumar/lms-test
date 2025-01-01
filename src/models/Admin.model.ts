import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			match: /.+\@.+\..+/,
			lowercase: true,
			trim: true,
			index: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const AdminModel =
	mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default AdminModel;
