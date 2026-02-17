<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';

	let { children } = $props();

	function applyTheme(value: string) {
		if (!browser) return;
		const root = document.documentElement;
		if (value === 'system') {
			const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			root.classList.toggle('dark', systemDark);
		} else {
			root.classList.toggle('dark', value === 'dark');
		}
	}

	onMount(() => {
		// Apply initial theme
		let currentValue = 'light';
		const unsub = theme.subscribe((value) => {
			currentValue = value;
			applyTheme(value);
		});

		// Also apply immediately in case store has value
		applyTheme(currentValue);

		return unsub;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<AdaptiveNavigation />

<main
	class="min-h-[calc(100dvh-7.5rem)] overflow-x-hidden pt-16 pb-14 lg:min-h-screen lg:pt-0 lg:pb-0 lg:pl-72"
>
	{@render children()}
</main>
