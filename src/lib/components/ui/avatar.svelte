<script lang="ts">
	interface Props {
		src?: string;
		alt?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	let { src = '', alt = 'Avatar', size = 'md', class: className = '' }: Props = $props();

	const sizeClasses = {
		sm: 'h-8 w-8',
		md: 'h-10 w-10',
		lg: 'h-14 w-14',
		xl: 'h-20 w-20'
	};
</script>

<div class="relative shrink-0 overflow-hidden rounded-full {sizeClasses[size]} {className}">
	{#if src}
		<img {src} {alt} class="h-full w-full object-cover" />
	{:else}
		<div
			class="flex h-full w-full items-center justify-center bg-rose-100 font-medium text-rose-600 dark:bg-rose-900 dark:text-rose-400"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="50%"
				height="50%"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
				<circle cx="12" cy="7" r="4"></circle>
			</svg>
		</div>
	{/if}
</div>
