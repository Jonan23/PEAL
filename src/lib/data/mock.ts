export interface User {
	id: string;
	name: string;
	email: string;
	avatar: string;
	role: 'woman' | 'sponsor';
	bio?: string;
	skills?: string[];
	location?: string;
	joinedAt: Date;
}

export interface Video {
	id: string;
	title: string;
	description: string;
	thumbnail: string;
	videoUrl: string;
	author: User;
	category: string;
	tags: string[];
	likes: number;
	comments: number;
	shares: number;
	createdAt: Date;
	duration: number;
}

export interface Mentor {
	id: string;
	user: User;
	skills: string[];
	bio: string;
	availability: 'available' | 'busy' | 'unavailable';
	connections: number;
}

export interface FundingRequest {
	id: string;
	title: string;
	description: string;
	category: string;
	goalAmount: number;
	currentAmount: number;
	supporters: number;
	author: User;
	createdAt: Date;
	imageUrl?: string;
}

export interface SuccessStory {
	id: string;
	title: string;
	description: string;
	author: User;
	beforeImage: string;
	afterImage: string;
	impact: string;
	createdAt: Date;
}

export interface Notification {
	id: string;
	type: 'like' | 'comment' | 'follow' | 'reaction' | 'mention' | 'video_upload' | 'achievement';
	message: string;
	fromUser?: User;
	read: boolean;
	createdAt: Date;
}

export const mockUsers: User[] = [
	{
		id: '1',
		name: 'Sarah Johnson',
		email: 'sarah@example.com',
		avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
		role: 'woman',
		bio: 'Aspiring entrepreneur passionate about tech',
		skills: ['Leadership', 'Technology', 'Marketing'],
		location: 'New York, USA',
		joinedAt: new Date('2024-01-15')
	},
	{
		id: '2',
		name: 'Maria Garcia',
		email: 'maria@example.com',
		avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
		role: 'woman',
		bio: 'Small business owner',
		skills: ['Business', 'Finance', 'Sales'],
		location: 'Madrid, Spain',
		joinedAt: new Date('2024-02-01')
	},
	{
		id: '3',
		name: 'Emily Chen',
		email: 'emily@example.com',
		avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
		role: 'sponsor',
		bio: 'Venture capitalist, mentor, and advocate for women in tech',
		skills: ['Investment', 'Technology', 'Mentoring'],
		location: 'San Francisco, USA',
		joinedAt: new Date('2023-12-01')
	},
	{
		id: '4',
		name: 'Amara Okafor',
		email: 'amara@example.com',
		avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
		role: 'sponsor',
		bio: 'Philanthropist focused on education and empowerment',
		skills: ['Education', 'Non-profit', 'Public Speaking'],
		location: 'Lagos, Nigeria',
		joinedAt: new Date('2024-01-01')
	}
];

export const mockVideos: Video[] = [
	{
		id: '1',
		title: 'My Journey to Starting My Own Business',
		description:
			'Sharing my experience of launching my startup and the lessons I learned along the way.',
		thumbnail: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400',
		videoUrl: 'https://example.com/videos/1.mp4',
		author: mockUsers[0],
		category: 'entrepreneurship',
		tags: ['business', 'startup', 'inspiration'],
		likes: 1234,
		comments: 89,
		shares: 45,
		createdAt: new Date('2024-03-10'),
		duration: 180
	},
	{
		id: '2',
		title: 'How I Overcame Self-Doubt',
		description: 'A powerful story about building confidence and believing in yourself.',
		thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
		videoUrl: 'https://example.com/videos/2.mp4',
		author: mockUsers[1],
		category: 'motivation',
		tags: ['confidence', 'mental-health', 'growth'],
		likes: 2567,
		comments: 156,
		shares: 89,
		createdAt: new Date('2024-03-08'),
		duration: 240
	},
	{
		id: '3',
		title: 'Mentorship Changed My Life',
		description: 'How finding the right mentor transformed my career trajectory.',
		thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
		videoUrl: 'https://example.com/videos/3.mp4',
		author: mockUsers[0],
		category: 'mentorship',
		tags: ['mentorship', 'career', 'guidance'],
		likes: 1890,
		comments: 112,
		shares: 67,
		createdAt: new Date('2024-03-05'),
		duration: 300
	},
	{
		id: '4',
		title: 'Financial Literacy for Women',
		description: 'Essential tips for managing your finances and building wealth.',
		thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
		videoUrl: 'https://example.com/videos/4.mp4',
		author: mockUsers[2],
		category: 'education',
		tags: ['finance', 'education', 'wealth'],
		likes: 3421,
		comments: 234,
		shares: 123,
		createdAt: new Date('2024-03-01'),
		duration: 420
	},
	{
		id: '5',
		title: 'From Idea to Launch in 30 Days',
		description: 'A step-by-step guide to quickly validating and launching your business idea.',
		thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
		videoUrl: 'https://example.com/videos/5.mp4',
		author: mockUsers[1],
		category: 'entrepreneurship',
		tags: ['startup', 'launch', 'business'],
		likes: 987,
		comments: 78,
		shares: 34,
		createdAt: new Date('2024-02-28'),
		duration: 360
	},
	{
		id: '6',
		title: 'Building Your Personal Brand',
		description: 'Learn how to establish and grow your personal brand online.',
		thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
		videoUrl: 'https://example.com/videos/6.mp4',
		author: mockUsers[2],
		category: 'marketing',
		tags: ['branding', 'marketing', 'personal-growth'],
		likes: 2156,
		comments: 145,
		shares: 89,
		createdAt: new Date('2024-02-25'),
		duration: 270
	}
];

export const mockMentors: Mentor[] = [
	{
		id: '1',
		user: mockUsers[2],
		skills: ['Investment', 'Technology', 'Startups', 'Leadership'],
		bio: '15+ years in venture capital, helped 50+ women-led startups get funded.',
		availability: 'available',
		connections: 234
	},
	{
		id: '2',
		user: mockUsers[3],
		skills: ['Education', 'Non-profit', 'Public Speaking', 'Mentoring'],
		bio: 'Passionate about empowering the next generation of women leaders.',
		availability: 'available',
		connections: 189
	},
	{
		id: '3',
		user: {
			...mockUsers[2],
			id: '5',
			name: 'Jennifer Williams',
			avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
		},
		skills: ['Marketing', 'Sales', 'Business Development', 'E-commerce'],
		bio: 'Built and sold 3 companies, now dedicated to helping women entrepreneurs.',
		availability: 'busy',
		connections: 312
	},
	{
		id: '4',
		user: {
			...mockUsers[2],
			id: '6',
			name: 'Dr. Aisha Patel',
			avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
		},
		skills: ['Technology', 'AI', 'Research', 'Academia'],
		bio: 'PhD in Computer Science, tech leader and advocate for women in STEM.',
		availability: 'available',
		connections: 156
	}
];

export const mockFundingRequests: FundingRequest[] = [
	{
		id: '1',
		title: 'Tech Education for Rural Girls',
		description: 'Providing laptops and coding classes to 100 girls in rural communities.',
		category: 'education',
		goalAmount: 15000,
		currentAmount: 8750,
		supporters: 89,
		author: mockUsers[1],
		createdAt: new Date('2024-03-01'),
		imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
	},
	{
		id: '2',
		title: 'Women-Owned Restaurant',
		description: 'Funding to open a sustainable farm-to-table restaurant run by single mothers.',
		category: 'business',
		goalAmount: 25000,
		currentAmount: 12000,
		supporters: 145,
		author: mockUsers[0],
		createdAt: new Date('2024-02-15'),
		imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
	},
	{
		id: '3',
		title: 'Healthcare Initiative for Mothers',
		description: 'Providing prenatal and postnatal care for underserved communities.',
		category: 'healthcare',
		goalAmount: 50000,
		currentAmount: 32500,
		supporters: 267,
		author: mockUsers[1],
		createdAt: new Date('2024-01-20'),
		imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400'
	},
	{
		id: '4',
		title: 'Fashion Design School',
		description:
			'Scholarship fund for aspiring women fashion designers from low-income backgrounds.',
		category: 'education',
		goalAmount: 10000,
		currentAmount: 4500,
		supporters: 56,
		author: mockUsers[0],
		createdAt: new Date('2024-03-05'),
		imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
	}
];

export const mockSuccessStories: SuccessStory[] = [
	{
		id: '1',
		title: 'From Scholarship to CEO',
		description: 'How a PEAL scholarship helped me build a million-dollar tech company.',
		author: mockUsers[0],
		beforeImage: 'https://images.unsplash.com/photo-1519327233552-1370418e6bf8?w=400',
		afterImage: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400',
		impact: 'Created 50 jobs, mentored 200+ women',
		createdAt: new Date('2024-02-01')
	},
	{
		id: '2',
		title: 'Breaking Barriers in Tech',
		description: 'My journey from a small town to becoming a lead engineer at a Fortune 500.',
		author: mockUsers[1],
		beforeImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
		afterImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
		impact: 'Featured in Forbes 30 Under 30',
		createdAt: new Date('2024-01-15')
	},
	{
		id: '3',
		title: 'Building a Community Center',
		description: 'Creating a safe space for women and children in my hometown.',
		author: mockUsers[1],
		beforeImage: 'https://images.unsplash.com/photo-1499028344343-cd17b5cf5600?w=400',
		afterImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400',
		impact: 'Helped 1000+ families',
		createdAt: new Date('2023-12-20')
	}
];

export const mockNotifications: Notification[] = [
	{
		id: '1',
		type: 'like',
		message: 'liked your video',
		fromUser: mockUsers[2],
		read: false,
		createdAt: new Date()
	},
	{
		id: '2',
		type: 'follow',
		message: 'started following you',
		fromUser: mockUsers[3],
		read: false,
		createdAt: new Date(Date.now() - 3600000)
	},
	{
		id: '3',
		type: 'comment',
		message: 'commented on your video',
		fromUser: mockUsers[0],
		read: true,
		createdAt: new Date(Date.now() - 86400000)
	}
];
