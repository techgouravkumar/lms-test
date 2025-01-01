import mongoose, { Document, Schema } from "mongoose";

export interface SliderDocument extends Document {
	url: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const SliderSchema: Schema<SliderDocument> = new Schema(
	{
		url: {
			type: String,
			required: true,
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

// Add compound index for faster querying active slides
SliderSchema.index({ isActive: 1, createdAt: -1 });

const SliderModel =
	mongoose.models.Slider ||
	mongoose.model<SliderDocument>("Slider", SliderSchema);

export default SliderModel;
