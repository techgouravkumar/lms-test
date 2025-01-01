import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const NoLiveClass = () => (
	<Card className="bg-gray-50 w-full shadow-sm">
		<CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
			<AlertCircle className="w-12 h-12 text-gray-400" />
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-700">
					No Live Class Running
				</h3>
				<p className="text-gray-500 mt-2">
					There is currently no live class in session for this course.
					Please check back later.
				</p>
			</div>
		</CardContent>
	</Card>
);
