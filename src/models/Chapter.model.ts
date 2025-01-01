import mongoose, { Document, Schema } from "mongoose";
import SubjectModel from "./Subject.model";

interface Notes {
	title: string;
	url: string;
}

export interface ChapterDocument extends Document {
	title: string;
	subjectId: Schema.Types.ObjectId;
	description: string;
	resources?: Notes[];
	chapterThumbnail?: string;
	createdAt: Date;
	updatedAt: Date;
}

const ChapterSchema: Schema<ChapterDocument> = new Schema(
	{
		title: {
			type: String,
			required: [true, "Chapter title is required"],
			trim: true,
			minlength: [3, "Chapter title must be at least 3 characters long"],
			maxLength: [100, "Chapter title cannot exceed 100 characters"],
		},
		subjectId: {
			type: Schema.Types.ObjectId,
			ref: SubjectModel,
			required: [true, "Subject ID is required"],
			index: true,
		},
		description: {
			type: String,
			required: [true, "Chapter description is required"],
			trim: true,
			maxLength: [1000, "Description cannot exceed 1000 characters"],
		},
		resources: [
			{
				title: {
					type: String,
					required: [true, "Resource title is required"],
					trim: true,
					minlength: [
						3,
						"Resource title must be at least 3 characters long",
					],
					maxLength: [
						100,
						"Resource title cannot exceed 100 characters",
					],
				},
				url: {
					type: String,
					required: [true, "Resource URL is required"],
					trim: true,
					validate: {
						validator: function (v: string) {
							return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
								v,
							);
						},
						message: "Please enter a valid URL",
					},
				},
			},
		],
		chapterThumbnail: {
			type: String,
			trim: true,
			default:
				"https://cdn.midjourney.com/dc3d86c3-2fe7-48a6-81e8-9091912fcd0e/0_2.png",
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

const ChapterModel =
	mongoose.models.Chapter ||
	mongoose.model<ChapterDocument>("Chapter", ChapterSchema);
export default ChapterModel;
