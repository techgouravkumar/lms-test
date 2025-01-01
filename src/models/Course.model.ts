import mongoose, { Document, Schema } from "mongoose";

// Define interfaces first
interface FAQ {
	question: string;
	answer: string;
}

interface SocialMedia {
	platform: string;
	url: string;
}

interface DemoVideo {
	title: string;
	url: string;
}

export interface CourseDocument extends Document {
	title: string;
	description: string;
	createdBy: Schema.Types.ObjectId;
	originalCost: number;
	discount: number;
	createdAt: Date;
	updatedAt: Date;
	courseThumbnail: string;
	duration: number;
	validity: number;
	demoVideo?: DemoVideo[];
	faq?: FAQ[];
	socialMedia?: SocialMedia[];
	isPublished: boolean;
	category?: string;
	language: string;
	ratings?: {
		average: number;
		count: number;
	};
}

const CourseSchema: Schema<CourseDocument> = new Schema(
	{
		title: {
			type: String,
			maxLength: [100, "Title cannot exceed 100 characters"],
			required: true,
			trim: true,
			minlength: [3, "Title must be at least 3 characters long"],
			index: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			minlength: [10, "Description must be at least 10 characters long"],
		},
		originalCost: {
			type: Number,
			required: true,
			min: [0, "Cost cannot be negative"],
		},
		discount: {
			type: Number,
			default: 0,
			min: [0, "Discount cannot be negative"],
			max: [100, "Discount cannot exceed 100%"],
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "Admin", // Use string reference instead of direct model import
			required: true,
		},
		courseThumbnail: {
			type: String,
			default:
				"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7S1meIBhm9Sl8CK8IWQkXc0jRu0ylN6lqLg&s",
		},
		duration: {
			type: Number,
			required: true,
			min: [0, "Duration cannot be negative"],
		},
		validity: {
			type: Number,
			required: true,
			min: [1, "Validity must be at least 1 day"],
		},
		demoVideo: [
			{
				title: {
					type: String,
					required: true,
					trim: true,
				},
				url: {
					type: String,
					required: true,
					trim: true,
					validate: {
						validator: function (v: string) {
							return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(
								v,
							);
						},
						message: "Please enter a valid URL",
					},
				},
			},
		],
		faq: [
			{
				question: {
					type: String,
					required: true,
					trim: true,
					minlength: [
						10,
						"Question must be at least 10 characters long",
					],
				},
				answer: {
					type: String,
					required: true,
					trim: true,
					minlength: [
						10,
						"Answer must be at least 10 characters long",
					],
				},
			},
		],
		socialMedia: [
			{
				platform: {
					type: String,
					required: true,
					trim: true,
				},
				url: {
					type: String,
					required: true,
					trim: true,
					validate: {
						validator: function (v: string) {
							return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(
								v,
							);
						},
						message: "Please enter a valid URL",
					},
				},
			},
		],
		isPublished: {
			type: Boolean,
			default: false,
		},
		category: {
			type: String,
		},
		language: {
			type: String,
			required: true,
			default: "Hindi",
		},
		ratings: {
			average: {
				type: Number,
				default: 0,
				min: 0,
				max: 5,
			},
			count: {
				type: Number,
				default: 0,
				min: 0,
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

// Define virtuals and indexes
CourseSchema.virtual("finalPrice").get(function () {
	const discountAmount = (this.originalCost * this.discount) / 100;
	return this.originalCost - discountAmount;
});

CourseSchema.index({ category: 1 });
CourseSchema.index({ "ratings.average": -1 });
CourseSchema.index({ originalCost: 1 });

// Export the model
const CourseModel =
	mongoose.models.Course ||
	mongoose.model<CourseDocument>("Course", CourseSchema);
export default CourseModel;
