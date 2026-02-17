<script lang="ts">
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Progress from '$lib/components/ui/progress.svelte';
	import {
		Plus,
		Search,
		Users,
		Heart,
		TrendingUp,
		DollarSign,
		Target,
		MessageCircle,
		Share2
	} from 'lucide-svelte';
	import { mockFundingRequests } from '$lib/data/mock';
	import { t } from '$lib/i18n';

	let searchQuery = $state('');
	let selectedCategory = $state('all');

	const categories = ['all', 'education', 'business', 'healthcare', 'technology', 'arts'];

	const stats = {
		activeRequests: mockFundingRequests.length,
		raisedThisMonth: mockFundingRequests.reduce((sum, r) => sum + r.currentAmount, 0),
		successRate: 78
	};

	const filteredRequests = $derived(
		mockFundingRequests.filter((request) => {
			const matchesSearch =
				request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				request.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
			return matchesSearch && matchesCategory;
		})
	);

	function calculateProgress(current: number, goal: number): number {
		return Math.round((current / goal) * 100);
	}
</script>

<svelte:head>
	<title>Funding Requests - PEAL</title>
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
							{$t.requests.title}
						</h1>
						<p class="text-gray-600 dark:text-gray-400">{$t.requests.subtitle}</p>
					</div>

					<Button>
						<Plus class="mr-2 h-4 w-4" />
						{$t.requests.createRequest}
					</Button>
				</div>
			</div>

			<!-- Stats -->
			<div class="mb-6 flex flex-wrap gap-3">
				<Card class="flex items-center gap-3 px-4 py-3">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30"
					>
						<TrendingUp class="h-6 w-6 text-rose-500" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeRequests}</p>
						<p class="text-sm text-gray-500">{$t.requests.activeRequests}</p>
					</div>
				</Card>
				<Card class="flex items-center gap-3 px-4 py-3">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
					>
						<DollarSign class="h-6 w-6 text-emerald-500" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">
							${stats.raisedThisMonth.toLocaleString()}
						</p>
						<p class="text-sm text-gray-500">{$t.requests.raisedThisMonth}</p>
					</div>
				</Card>
				<Card class="flex items-center gap-3 px-4 py-3">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30"
					>
						<Target class="h-6 w-6 text-violet-500" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
						<p class="text-sm text-gray-500">{$t.requests.successRate}</p>
					</div>
				</Card>
			</div>

			<!-- Search -->
			<div class="relative mb-6">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder={$t.requests.searchPlaceholder}
					bind:value={searchQuery}
					class="h-12 w-full rounded-xl border border-gray-200 bg-white pr-4 pl-10 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				/>
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

			<!-- Requests Grid -->
			<div class="grid gap-6 md:grid-cols-2">
				{#each filteredRequests as request (request.id)}
					<Card class="overflow-hidden">
						{#if request.imageUrl}
							<img src={request.imageUrl} alt={request.title} class="h-48 w-full object-cover" />
						{:else}
							<div class="h-48 w-full bg-gradient-to-br from-rose-200 to-orange-200"></div>
						{/if}

						<div class="p-5">
							<div class="mb-3 flex items-start gap-3">
								<Avatar src={request.author.avatar} alt={request.author.name} size="sm" />
								<div class="flex-1">
									<p class="font-medium text-gray-900 dark:text-white">{request.author.name}</p>
									<p class="text-xs text-gray-500">
										{new Date(request.createdAt).toLocaleDateString()}
									</p>
								</div>
								<Badge>{request.category}</Badge>
							</div>

							<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
								{request.title}
							</h3>
							<p class="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
								{request.description}
							</p>

							<!-- Progress -->
							<div class="mb-2">
								<Progress value={request.currentAmount} max={request.goalAmount} />
							</div>
							<div class="mb-4 flex items-center justify-between text-sm">
								<span class="font-semibold text-rose-500">
									${request.currentAmount.toLocaleString()}
									<span class="font-normal text-gray-500 dark:text-gray-400">{$t.requests.raised}</span>
								</span>
								<span class="text-gray-500 dark:text-gray-400">
									${request.goalAmount.toLocaleString()} {$t.requests.goal}
								</span>
							</div>

							<div class="mb-4 flex items-center justify-between text-sm">
								<span class="flex items-center gap-1">
									<Users class="h-4 w-4" />
									{request.supporters} {$t.requests.supportersCount}
								</span>
								<span class="flex items-center gap-1">
									{calculateProgress(request.currentAmount, request.goalAmount)}% funded
								</span>
							</div>

							<!-- Social Icons -->
							<div class="mb-4 flex items-center gap-6 text-gray-500 dark:text-gray-400">
								<button class="flex items-center gap-1.5 transition-colors hover:text-rose-500">
									<Heart class="h-4 w-4" />
									<span class="text-sm">{Math.floor(Math.random() * 500) + 50}</span>
								</button>
								<button class="flex items-center gap-1.5 transition-colors hover:text-rose-500">
									<MessageCircle class="h-4 w-4" />
									<span class="text-sm">{Math.floor(Math.random() * 100) + 10}</span>
								</button>
								<button class="flex items-center gap-1.5 transition-colors hover:text-rose-500">
									<Share2 class="h-4 w-4" />
									<span class="text-sm">{Math.floor(Math.random() * 50) + 5}</span>
								</button>
							</div>

							<Button class="w-full">
								<Heart class="mr-2 h-4 w-4" />
								{$t.requests.donate}
							</Button>
						</div>
					</Card>
				{/each}
			</div>

			{#if filteredRequests.length === 0}
				<div class="py-12 text-center">
					<p class="text-gray-500 dark:text-gray-400">
						No funding requests found matching your criteria.
					</p>
				</div>
			{/if}
		</div>
	</main>
</div>
