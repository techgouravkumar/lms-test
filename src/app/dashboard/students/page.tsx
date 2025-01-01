import StudentsTable from "./students-table";

export default function StudentsPage() {
	return (
		<div className="container mx-auto py-10 px-4">
			<h1 className="text-2xl font-bold mb-6">Students </h1>
			<StudentsTable />
		</div>
	);
}
