<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Progress from '$lib/components/ui/progress.svelte';
	import VideoThumbnail from '$lib/components/video-thumbnail.svelte';
	import { TrendingUp, Target, Calendar, ArrowRight } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { authStore } from '$lib/stores/auth';
	import { videosApi, requestsApi } from '$lib/api';
	import type { Video, FundingRequest, User } from '$lib/api/types';

	let currentUser = $state<User | null>(null);
	let trendingVideos = $state<Video[]>([]);
	let activeRequests = $state<FundingRequest[]>([]);
	let loading = $state(true);
	let stats = $state({
		videoViews: 0,
		activeGoals: 0,
		supporters: 0,
		events: 0
	});

	onMount(async () => {
		await authStore.initialize();
		currentUser = $authStore.user;

		try {
			const [videosRes, requestsRes] = await Promise.all([
				videosApi.getTrending(),
				requestsApi.getAll({ status: 'active' })
			]);

			trendingVideos = videosRes.videos.slice(0, 4);
			activeRequests = requestsRes.requests.slice(0, 2);

			stats = {
				videoViews: trendingVideos.reduce((sum, v) => sum + v.viewsCount, 0),
				activeGoals: requestsRes.requests.filter(r => r.status === 'active').length,
				supporters: requestsRes.requests.reduce((sum, r) => sum + r.supportersCount, 0),
				events: 2
			};
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
				<div class="mb-8">
					<h1 class="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
						{currentUser ? $t.dashboard.welcomeUser.replace('{name}', currentUser.name.split(' ')[0]) : $t.dashboard.welcome}
					</h1>
					<p class="text-gray-600 dark:text-gray-400">
						{$t.dashboard.communityMessage}
					</p>
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
						<div class="space-y-4">
							<div class="flex items-center gap-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
								<div
									class="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white"
								>
									<span class="text-xs font-bold">MAR</span>
									<span class="text-lg font-bold">15</span>
								</div>
								<div class="flex-1">
									<h3 class="font-medium text-gray-900 dark:text-white">Women's Leadership Summit</h3>
									<p class="text-sm text-gray-500">2:00 PM - Virtual Event</p>
								</div>
								<Button size="sm">{$t.common.join}</Button>
							</div>
							<div class="flex items-center gap-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
								<div
									class="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white"
								>
									<span class="text-xs font-bold">MAR</span>
									<span class="text-lg font-bold">20</span>
								</div>
								<div class="flex-1">
									<h3 class="font-medium text-gray-900 dark:text-white">Mentor Matching Session</h3>
									<p class="text-sm text-gray-500">4:00 PM - Virtual Event</p>
								</div>
								<Button size="sm" variant="secondary">{$t.common.registerBtn}</Button>
							</div>
						</div>
					</Card>
				</section>
			{/if}
		</div>
	</main>
</div>
