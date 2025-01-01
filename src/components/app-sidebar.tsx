"use client";
import {
	Home,
	Video,
	Users,
	PlusCircle,
	Book,
	UserPlus,
	UserCheck,
	LogOut,
	FileSliders,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

// Menu items.
const menuItems = [
	{
		title: "Home",
		url: "/dashboard",
		icon: Home,
	},

	{
		title: "Courses",
		url: "/dashboard/courses",
		icon: Book,
	},
	{
		title: "Add Course",
		url: "/dashboard/courses/new",
		icon: PlusCircle,
	},
	{
		title: "Registration",
		url: "/dashboard/register",
		icon: UserPlus,
	},
	{
		title: "Students",
		url: "/dashboard/students",
		icon: Users,
	},
	{
		title: "Enroll Student",
		url: "/dashboard/enroll-student",
		icon: UserCheck,
	},
	{
		title: "Slider Images",
		url: "/dashboard/slider-images",
		icon: FileSliders,
	},
];

export function AppSidebar() {
	const router = useRouter();
	const { toast } = useToast();

	const handleLogout = async () => {
		try {
			await axios.post("/api/admins/logout");
			router.replace("/login");
			toast({
				title: "Logged Out",
				description: "You have been logged out successfully.",
			});
		} catch (error) {
			console.error("Error logging out:", error);
			toast({
				title: "Logout Failed",
				description: "Failed to log you out. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link href={item.url}>
											<item.icon className="mr-2" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<button onClick={handleLogout}>
										<LogOut className="mr-2" />
										<span>Logout</span>
									</button>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
