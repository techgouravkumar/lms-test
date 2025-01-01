import mongoose, { Document, Schema } from "mongoose";
import ChapterModel from "./Chapter.model";

export interface VideoDocument extends Document {
	title: string;
	url: string;
	chapterId: Schema.Types.ObjectId;
	description: string;
	createdAt: Date;
	updatedAt: Date;
	isLive: boolean;
	isLiveChatEnabled: boolean;
}

const VideoSchema: Schema<VideoDocument> = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: [3, "Title must be at least 3 characters long"],
			maxLength: [100, "Title cannot exceed 100 characters"],
			index: true,
		},
		url: {
			type: String,
			required: true,
			validate: {
				validator: function (v: string) {
					return /^https?:\/\/.+$/.test(v);
				},
				message: (props) => `${props.value} is not a valid URL!`,
			},
		},
		chapterId: {
			type: Schema.Types.ObjectId,
			ref: ChapterModel,
			required: true,
			index: true,
		},
		description: {
			type: String,
			trim: true,
			default: "",
		},
		isLive: {
			type: Boolean,
			default: true,
		},
		isLiveChatEnabled: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

const VideoModel =
	mongoose.models.Video ||
	mongoose.model<VideoDocument>("Video", VideoSchema);
export default VideoModel;
