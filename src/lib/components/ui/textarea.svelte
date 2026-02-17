<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		label?: string;
		error?: string;
	}

	let { label, error, class: className = '', ...rest }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
		</label>
	{/if}
	<textarea
		class="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-rose-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 {className}"
		{...rest}
	></textarea>
	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
</div>
