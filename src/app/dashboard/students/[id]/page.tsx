"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Phone, Mail, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Student } from "@/types";

const StudentDetails = ({ params }: { params: { id: string } }) => {
	const [student, setStudent] = useState<Student | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedData, setEditedData] = useState<{
		fullName: string;
		phoneNumber: string;
		gender: "male" | "female" | "other";
		isLoggingIn: boolean;
	}>({
		fullName: "",
		phoneNumber: "",
		gender: "male", // Default gender (or use any other valid value)
		isLoggingIn: false,
	});

	useEffect(() => {
		const fetchStudent = async () => {
			try {
				setLoading(true);
				setError(null);

				const { data } = await axios.get(`/api/students/${params.id}`);

				if (!data.success) {
					throw new Error(
						data.message || "Failed to fetch student details",
					);
				}

				setStudent(data.data); // Set the full student data to state

				// Initialize editedData with the fetched student info
				setEditedData({
					fullName: data.data.fullName,
					phoneNumber: data.data.phoneNumber,
					gender: data.data.gender, // Gender should be "male", "female", or "other"
					isLoggingIn: data.data.isLoggingIn, // This is a boolean
				});
			} catch (err) {
				if (axios.isAxiosError(err)) {
					setError(
						err.response?.data?.message ||
							"Failed to fetch student details",
					);
				} else {
					setError("An unexpected error occurred");
				}
			} finally {
				setLoading(false);
			}
		};

		if (params.id) {
			fetchStudent();
		}
	}, [params.id]);

	const handleUpdate = async () => {
		try {
			setError(null);
			const { data } = await axios.put(
				`/api/students/${params.id}`,
				editedData,
			);

			if (!data.success) {
				throw new Error(
					data.message || "Failed to update student details",
				);
			}

			setStudent((prevStudent) => ({ ...prevStudent!, ...editedData }));
			setIsEditing(false);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(
					err.response?.data?.message ||
						"Failed to update student details",
				);
			} else {
				setError("An unexpected error occurred");
			}
		}
	};

	if (loading) {
		return (
			<Card className="w-full max-w-3xl mx-auto mt-6">
				<CardHeader>
					<Skeleton className="h-8 w-[250px]" />
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-4 w-[200px]" />
					<Skeleton className="h-4 w-[150px]" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-[180px]" />
						<Skeleton className="h-20 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (!student) {
		return (
			<Alert>
				<AlertTitle>No Data</AlertTitle>
				<AlertDescription>No student details found.</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card className="w-full max-w-3xl">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="text-2xl">
						{isEditing ? "Edit Profile" : student.fullName}
					</CardTitle>
					<CardDescription>Student Profile</CardDescription>
				</div>
				{!isEditing ? (
					<Button
						variant="outline"
						size="icon"
						onClick={() => setIsEditing(true)}
					>
						<Edit2 className="h-4 w-4" />
					</Button>
				) : (
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setIsEditing(false)}
						>
							<X className="h-4 w-4" />
						</Button>
						<Button
							variant="default"
							size="icon"
							onClick={handleUpdate}
						>
							<Save className="h-4 w-4" />
						</Button>
					</div>
				)}
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{isEditing ? (
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium mb-1 block">
									Full Name
								</label>
								<Input
									value={editedData.fullName}
									onChange={(e) =>
										setEditedData((prev) => ({
											...prev,
											fullName: e.target.value,
										}))
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">
									Phone Number
								</label>
								<Input
									value={editedData.phoneNumber}
									onChange={(e) =>
										setEditedData((prev) => ({
											...prev,
											phoneNumber: e.target.value,
										}))
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">
									Gender
								</label>
								<Select
									value={editedData.gender}
									onValueChange={(value) =>
										setEditedData((prev) => ({
											...prev,
											gender: value as
												| "male"
												| "female"
												| "other",
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">
											Male
										</SelectItem>
										<SelectItem value="female">
											Female
										</SelectItem>
										<SelectItem value="other">
											Other
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium mb-1 block">
									Login Status
								</label>
								<Select
									value={editedData.isLoggingIn.toString()}
									onValueChange={(value) =>
										setEditedData((prev) => ({
											...prev,
											isLoggingIn: value === "true",
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select login status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="true">
											Logged In
										</SelectItem>
										<SelectItem value="false">
											Logged Out
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center space-x-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Email
										</p>
										<p>{student.email}</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Phone
										</p>
										<p>{student.phoneNumber}</p>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Gender
									</p>
									<p className="capitalize">
										{student.gender}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Login Status
									</p>
									<Badge
										variant={
											student.isLoggingIn
												? "default"
												: "secondary"
										}
									>
										{student.isLoggingIn
											? "Logged In"
											: "Logged Out"}
									</Badge>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold mb-3">
									Enrolled Courses
								</h3>
								{student.enrolledCourses.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{student.enrolledCourses.map(
											(course) => (
												<Card key={course._id}>
													<CardContent className="pt-4">
														<h4 className="font-semibold mb-1">
															{course.title}
														</h4>
														<p className="text-sm text-muted-foreground line-clamp-2">
															{course.description}
														</p>
													</CardContent>
												</Card>
											),
										)}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										No courses enrolled yet
									</p>
								)}
							</div>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default StudentDetails;
