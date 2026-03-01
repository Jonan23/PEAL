<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import { theme } from '$lib/stores/theme';
	import { language, availableLanguages, t } from '$lib/i18n';
	import { type Language } from '$lib/i18n/translations';
	import { authStore } from '$lib/stores/auth';
	import { settingsApi, usersApi } from '$lib/api';
	import { uploadFile } from '$lib/api/upload';
	import type { User, UserSettings } from '$lib/api/types';
	import {
		Save,
		Moon,
		Sun,
		Shield,
		User as UserIcon,
		X,
		Download,
		Trash2,
		Lock,
		AlertTriangle,
		Camera,
		LogOut
	} from 'lucide-svelte';

	let currentUser = $state<User | null>(null);
	let settings = $state<UserSettings | null>(null);
	let loading = $state(true);
	let saving = $state(false);
	let loggingOut = $state(false);
	let uploadingAvatar = $state(false);
	let avatarPreview = $state<string | null>(null);
	let selectedAvatarFile = $state<File | null>(null);
	let saveError = $state('');
	let saveSuccess = $state('');
	let accountNotice = $state('');
	let accountError = $state('');
	let deletingAccount = $state(false);
	let fileInput: HTMLInputElement;

	let selectedTheme = $state('light');
	let selectedLanguage = $state<Language>('en');
	let emailNotifications = $state(true);
	let pushNotifications = $state(true);
	let mentorMessages = $state(true);
	let supporterUpdates = $state(true);
	let weeklyDigest = $state(false);
	let publicProfile = $state(true);

	let name = $state('');
	let email = $state('');
	let location = $state('');
	let bio = $state('');
	let userSkills = $state<string[]>([]);
	let userInterests = $state<string[]>([]);
	let newSkill = $state('');
	let newInterest = $state('');

	const availableSkills = [
		'Leadership',
		'Technology',
		'Marketing',
		'Finance',
		'Sales',
		'Design',
		'Education',
		'Business',
		'Mentoring',
		'Public Speaking'
	];
	const availableInterests = [
		'Entrepreneurship',
		'Education',
		'Healthcare',
		'Technology',
		'Arts',
		'Sports',
		'Environment',
		'Social Impact'
	];

	theme.subscribe((value) => {
		selectedTheme = value;
	});

	language.subscribe((value) => {
		selectedLanguage = value;
	});

	onMount(async () => {
		await authStore.initialize();
		currentUser = $authStore.user;

		if (currentUser) {
			name = currentUser.name || '';
			email = currentUser.email || '';
			location = currentUser.location || '';
			bio = currentUser.bio || '';
			publicProfile = currentUser.isPublic ?? true;
		}

		try {
			if (!currentUser) {
				loading = false;
				return;
			}

			const [settingsResponse, skillsResponse, interestsResponse] = await Promise.all([
				settingsApi.get(),
				usersApi.getSkills(currentUser.id),
				usersApi.getInterests(currentUser.id)
			]);
			settings = settingsResponse.settings;
			userSkills = skillsResponse.skills;
			userInterests = interestsResponse.interests;

			if (settings) {
				emailNotifications = settings.emailNotifications;
				pushNotifications = settings.pushNotifications;
				mentorMessages = settings.mentorMessagesNotifications;
				supporterUpdates = settings.supporterUpdatesNotifications;
				weeklyDigest = settings.weeklyDigest;
				selectedLanguage = settings.language as Language;
				selectedTheme = settings.theme;
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		} finally {
			loading = false;
		}
	});

	function setTheme(newTheme: 'light' | 'dark') {
		theme.set(newTheme);
	}

	function setLanguage(newLang: Language) {
		language.set(newLang);
	}

	function addSkill() {
		if (newSkill && !userSkills.includes(newSkill) && userSkills.length < 5) {
			userSkills = [...userSkills, newSkill];
			newSkill = '';
		}
	}

	function removeSkill(skill: string) {
		userSkills = userSkills.filter((s) => s !== skill);
	}

	function addInterest() {
		if (newInterest && !userInterests.includes(newInterest) && userInterests.length < 5) {
			userInterests = [...userInterests, newInterest];
			newInterest = '';
		}
	}

	function removeInterest(interest: string) {
		userInterests = userInterests.filter((i) => i !== interest);
	}

	async function handleSave() {
		if (!currentUser) return;

		saving = true;
		saveError = '';
		saveSuccess = '';
		try {
			let avatarUrl = currentUser.avatarUrl;

			if (selectedAvatarFile) {
				uploadingAvatar = true;
				const uploaded = await uploadFile(selectedAvatarFile, 'image');
				avatarUrl = uploaded.url;
				uploadingAvatar = false;
			}

			await usersApi.update(currentUser.id, {
				name,
				email,
				location,
				bio,
				avatarUrl,
				isPublic: publicProfile
			});

			const secondaryResults = await Promise.allSettled([
				usersApi.updateSkills(currentUser.id, userSkills),
				usersApi.updateInterests(currentUser.id, userInterests),
				settingsApi.update({
					emailNotifications,
					pushNotifications,
					mentorMessagesNotifications: mentorMessages,
					supporterUpdatesNotifications: supporterUpdates,
					weeklyDigest,
					language: selectedLanguage,
					theme: selectedTheme
				})
			]);

			const refreshedUser = await authStore.refreshUser();
			if (refreshedUser) {
				currentUser = refreshedUser;
			}
			selectedAvatarFile = null;
			avatarPreview = null;
			if (fileInput) {
				fileInput.value = '';
			}

			const hasSecondaryFailure = secondaryResults.some((result) => result.status === 'rejected');
			saveSuccess = hasSecondaryFailure
				? 'Profile photo and core profile updated. Some preferences could not be saved.'
				: 'Changes saved successfully.';
		} catch (error) {
			console.error('Failed to save settings:', error);
			saveError = error instanceof Error ? error.message : 'Failed to save changes';
		} finally {
			uploadingAvatar = false;
			saving = false;
		}
	}

	function handleAvatarClick() {
		fileInput?.click();
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			selectedAvatarFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				avatarPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function handleLogout() {
		loggingOut = true;
		try {
			await authStore.logout();
			goto('/login');
		} finally {
			loggingOut = false;
		}
	}

	function handlePasswordUpdate() {
		accountError = '';
		accountNotice =
			'Password updates are managed through your auth provider today. Contact support if you need an immediate reset.';
	}

	function handleDownloadData() {
		accountError = '';
		try {
			const exportData = {
				profile: {
					id: currentUser?.id,
					name,
					email,
					location,
					bio,
					avatarUrl: currentUser?.avatarUrl,
					isPublic: publicProfile,
					skills: userSkills,
					interests: userInterests
				},
				preferences: {
					emailNotifications,
					pushNotifications,
					mentorMessages,
					supporterUpdates,
					weeklyDigest,
					language: selectedLanguage,
					theme: selectedTheme
				},
				exportedAt: new Date().toISOString()
			};

			const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `peal-account-export-${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			accountNotice = 'Your account data export has been downloaded.';
		} catch (error) {
			accountError = error instanceof Error ? error.message : 'Failed to export your data';
		}
	}

	async function handleDeleteAccount() {
		if (!currentUser) return;
		accountNotice = '';
		accountError = '';

		const confirmed = confirm('Delete your account permanently? This action cannot be undone.');
		if (!confirmed) return;

		deletingAccount = true;
		try {
			await usersApi.delete(currentUser.id);
			await authStore.logout();
			goto('/register');
		} catch (error) {
			accountError = error instanceof Error ? error.message : 'Failed to delete account';
		} finally {
			deletingAccount = false;
		}
	}
</script>

<svelte:head>
	<title>Settings - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto max-w-3xl px-4 py-6 lg:p-8">
			<h1 class="mb-8 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">{$t.settings.title}</h1>

			<!-- Profile Section -->
			<section class="mb-8">
				<h2
					class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<UserIcon class="h-5 w-5" />
					{$t.settings.profile}
				</h2>
				<Card class="p-5">
					<div class="mb-6 flex items-start gap-4">
						<div class="relative">
							<Avatar 
								src={avatarPreview || currentUser?.avatarUrl} 
								alt={currentUser?.name || 'User'} 
								size="xl" 
							/>
							<button
								onclick={handleAvatarClick}
								class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-rose-600"
								title={$t.settings.changePhoto}
							>
								<Camera class="h-4 w-4" />
							</button>
							<input
								bind:this={fileInput}
								type="file"
								accept="image/*"
								onchange={handleFileSelect}
								class="hidden"
							/>
						</div>
						<div class="flex-1">
							<p class="text-sm text-gray-500">{$t.settings.photoHint}</p>
						</div>
					</div>
					<div class="grid gap-4">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>{$t.settings.name}</label
							>
							<input
								type="text"
								bind:value={name}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>{$t.settings.email}</label
							>
							<input
								type="email"
								bind:value={email}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>{$t.settings.location}</label
							>
							<input
								type="text"
								bind:value={location}
								placeholder="City, Country"
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>{$t.settings.bio}</label
							>
							<textarea
								bind:value={bio}
								placeholder={$t.settings.bioPlaceholder || 'Tell us about yourself...'}
								rows="3"
								class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							></textarea>
						</div>
					</div>

					<!-- Skills -->
					<div class="mt-6">
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>{$t.settings.skills} {$t.settings.skillsHint}</label
						>
						<div class="mb-3 flex flex-wrap gap-2">
							{#each userSkills as skill}
								<span
									class="flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
								>
									{skill}
									<button
										onclick={() => removeSkill(skill)}
										class="ml-1 hover:text-rose-900 dark:hover:text-rose-100"
									>
										<X class="h-3 w-3" />
									</button>
								</span>
							{/each}
						</div>
						{#if userSkills.length < 5}
							<div class="flex gap-2">
								<select
									bind:value={newSkill}
									class="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
								>
									<option value="">{$t.settings.addSkill}</option>
									{#each availableSkills.filter((s) => !userSkills.includes(s)) as skill}
										<option value={skill}>{skill}</option>
									{/each}
								</select>
								<Button variant="secondary" size="sm" onclick={addSkill} disabled={!newSkill}
									>{$t.common.add}</Button
								>
							</div>
						{/if}
					</div>

					<!-- Interests -->
					<div class="mt-6">
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>{$t.settings.interests} {$t.settings.interestsHint}</label
						>
						<div class="mb-3 flex flex-wrap gap-2">
							{#each userInterests as interest}
								<span
									class="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
								>
									{interest}
									<button
										onclick={() => removeInterest(interest)}
										class="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
									>
										<X class="h-3 w-3" />
									</button>
								</span>
							{/each}
						</div>
						{#if userInterests.length < 5}
							<div class="flex gap-2">
								<select
									bind:value={newInterest}
									class="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
								>
									<option value="">{$t.settings.addInterest}</option>
									{#each availableInterests.filter((i) => !userInterests.includes(i)) as interest}
										<option value={interest}>{interest}</option>
									{/each}
								</select>
								<Button variant="secondary" size="sm" onclick={addInterest} disabled={!newInterest}
									>{$t.common.add}</Button
								>
							</div>
						{/if}
					</div>
				</Card>
			</section>

			<!-- Appearance Section -->
			<section class="mb-8">
				<h2
					class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<Moon class="h-5 w-5" />
					{$t.settings.appearance}
				</h2>
				<Card class="p-5">
					<div class="mb-4">
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>{$t.settings.theme}</label
						>
						<div class="flex gap-3">
							<button
								onclick={() => setTheme('light')}
								class="flex-1 rounded-xl border-2 p-4 transition-all {selectedTheme === 'light'
									? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
									: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
							>
								<Sun class="mx-auto mb-2 h-6 w-6 text-orange-500" />
								<p class="text-sm font-medium">{$t.settings.light}</p>
							</button>
							<button
								onclick={() => setTheme('dark')}
								class="flex-1 rounded-xl border-2 p-4 transition-all {selectedTheme === 'dark'
									? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
									: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
							>
								<Moon class="mx-auto mb-2 h-6 w-6 text-violet-500" />
								<p class="text-sm font-medium">{$t.settings.dark}</p>
							</button>
						</div>
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>{$t.settings.language}</label
						>
						<div class="grid grid-cols-2 gap-3">
							{#each availableLanguages as lang}
								<button
									onclick={() => setLanguage(lang.code)}
									class="flex items-center gap-3 rounded-xl border-2 p-3 transition-all {selectedLanguage ===
									lang.code
										? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
										: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
								>
									<span class="text-xl">{lang.flag}</span>
									<span class="font-medium">{lang.name}</span>
								</button>
							{/each}
						</div>
					</div>
				</Card>
			</section>

			<!-- Notifications Section -->
			<section class="mb-8">
<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
					<AlertTriangle class="h-5 w-5" />
					{$t.settings.account}
				</h2>
				<Card class="p-5">
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">{$t.settings.emailNotifications}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">{$t.settings.emailNotificationsDesc}</p>
							</div>
							<button
								onclick={() => (emailNotifications = !emailNotifications)}
								class="h-6 w-11 rounded-full transition-colors {emailNotifications
									? 'bg-rose-500'
									: 'bg-gray-300 dark:bg-gray-600'}"
							>
								<span
									class="block h-5 w-5 transform rounded-full bg-white shadow transition-transform {emailNotifications
										? 'translate-x-5'
										: 'translate-x-0.5'}"
								></span>
							</button>
						</div>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">{$t.settings.pushNotifications}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">{$t.settings.pushNotificationsDesc}</p>
							</div>
							<button
								onclick={() => (pushNotifications = !pushNotifications)}
								class="h-6 w-11 rounded-full transition-colors {pushNotifications
									? 'bg-rose-500'
									: 'bg-gray-300 dark:bg-gray-600'}"
							>
								<span
									class="block h-5 w-5 transform rounded-full bg-white shadow transition-transform {pushNotifications
										? 'translate-x-5'
										: 'translate-x-0.5'}"
								></span>
							</button>
						</div>
						<div class="border-t border-gray-100 pt-4 dark:border-gray-800">
							<p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.settings.activityNotifications}
							</p>
						</div>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">{$t.settings.mentorMessages}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">{$t.settings.mentorMessagesDesc}</p>
							</div>
							<button
								onclick={() => (mentorMessages = !mentorMessages)}
								class="h-6 w-11 rounded-full transition-colors {mentorMessages
									? 'bg-rose-500'
									: 'bg-gray-300 dark:bg-gray-600'}"
							>
								<span
									class="block h-5 w-5 transform rounded-full bg-white shadow transition-transform {mentorMessages
										? 'translate-x-5'
										: 'translate-x-0.5'}"
								></span>
							</button>
						</div>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">{$t.settings.supporterUpdates}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">{$t.settings.supporterUpdatesDesc}</p>
							</div>
							<button
								onclick={() => (supporterUpdates = !supporterUpdates)}
								class="h-6 w-11 rounded-full transition-colors {supporterUpdates
									? 'bg-rose-500'
									: 'bg-gray-300 dark:bg-gray-600'}"
							>
								<span
									class="block h-5 w-5 transform rounded-full bg-white shadow transition-transform {supporterUpdates
										? 'translate-x-5'
										: 'translate-x-0.5'}"
								></span>
							</button>
						</div>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">{$t.settings.weeklyDigest}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">{$t.settings.weeklyDigestDesc}</p>
							</div>
							<button
								onclick={() => (weeklyDigest = !weeklyDigest)}
								class="h-6 w-11 rounded-full transition-colors {weeklyDigest
									? 'bg-rose-500'
									: 'bg-gray-300 dark:bg-gray-600'}"
							>
								<span
									class="block h-5 w-5 transform rounded-full bg-white shadow transition-transform {weeklyDigest
										? 'translate-x-5'
										: 'translate-x-0.5'}"
								></span>
							</button>
						</div>
					</div>
				</Card>
			</section>

			<!-- Privacy Section -->
			<section class="mb-8">
				<h2
					class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<Shield class="h-5 w-5" />
					Privacy
				</h2>
				<Card class="p-5">
					<div class="flex items-center justify-between">
						<div>
							<p class="font-medium text-gray-900 dark:text-white">{$t.settings.publicProfile}</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">{$t.settings.publicProfileDesc}</p>
						</div>
						<button
							onclick={() => (publicProfile = !publicProfile)}
							class="h-6 w-11 rounded-full transition-colors {publicProfile
								? 'bg-rose-500'
								: 'bg-gray-300 dark:bg-gray-600'}"
						>
							<span
								class="block h-5 w-5 transform rounded-full bg-white shadow transition-transform {publicProfile
									? 'translate-x-5'
									: 'translate-x-0.5'}"
							></span>
						</button>
					</div>
				</Card>
			</section>

			<!-- Account Section -->
			<section class="mb-8">
				<h2
					class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<AlertTriangle class="h-5 w-5" />
					Account
				</h2>
				<Card class="p-5">
					<div class="space-y-4">
						{#if accountNotice}
							<p class="text-sm text-emerald-600 dark:text-emerald-400">{accountNotice}</p>
						{/if}
						{#if accountError}
							<p class="text-sm text-red-600 dark:text-red-400">{accountError}</p>
						{/if}

						<div
							class="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-700"
						>
							<div class="flex items-center gap-3">
								<LogOut class="h-5 w-5 text-gray-500" />
								<div>
									<p class="font-medium text-gray-900 dark:text-white">Sign out</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">End your current session</p>
								</div>
							</div>
							<Button variant="secondary" size="sm" onclick={handleLogout} disabled={loggingOut}>
								{loggingOut ? 'Signing out...' : 'Logout'}
							</Button>
						</div>

						<div
							class="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-700"
						>
							<div class="flex items-center gap-3">
								<Lock class="h-5 w-5 text-gray-500" />
								<div>
									<p class="font-medium text-gray-900 dark:text-white">{$t.settings.changePassword}</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">{$t.settings.changePasswordDesc}</p>
								</div>
							</div>
							<Button variant="secondary" size="sm" onclick={handlePasswordUpdate}>Update</Button>
						</div>
						<div
							class="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-700"
						>
							<div class="flex items-center gap-3">
								<Download class="h-5 w-5 text-gray-500" />
								<div>
									<p class="font-medium text-gray-900 dark:text-white">{$t.settings.saveYourData}</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">{$t.settings.saveYourDataDesc}</p>
								</div>
							</div>
							<Button variant="secondary" size="sm" onclick={handleDownloadData}>Download</Button>
						</div>
						<div
							class="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20"
						>
							<div class="flex items-center gap-3">
								<Trash2 class="h-5 w-5 text-red-500" />
								<div>
									<p class="font-medium text-red-700 dark:text-red-400">{$t.settings.deleteAccount}</p>
									<p class="text-sm text-red-500 dark:text-red-400">{$t.settings.deleteAccountDesc}</p>
								</div>
							</div>
							<Button variant="destructive" size="sm" onclick={handleDeleteAccount} disabled={deletingAccount}>
								{deletingAccount ? 'Deleting...' : 'Delete'}
							</Button>
						</div>
					</div>
				</Card>
			</section>

			<!-- Save Button -->
			<Button class="w-full" onclick={handleSave} disabled={saving || uploadingAvatar}>
				<Save class="mr-2 h-4 w-4" />
				{saving || uploadingAvatar ? 'Saving...' : $t.settings.saveChanges}
			</Button>
			{#if saveSuccess}
				<p class="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{saveSuccess}</p>
			{/if}
			{#if saveError}
				<p class="mt-3 text-sm text-red-600 dark:text-red-400">{saveError}</p>
			{/if}
		</div>
	</main>
</div>
