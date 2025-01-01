import {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Star, Clock, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Course, Rating } from "@/types";
import Link from "next/link";

export const CourseRating = ({ average, count }: Rating) => (
	<div className="flex items-center gap-1">
		<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
		<span className="text-sm">
			{average.toFixed(1)} ({count} reviews)
		</span>
	</div>
);

export const PriceDisplay = ({
	originalCost,
	discount,
}: Pick<Course, "originalCost" | "discount">) => {
	const discountedPrice = originalCost - (originalCost * discount) / 100;
	return (
		<div className="flex flex-col">
			<span className="text-xl font-bold">₹{discountedPrice}</span>
			{discount > 0 && (
				<span className="text-sm line-through text-muted-foreground">
					₹{originalCost}
				</span>
			)}
		</div>
	);
};

export const LoadingSkeleton = () => (
	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{[...Array(6)].map((_, index) => (
			<div key={index} className="w-full h-full">
				<Skeleton className="w-full h-72" />
				<Skeleton className="w-full h-6 mt-4" />
				<Skeleton className="w-3/4 h-4 mt-2" />
				<Skeleton className="w-1/2 h-4 mt-2" />
			</div>
		))}
	</div>
);
export const CourseCard = ({ course }: { course: Course }) => {
	const truncatedDescription =
		course.description.length > 100
			? `${course.description.slice(0, 100)}...`
			: course.description;

	return (
		<Card className="w-full h-full flex flex-col hover:shadow-lg transition-shadow">
			<CardHeader>
				<div className="aspect-video relative rounded-lg overflow-hidden mb-4">
					<img
						src={
							course.courseThumbnail || "/api/placeholder/400/225"
						}
						alt={course.title}
						className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
					/>
				</div>
				<div className="flex justify-between items-start gap-2">
					<CardTitle className="line-clamp-2 flex-1">
						{course.title}
					</CardTitle>
				</div>
				<CardDescription>{truncatedDescription}</CardDescription>
			</CardHeader>

			<CardContent className="flex-grow space-y-4">
				<div className="flex flex-wrap gap-2">
					<Badge variant="secondary">{course.language}</Badge>
					{course.category && (
						<Badge variant="outline">{course.category}</Badge>
					)}
				</div>

				<div className="space-y-2 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<Clock className="w-4 h-4" />
						<span>{course.duration} hours</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar className="w-4 h-4" />
						<span>{course.validity} days validity</span>
					</div>
					<CourseRating
						average={course.ratings.average}
						count={course.ratings.count}
					/>
				</div>

				<Button className="w-full" asChild>
					<Link href={`/dashboard/courses/${course._id}`}>
						View Full Course <ArrowRight className="ml-2 w-4 h-4" />
					</Link>
				</Button>
			</CardContent>

			<CardFooter className="flex justify-between items-center">
				<PriceDisplay
					originalCost={course.originalCost}
					discount={course.discount}
				/>
				{course.discount > 0 && (
					<Badge variant="destructive">{course.discount}% OFF</Badge>
				)}
			</CardFooter>
		</Card>
	);
};
