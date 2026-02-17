<script lang="ts">
	import { slide } from 'svelte/transition';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children?: import('svelte').Snippet;
	}

	let { open = false, onOpenChange, children }: Props = $props();
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		transition:slide={{ duration: 200 }}
		onclick={() => onOpenChange?.(false)}
		onkeydown={(e) => e.key === 'Escape' && onOpenChange?.(false)}
		role="button"
		tabindex="0"
		aria-label="Close dialog"
	></div>
	<div
		class="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
		transition:slide={{ duration: 200 }}
	>
		<div
			class="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
		>
			{@render children?.()}
		</div>
	</div>
{/if}
