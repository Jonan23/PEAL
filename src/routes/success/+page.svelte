<script lang="ts">
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Share2, Heart, MessageCircle, TrendingUp, Users, Globe, Sparkles } from 'lucide-svelte';
	import { mockSuccessStories } from '$lib/data/mock';
	import { t } from '$lib/i18n';

	const stats = {
		successStories: mockSuccessStories.length + 500,
		livesChanged: 10000,
		economicImpact: 2000000
	};
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

			<!-- Featured Story -->
			{#if mockSuccessStories[0]}
				<Card class="mb-8 overflow-hidden">
					<!-- {$t.success.before}/{$t.success.after} Images -->
					<div class="grid grid-cols-2 gap-1">
						<div class="relative aspect-video">
							<img
								src={mockSuccessStories[0].beforeImage}
								alt="{$t.success.before}"
								class="h-full w-full object-cover"
							/>
							<div class="absolute right-3 bottom-3 left-3">
								<span class="rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-white">
									6 months ago
								</span>
							</div>
							<span
								class="absolute top-3 left-3 rounded-lg bg-black/50 px-3 py-1 text-xs font-medium text-white"
							>
								{$t.success.before}
							</span>
						</div>
						<div class="relative aspect-video">
							<img
								src={mockSuccessStories[0].afterImage}
								alt="{$t.success.after}"
								class="h-full w-full object-cover"
							/>
							<div class="absolute right-3 bottom-3 left-3">
								<span class="rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white">
									Success
								</span>
							</div>
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
							{mockSuccessStories[0].title}
						</h2>
						<p class="mb-4 text-gray-600 dark:text-gray-400">
							{mockSuccessStories[0].description}
						</p>

						<!-- Impact Badge -->
						<div class="mb-4 flex items-center gap-2">
							<span
								class="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
							>
								Impact Created
							</span>
						</div>

						<div class="mb-4 flex items-center gap-6 rounded-xl bg-rose-50 p-4 dark:bg-rose-900/20">
							<div class="flex items-center gap-2">
								<TrendingUp class="h-5 w-5 text-rose-500" />
								<span class="font-medium text-gray-900 dark:text-white">
									{mockSuccessStories[0].impact}
								</span>
							</div>
						</div>

						<!-- Author & Actions -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<Avatar
									src={mockSuccessStories[0].author.avatar}
									alt={mockSuccessStories[0].author.name}
									size="lg"
								/>
								<div>
									<p class="font-medium text-gray-900 dark:text-white">
										{mockSuccessStories[0].author.name}
									</p>
									<p class="text-sm text-gray-500">{mockSuccessStories[0].author.location}</p>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<Button variant="secondary">
									<Sparkles class="mr-2 h-4 w-4" />
									{$t.success.celebrate}
								</Button>
								<Button variant="ghost">View Full Story</Button>
							</div>
						</div>

						<!-- Social Icons -->
						<div
							class="mt-4 flex items-center gap-6 border-t border-gray-100 pt-4 dark:border-gray-800"
						>
							<button
								class="flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-500"
							>
								<Heart class="h-5 w-5" />
								<span class="text-sm">{Math.floor(Math.random() * 2000) + 500}</span>
							</button>
							<button
								class="flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-500"
							>
								<MessageCircle class="h-5 w-5" />
								<span class="text-sm">{Math.floor(Math.random() * 200) + 50}</span>
							</button>
							<button
								class="flex items-center gap-2 text-gray-500 transition-colors hover:text-rose-500"
							>
								<Share2 class="h-5 w-5" />
								<span class="text-sm">{Math.floor(Math.random() * 100) + 20}</span>
							</button>
						</div>
					</div>
				</Card>
			{/if}

			<!-- More Stories -->
			<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">More Stories</h2>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each mockSuccessStories.slice(1) as story (story.id)}
					<Card class="overflow-hidden">
						<!-- {$t.success.before}/{$t.success.after} -->
						<div class="grid grid-cols-2 gap-1">
							<div class="relative aspect-video">
								<img src={story.beforeImage} alt="{$t.success.before}" class="h-full w-full object-cover" />
								<span
									class="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs font-medium text-white"
								>
									{$t.success.before}
								</span>
								<span
									class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white"
								>
									3 months ago
								</span>
							</div>
							<div class="relative aspect-video">
								<img src={story.afterImage} alt="{$t.success.after}" class="h-full w-full object-cover" />
								<span
									class="absolute top-2 right-2 rounded bg-rose-500 px-2 py-0.5 text-xs font-medium text-white"
								>
									Success
								</span>
							</div>
						</div>

						<div class="p-5">
							<!-- Impact Badge -->
							<div class="mb-2 flex items-center gap-2">
								<span
									class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
								>
									Impact Created
								</span>
							</div>

							<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
								{story.title}
							</h3>
							<p class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
								{story.description}
							</p>

							<!-- Impact -->
							<div class="mb-3 flex items-center gap-2 text-sm text-rose-500">
								<TrendingUp class="h-4 w-4" />
								<span class="font-medium">{story.impact}</span>
							</div>

							<!-- Author -->
							<div class="mb-3 flex items-center gap-2">
								<Avatar src={story.author.avatar} alt={story.author.name} size="sm" />
								<span class="text-sm text-gray-600 dark:text-gray-400">{story.author.name}</span>
							</div>

							<!-- Social Icons -->
							<div
								class="flex items-center gap-4 border-t border-gray-100 pt-3 dark:border-gray-800"
							>
								<button
									class="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-rose-500"
								>
									<Heart class="h-4 w-4" />
									{Math.floor(Math.random() * 500) + 100}
								</button>
								<button
									class="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-rose-500"
								>
									<MessageCircle class="h-4 w-4" />
									{Math.floor(Math.random() * 50) + 10}
								</button>
								<button
									class="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-rose-500"
								>
									<Share2 class="h-4 w-4" />
									{Math.floor(Math.random() * 30) + 5}
								</button>
							</div>

							<!-- Actions -->
							<div class="mt-3 flex gap-2">
								<Button variant="secondary" size="sm" class="flex-1">
									<Sparkles class="mr-1 h-3 w-3" />
									{$t.success.celebrate}
								</Button>
								<Button variant="ghost" size="sm" class="flex-1">View Story</Button>
							</div>
						</div>
					</Card>
				{/each}
			</div>

			<!-- Impact Stats -->
			<div class="mt-12">
				<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
					Our Collective Impact
				</h2>
				<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<Card class="p-5 text-center">
						<Users class="mx-auto mb-2 h-8 w-8 text-rose-500" />
						<p class="text-3xl font-bold text-gray-900 dark:text-white">10K+</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Women Supported</p>
					</Card>
					<Card class="p-5 text-center">
						<Globe class="mx-auto mb-2 h-8 w-8 text-orange-500" />
						<p class="text-3xl font-bold text-gray-900 dark:text-white">50+</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Countries</p>
					</Card>
					<Card class="p-5 text-center">
						<TrendingUp class="mx-auto mb-2 h-8 w-8 text-violet-500" />
						<p class="text-3xl font-bold text-gray-900 dark:text-white">$2M+</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Funds Raised</p>
					</Card>
					<Card class="p-5 text-center">
						<Sparkles class="mx-auto mb-2 h-8 w-8 text-emerald-500" />
						<p class="text-3xl font-bold text-gray-900 dark:text-white">500+</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Success Stories</p>
					</Card>
				</div>
			</div>
		</div>
	</main>
</div>
