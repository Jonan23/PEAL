<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { t } from '$lib/i18n';

	let selectedType = $state<'woman' | 'sponsor' | null>(null);
	let loading = $state(false);

	async function handleComplete() {
		loading = true;
		await new Promise((r) => setTimeout(r, 1000));
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Onboarding - PEAL</title>
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
				{$t.onboarding.title}
			</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">{$t.onboarding.subtitle}</p>
		</div>

		<!-- Role Selection -->
		<Card class="p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{$t.onboarding.selectType}</h2>

			<div class="grid gap-4">
				<button
					type="button"
					onclick={() => (selectedType = 'woman')}
					class="rounded-xl border-2 p-6 text-left transition-all {selectedType === 'woman'
						? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
						: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
				>
					<span class="mb-3 block text-4xl">👩</span>
					<h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{$t.onboarding.woman}</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">{$t.onboarding.womanDesc}</p>
				</button>

				<button
					type="button"
					onclick={() => (selectedType = 'sponsor')}
					class="rounded-xl border-2 p-6 text-left transition-all {selectedType === 'sponsor'
						? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
						: 'border-gray-200 hover:border-gray-300 dark:border-gray-700'}"
				>
					<span class="mb-3 block text-4xl">🤝</span>
					<h3 class="mb-1 font-semibold text-gray-900 dark:text-white">{$t.onboarding.sponsor}</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">{$t.onboarding.sponsorDesc}</p>
				</button>
			</div>

			<Button onclick={handleComplete} disabled={!selectedType} {loading} class="mt-6 w-full">
				{loading ? $t.onboarding.settingUp : $t.onboarding.continueToDashboard}
			</Button>
		</Card>
	</div>
</div>
