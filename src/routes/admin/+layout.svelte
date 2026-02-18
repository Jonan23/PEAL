<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const unsub = authStore.subscribe((auth) => {
			if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
				goto('/dashboard');
			}
		});
		return unsub;
	});

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: '📊' },
		{ href: '/admin/users', label: 'Users', icon: '👥' },
		{ href: '/admin/reports', label: 'Reports', icon: '🚨' },
		{ href: '/admin/videos', label: 'Videos', icon: '🎬' },
		{ href: '/admin/requests', label: 'Funding', icon: '💰' },
	];
</script>

<div class="flex min-h-screen">
	<aside class="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
		<div class="p-4">
			<h1 class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
		</div>
		<nav class="mt-4">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
				>
					<span>{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
		<div class="absolute bottom-4 left-4">
			<a href="/dashboard" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
				← Back to App
			</a>
		</div>
	</aside>

	<main class="flex-1 p-8 bg-white dark:bg-gray-900">
		{@render children()}
	</main>
</div>
