<script lang="ts">
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import { theme } from '$lib/stores/theme';
	import { language } from '$lib/i18n';
	import { type Language } from '$lib/i18n/translations';
	import {
		Save,
		Moon,
		Sun,
		Bell,
		Shield,
		User,
		X,
		Users,
		Heart,
		TrendingUp,
		Download,
		Trash2,
		Lock,
		AlertTriangle
	} from 'lucide-svelte';
	import { mockUsers } from '$lib/data/mock';

	const currentUser = mockUsers[0];

	let selectedTheme = $state('light');
	let selectedLanguage = $state<Language>('en');
	let emailNotifications = $state(true);
	let pushNotifications = $state(true);
	let mentorMessages = $state(true);
	let supporterUpdates = $state(true);
	let weeklyDigest = $state(false);
	let publicProfile = $state(true);

	let userSkills = $state(['Leadership', 'Technology', 'Marketing']);
	let userInterests = $state(['Entrepreneurship', 'Education', 'Healthcare']);
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

	const impactStats = {
		supporters: 89,
		mentors: 5,
		raised: 12500
	};

	theme.subscribe((value) => {
		selectedTheme = value;
	});

	language.subscribe((value) => {
		selectedLanguage = value;
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
</script>

<svelte:head>
	<title>Settings - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto max-w-3xl px-4 py-6 lg:p-8">
			<h1 class="mb-8 text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">Settings</h1>

			<!-- Profile Section -->
			<section class="mb-8">
				<h2
					class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<User class="h-5 w-5" />
					Profile
				</h2>
				<Card class="p-5">
					<div class="mb-6 flex items-start gap-4">
						<Avatar src={currentUser.avatar} alt={currentUser.name} size="xl" />
						<div class="flex-1">
							<Button variant="secondary" size="sm">Change Photo</Button>
							<p class="mt-2 text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
						</div>
					</div>
					<div class="grid gap-4">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>Name</label
							>
							<input
								type="text"
								value={currentUser.name}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>Email</label
							>
							<input
								type="email"
								value={currentUser.email}
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>Location</label
							>
							<input
								type="text"
								value={currentUser.location || ''}
								placeholder="City, Country"
								class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>Bio</label
							>
							<textarea
								value={currentUser.bio || ''}
								placeholder="Tell us about yourself..."
								rows="3"
								class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							></textarea>
						</div>
					</div>

					<!-- Skills -->
					<div class="mt-6">
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Skills (up to 5)</label
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
									<option value="">Add a skill...</option>
									{#each availableSkills.filter((s) => !userSkills.includes(s)) as skill}
										<option value={skill}>{skill}</option>
									{/each}
								</select>
								<Button variant="secondary" size="sm" onclick={addSkill} disabled={!newSkill}
									>Add</Button
								>
							</div>
						{/if}
					</div>

					<!-- Interests -->
					<div class="mt-6">
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Interests (up to 5)</label
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
									<option value="">Add an interest...</option>
									{#each availableInterests.filter((i) => !userInterests.includes(i)) as interest}
										<option value={interest}>{interest}</option>
									{/each}
								</select>
								<Button variant="secondary" size="sm" onclick={addInterest} disabled={!newInterest}
									>Add</Button
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
					Appearance
				</h2>
				<Card class="p-5">
					<div class="mb-4">
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Theme</label
						>
						<div class="flex gap-3">
							<button
								onclick={() => setTheme('light')}
								class="flex-1 rounded-xl border-2 p-4 transition-all {selectedTheme === 'light'
									? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
									: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
							>
								<Sun class="mx-auto mb-2 h-6 w-6 text-orange-500" />
								<p class="text-sm font-medium">Light</p>
							</button>
							<button
								onclick={() => setTheme('dark')}
								class="flex-1 rounded-xl border-2 p-4 transition-all {selectedTheme === 'dark'
									? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
									: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
							>
								<Moon class="mx-auto mb-2 h-6 w-6 text-violet-500" />
								<p class="text-sm font-medium">Dark</p>
							</button>
						</div>
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Language</label
						>
						<div class="grid grid-cols-2 gap-3">
							{#each [{ code: 'en', label: 'English', flag: '🇺🇸' }, { code: 'es', label: 'Español', flag: '🇪🇸' }, { code: 'fr', label: 'Français', flag: '🇫🇷' }, { code: 'pt', label: 'Português', flag: '🇧🇷' }] as lang}
								<button
									onclick={() => setLanguage(lang.code as Language)}
									class="flex items-center gap-3 rounded-xl border-2 p-3 transition-all {selectedLanguage ===
									lang.code
										? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
										: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
								>
									<span class="text-xl">{lang.flag}</span>
									<span class="font-medium">{lang.label}</span>
								</button>
							{/each}
						</div>
					</div>
				</Card>
			</section>

			<!-- Notifications Section -->
			<section class="mb-8">
				<h2
					class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<Bell class="h-5 w-5" />
					Notifications
				</h2>
				<Card class="p-5">
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">Email Notifications</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
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
								<p class="font-medium text-gray-900 dark:text-white">Push Notifications</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Receive push notifications</p>
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
								Activity Notifications
							</p>
						</div>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium text-gray-900 dark:text-white">Mentor Messages</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									Get notified when mentors message you
								</p>
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
								<p class="font-medium text-gray-900 dark:text-white">Supporter Updates</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">Updates from your supporters</p>
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
								<p class="font-medium text-gray-900 dark:text-white">Weekly Digest</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									Weekly summary of platform activity
								</p>
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

			<!-- Impact Section -->
			<section class="mb-8">
				<h2
					class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
				>
					<TrendingUp class="h-5 w-5" />
					Your Impact
				</h2>
				<Card class="p-5">
					<div class="grid grid-cols-3 gap-4">
						<div class="text-center">
							<div
								class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30"
							>
								<Users class="h-6 w-6 text-rose-500" />
							</div>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">
								{impactStats.supporters}
							</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">Supporters</p>
						</div>
						<div class="text-center">
							<div
								class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30"
							>
								<User class="h-6 w-6 text-violet-500" />
							</div>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">{impactStats.mentors}</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">Mentors</p>
						</div>
						<div class="text-center">
							<div
								class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
							>
								<Heart class="h-6 w-6 text-emerald-500" />
							</div>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">
								${impactStats.raised.toLocaleString()}
							</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">Raised</p>
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
							<p class="font-medium text-gray-900 dark:text-white">Public Profile</p>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								Allow others to view your profile
							</p>
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
						<div
							class="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-700"
						>
							<div class="flex items-center gap-3">
								<Lock class="h-5 w-5 text-gray-500" />
								<div>
									<p class="font-medium text-gray-900 dark:text-white">Change Password</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">Update your password</p>
								</div>
							</div>
							<Button variant="secondary" size="sm">Update</Button>
						</div>
						<div
							class="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-700"
						>
							<div class="flex items-center gap-3">
								<Download class="h-5 w-5 text-gray-500" />
								<div>
									<p class="font-medium text-gray-900 dark:text-white">Save Your Data</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">Download all your data</p>
								</div>
							</div>
							<Button variant="secondary" size="sm">Download</Button>
						</div>
						<div
							class="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20"
						>
							<div class="flex items-center gap-3">
								<Trash2 class="h-5 w-5 text-red-500" />
								<div>
									<p class="font-medium text-red-700 dark:text-red-400">Delete Account</p>
									<p class="text-sm text-red-500 dark:text-red-400">
										Permanently delete your account
									</p>
								</div>
							</div>
							<Button variant="destructive" size="sm">Delete</Button>
						</div>
					</div>
				</Card>
			</section>

			<!-- Save Button -->
			<Button class="w-full">
				<Save class="mr-2 h-4 w-4" />
				Save Changes
			</Button>
		</div>
	</main>
</div>
