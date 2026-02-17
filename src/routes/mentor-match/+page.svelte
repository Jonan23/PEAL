<script lang="ts">
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
		SlidersHorizontal
	} from 'lucide-svelte';
	import { mockMentors } from '$lib/data/mock';
	import { t } from '$lib/i18n';

	let searchQuery = $state('');
	let selectedSkill = $state('all');

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

	const filteredMentors = $derived(
		mockMentors
			.map((mentor) => ({
				...mentor,
				yearsExperience: Math.floor(Math.random() * 10) + 1,
				menteesCount: Math.floor(Math.random() * 50) + 10
			}))
			.filter((mentor) => {
				const matchesSearch =
					mentor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					mentor.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
				const matchesSkill = selectedSkill === 'all' || mentor.skills.includes(selectedSkill);
				return matchesSearch && matchesSkill;
			})
	);
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
			<div class="space-y-4">
				{#each filteredMentors as mentor (mentor.id)}
					<div class="flex gap-4">
						<!-- Connect Button on Left -->
						<div class="hidden lg:flex lg:flex-col lg:justify-center">
							<Button size="sm">{$t.mentors.connect}</Button>
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
									<Avatar src={mentor.user.avatar} alt={mentor.user.name} size="xl" />
									<span
										class="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white {mentor.availability ===
										'available'
											? 'bg-emerald-500'
											: 'bg-red-500'} dark:border-gray-900"
									></span>
								</div>

								<div class="flex-1">
									<!-- Name & Bio -->
									<h3 class="font-semibold text-gray-900 dark:text-white">{mentor.user.name}</h3>
									<p class="text-sm text-gray-500 dark:text-gray-400">{mentor.user.bio}</p>

									<!-- Skills -->
									<div class="mt-2 flex flex-wrap gap-1.5">
										{#each mentor.skills as skill}
											<Badge variant="secondary">{skill}</Badge>
										{/each}
									</div>

									<!-- Stats: Mentees, Experience, Years -->
									<div
										class="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
									>
										<span class="flex items-center gap-1">
											<Users class="h-4 w-4" />
											{mentor.menteesCount} mentees
										</span>
										<span class="flex items-center gap-1">
											<Briefcase class="h-4 w-4" />
											{mentor.yearsExperience} years exp
										</span>
										<span class="flex items-center gap-1">
											<Calendar class="h-4 w-4" />
											{mentor.yearsExperience}+ years
										</span>
										<span class="flex items-center gap-1">
											<MapPin class="h-4 w-4" />
											{mentor.user.location || 'Remote'}
										</span>
									</div>
								</div>
							</div>

							<!-- Mobile Connect Button -->
							<div class="mt-4 lg:hidden">
								<Button class="w-full">{$t.mentors.connect}</Button>
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
		</div>
	</main>
</div>
