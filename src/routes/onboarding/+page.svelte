<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowRight, ArrowLeft, Check, Users, Video, Heart, Target, Sparkles } from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth';

	let currentStep = $state(0);
	let loading = $state(false);

	const features = [
		{
			icon: Users,
			title: 'Connect with Mentors',
			description: 'Find experienced mentors who can guide your journey and help you achieve your goals.'
		},
		{
			icon: Video,
			title: 'Share Your Story',
			description: 'Upload videos to inspire others and build your personal brand within the community.'
		},
		{
			icon: Target,
			title: 'Set & Achieve Goals',
			description: 'Create funding requests and get support from sponsors who believe in your vision.'
		},
		{
			icon: Heart,
			title: 'Join a Community',
			description: 'Connect with like-minded women from around the world who are pursuing their dreams.'
		}
	];

	function nextStep() {
		if (currentStep < features.length) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			currentStep--;
		}
	}

	async function handleGetStarted() {
		loading = true;
		authStore.markOnboardingSeen();
		await new Promise((r) => setTimeout(r, 500));
		goto('/register');
	}

	function handleSkip() {
		authStore.markOnboardingSeen();
		goto('/login');
	}
</script>

<svelte:head>
	<title>Welcome to PEAL</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
>
	<!-- Skip Button -->
	<div class="flex justify-end p-4">
		<button
			onclick={handleSkip}
			class="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
		>
			Skip
			<ArrowRight class="h-4 w-4" />
		</button>
	</div>

	<!-- Main Content -->
	<div class="flex flex-1 flex-col items-center justify-center px-4">
		<!-- Progress Dots -->
		<div class="mb-8 flex gap-2">
			{#each features as _, i}
				<div
					class="h-2 w-2 rounded-full transition-all {i <= currentStep
						? 'w-8 bg-gradient-to-r from-rose-500 to-orange-500'
						: 'bg-gray-300 dark:bg-gray-600'}"
				></div>
			{/each}
		</div>

		<!-- Feature Card -->
		<div class="w-full max-w-md">
			{#if currentStep < features.length}
				{@const feature = features[currentStep]}
				<div class="mb-8 text-center">
					<div
						class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg"
					>
						<feature.icon class="h-12 w-12 text-white" />
					</div>
					<h1
						class="mb-3 bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent"
					>
						{feature.title}
					</h1>
					<p class="text-lg text-gray-600 dark:text-gray-400">
						{feature.description}
					</p>
				</div>
			{:else}
				<div class="mb-8 text-center">
					<div
						class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg"
					>
						<Sparkles class="h-12 w-12 text-white" />
					</div>
					<h1
						class="mb-3 bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent"
					>
						Ready to Begin?
					</h1>
					<p class="text-lg text-gray-600 dark:text-gray-400">
						Join thousands of women who are already pursuing their dreams with PEAL.
					</p>
				</div>
			{/if}

			<!-- Navigation Buttons -->
			<div class="flex gap-3">
				{#if currentStep > 0}
					<button
						onclick={prevStep}
						class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						<ArrowLeft class="h-5 w-5" />
						Back
					</button>
				{/if}
				<button
					onclick={currentStep < features.length ? nextStep : handleGetStarted}
					disabled={loading}
					class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl hover:shadow-rose-500/25 disabled:opacity-50"
				>
					{#if loading}
						<div class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
					{:else}
						{currentStep < features.length ? 'Next' : 'Get Started'}
						{#if currentStep < features.length}
							<ArrowRight class="h-5 w-5" />
						{:else}
							<Check class="h-5 w-5" />
						{/if}
					{/if}
				</button>
			</div>
		</div>

		<!-- Step Counter -->
		<p class="mt-8 text-sm text-gray-500">
			Step {currentStep + 1} of {features.length + 1}
		</p>
	</div>
</div>
