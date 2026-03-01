<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	onMount(() => {
		if (!browser) return;

		const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
		const accessToken = localStorage.getItem('accessToken');

		if (accessToken) {
			goto('/dashboard');
		} else if (!hasSeenOnboarding) {
			goto('/onboarding');
		} else {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>PEAL - Pride, Empowerment and Love</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<div class="animate-pulse">
		<div
			class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500"
		>
			<span class="text-2xl font-bold text-white">P</span>
		</div>
	</div>
</div>
