<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

	const variantClasses = {
		primary:
			'bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-rose-500/30 rounded-2xl',
		secondary:
			'border border-rose-200 dark:border-rose-800 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl',
		ghost: 'hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl',
		destructive: 'bg-red-500 text-white hover:bg-red-600 rounded-2xl'
	};

	const sizeClasses = {
		sm: 'h-8 px-3 text-sm',
		md: 'h-10 px-4 text-sm',
		lg: 'h-12 px-6 text-base'
	};
</script>

<button
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}"
	disabled={loading || rest.disabled}
	{...rest}
>
	{#if loading}
		<svg
			class="mr-2 -ml-1 h-4 w-4 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{@render children?.()}
</button>
