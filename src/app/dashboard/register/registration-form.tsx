// app/register/registration-form.tsx
"use client";

import React from "react";
import axios from "axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface FormData {
	fullName: string;
	email: string;
	password: string;
	phoneNumber: string;
	gender: string;
}

export default function RegistrationForm() {
	const { toast } = useToast();
	const router = useRouter();
	const [isLoading, setIsLoading] = React.useState(false);
	const [formData, setFormData] = React.useState<FormData>({
		fullName: "",
		email: "",
		password: "",
		phoneNumber: "",
		gender: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleGenderChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			gender: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await axios.post("/api/admins/register-students", formData);

			if (response.data.success) {
				toast({
					title: "Success!",
					description: "Registration completed successfully.",
				});

				// Redirect to login or dashboard
				router.push("/dashboard/students");
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Registration failed",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Student Registration</CardTitle>
				<CardDescription>
					Create your account to get started
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="fullName">Full Name</Label>
						<Input
							id="fullName"
							name="fullName"
							value={formData.fullName}
							onChange={handleChange}
							required
							placeholder="Enter your full name"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							required
							placeholder="Enter your email"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							value={formData.password}
							onChange={handleChange}
							required
							placeholder="Create a password"
							minLength={6}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phoneNumber">Phone Number</Label>
						<Input
							id="phoneNumber"
							name="phoneNumber"
							value={formData.phoneNumber}
							onChange={handleChange}
							required
							placeholder="Enter your phone number"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="gender">Gender</Label>
						<Select
							value={formData.gender}
							onValueChange={handleGenderChange}
							required
						>
							<SelectTrigger>
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="male">Male</SelectItem>
								<SelectItem value="female">Female</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}
					>
						{isLoading ? "Registering..." : "Register"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
