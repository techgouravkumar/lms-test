"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Pencil, MoreHorizontal, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Student {
	_id: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	gender: string;
	isVerified: boolean;
}

interface PaginationInfo {
	totalStudents: number;
	totalPages: number;
	currentPage: number;
	pageSize: number;
}

export default function StudentsTable() {
	const [students, setStudents] = useState<Student[]>([]);
	const [pagination, setPagination] = useState<PaginationInfo>({
		totalStudents: 0,
		totalPages: 0,
		currentPage: 1,
		pageSize: 10,
	});
	const [loading, setLoading] = useState(true);
	const [selectedStudent, setSelectedStudent] =
		React.useState<Student | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const fetchStudents = async (page: number = 1) => {
		try {
			setLoading(true);
			const response = await axios.get(
				`/api/students?page=${page}&limit=${pagination.pageSize}`,
			);
			if (response.data.success) {
				setStudents(response.data.data);
				setPagination(response.data.pagination);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch students",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStudents();
	}, []);

	const handlePageChange = (page: number) => {
		if (page < 1 || page > pagination.totalPages) return;
		fetchStudents(page);
	};

	const handleDelete = async (studentId: string) => {
		try {
			const response = await axios.delete(`/api/students/${studentId}`);
			if (response.data.success) {
				toast({
					title: "Success",
					description: "Student deleted successfully",
				});
				fetchStudents(pagination.currentPage);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete student",
				variant: "destructive",
			});
		}
		setDeleteDialogOpen(false);
	};

	return (
		<div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Full Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone Number</TableHead>
							<TableHead>Gender</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center">
									Loading...
								</TableCell>
							</TableRow>
						) : students.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center">
									No students found
								</TableCell>
							</TableRow>
						) : (
							students.map((student) => (
								<TableRow key={student._id}>
									<TableCell>{student.fullName}</TableCell>
									<TableCell>{student.email}</TableCell>
									<TableCell>{student.phoneNumber}</TableCell>
									<TableCell className="capitalize">
										{student.gender}
									</TableCell>
									<TableCell>
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												student.isVerified
													? "bg-green-100 text-green-800"
													: "bg-yellow-100 text-yellow-800"
											}`}
										>
											{student.isVerified
												? "Verified"
												: "Pending"}
										</span>
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>
													Actions
												</DropdownMenuLabel>
												{/* Change "Edit" to "View" */}
												<DropdownMenuItem
													onClick={() => {
														router.push(
															`/dashboard/students/${student._id}`,
														);
													}}
												>
													<Pencil className="mr-2 h-4 w-4" />
													View
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-red-600"
													onClick={() => {
														setSelectedStudent(
															student,
														);
														setDeleteDialogOpen(
															true,
														);
													}}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<Pagination className="mt-4 cursor-pointer">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={() =>
								handlePageChange(pagination.currentPage - 1)
							}
							isActive={pagination.currentPage > 1} // Disable if on first page
						/>
					</PaginationItem>
					{[...Array(pagination.totalPages)].map((_, index) => (
						<PaginationItem key={index + 1}>
							<PaginationLink
								onClick={() => handlePageChange(index + 1)}
								isActive={pagination.currentPage === index + 1}
							>
								{index + 1}
							</PaginationLink>
						</PaginationItem>
					))}
					<PaginationItem>
						<PaginationNext
							onClick={() =>
								handlePageChange(pagination.currentPage + 1)
							}
							isActive={
								pagination.currentPage < pagination.totalPages
							} // Disable if on last page
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this student? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() =>
								selectedStudent &&
								handleDelete(selectedStudent._id)
							}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
