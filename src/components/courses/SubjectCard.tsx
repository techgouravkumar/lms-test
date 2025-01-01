"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { Subject } from "@/types";

interface SubjectCardProps {
	subject: Subject;
	courseId: string;
}

const SubjectCard = ({ subject, courseId }: SubjectCardProps) => {
	const router = useRouter();

	const handleClick = () => {
		router.push(`/dashboard/courses/${courseId}/subject/${subject._id}`);
	};

	return (
		<Card
			className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
			onClick={handleClick}
		>
			<CardHeader>
				<CardTitle>{subject.name}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{subject.imageUrl ? (
					<div className="relative w-full h-48">
						<Image
							src={subject.imageUrl}
							alt={subject.name}
							fill
							className="object-cover rounded"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						/>
					</div>
				) : (
					<div className="w-full h-48 bg-secondary flex items-center justify-center rounded">
						<ImageIcon className="h-12 w-12 text-muted-foreground" />
					</div>
				)}
				<p className="text-muted-foreground line-clamp-3">
					{subject.description}
				</p>
			</CardContent>
		</Card>
	);
};

export default SubjectCard;
