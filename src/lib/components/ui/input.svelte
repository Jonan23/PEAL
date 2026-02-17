<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		value?: string;
	}

	let { label, error, value = $bindable(), class: className = '', ...rest }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
		</label>
	{/if}
	<input
		bind:value
		class="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-rose-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 {className}"
		{...rest}
	/>
	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
</div>
