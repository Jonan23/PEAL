<script lang="ts">
	import { page } from '$app/stores';
	import {
		Home,
		Video,
		Users,
		Heart,
		Star,
		Settings,
		PlusCircle,
		Upload,
		MessageCircle,
		Bell,
		Search
	} from 'lucide-svelte';
	import Avatar from './ui/avatar.svelte';
	import ThemeToggle from './theme-toggle.svelte';
	import { mockUsers } from '$lib/data/mock';

	const currentUser = mockUsers[0];

	const navItems = [
		{ href: '/dashboard', icon: Home, label: 'Home' },
		{ href: '/feed', icon: Video, label: 'Feed' },
		{ href: '/mentor-match', icon: Users, label: 'Mentors' },
		{ href: '/requests', icon: Heart, label: 'Requests' },
		{ href: '/success', icon: Star, label: 'Success' }
	];

	const quickActions = [
		{ href: '/requests/new', icon: PlusCircle, label: 'Create Request' },
		{ href: '/feed/upload', icon: Upload, label: 'Share Video' },
		{ href: '/messages', icon: MessageCircle, label: 'Messages' }
	];

	function isActive(href: string, pathname: string): boolean {
		return pathname === href || pathname.startsWith(href + '/');
	}
</script>

<!-- Desktop Sidebar -->
<aside
	class="hidden border-r border-gray-100 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col dark:border-gray-800 dark:bg-gray-900"
>
	<div class="flex h-full flex-col gap-4 p-4">
		<!-- Logo -->
		<a href="/dashboard" class="flex items-center gap-3 px-2 py-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500"
			>
				<span class="text-xl font-bold text-white">P</span>
			</div>
			<span
				class="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-xl font-bold text-transparent"
				>PEAL</span
			>
		</a>

		<!-- User Card -->
		<div
			class="rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
		>
			<div class="flex items-center gap-3">
				<Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" />
				<div class="min-w-0 flex-1">
					<p class="truncate font-medium text-gray-900 dark:text-gray-100">{currentUser.name}</p>
					<p class="text-sm text-gray-500 capitalize dark:text-gray-400">{currentUser.role}</p>
				</div>
			</div>
			{#if currentUser.skills && currentUser.skills.length > 0}
				<div class="mt-2 flex flex-wrap gap-1">
					{#each currentUser.skills.slice(0, 3) as skill}
						<span
							class="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
							>{skill}</span
						>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1">
			{#each navItems as item}
				{@const active = isActive(item.href, $page.url.pathname)}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 {active
						? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-800'
						: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}"
				>
					<item.icon class="h-5 w-5" />
					<span class="font-medium">{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Quick Actions -->
		<div class="space-y-1 border-t border-gray-100 pt-2 dark:border-gray-800">
			{#each quickActions as action}
				<a
					href={action.href}
					class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
				>
					<action.icon class="h-5 w-5" />
					<span class="font-medium">{action.label}</span>
				</a>
			{/each}
		</div>

		<!-- Footer -->
		<div
			class="flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-800"
		>
			<a
				href="/profile/settings"
				class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
			>
				<Settings class="h-5 w-5" />
				<span class="font-medium">Settings</span>
			</a>
			<ThemeToggle />
		</div>
	</div>
</aside>

<!-- Mobile Header - Glassmorphism -->
<header
	class="fixed top-0 right-0 left-0 z-40 h-16 border-b border-gray-100/80 bg-white/80 px-4 backdrop-blur-xl lg:hidden dark:border-gray-800/50 dark:bg-gray-900/80"
>
	<div class="flex h-full items-center justify-between">
		<a href="/dashboard" class="flex items-center gap-2">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500"
			>
				<span class="font-bold text-white">P</span>
			</div>
			<span
				class="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-lg font-bold text-transparent"
				>PEAL</span
			>
		</a>

		<div class="flex items-center gap-2">
			<button
				class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
			>
				<Search class="h-5 w-5 text-gray-600 dark:text-gray-400" />
			</button>
			<button
				class="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
			>
				<Bell class="h-5 w-5 text-gray-600 dark:text-gray-400" />
				<span class="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
			</button>
			<ThemeToggle />
			<a href="/profile/settings" class="h-10 w-10">
				<Avatar src={currentUser.avatar} alt={currentUser.name} size="md" />
			</a>
		</div>
	</div>
</header>

<!-- Mobile Bottom Navigation - Floating MacOS-style Dock -->
<nav class="fixed right-4 bottom-4 left-4 z-40 mx-auto max-w-md lg:hidden">
	<div
		class="flex h-14 items-center justify-around rounded-2xl border border-white/20 bg-white/60 shadow-xl shadow-black/10 backdrop-blur-xl dark:border-gray-800/30 dark:bg-gray-900/70"
	>
		{#each navItems as item}
			{@const active = isActive(item.href, $page.url.pathname)}
			<a
				href={item.href}
				class="flex items-center justify-center rounded-xl p-2.5 transition-all {active
					? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30'
					: 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}"
			>
				<item.icon class="h-6 w-6" />
			</a>
		{/each}
	</div>
</nav>
