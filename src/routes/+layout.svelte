<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores/theme';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { isRTL } from '$lib/i18n';
	import { authStore } from '$lib/stores/auth';

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
		authStore.initialize();

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

<main
	class="min-h-screen overflow-x-hidden"
	dir={$isRTL ? 'rtl' : 'ltr'}
>
	{@render children()}
</main>
