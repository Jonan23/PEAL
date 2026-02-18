<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import { Calendar, MapPin, Users, Video, Clock, ExternalLink } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { eventsApi } from '$lib/api/endpoints';
	import type { Event } from '$lib/api/types';

	let events = $state<Event[]>([]);
	let loading = $state(true);
	let selectedCategory = $state('all');
	let registeredIds = $state<Set<string>>(new Set());

	const categories = [
		{ value: 'all', label: 'All Events' },
		{ value: 'workshop', label: 'Workshops' },
		{ value: 'webinar', label: 'Webinars' },
		{ value: 'networking', label: 'Networking' },
		{ value: 'conference', label: 'Conferences' },
		{ value: 'mentorship', label: 'Mentorship Sessions' }
	];

	onMount(async () => {
		await loadEvents();
	});

	async function loadEvents() {
		loading = true;
		try {
			const params = selectedCategory !== 'all' ? { category: selectedCategory } : undefined;
			const response = await eventsApi.getAll(params);
			events = response.events;
		} catch (error) {
			console.error('Failed to load events:', error);
		} finally {
			loading = false;
		}
	}

	async function handleRegister(eventId: string) {
		try {
			if (registeredIds.has(eventId)) {
				await eventsApi.unregister(eventId);
				registeredIds.delete(eventId);
			} else {
				await eventsApi.register(eventId);
				registeredIds.add(eventId);
			}
			registeredIds = new Set(registeredIds);
			await loadEvents();
		} catch (error) {
			console.error('Failed to register:', error);
		}
	}

	function formatDate(date: string): string {
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatTime(date: string): string {
		return new Date(date).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function isUpcoming(date: string): boolean {
		return new Date(date) > new Date();
	}

	const filteredEvents = $derived(
		selectedCategory === 'all' 
			? events 
			: events.filter(e => e.category === selectedCategory)
	);
</script>

<svelte:head>
	<title>Events - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto px-4 py-6 lg:p-8">
			<!-- Header -->
			<div class="mb-6">
				<h1 class="text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">Events</h1>
				<p class="text-gray-600 dark:text-gray-400">Discover workshops, webinars, and networking opportunities</p>
			</div>

			<!-- Categories -->
			<div class="mb-6 flex flex-wrap gap-2">
				{#each categories as cat}
					<button
						onclick={() => { selectedCategory = cat.value; loadEvents(); }}
						class="rounded-full px-4 py-2 text-sm font-medium transition-all {selectedCategory === cat.value
							? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
							: 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}"
					>
						{cat.label}
					</button>
				{/each}
			</div>

			<!-- Events Grid -->
			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
				</div>
			{:else if filteredEvents.length === 0}
				<Card class="p-8 text-center">
					<Calendar class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
					<p class="text-gray-500 dark:text-gray-400">Check back later for upcoming events</p>
				</Card>
			{:else}
				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredEvents as event (event.id)}
						<Card class="overflow-hidden">
							{#if event.coverImage}
								<img src={event.coverImage} alt={event.title} class="h-40 w-full object-cover" />
							{:else}
								<div class="h-40 w-full bg-gradient-to-br from-rose-200 to-orange-200 dark:from-rose-900/30 dark:to-orange-900/30 flex items-center justify-center">
									<Calendar class="h-12 w-12 text-rose-500/50" />
								</div>
							{/if}

							<div class="p-5">
								<div class="mb-3 flex items-start justify-between">
									<Badge>{event.category}</Badge>
									{#if event.isVirtual}
										<Badge variant="secondary">
											<Video class="mr-1 h-3 w-3" />
											Virtual
										</Badge>
									{/if}
								</div>

								<h3 class="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
									{event.title}
								</h3>

								{#if event.description}
									<p class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
										{event.description}
									</p>
								{/if}

								<div class="mb-3 space-y-2 text-sm text-gray-500">
									<div class="flex items-center gap-2">
										<Calendar class="h-4 w-4" />
										<span>{formatDate(event.eventDate)}</span>
									</div>
									<div class="flex items-center gap-2">
										<Clock class="h-4 w-4" />
										<span>{formatTime(event.eventDate)}</span>
									</div>
									{#if event.location}
										<div class="flex items-center gap-2">
											<MapPin class="h-4 w-4" />
											<span class="truncate">{event.location}</span>
										</div>
									{/if}
									{#if event.maxAttendees}
										<div class="flex items-center gap-2">
											<Users class="h-4 w-4" />
											<span>{event.attendeeCount}/{event.maxAttendees} spots</span>
										</div>
									{/if}
								</div>

								{#if event.host}
									<div class="mb-4 flex items-center gap-2">
										<Avatar src={event.host.avatarUrl} alt={event.host.name} size="sm" />
										<span class="text-sm text-gray-600 dark:text-gray-400">by {event.host.name}</span>
									</div>
								{/if}

								{#if isUpcoming(event.eventDate)}
									<div class="flex gap-2">
										{#if event.isVirtual && event.meetingUrl && registeredIds.has(event.id)}
											<a
												href={event.meetingUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="flex-1"
											>
												<Button class="w-full">
													<ExternalLink class="mr-2 h-4 w-4" />
													Join Event
												</Button>
											</a>
										{/if}
										<Button
											variant={registeredIds.has(event.id) ? 'secondary' : 'primary'}
											class="flex-1"
											onclick={() => handleRegister(event.id)}
											disabled={event.maxAttendees != null && event.attendeeCount >= event.maxAttendees && !registeredIds.has(event.id)}
										>
											{#if registeredIds.has(event.id)}
												Registered ✓
											{:else if event.maxAttendees && event.attendeeCount >= event.maxAttendees}
												Full
											{:else}
												Register
											{/if}
										</Button>
									</div>
								{:else}
									<Button variant="secondary" class="w-full" disabled>
										Event Ended
									</Button>
								{/if}
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</div>
