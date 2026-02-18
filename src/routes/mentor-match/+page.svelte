<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import {
		Search,
		MapPin,
		Users,
		MessageCircle,
		Briefcase,
		Calendar,
		SlidersHorizontal,
		Star,
		Sparkles
	} from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { mentorsApi, matchingApi } from '$lib/api/endpoints';
	import { authStore } from '$lib/stores/auth';
	import type { Mentor, MentorMatch } from '$lib/api/types';

	let mentors = $state<Mentor[]>([]);
	let recommendedMentors = $state<MentorMatch[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedSkill = $state('all');
	let showRecommended = $state(true);

	const skills = [
		'Technology',
		'Leadership',
		'Marketing',
		'Finance',
		'Sales',
		'Design',
		'Education',
		'Business',
		'Mentoring',
		'Public Speaking',
		'Entrepreneurship'
	];

	onMount(async () => {
		await authStore.initialize();
		const userId = $authStore.user?.id;

		try {
			const [mentorsRes, matchesRes] = await Promise.all([
				mentorsApi.getAll(),
				userId ? matchingApi.getRecommendations(userId) : Promise.resolve({ matches: [] })
			]);
			mentors = mentorsRes.mentors;
			recommendedMentors = matchesRes.matches;
		} catch (error) {
			console.error('Failed to load mentors:', error);
		} finally {
			loading = false;
		}
	});

	const filteredMentors = $derived(
		mentors.filter((mentor) => {
			const matchesSearch =
				(mentor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
				(mentor.skills && mentor.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())));
			const matchesSkill = selectedSkill === 'all' || (mentor.skills && mentor.skills.includes(selectedSkill));
			return matchesSearch && matchesSkill;
		})
	);

	async function handleConnect(mentorId: string) {
		try {
			await mentorsApi.connect(mentorId);
		} catch (error) {
			console.error('Failed to connect:', error);
		}
	}
</script>

<svelte:head>
	<title>Mentor Match - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto px-4 py-6 lg:p-8">
			<!-- Header -->
			<div class="mb-6">
				<h1 class="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
					{$t.mentors.title}
				</h1>
				<p class="text-gray-600 dark:text-gray-400">
					{$t.mentors.subtitle}
				</p>
			</div>

			<!-- Become a Mentor Button -->
			<div class="mb-4">
				<Button>
					<Briefcase class="mr-2 h-4 w-4" />
					{$t.mentors.becomeMentor}
				</Button>
			</div>

			<!-- Search -->
			<div class="relative mb-4">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder={$t.mentors.searchPlaceholder}
					bind:value={searchQuery}
					class="h-12 w-full rounded-xl border border-gray-200 bg-white pr-4 pl-10 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				/>
			</div>

			<!-- Skills Dropdown & Filters -->
			<div class="mb-6 flex flex-wrap items-center gap-3">
				<select
					bind:value={selectedSkill}
					class="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				>
					<option value="all">{$t.mentors.allSkills}</option>
					{#each skills as skill}
						<option value={skill}>{skill}</option>
					{/each}
				</select>

				<Button variant="secondary" size="sm">
					<SlidersHorizontal class="mr-1 h-4 w-4" />
					{$t.mentors.moreFilters}
				</Button>
			</div>

			<!-- Mentors List -->
			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
				</div>
			{:else}
				<!-- Recommended Mentors Section -->
				{#if recommendedMentors.length > 0 && showRecommended}
					<section class="mb-8">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
								<Sparkles class="h-5 w-5 text-rose-500" />
								Recommended for You
							</h2>
							<button
								onclick={() => (showRecommended = false)}
								class="text-sm text-gray-500 hover:text-gray-700"
							>
								Hide
							</button>
						</div>
						<div class="grid gap-4 md:grid-cols-2">
							{#each recommendedMentors as match (match.mentorId)}
								<Card class="border-2 border-rose-100 p-4 dark:border-rose-900/30">
									<div class="mb-2 flex items-center gap-2">
										<span class="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
											{Math.round(match.score)}% Match
										</span>
									</div>
									<div class="flex gap-3">
										<Avatar src={match.profile.user.avatarUrl ?? undefined} alt={match.profile.user.name || 'Mentor'} size="lg" />
										<div class="flex-1">
											<h3 class="font-semibold text-gray-900 dark:text-white">{match.profile.user.name || 'Mentor'}</h3>
											<p class="text-sm text-gray-500">{match.profile.user.location || 'Remote'}</p>
											{#if match.matchedSkills.length > 0}
												<div class="mt-1 flex flex-wrap gap-1">
													{#each match.matchedSkills.slice(0, 3) as skill}
														<span class="text-xs text-rose-500">#{skill}</span>
													{/each}
												</div>
											{/if}
										</div>
										<Button size="sm" onclick={() => handleConnect(match.mentorId)}>
											Connect
										</Button>
									</div>
								</Card>
							{/each}
						</div>
					</section>
				{/if}

				<!-- All Mentors -->
				<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">All Mentors</h2>
				<div class="space-y-4">
					{#each filteredMentors as mentor (mentor.id)}
						<div class="flex gap-4">
							<!-- Connect Button on Left -->
							<div class="hidden lg:flex lg:flex-col lg:justify-center">
								<Button size="sm" onclick={() => handleConnect(mentor.id)}>{$t.mentors.connect}</Button>
							</div>

							<Card class="flex-1 p-4">
								<!-- Status Indicator & Comment Icon -->
								<div class="mb-3 flex items-start justify-between">
									<div class="flex items-center gap-2">
										{#if mentor.availability === 'available'}
											<span
												class="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
											>
												<span class="h-2 w-2 rounded-full bg-emerald-500"></span>
												Available
											</span>
										{:else}
											<span
												class="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
											>
												<span class="h-2 w-2 rounded-full bg-red-500"></span>
												Unavailable
											</span>
										{/if}
									</div>
									<button class="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
										<MessageCircle class="h-5 w-5 text-gray-400" />
									</button>
								</div>

								<div class="flex gap-4">
									<!-- Avatar with status dot -->
									<div class="relative">
										<Avatar src={mentor.user?.avatarUrl} alt={mentor.user?.name || 'Mentor'} size="xl" />
										<span
											class="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white {mentor.availability ===
											'available'
												? 'bg-emerald-500'
												: 'bg-red-500'} dark:border-gray-900"
										></span>
									</div>

									<div class="flex-1">
										<!-- Name & Bio -->
										<h3 class="font-semibold text-gray-900 dark:text-white">{mentor.user?.name || 'Unknown'}</h3>
										<p class="text-sm text-gray-500 dark:text-gray-400">{mentor.bio || mentor.user?.bio}</p>

										<!-- Skills -->
										{#if mentor.skills && mentor.skills.length > 0}
											<div class="mt-2 flex flex-wrap gap-1.5">
												{#each mentor.skills as skill}
													<Badge variant="secondary">{skill}</Badge>
												{/each}
											</div>
										{/if}

										<!-- Stats: Mentees, Experience, Years -->
										<div
											class="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
										>
											<span class="flex items-center gap-1">
												<Users class="h-4 w-4" />
												{mentor.currentMenteesCount} mentees
											</span>
											{#if mentor.yearsExperience}
												<span class="flex items-center gap-1">
													<Briefcase class="h-4 w-4" />
													{mentor.yearsExperience} years exp
												</span>
											{/if}
											<span class="flex items-center gap-1">
												<Calendar class="h-4 w-4" />
												{mentor.yearsExperience || 1}+ years
											</span>
											<span class="flex items-center gap-1">
												<MapPin class="h-4 w-4" />
												{mentor.user?.location || 'Remote'}
											</span>
										</div>
									</div>
								</div>

								<!-- Mobile Connect Button -->
								<div class="mt-4 lg:hidden">
									<Button class="w-full" onclick={() => handleConnect(mentor.id)}>{$t.mentors.connect}</Button>
								</div>
							</Card>
						</div>
					{/each}
				</div>

				{#if filteredMentors.length === 0}
					<div class="py-12 text-center">
						<p class="text-gray-500 dark:text-gray-400">No mentors found matching your criteria.</p>
					</div>
				{/if}
			{/if}
		</div>
	</main>
</div>
