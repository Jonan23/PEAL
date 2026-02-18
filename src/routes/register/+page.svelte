<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, ArrowRight, Check } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import { t } from '$lib/i18n';
	import { authStore } from '$lib/stores/auth';

	let step = $state(1);
	let loading = $state(false);
	let error = $state('');

	let formData = $state({
		email: '',
		password: '',
		name: '',
		location: '',
		role: '' as 'woman' | 'sponsor',
		skills: [] as string[],
		bio: ''
	});

	const skillOptions = [
		'Leadership',
		'Technology',
		'Marketing',
		'Finance',
		'Sales',
		'Design',
		'Education',
		'Business',
		'Mentoring'
	];

	function toggleSkill(skill: string) {
		if (formData.skills.includes(skill)) {
			formData.skills = formData.skills.filter((s) => s !== skill);
		} else {
			formData.skills = [...formData.skills, skill];
		}
	}

	async function handleNext() {
		error = '';
		
		if (step < 3) {
			step++;
		} else {
			loading = true;
			
			const result = await authStore.register({
				email: formData.email,
				password: formData.password,
				name: formData.name,
				role: formData.role,
				skills: formData.skills,
				bio: formData.bio,
				location: formData.location
			});

			if (result.success) {
				goto('/onboarding');
			} else {
				error = result.error || 'Registration failed';
				loading = false;
			}
		}
	}
</script>

<svelte:head>
	<title>Register - PEAL</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
>
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<div
				class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500"
			>
				<span class="text-2xl font-bold text-white">P</span>
			</div>
			<h1
				class="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent"
			>
				{$t.auth.createAccount}
			</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">{$t.auth.stepOf.replace('{current}', step.toString()).replace('{total}', '3')}</p>
		</div>

		<!-- Progress -->
		<div class="mb-6 flex gap-2">
			{#each [1, 2, 3] as i}
				<div
					class="h-1.5 flex-1 rounded-full {i <= step
						? 'bg-gradient-to-r from-rose-500 to-orange-500'
						: 'bg-gray-200 dark:bg-gray-700'}"
				></div>
			{/each}
		</div>

		<!-- Form Card -->
		<div class="card p-6">
			{#if error}
				<div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
					{error}
				</div>
			{/if}
			
			{#if step === 1}
				<!-- Step 1: Email & Password -->
				<div class="space-y-4">
					<Input
						type="email"
						label={$t.auth.email}
						placeholder="you@example.com"
						bind:value={formData.email}
						required
					/>
					<Input
						type="password"
						label={$t.auth.password}
						placeholder="Create a password"
						bind:value={formData.password}
						required
					/>
				</div>
			{:else if step === 2}
				<!-- Step 2: Personal Details -->
				<div class="space-y-4">
					<Input
						label={$t.auth.fullName}
						placeholder="Your full name"
						bind:value={formData.name}
						required
					/>
					<Input label={$t.auth.location} placeholder="City, Country" bind:value={formData.location} />
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>{$t.auth.iAmA}</label
						>
						<div class="grid grid-cols-2 gap-3">
							<button
								type="button"
								onclick={() => (formData.role = 'woman')}
								class="rounded-xl border-2 p-4 transition-all {formData.role === 'woman'
									? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
									: 'border-gray-200 dark:border-gray-700'}"
							>
								<span class="mb-2 block text-2xl">👩</span>
								<span class="font-medium">{$t.auth.woman}</span>
							</button>
							<button
								type="button"
								onclick={() => (formData.role = 'sponsor')}
								class="rounded-xl border-2 p-4 transition-all {formData.role === 'sponsor'
									? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
									: 'border-gray-200 dark:border-gray-700'}"
							>
								<span class="mb-2 block text-2xl">🤝</span>
								<span class="font-medium">{$t.auth.sponsor}</span>
							</button>
						</div>
					</div>
					{#if formData.role}
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>{$t.auth.selectSkills}</label
							>
							<div class="flex flex-wrap gap-2">
								{#each skillOptions as skill}
									<button
										type="button"
										onclick={() => toggleSkill(skill)}
										disabled={!formData.skills.includes(skill) && formData.skills.length >= 3}
										class="rounded-full border px-3 py-1.5 text-sm transition-all {formData.skills.includes(
											skill
										)
											? 'border-rose-500 bg-rose-500 text-white'
											: 'border-gray-200 hover:border-rose-300 dark:border-gray-700'}"
									>
										{#if formData.skills.includes(skill)}
											<Check class="mr-1 inline h-3 w-3" />
										{/if}
										{skill}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Step 3: Bio -->
				<div class="space-y-4">
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>{$t.auth.profilePhoto}</label
						>
						<div class="flex items-center gap-4">
							<Avatar src="" alt="Profile" size="xl" />
							<Button variant="secondary" size="sm">{$t.auth.uploadPhoto}</Button>
						</div>
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>{$t.auth.bio}</label
						>
						<textarea
							bind:value={formData.bio}
							placeholder={$t.auth.bioPlaceholder}
							rows="4"
							class="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						></textarea>
					</div>
					<label class="flex items-start gap-2 text-sm">
						<input
							type="checkbox"
							class="mt-0.5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
							required
						/>
						<span class="text-gray-600 dark:text-gray-400"
							>{$t.auth.agreeTerms}</span
						>
					</label>
				</div>
			{/if}

			<div class="mt-6 flex gap-3">
				{#if step > 1}
					<Button variant="ghost" onclick={() => step--} class="flex-1">
						<ArrowLeft class="mr-2 h-4 w-4" />
						{$t.common.back}
					</Button>
				{/if}
				<Button onclick={handleNext} class="flex-1" disabled={loading}>
					{#if loading}
						{$t.auth.creatingAccount}
					{:else}
						{step === 3 ? $t.auth.createAccount : $t.common.continue}
						<ArrowRight class="ml-2 h-4 w-4" />
					{/if}
				</Button>
			</div>
		</div>

		<!-- Sign In Link -->
		<p class="mt-6 text-center text-gray-600 dark:text-gray-400">
			{$t.auth.haveAccount}
			<a href="/login" class="font-medium text-rose-500 hover:text-rose-600">{$t.auth.signIn}</a>
		</p>
	</div>
</div>
