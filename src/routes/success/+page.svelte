<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Share2, Heart, MessageCircle, TrendingUp, Users, Globe, Sparkles } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { storiesApi } from '$lib/api';
	import type { SuccessStory } from '$lib/api/types';

	let stories = $state<SuccessStory[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await storiesApi.getAll();
			stories = response.stories;
		} catch (error) {
			console.error('Failed to load stories:', error);
		} finally {
			loading = false;
		}
	});

	const stats = $derived({
		successStories: stories.length + 500,
		livesChanged: 10000,
		economicImpact: 2000000
	});

	async function handleCelebrate(storyId: string) {
		try {
			await storiesApi.celebrate(storyId);
			stories = stories.map(s => 
				s.id === storyId ? { ...s, celebrationsCount: s.celebrationsCount + 1 } : s
			);
		} catch (error) {
			console.error('Failed to celebrate:', error);
		}
	}

	function formatNumber(num: number): string {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	}
</script>

<svelte:head>
	<title>Success Stories - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto px-4 py-6 lg:p-8">
			<!-- Header -->
			<div class="mb-6">
				<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div>
						<h1 class="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
							{$t.success.title}
						</h1>
						<p class="text-gray-600 dark:text-gray-400">
							{$t.success.subtitle}
						</p>
					</div>

					<Button>
						<Share2 class="mr-2 h-4 w-4" />
						{$t.success.shareStory}
					</Button>
				</div>
			</div>

			<!-- Stats -->
			<div class="mb-6 flex flex-wrap gap-3">
				<Card class="flex items-center gap-3 px-5 py-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30"
					>
						<Sparkles class="h-6 w-6 text-rose-500" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">
							{stats.successStories.toLocaleString()}+
						</p>
						<p class="text-sm text-gray-500">{$t.success.successStoriesCount}</p>
					</div>
				</Card>
				<Card class="flex items-center gap-3 px-5 py-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
					>
						<Users class="h-6 w-6 text-emerald-500" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">
							{stats.livesChanged.toLocaleString()}+
						</p>
						<p class="text-sm text-gray-500">{$t.success.livesChanged}</p>
					</div>
				</Card>
				<Card class="flex items-center gap-3 px-5 py-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30"
					>
						<TrendingUp class="h-6 w-6 text-violet-500" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">
							${(stats.economicImpact / 1000000).toFixed(1)}M+
						</p>
						<p class="text-sm text-gray-500">{$t.success.economicImpact}</p>
					</div>
				</Card>
			</div>

			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
				</div>
			{:else}
				<!-- Featured Story -->
				{#if stories[0]}
					<Card class="mb-8 overflow-hidden">
						<div class="grid grid-cols-2 gap-1">
							<div class="relative aspect-video">
								<img
									src={stories[0].beforeImageUrl || 'https://images.unsplash.com/photo-1519327233552-1370418e6bf8?w=400'}
									alt="{$t.success.before}"
									class="h-full w-full object-cover"
								/>
								<span
									class="absolute top-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-xs font-medium text-white"
								>
									{$t.success.before}
								</span>
							</div>
							<div class="relative aspect-video">
								<img
									src={stories[0].afterImageUrl || 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400'}
									alt="{$t.success.after}"
									class="h-full w-full object-cover"
								/>
								<span
									class="absolute top-3 right-3 rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white"
								>
									{$t.success.after}
								</span>
							</div>
						</div>

						<div class="p-6">
							<div class="mb-4 flex items-start justify-between">
								<Badge>{$t.success.featuredStory}</Badge>
								<span
									class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
								>
									{$t.success.completed}
								</span>
							</div>

							<h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
								{stories[0].title}
							</h2>
							<p class="mb-4 text-gray-600 dark:text-gray-400">
								{stories[0].description}
							</p>

							{#if stories[0].impactDescription}
								<div class="mb-4 flex items-center gap-6 rounded-xl bg-rose-50 p-4 dark:bg-rose-900/20">
									<div class="flex items-center gap-2">
										<TrendingUp class="h-5 w-5 text-rose-500" />
										<span class="font-medium text-gray-900 dark:text-white">
											{stories[0].impactDescription}
										</span>
									</div>
								</div>
							{/if}

							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<Avatar
										src={stories[0].author?.avatarUrl}
										alt={stories[0].author?.name || 'Author'}
										size="lg"
									/>
									<div>
										<p class="font-medium text-gray-900 dark:text-white">
											{stories[0].author?.name || 'Unknown'}
										</p>
									</div>
								</div>

								<div class="flex items-center gap-3">
									<Button variant="secondary" onclick={() => handleCelebrate(stories[0].id)}>
										<Sparkles class="mr-2 h-4 w-4" />
										{$t.success.celebrate}
									</Button>
								</div>
							</div>
						</div>
					</Card>
				{/if}

				<!-- More Stories -->
				{#if stories.length > 1}
					<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">More Stories</h2>
					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each stories.slice(1) as story (story.id)}
							<Card class="overflow-hidden">
								<div class="grid grid-cols-2 gap-1">
									<div class="relative aspect-video">
										<img src={story.beforeImageUrl || 'https://images.unsplash.com/photo-1519327233552-1370418e6bf8?w=400'} alt="{$t.success.before}" class="h-full w-full object-cover" />
										<span class="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
											{$t.success.before}
										</span>
									</div>
									<div class="relative aspect-video">
										<img src={story.afterImageUrl || 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400'} alt="{$t.success.after}" class="h-full w-full object-cover" />
										<span class="absolute top-2 right-2 rounded bg-rose-500 px-2 py-0.5 text-xs font-medium text-white">
											Success
										</span>
									</div>
								</div>

								<div class="p-5">
									{#if story.impactDescription}
										<div class="mb-2 flex items-center gap-2">
											<span class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
												{$t.success.impactCreated}
											</span>
										</div>
									{/if}

									<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
										{story.title}
									</h3>
									<p class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
										{story.description}
									</p>

									{#if story.impactDescription}
										<div class="mb-3 flex items-center gap-2 text-sm text-rose-500">
											<TrendingUp class="h-4 w-4" />
											<span class="font-medium">{story.impactDescription}</span>
										</div>
									{/if}

									<div class="mb-3 flex items-center gap-2">
										<Avatar src={story.author?.avatarUrl} alt={story.author?.name || 'Author'} size="sm" />
										<span class="text-sm text-gray-600 dark:text-gray-400">{story.author?.name || 'Unknown'}</span>
									</div>

									<div class="flex items-center gap-4 border-t border-gray-100 pt-3 dark:border-gray-800">
										<button class="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-rose-500">
											<Heart class="h-4 w-4" />
											{formatNumber(story.celebrationsCount)}
										</button>
									</div>

									<div class="mt-3 flex gap-2">
										<Button variant="secondary" size="sm" class="flex-1" onclick={() => handleCelebrate(story.id)}>
											<Sparkles class="mr-1 h-3 w-3" />
											{$t.success.celebrate}
										</Button>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				{/if}

				{#if stories.length === 0}
					<div class="py-12 text-center">
						<p class="text-gray-500 dark:text-gray-400">No success stories yet.</p>
					</div>
				{/if}
			{/if}

			<!-- Impact Stats -->
			<div class="mt-12">
				<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
					{$t.success.ourCollectiveImpact}
				</h2>
				<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<Card class="p-5 text-center">
						<Users class="mx-auto mb-2 h-8 w-8 text-rose-500" />
						<p class="text-3xl font-bold text-gray-900 dark:text-white">10K+</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">{$t.success.womenSupported}</p>
					</Card>
					<Card class="p-5 text-center">
						<Globe class="mx-auto mb-2 h-8 w-8 text-orange-500" />
						<p class="text-3xl font-bold text-gray-900 dark:text-white">50+</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">{$t.success.countries}</p>
					</Card>
					<Card class="p-5 text-center">
						<TrendingUp class="mx-auto mb-2 h-8 w-8 text-violet-500" />
						<p class="text-3xl font-bold text-gray-900 dark:text-white">$2M+</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">{$t.success.fundsRaised}</p>
					</Card>
					<Card class="p-5 text-center">
						<Sparkles class="mx-auto mb-2 h-8 w-8 text-emerald-500" />
						<p class="text-3xl font-bold text-gray-900 dark:text-white">500+</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">{$t.success.successStoriesCount}</p>
					</Card>
				</div>
			</div>
		</div>
	</main>
</div>
