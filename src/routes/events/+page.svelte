<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import {
		Calendar,
		MapPin,
		Users,
		Video,
		Clock,
		ExternalLink,
		Plus,
		X,
		Image as ImageIcon
	} from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { eventsApi } from '$lib/api/endpoints';
	import { uploadFile } from '$lib/api/upload';
	import { authStore } from '$lib/stores/auth';
	import type { Event } from '$lib/api/types';

	let events = $state<Event[]>([]);
	let loading = $state(true);
	let selectedCategory = $state('all');
	let registeredIds = $state<Set<string>>(new Set());
	let currentUserId = $state<string | null>(null);
	let canCreateEvent = $state(false);
	let showCreateEvent = $state(false);
	let creatingEvent = $state(false);
	let createError = $state('');
	let createSuccess = $state('');
	let actionInProgress = $state<string | null>(null);
	let myActiveEvents = $state<Event[]>([]);
	let coverImageFile = $state<File | null>(null);
	let coverImagePreview = $state('');
	let coverUploading = $state(false);

	let createForm = $state({
		title: '',
		description: '',
		eventDate: '',
		endDate: '',
		location: '',
		isVirtual: true,
		meetingUrl: '',
		category: 'workshop',
		maxAttendees: 0
	});

	const categories = [
		{ value: 'all', label: 'All Events' },
		{ value: 'workshop', label: 'Workshops' },
		{ value: 'webinar', label: 'Webinars' },
		{ value: 'networking', label: 'Networking' },
		{ value: 'conference', label: 'Conferences' },
		{ value: 'mentorship', label: 'Mentorship Sessions' }
	];

	onMount(async () => {
		await authStore.initialize();
		canCreateEvent = !!$authStore.user;
		currentUserId = $authStore.user?.id || null;
		await loadEvents();
	});

	async function loadEvents() {
		loading = true;
		createError = '';
		try {
			const params = selectedCategory !== 'all' ? { category: selectedCategory } : undefined;
			const response = await eventsApi.getAll(params);
			events = response.events;

			if (currentUserId) {
				const ownEvents = response.events.filter(
					(event) => event.hostId === currentUserId && event.status === 'upcoming'
				);

				if (selectedCategory === 'all') {
					myActiveEvents = ownEvents;
				} else {
					const allUpcoming = await eventsApi.getAll({ status: 'upcoming' });
					myActiveEvents = allUpcoming.events.filter((event) => event.hostId === currentUserId);
				}
			} else {
				myActiveEvents = [];
			}
		} catch (error) {
			console.error('Failed to load events:', error);
			createError = error instanceof Error ? error.message : 'Failed to load events';
		} finally {
			loading = false;
		}
	}

	async function handleRegister(eventId: string) {
		createError = '';
		createSuccess = '';
		try {
			if (registeredIds.has(eventId)) {
				await eventsApi.unregister(eventId);
				registeredIds.delete(eventId);
			} else {
				await eventsApi.register(eventId);
				registeredIds.add(eventId);
			}
			registeredIds = new Set(registeredIds);
			createSuccess = registeredIds.has(eventId)
				? 'You are registered for this event.'
				: 'You have unregistered from this event.';
			await loadEvents();
		} catch (error) {
			console.error('Failed to register:', error);
			createError = error instanceof Error ? error.message : 'Failed to update registration';
		}
	}

	function handleCoverImageChange(event: globalThis.Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		coverImageFile = file;
		coverImagePreview = URL.createObjectURL(file);
	}

	function resetCreateEventForm() {
		createForm = {
			title: '',
			description: '',
			eventDate: '',
			endDate: '',
			location: '',
			isVirtual: true,
			meetingUrl: '',
			category: 'workshop',
			maxAttendees: 0
		};
		createError = '';
		coverImageFile = null;
		if (coverImagePreview) {
			URL.revokeObjectURL(coverImagePreview);
		}
		coverImagePreview = '';
	}

	async function handleCreateEvent() {
		createError = '';
		createSuccess = '';

		if (!createForm.title.trim() || !createForm.eventDate || !createForm.category) {
			createError = 'Title, date, and category are required.';
			return;
		}

		if (createForm.isVirtual && !createForm.meetingUrl.trim()) {
			createError = 'Meeting URL is required for virtual events.';
			return;
		}

		if (!createForm.isVirtual && !createForm.location.trim()) {
			createError = 'Location is required for in-person events.';
			return;
		}

		creatingEvent = true;
		try {
			let coverImage: string | undefined;
			if (coverImageFile) {
				coverUploading = true;
				const uploaded = await uploadFile(coverImageFile, 'image');
				coverImage = uploaded.url;
				coverUploading = false;
			}

			await eventsApi.create({
				title: createForm.title.trim(),
				description: createForm.description.trim() || undefined,
				coverImage,
				eventDate: new Date(createForm.eventDate).toISOString(),
				endDate: createForm.endDate ? new Date(createForm.endDate).toISOString() : undefined,
				location: createForm.isVirtual ? undefined : createForm.location.trim(),
				isVirtual: createForm.isVirtual,
				meetingUrl: createForm.isVirtual ? createForm.meetingUrl.trim() : undefined,
				category: createForm.category,
				maxAttendees: createForm.maxAttendees > 0 ? createForm.maxAttendees : undefined
			});

			createSuccess = 'Event created successfully.';
			showCreateEvent = false;
			resetCreateEventForm();
			await loadEvents();
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Failed to create event';
		} finally {
			creatingEvent = false;
			coverUploading = false;
		}
	}

	async function handleCancelEvent(eventId: string) {
		actionInProgress = eventId;
		createError = '';
		createSuccess = '';

		try {
			await eventsApi.update(eventId, { status: 'cancelled' });
			createSuccess = 'Event cancelled successfully.';
			await loadEvents();
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Failed to cancel event';
		} finally {
			actionInProgress = null;
		}
	}

	async function handleDeleteEvent(eventId: string) {
		const confirmed = confirm('Delete this event permanently?');
		if (!confirmed) return;

		actionInProgress = eventId;
		createError = '';
		createSuccess = '';

		try {
			await eventsApi.delete(eventId);
			createSuccess = 'Event deleted successfully.';
			await loadEvents();
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Failed to delete event';
		} finally {
			actionInProgress = null;
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
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 class="text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">Events</h1>
						<p class="text-gray-600 dark:text-gray-400">Discover workshops, webinars, and networking opportunities</p>
					</div>
					{#if canCreateEvent}
						<Button onclick={() => (showCreateEvent = true)}>
							<Plus class="mr-2 h-4 w-4" />
							Add Event
						</Button>
					{/if}
				</div>

				{#if createSuccess}
					<p class="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{createSuccess}</p>
				{/if}
				{#if createError && !showCreateEvent}
					<p class="mt-3 text-sm text-red-600 dark:text-red-400">{createError}</p>
				{/if}
			</div>

			{#if showCreateEvent}
				<Card class="mb-6 border-rose-200 p-5 dark:border-rose-900/40">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Create Event</h2>
						<button
							onclick={() => {
								showCreateEvent = false;
								resetCreateEventForm();
							}}
							class="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<X class="h-4 w-4" />
						</button>
					</div>

					<div class="grid gap-4 md:grid-cols-2">
						<div class="md:col-span-2">
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
							<input
								type="text"
								bind:value={createForm.title}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>

						<div class="md:col-span-2">
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
							<textarea
								rows="3"
								bind:value={createForm.description}
								class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							></textarea>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Event Date</label>
							<input
								type="datetime-local"
								bind:value={createForm.eventDate}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">End Date (Optional)</label>
							<input
								type="datetime-local"
								bind:value={createForm.endDate}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
							<select
								bind:value={createForm.category}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							>
								{#each categories.filter((c) => c.value !== 'all') as cat}
									<option value={cat.value}>{cat.label}</option>
								{/each}
							</select>
						</div>

						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Max Attendees (Optional)</label>
							<input
								type="number"
								min="0"
								bind:value={createForm.maxAttendees}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>

						<div class="md:col-span-2">
							<label class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
								<input type="checkbox" bind:checked={createForm.isVirtual} class="h-4 w-4 rounded border-gray-300" />
								Virtual Event
							</label>
						</div>

						{#if createForm.isVirtual}
							<div class="md:col-span-2">
								<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Meeting URL</label>
								<input
									type="url"
									bind:value={createForm.meetingUrl}
									placeholder="https://..."
									class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
								/>
							</div>
						{:else}
							<div class="md:col-span-2">
								<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
								<input
									type="text"
									bind:value={createForm.location}
									placeholder="Venue, city"
									class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
								/>
							</div>
						{/if}

						<div class="md:col-span-2">
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image (Optional)</label>
							<div class="flex items-center gap-3">
								<label class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
									<ImageIcon class="h-4 w-4" />
									Upload image
									<input type="file" accept="image/*" class="hidden" onchange={handleCoverImageChange} />
								</label>
								{#if coverImagePreview}
									<img src={coverImagePreview} alt="Cover preview" class="h-14 w-20 rounded-lg object-cover" />
								{/if}
							</div>
						</div>
					</div>

					{#if createError}
						<p class="mt-3 text-sm text-red-600 dark:text-red-400">{createError}</p>
					{/if}

					<div class="mt-4 flex items-center gap-3">
						<Button onclick={handleCreateEvent} disabled={creatingEvent || coverUploading}>
							{creatingEvent || coverUploading ? 'Publishing...' : 'Add Event'}
						</Button>
						<Button
							variant="secondary"
							onclick={() => {
								showCreateEvent = false;
								resetCreateEventForm();
							}}
						>
							Cancel
						</Button>
					</div>

					{#if myActiveEvents.length > 0}
						<div class="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
							<h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Manage Active Events</h3>
							<div class="space-y-2">
								{#each myActiveEvents as event (event.id)}
									<div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
										<div>
											<p class="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
											<p class="text-xs text-gray-500 dark:text-gray-400">
												{new Date(event.eventDate).toLocaleString()}
											</p>
										</div>
										<div class="flex gap-2">
											<Button
												size="sm"
												variant="secondary"
												onclick={() => handleCancelEvent(event.id)}
												disabled={actionInProgress === event.id}
											>
												Cancel
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onclick={() => handleDeleteEvent(event.id)}
												disabled={actionInProgress === event.id}
											>
												Delete
											</Button>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</Card>
			{/if}

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
