import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

// Define types
interface ModelInfo {
	name: string;
	path: string;
}

interface CollectionCounts {
	[key: string]: number | string;
}

async function seed(): Promise<void> {
	try {
		console.log("Connecting to database...");
		await dbConnect();

		// Define models array with type
		const models: ModelInfo[] = [
			{ name: "Student", path: "@/models/Student.model" },
			{ name: "Course", path: "@/models/Course.model" },
			{ name: "Admin", path: "@/models/Admin.model" },
			{ name: "Chapter", path: "@/models/Chapter.model" },
			{ name: "Subject", path: "@/models/Subject.model" },
			{ name: "Video", path: "@/models/Video.model" },
			{ name: "Payment", path: "@/models/Payment.model" },
			{ name: "Slider", path: "@/models/Slider.model" },
		];

		// Import all models and get their counts
		const counts: CollectionCounts = {};
		for (const model of models) {
			try {
				const ModelClass: mongoose.Model<any> = (await import(model.path)).default;
				counts[model.name.toLowerCase() + "s"] = await ModelClass.countDocuments();
			} catch (error) {
				console.error(`Error counting ${model.name} documents:`, error);
				counts[model.name.toLowerCase() + "s"] = "Error";
			}
		}

		console.log("\nDatabase Collection Counts:");
		console.table(counts);
	} catch (error) {
		console.error("Database connection error:", error);
		process.exit(1);
	} finally {
		try {
			await mongoose.disconnect();
			console.log("Database connection closed.");
		} catch (error) {
			console.error("Error disconnecting from database:", error);
		}
		process.exit(0);
	}
}

// Add error handling for the main execution
process.on("unhandledRejection", (error: Error) => {
	console.error("Unhandled promise rejection:", error);
	process.exit(1);
});

seed();
