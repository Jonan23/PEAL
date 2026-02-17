<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { Sun, Moon } from 'lucide-svelte';

	let currentTheme = $state('light');

	theme.subscribe((value) => {
		currentTheme = value;
	});

	function toggle() {
		theme.toggle();
	}
</script>

<button
	onclick={toggle}
	class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
	aria-label="Toggle theme"
>
	{#if currentTheme === 'dark'}
		<Moon class="h-5 w-5 text-gray-700 dark:text-gray-300" />
	{:else}
		<Sun class="h-5 w-5 text-gray-700 dark:text-gray-300" />
	{/if}
</button>
