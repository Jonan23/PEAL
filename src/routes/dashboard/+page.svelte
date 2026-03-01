<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Progress from '$lib/components/ui/progress.svelte';
	import VideoThumbnail from '$lib/components/video-thumbnail.svelte';
	import {
		TrendingUp,
		Target,
		Calendar,
		ArrowRight,
		Plus,
		ChevronDown,
		Users as UsersIcon,
		ShieldAlert
	} from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { authStore } from '$lib/stores/auth';
	import { videosApi, requestsApi, eventsApi, goalsApi, adminApi } from '$lib/api';
	import type { Video, FundingRequest, User, Event, ModerationReport } from '$lib/api';

	type AdminStats = {
		totalUsers: number;
		activeUsers: number;
		totalVideos: number;
		totalFundingRequests: number;
		totalDonations: number;
		totalDonationAmount: number;
		totalMentors: number;
		pendingReports: number;
	};

	type AdminAnalytics = {
		period: string;
		newUsers: number;
		newVideos: number;
		newDonations: number;
		donationTotal: number;
	};

	type AdminUserRow = User & {
		_count: {
			videos: number;
			fundingRequests: number;
			fundingDonations: number;
		};
	};

	let currentUser = $state<User | null>(null);
	let trendingVideos = $state<Video[]>([]);
	let activeRequests = $state<FundingRequest[]>([]);
	let upcomingEvents = $state<Event[]>([]);
	let adminStats = $state<AdminStats | null>(null);
	let adminAnalytics = $state<AdminAnalytics | null>(null);
	let recentUsers = $state<AdminUserRow[]>([]);
	let pendingReports = $state<ModerationReport[]>([]);
	let showPostMenu = $state(false);
	let loading = $state(true);
	let stats = $state({
		videoViews: 0,
		activeGoals: 0,
		supporters: 0,
		events: 0
	});

	const postOptions = [
		{ label: 'Funding Request', href: '/requests/new' },
		{ label: 'Video Update', href: '/feed/upload' },
		{ label: 'Upcoming Event', href: '/events' }
	];

	onMount(async () => {
		await authStore.initialize();
		currentUser = $authStore.user;

		try {
			const [videosRes, requestsRes, goalsRes, eventsRes] = await Promise.all([
				videosApi.getTrending(),
				requestsApi.getAll({ status: 'active' }),
				goalsApi.getAll('in_progress'),
				eventsApi.getAll({ status: 'upcoming' })
			]);

			trendingVideos = (videosRes.videos || []).slice(0, 4);
			activeRequests = (requestsRes.requests || []).slice(0, 2);
			upcomingEvents = (eventsRes.events || []).slice(0, 2);

			stats = {
				videoViews: trendingVideos.reduce((sum, v) => sum + (v.viewsCount || 0), 0),
				activeGoals: goalsRes.goals?.length || 0,
				supporters: (requestsRes.requests || []).reduce((sum, r) => sum + (r.supportersCount || 0), 0),
				events: eventsRes.pagination?.total || 0
			};

			if (currentUser?.role === 'admin') {
				const [dashboardRes, analyticsRes, usersRes, reportsRes] = await Promise.all([
					adminApi.getDashboard(),
					adminApi.getAnalytics(),
					adminApi.getUsers({ page: 1, limit: 5 }),
					adminApi.getReports({ page: 1, limit: 5, status: 'pending' })
				]);

				adminStats = dashboardRes.stats;
				adminAnalytics = analyticsRes.analytics;
				recentUsers = usersRes.users as AdminUserRow[];
				pendingReports = reportsRes.reports;
			}
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			loading = false;
		}
	});

	function formatNumber(num: number): string {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	}

	function getReportReason(reason: string): string {
		const labels: Record<string, string> = {
			spam: 'Spam',
			harassment: 'Harassment',
			inappropriate: 'Inappropriate',
			misinformation: 'Misinformation',
			other: 'Other'
		};

		return labels[reason] || reason;
	}
</script>

<svelte:head>
	<title>Dashboard - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto px-4 py-6 lg:p-8">
			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
				</div>
			{:else}
				<!-- Welcome Section -->
				<div class="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
					<h1 class="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
						{currentUser ? $t.dashboard.welcomeUser.replace('{name}', currentUser.name.split(' ')[0]) : $t.dashboard.welcome}
					</h1>
					<p class="text-gray-600 dark:text-gray-400">
						{$t.dashboard.communityMessage}
					</p>
					</div>

					<div class="relative">
						<Button onclick={() => (showPostMenu = !showPostMenu)}>
							<Plus class="mr-2 h-4 w-4" />
							Post
							<ChevronDown class="ml-2 h-4 w-4" />
						</Button>

						{#if showPostMenu}
							<div
								class="absolute right-0 z-10 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
							>
								{#each postOptions as option}
									<a
										href={option.href}
										onclick={() => (showPostMenu = false)}
										class="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
									>
										{option.label}
									</a>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<!-- Stats Cards -->
				<div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
					<Card class="p-4">
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30"
							>
								<TrendingUp class="h-5 w-5 text-rose-500" />
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.videoViews)}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{$t.dashboard.videoViews}</p>
							</div>
						</div>
					</Card>
					<Card class="p-4">
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30"
							>
								<Target class="h-5 w-5 text-orange-500" />
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeGoals}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{$t.dashboard.activeGoals}</p>
							</div>
						</div>
					</Card>
					<Card class="p-4">
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30"
							>
								<svg
									class="h-5 w-5 text-violet-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.supporters}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{$t.dashboard.supporters}</p>
							</div>
						</div>
					</Card>
					<Card class="p-4">
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
							>
								<Calendar class="h-5 w-5 text-emerald-500" />
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.events}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{$t.dashboard.events}</p>
							</div>
						</div>
					</Card>
				</div>

				<!-- Your Goals -->
				{#if activeRequests.length > 0}
					<section class="mb-8">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-xl font-semibold text-gray-900 dark:text-white">{$t.dashboard.yourGoals}</h2>
							<a
								href="/goals"
								class="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600"
							>
								{$t.common.viewAll} <ArrowRight class="h-4 w-4" />
							</a>
						</div>
						<div class="grid gap-4 md:grid-cols-2">
							{#each activeRequests as request}
								<Card class="p-4">
									<div class="flex gap-4">
										{#if request.coverImageUrl}
											<img
												src={request.coverImageUrl}
												alt={request.title}
												class="h-20 w-20 rounded-xl object-cover"
											/>
										{:else}
											<div
												class="h-20 w-20 rounded-xl bg-gradient-to-br from-rose-200 to-orange-200"
											></div>
										{/if}
										<div class="flex-1">
											<h3 class="mb-1 line-clamp-1 font-medium text-gray-900 dark:text-white">
												{request.title}
											</h3>
											<Badge variant="secondary" class="mb-2">{request.category || 'General'}</Badge>
											<Progress value={request.currentAmount} max={request.goalAmount} />
											<p class="mt-1 text-sm text-gray-500">
												${request.currentAmount.toLocaleString()} of ${request.goalAmount.toLocaleString()}
											</p>
										</div>
									</div>
								</Card>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Trending Videos -->
				{#if trendingVideos.length > 0}
					<section class="mb-8">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-xl font-semibold text-gray-900 dark:text-white">{$t.dashboard.trending}</h2>
							<a href="/feed" class="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600">
								{$t.common.viewAll} <ArrowRight class="h-4 w-4" />
							</a>
						</div>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
							{#each trendingVideos as video}
								<VideoThumbnail {video} />
							{/each}
						</div>
					</section>
				{/if}

			<!-- Upcoming Events -->
				<section>
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-xl font-semibold text-gray-900 dark:text-white">{$t.dashboard.upcomingEvents}</h2>
						<a
							href="/events"
							class="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600"
						>
							{$t.common.viewAll} <ArrowRight class="h-4 w-4" />
						</a>
					</div>
					<Card class="p-4">
						{#if upcomingEvents.length > 0}
							<div class="space-y-4">
								{#each upcomingEvents as event (event.id)}
									<div class="flex items-center gap-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
										<div
											class="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white"
										>
											<span class="text-xs font-bold">
												{new Date(event.eventDate).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
											</span>
											<span class="text-lg font-bold">{new Date(event.eventDate).getDate()}</span>
										</div>
										<div class="flex-1">
											<h3 class="font-medium text-gray-900 dark:text-white">{event.title}</h3>
											<p class="text-sm text-gray-500">
												{new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
												 - {event.isVirtual ? 'Virtual Event' : event.location || 'TBA'}
											</p>
										</div>
										<a href="/events">
											<Button size="sm" variant={event.isVirtual ? 'primary' : 'secondary'}>
												{event.isVirtual ? $t.common.join : $t.common.registerBtn}
											</Button>
										</a>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-gray-500 dark:text-gray-400">No upcoming events yet.</p>
						{/if}
					</Card>
				</section>

				{#if currentUser?.role === 'admin' && adminStats && adminAnalytics}
					<section class="mt-8 space-y-6">
						<div class="flex items-center justify-between">
							<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Platform Overview</h2>
							<Badge variant="secondary">Admin</Badge>
						</div>

						<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
							<Card class="p-4">
								<p class="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
								<p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalUsers}</p>
								<p class="text-xs text-emerald-500">+{adminAnalytics.newUsers} last 30d</p>
							</Card>
							<Card class="p-4">
								<p class="text-xs text-gray-500 dark:text-gray-400">Total Videos</p>
								<p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalVideos}</p>
								<p class="text-xs text-emerald-500">+{adminAnalytics.newVideos} last 30d</p>
							</Card>
							<Card class="p-4">
								<p class="text-xs text-gray-500 dark:text-gray-400">Donation Volume</p>
								<p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
									${(adminStats.totalDonationAmount / 100).toFixed(2)}
								</p>
								<p class="text-xs text-emerald-500">+${(adminAnalytics.donationTotal / 100).toFixed(2)} last 30d</p>
							</Card>
							<Card class="p-4">
								<p class="text-xs text-gray-500 dark:text-gray-400">Pending Reports</p>
								<p class="mt-1 text-2xl font-bold text-orange-500">{adminStats.pendingReports}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">Needs moderation</p>
							</Card>
						</div>

						<div class="grid gap-6 lg:grid-cols-2">
							<Card class="p-4">
								<div class="mb-3 flex items-center gap-2">
									<UsersIcon class="h-4 w-4 text-rose-500" />
									<h3 class="font-semibold text-gray-900 dark:text-white">Newest Users</h3>
								</div>
								{#if recentUsers.length > 0}
									<div class="space-y-3">
										{#each recentUsers as user (user.id)}
											<div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
												<div>
													<p class="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
													<p class="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
												</div>
												<Badge variant="secondary">{user.role}</Badge>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-sm text-gray-500 dark:text-gray-400">No recent users.</p>
								{/if}
							</Card>

							<Card class="p-4">
								<div class="mb-3 flex items-center gap-2">
									<ShieldAlert class="h-4 w-4 text-orange-500" />
									<h3 class="font-semibold text-gray-900 dark:text-white">Pending Reports</h3>
								</div>
								{#if pendingReports.length > 0}
									<div class="space-y-3">
										{#each pendingReports as report (report.id)}
											<div class="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
												<div class="mb-1 flex items-center justify-between gap-2">
													<Badge variant="secondary">{report.contentType}</Badge>
													<span class="text-xs text-gray-500 dark:text-gray-400">{getReportReason(report.reason)}</span>
												</div>
												<p class="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
													{report.description || `Reported content: ${report.contentId}`}
												</p>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-sm text-gray-500 dark:text-gray-400">No pending reports.</p>
								{/if}
							</Card>
						</div>
					</section>
				{/if}
			{/if}
		</div>
	</main>
</div>
