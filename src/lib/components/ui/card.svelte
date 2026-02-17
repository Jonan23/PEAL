<script lang="ts">
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div
	class="rounded-3xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-xl transition-colors dark:border-gray-800 dark:bg-gray-900/80 {className}"
>
	{@render children?.()}
</div>
