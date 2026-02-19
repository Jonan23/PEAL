<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import VideoThumbnail from '$lib/components/video-thumbnail.svelte';
	import VideoModal from '$lib/components/video-modal.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import {
		Search,
		Filter,
		Grid3X3,
		List,
		Heart,
		Share2,
		SlidersHorizontal,
		MessageCircle,
		TrendingUp,
		Check
	} from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { videosApi } from '$lib/api';
	import type { Video } from '$lib/api/types';

	let videos = $state<Video[]>([]);
	let loading = $state(true);
	let viewMode = $state<'grid' | 'vertical'>('vertical');
	let searchQuery = $state('');
	let selectedCategory = $state('all');
	let selectedVideo = $state<Video | null>(null);
	let selectedHashtag = $state('');
	let copiedVideoId = $state<string | null>(null);

	const categories = [
		'all',
		'entrepreneurship',
		'motivation',
		'mentorship',
		'education',
		'marketing'
	];

	const hashtags = $derived([
		$t.hashtags.womenInTech,
		$t.hashtags.entrepreneurshipTag,
		$t.hashtags.mentorshipTag,
		$t.hashtags.fundingTag,
		$t.hashtags.successStoriesTag,
		$t.hashtags.womenLeadersTag,
		$t.hashtags.startupTag,
		$t.hashtags.empowermentTag
	]);

	onMount(async () => {
		try {
			const response = await videosApi.getAll({ limit: 50 });
			videos = response.data;
		} catch (error) {
			console.error('Failed to load videos:', error);
		} finally {
			loading = false;
		}
	});

	const filteredVideos = $derived(
		videos
			.filter((video) => {
				const matchesSearch =
					video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(video.tags && video.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
				const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
				const matchesHashtag =
					!selectedHashtag ||
					(video.tags && video.tags.some((tag) =>
						tag.toLowerCase().includes(selectedHashtag.toLowerCase().replace('#', ''))
					));
				return matchesSearch && matchesCategory && matchesHashtag;
			})
	);

	function selectHashtag(tag: string) {
		selectedHashtag = selectedHashtag === tag ? '' : tag;
	}

	function formatNumber(num: number): string {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	}

	async function handleLike(video: Video) {
		try {
			await videosApi.like(video.id);
			videos = videos.map(v => 
				v.id === video.id ? { ...v, likesCount: v.likesCount + 1 } : v
			);
		} catch (error) {
			console.error('Failed to like video:', error);
		}
	}

	async function handleShare(video: Video) {
		const shareUrl = `${window.location.origin}/feed?v=${video.id}`;
		const shareData = {
			title: video.title,
			text: video.description || `Check out this video: ${video.title}`,
			url: shareUrl
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(shareUrl);
				copiedVideoId = video.id;
				setTimeout(() => {
					copiedVideoId = null;
				}, 2000);
			}
			videos = videos.map(v =>
				v.id === video.id ? { ...v, sharesCount: v.sharesCount + 1 } : v
			);
		} catch (error) {
			if ((error as Error).name !== 'AbortError') {
				console.error('Failed to share:', error);
			}
		}
	}
</script>

<svelte:head>
	<title>Feed - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto px-4 py-6 lg:p-8">
			<!-- Header -->
			<div class="mb-6 flex flex-col gap-4">
				<div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
					<div>
						<h1 class="text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">{$t.feed.title}</h1>
						<p class="text-gray-600 dark:text-gray-400">{$t.feed.discoverStories}</p>
					</div>

					<!-- Action Buttons -->
					<div class="flex items-center gap-2">
						<Button variant="secondary" size="sm">
							<Heart class="mr-1 h-4 w-4" />
							{$t.common.like}
						</Button>
						<a href="/feed/upload">
							<Button variant="primary" size="sm">
								<Share2 class="mr-1 h-4 w-4" />
								{$t.nav.shareVideo}
							</Button>
						</a>
						<Button variant="secondary" size="sm">
							<SlidersHorizontal class="mr-1 h-4 w-4" />
							{$t.common.filter}
						</Button>
					</div>
				</div>

				<!-- Search -->
				<div class="flex items-center gap-3">
					<div class="relative flex-1 lg:w-80">
						<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder={$t.feed.searchPlaceholder}
							bind:value={searchQuery}
							class="h-10 w-full rounded-xl border border-gray-200 bg-white pr-4 pl-10 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						/>
					</div>
					<Button variant="secondary" size="sm">
						<Filter class="h-4 w-4" />
					</Button>
				</div>

				<!-- Hashtags -->
				<div class="scrollbar-hide flex flex-wrap items-center gap-2 overflow-x-auto">
					{#each hashtags as tag}
						<button
							onclick={() => selectHashtag(tag)}
							class="rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all {selectedHashtag ===
							tag
								? 'bg-rose-500 text-white'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}"
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>

			<!-- Categories -->
			<div class="scrollbar-hide mb-6 flex items-center gap-2 overflow-x-auto pb-2">
				{#each categories as category}
					<button
						onclick={() => (selectedCategory = category)}
						class="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all {selectedCategory ===
						category
							? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
							: 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}"
					>
						{category.charAt(0).toUpperCase() + category.slice(1)}
					</button>
				{/each}
			</div>

			<!-- View Toggle -->
			<div class="mb-6 flex items-center justify-end gap-2">
				<button
					onclick={() => (viewMode = 'grid')}
					class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {viewMode ===
					'grid'
						? 'bg-rose-100 text-rose-500 dark:bg-rose-900/30'
						: 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}"
				>
					<Grid3X3 class="h-4 w-4" />
				</button>
				<button
					onclick={() => (viewMode = 'vertical')}
					class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors {viewMode ===
					'vertical'
						? 'bg-rose-100 text-rose-500 dark:bg-rose-900/30'
						: 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}"
				>
					<List class="h-4 w-4" />
				</button>
			</div>

			<!-- Video Grid -->
			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
				</div>
			{:else if viewMode === 'grid'}
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{#each filteredVideos as video (video.id)}
						<VideoThumbnail {video} onclick={() => (selectedVideo = video)} />
					{/each}
				</div>
			{:else}
				<!-- Vertical Feed (YouTube-style list) -->
				<div class="mx-auto max-w-2xl space-y-4">
					{#each filteredVideos as video (video.id)}
						<Card class="space-y-3 p-4">
							<!-- Video with Tags -->
							<div class="relative aspect-video overflow-hidden rounded-xl bg-gray-900">
								<video
									src={video.videoUrl}
									poster={video.thumbnailUrl || video.videoUrl}
									class="h-full w-full object-cover"
									controls
								></video>

								<!-- Top Tags -->
								<div class="absolute top-3 right-3 left-3 flex items-start justify-between">
									{#if video.category}
										<span
											class="rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-white capitalize"
										>
											{video.category}
										</span>
									{/if}
									{#if video.isTrending}
										<span
											class="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white"
										>
											<TrendingUp class="h-3 w-3" />
											Trending
										</span>
									{:else}
										<span
											class="rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-gray-300"
										>
											{$t.feed.notTrending}
										</span>
									{/if}
								</div>
							</div>

							<!-- User Info & Description -->
							<div class="flex gap-3">
								<Avatar src={video.author?.avatarUrl} alt={video.author?.name || 'User'} size="lg" />
								<div class="flex-1">
									<h3 class="line-clamp-2 font-semibold text-gray-900 dark:text-white">
										{video.title}
									</h3>
									<p class="mt-1 text-sm text-gray-500">{video.author?.name || 'Unknown'}</p>
									{#if video.description}
										<p class="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
											{video.description}
										</p>
									{/if}

									<!-- Tags -->
									{#if video.tags && video.tags.length > 0}
										<div class="mt-2 flex flex-wrap gap-2">
											{#each video.tags as tag}
												<span class="text-sm text-rose-500">#{tag}</span>
											{/each}
										</div>
									{/if}
								</div>
							</div>

							<!-- Action Icons -->
							<div
								class="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800"
							>
								<button
									class="flex items-center gap-2 text-gray-600 transition-colors hover:text-rose-500 dark:text-gray-400"
									onclick={() => handleLike(video)}
								>
									<Heart class="h-5 w-5" />
									<span class="text-sm font-medium">{formatNumber(video.likesCount)}</span>
								</button>
								<button
									class="flex items-center gap-2 text-gray-600 transition-colors hover:text-rose-500 dark:text-gray-400"
								>
									<MessageCircle class="h-5 w-5" />
									<span class="text-sm font-medium">{formatNumber(video.commentsCount)}</span>
								</button>
								<button
									class="flex items-center gap-2 text-gray-600 transition-colors hover:text-rose-500 dark:text-gray-400"
									onclick={() => handleShare(video)}
								>
									{#if copiedVideoId === video.id}
										<Check class="h-5 w-5 text-green-500" />
										<span class="text-sm font-medium text-green-500">Copied!</span>
									{:else}
										<Share2 class="h-5 w-5" />
										<span class="text-sm font-medium">{formatNumber(video.sharesCount)}</span>
									{/if}
								</button>
							</div>
						</Card>
					{/each}
				</div>
			{/if}

			{#if !loading && filteredVideos.length === 0}
				<div class="py-12 text-center">
					<p class="text-gray-500 dark:text-gray-400">{$t.feed.noVideosFound}</p>
				</div>
			{/if}
		</div>
	</main>

	{#if selectedVideo}
		<VideoModal video={selectedVideo} open={!!selectedVideo} onClose={() => (selectedVideo = null)} />
	{/if}
</div>
