import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Link } from "lucide-react";
import { Resource } from "@/types";

interface ResourceCardProps {
	resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{resource.title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex justify-between items-center">
					{/* {resource.type === "link" ? (
						<Button variant="outline" asChild>
							<a
								href={resource.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Link className="w-4 h-4 mr-2" />
								Open Link
							</a>
						</Button>
					) : ( */}
					<Button variant="outline" asChild>
						<a href={resource.url} download>
							<Download className="w-4 h-4 mr-2" />
							Download
						</a>
					</Button>
					{/* )} */}
				</div>
			</CardContent>
		</Card>
	);
};

export default ResourceCard;
