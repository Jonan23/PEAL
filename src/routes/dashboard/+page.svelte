<script lang="ts">
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Progress from '$lib/components/ui/progress.svelte';
	import VideoThumbnail from '$lib/components/video-thumbnail.svelte';
	import { TrendingUp, Target, Calendar, ArrowRight } from 'lucide-svelte';
	import { mockUsers, mockVideos, mockFundingRequests } from '$lib/data/mock';

	const currentUser = mockUsers[0];
	const trendingVideos = mockVideos.slice(0, 4);
	const activeRequests = mockFundingRequests.slice(0, 2);
</script>

<svelte:head>
	<title>Dashboard - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto px-4 py-6 lg:p-8">
			<!-- Welcome Section -->
			<div class="mb-8">
				<h1 class="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
					Welcome back, {currentUser.name.split(' ')[0]}!
				</h1>
				<p class="text-gray-600 dark:text-gray-400">
					Here's what's happening in your community today.
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
							<p class="text-2xl font-bold text-gray-900 dark:text-white">2.5K</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">Video Views</p>
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
							<p class="text-2xl font-bold text-gray-900 dark:text-white">3</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">Active Goals</p>
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
							<p class="text-2xl font-bold text-gray-900 dark:text-white">89</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">Supporters</p>
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
							<p class="text-2xl font-bold text-gray-900 dark:text-white">2</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">Events</p>
						</div>
					</div>
				</Card>
			</div>

			<!-- Your Goals -->
			<section class="mb-8">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Your Goals</h2>
					<a
						href="/goals"
						class="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600"
					>
						View all <ArrowRight class="h-4 w-4" />
					</a>
				</div>
				<div class="grid gap-4 md:grid-cols-2">
					{#each activeRequests as request}
						<Card class="p-4">
							<div class="flex gap-4">
								{#if request.imageUrl}
									<img
										src={request.imageUrl}
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
									<Badge variant="secondary" class="mb-2">{request.category}</Badge>
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

			<!-- Trending Videos -->
			<section class="mb-8">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Trending Now</h2>
					<a href="/feed" class="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600">
						View all <ArrowRight class="h-4 w-4" />
					</a>
				</div>
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{#each trendingVideos as video}
						<VideoThumbnail {video} />
					{/each}
				</div>
			</section>

			<!-- Upcoming Events -->
			<section>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
					<a
						href="/events"
						class="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600"
					>
						View all <ArrowRight class="h-4 w-4" />
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
							<Button size="sm">Join</Button>
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
							<Button size="sm" variant="secondary">Register</Button>
						</div>
					</div>
				</Card>
			</section>
		</div>
	</main>
</div>
