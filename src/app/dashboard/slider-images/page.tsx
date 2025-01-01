"use client";

import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface Slider {
	_id: string;
	url: string;
	isActive: boolean;
	createdAt: string;
}

export default function SlidersPage() {
	const [sliders, setSliders] = useState<Slider[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [uploading, setUploading] = useState<boolean>(false);
	const { toast } = useToast();

	// Fetch sliders
	const fetchSliders = async (): Promise<void> => {
		try {
			setLoading(true);
			const response = await axios.get("/api/slider-images");
			setSliders(response.data);
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to fetch sliders",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSliders();
	}, []);

	// Upload slider
	const handleUpload = async (
		e: ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		if (!e.target.files?.length) return;

		try {
			setUploading(true);
			const formData = new FormData();
			formData.append("image", e.target.files[0]);

			await axios.post("/api/slider-images", formData);
			toast({
				title: "Success",
				description: "Slider uploaded successfully",
			});
			fetchSliders();
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to upload slider",
			});
		} finally {
			setUploading(false);
		}
	};

	// Toggle slider status
	const toggleStatus = async (id: string): Promise<void> => {
		try {
			await axios.patch(`/api/slider-images/${id}`);
			fetchSliders();
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to update slider status",
			});
		}
	};

	// Delete slider
	const deleteSlider = async (id: string): Promise<void> => {
		try {
			await axios.delete(`/api/slider-images/${id}`);
			toast({
				title: "Success",
				description: "Slider deleted successfully",
			});
			fetchSliders();
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to delete slider",
			});
		}
	};

	return (
		<div className="container mx-auto py-10">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Slider Management</h1>
				<div className="flex gap-4">
					<Button
						variant="outline"
						disabled={uploading}
						onClick={() =>
							document.getElementById("fileInput")?.click()
						}
					>
						{uploading ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Upload className="mr-2 h-4 w-4" />
						)}
						Upload New Slider
					</Button>
					<input
						id="fileInput"
						type="file"
						className="hidden"
						accept="image/*"
						onChange={handleUpload}
					/>
				</div>
			</div>

			<Card>
				<CardContent className="p-6">
					{loading ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : sliders.length === 0 ? (
						<div className="flex justify-center items-center h-40 text-gray-500">
							No slider images available
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Preview</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sliders.map((slider) => (
									<TableRow key={slider._id}>
										<TableCell>
											<Dialog>
												<DialogTrigger>
													<div className="relative w-20 h-20">
														<Image
															src={slider.url}
															alt="Slider preview"
															fill
															className="object-cover rounded"
														/>
													</div>
												</DialogTrigger>
												<DialogContent className="max-w-2xl">
													<DialogHeader>
														<DialogTitle>
															Slider Preview
														</DialogTitle>
													</DialogHeader>
													<DialogDescription className="relative w-full h-[400px]">
														<Image
															src={slider.url}
															alt="Slider preview"
															fill
															className="object-cover rounded"
															sizes="(max-width: 768px) 50vw, (max-width: 1024px) 30vw, 20vw"
														/>
													</DialogDescription>
												</DialogContent>
											</Dialog>
										</TableCell>
										<TableCell>
											{new Date(
												slider.createdAt,
											).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<Switch
												checked={slider.isActive}
												onCheckedChange={() =>
													toggleStatus(slider._id)
												}
											/>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="destructive"
												size="icon"
												onClick={() =>
													deleteSlider(slider._id)
												}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
