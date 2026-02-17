<script lang="ts">
	interface Props {
		value?: number;
		max?: number;
		class?: string;
	}

	let { value = 0, max = 100, class: className = '' }: Props = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div
	class="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 {className}"
>
	<div
		class="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-300"
		style="width: {percentage}%"
	></div>
</div>
