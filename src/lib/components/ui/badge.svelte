<script lang="ts">
	interface Props {
		variant?: 'default' | 'secondary' | 'outline' | 'destructive';
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { variant = 'default', children, class: className = '' }: Props = $props();

	const variantClasses = {
		default: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
		secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
		outline: 'border border-gray-200 dark:border-gray-700',
		destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors {variantClasses[
		variant
	]} {className}"
>
	{@render children?.()}
</span>
