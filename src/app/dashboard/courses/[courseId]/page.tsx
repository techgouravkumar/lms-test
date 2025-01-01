"use client";
import React, { useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	BarChart3,
	Clock,
	Calendar,
	Star,
	Pencil,
	Plus,
	Globe,
	MessageSquare,
	CircleDollarSign,
	Video,
	Share2,
} from "lucide-react";
import { Course } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const CourseDetailAdmin = ({ params }: { params: { courseId: string } }) => {
	const { toast } = useToast();
	const [course, setCourse] = React.useState<Course | null>(null);

	useEffect(() => {
		const fetchCourse = async () => {
			try {
				const response = await axios.get(
					`/api/courses/${params.courseId}`,
				);
				if (response.data.success) {
					setCourse(response.data.data);
				}
			} catch (error) {
				toast({
					title: "Error",
					description: "Failed to fetch course details",
					variant: "destructive",
				});
			}
		};
		fetchCourse();
	}, [params.courseId, toast]);

	if (!course) return null;

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold">{course.title}</h1>
					<p className="text-muted-foreground">
						Created by {course.createdBy.name}
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => {
							toast({
								title: "Edit course feature coming soon",
								description: " ",
							});
						}}
					>
						<Pencil className="w-4 h-4 mr-2" /> Edit Course
					</Button>
					<Button asChild>
						<Link
							href={`/dashboard/courses/${params.courseId}/subject`}
						>
							<Plus className="w-4 h-4 mr-2" /> View Subject
						</Link>
					</Button>
				</div>
			</div>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList className="grid grid-cols-4 gap-4 bg-transparent">
					<TabsTrigger value="overview" className="bg-background">
						Overview
					</TabsTrigger>
					<TabsTrigger value="content" className="bg-background">
						Content
					</TabsTrigger>
					<TabsTrigger value="faq" className="bg-background">
						FAQ
					</TabsTrigger>
					<TabsTrigger value="social" className="bg-background">
						Social
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BarChart3 className="w-4 h-4" /> Course
									Stats
								</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-4">
								<div className="flex justify-between items-center">
									<span>Rating</span>
									<div className="flex items-center gap-1">
										<Star className="w-4 h-4 text-yellow-400" />
										<span>
											{course.ratings.average} (
											{course.ratings.count})
										</span>
									</div>
								</div>
								<div className="flex justify-between items-center">
									<span>Duration</span>
									<div className="flex items-center gap-1">
										<Clock className="w-4 h-4" />
										<span>{course.duration}h</span>
									</div>
								</div>
								<div className="flex justify-between items-center">
									<span>Validity</span>
									<div className="flex items-center gap-1">
										<Calendar className="w-4 h-4" />
										<span>{course.validity} days</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CircleDollarSign className="w-4 h-4" />{" "}
									Pricing
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold mb-2">
									₹
									{course.originalCost -
										(course.originalCost *
											course.discount) /
											100}
								</div>
								{course.discount > 0 && (
									<div className="flex items-center gap-2">
										<span className="text-muted-foreground line-through">
											₹{course.originalCost}
										</span>
										<Badge variant="destructive">
											{course.discount}% OFF
										</Badge>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Globe className="w-4 h-4" /> Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Badge variant="secondary">
									{course.language}
								</Badge>
								{course.category && (
									<Badge variant="outline">
										{course.category}
									</Badge>
								)}
								<Badge
									variant={
										course.isPublished
											? "destructive"
											: "default"
									}
								>
									{course.isPublished ? "Published" : "Draft"}
								</Badge>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Course Description</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap">
								{course.description}
							</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="content" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Video className="w-4 h-4" /> Demo Videos
							</CardTitle>
						</CardHeader>
						<CardContent>
							{course.demoVideo && course.demoVideo.length > 0 ? (
								<div className="grid gap-4">
									{course.demoVideo.map((video, index) => (
										<div
											key={index}
											className="flex items-center gap-2"
										>
											<Video className="w-4 h-4" />
											<a
												href={video}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-500 hover:underline"
											>{`Demo Video ${index + 1}`}</a>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground">
									No demo videos available
								</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="faq" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MessageSquare className="w-4 h-4" /> FAQ
							</CardTitle>
						</CardHeader>
						<CardContent>
							{course.faq && course.faq.length > 0 ? (
								<div className="space-y-4">
									{course.faq.map((faq, index) => (
										<div
											key={index}
											className="border-b pb-4"
										>
											<h3 className="font-semibold mb-2">
												{faq.question}
											</h3>
											<p className="text-muted-foreground">
												{faq.answer}
											</p>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground">
									No FAQs available
								</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="social" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Share2 className="w-4 h-4" /> Social Media
							</CardTitle>
						</CardHeader>
						<CardContent>
							{course.socialMedia &&
							course.socialMedia.length > 0 ? (
								<div className="grid gap-4">
									{course.socialMedia.map((social, index) => (
										<div
											key={index}
											className="flex items-center gap-2"
										>
											<Badge variant="outline">
												{social.platform}
											</Badge>
											<a
												href={social.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-500 hover:underline"
											>
												{social.url}
											</a>
										</div>
									))}
								</div>
							) : (
								<p className="text-muted-foreground">
									No social media links available
								</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default CourseDetailAdmin;
