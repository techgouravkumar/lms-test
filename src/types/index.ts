export interface Admin {
	_id: string;
	name: string;
	email: string;
}

export interface Video {
	_id: string;
	title: string;
	url: string;
	description: string;
	isLive: boolean;
	isLiveChatEnabled: boolean;
	chapterId: string;
	createdAt: string;
	updatedAt: string;
}

export interface Rating {
	average: number;
	count: number;
}

export interface FAQ {
	question: string;
	answer: string;
}

export interface SocialMedia {
	platform: string;
	url: string;
}

export interface Course {
	_id: string;
	title: string;
	description: string;
	originalCost: number;
	discount: number;
	createdBy: {
		_id: string;
		name: string;
		email: string;
	};
	courseThumbnail: string;
	duration: number;
	validity: number;
	demoVideo: string[];
	faq: FAQ[];
	socialMedia: SocialMedia[];
	isPublished: boolean;
	category: string;
	language: string;
	ratings: Rating;
	createdAt: string;
	updatedAt: string;
	finalPrice?: number;
}
export interface Student {
	_id: string;
	fullName: string;
	gender: "male" | "female" | "other";
	email: string;
	phoneNumber: string;
	enrolledCourses: Course[];
	isLoggingIn: boolean;
	isVerified: boolean;
	createdAt: string;
}

export interface APIResponse<T> {
	success: boolean;
	data?: T;
	message: string;
	errors?: { path: string; message: string }[];
}

export interface Subject {
	_id: string;
	name: string;
	description: string;
	imageUrl: string;
	chapters?: Chapter[];
}
export interface Resource {
	_id: string;
	title: string;
	url: string;
}

export interface Chapter {
	_id: string;
	title: string;
	description: string;
	subjectId: string;
	resources: Resource[];
	videos: Video[];
	createdAt: string;
	updatedAt: string;
	chapterThumbnail: string;
}
export interface Comment {
	id: string;
	user: string;
	content: string;
	timestamp: string;
}