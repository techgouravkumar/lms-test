"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Course } from "@/types";

const EnrollmentPage = () => {
	const [email, setEmail] = useState("");
	const [courseId, setCourseId] = useState("");
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isFetchingCourses, setIsFetchingCourses] = useState(true);

	// Fetch courses on component mount
	useEffect(() => {
		const fetchCourses = async () => {
			setIsFetchingCourses(true);
			try {
				const response = await axios.get("/api/courses");
				setCourses(response.data.data);
			} catch (error) {
				setError("Error fetching courses. Please try again later.");
			} finally {
				setIsFetchingCourses(false);
			}
		};
		fetchCourses();
	}, []);

	// Basic email validation (can be extended)
	const isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Clear messages after a timeout
	const clearMessages = () => {
		setTimeout(() => {
			setSuccessMessage("");
			setError("");
		}, 3000); // Clear messages after 3 seconds
	};

	// Handle email and course enrollment
	const handleEnroll = async () => {
		if (!email || !courseId) {
			setError("Please provide both an email and a course.");
			return;
		}

		if (!isValidEmail(email)) {
			setError("Please enter a valid email address.");
			return;
		}

		setLoading(true);
		setError(""); // Clear previous error

		try {
			await axios.post(`/api/courses/${courseId}/enrollment`, {
				email,
			});
			setSuccessMessage("Enrollment successful!");
			setEmail(""); // Clear email field
			setCourseId(""); // Clear course selection
			clearMessages();
		} catch (error: any) {
			setError(error.response?.data?.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex justify-center items-center h-screen bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Enroll in a Course</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Success Message */}
						{successMessage && (
							<p className="text-green-500 font-semibold">
								{successMessage}
							</p>
						)}

						{/* Email Input */}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								aria-describedby="email-helper"
							/>
						</div>

						{/* Course Select */}
						<div className="space-y-2">
							<Label htmlFor="course">Course</Label>
							<Select
								value={courseId}
								onValueChange={setCourseId}
								aria-describedby="course-helper"
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a course" />
								</SelectTrigger>
								<SelectContent>
									{courses.map((course) => (
										<SelectItem
											key={course._id}
											value={course._id}
										>
											{course.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* Loading State */}
							{isFetchingCourses && (
								<div className="mt-2 text-sm text-gray-500 flex items-center">
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Loading courses...
								</div>
							)}
						</div>

						{/* Error Message */}
						{error && (
							<p className="text-red-500 font-semibold">
								{error}
							</p>
						)}

						{/* Enroll Button */}
						<Button onClick={handleEnroll} disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Enrolling...
								</>
							) : (
								"Enroll"
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default EnrollmentPage;
