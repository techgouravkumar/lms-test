import mongoose from "mongoose";
import env from "./env";

// Define the connection object type
type ConnectionObject = {
	isConnected?: number;
};

// Initialize the connection object
const connection: ConnectionObject = {};

// Define the database name
const DATABASE_NAME = "lms_dev";

// Define the database connection function
async function dbConnect(): Promise<void> {
	// Check if already connected
	if (connection.isConnected) {
		console.log("Already Connected to database");
		return;
	}
	try {
		// Connect to the database
		const db = await mongoose.connect(
			`${env.DATABASE_URL}/${DATABASE_NAME}` || "",
		);
		// Update the connection status
		connection.isConnected = db.connections[0].readyState;
		console.log("Connected to database successfully");
	} catch (error) {
		console.log(error);
		console.log("Error connecting to database");
		process.exit(1);
	}
}

// Export the database connection function
export default dbConnect;
