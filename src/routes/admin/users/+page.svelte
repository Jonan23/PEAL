<script lang="ts">
	import { onMount } from 'svelte';
	import { adminApi } from '$lib/api/endpoints';
	import Button from '$lib/components/ui/button.svelte';

	interface AdminUser {
		id: string;
		name: string;
		email: string;
		role: string;
		emailVerified: boolean;
		createdAt: string;
		_count: {
			videos: number;
			fundingRequests?: number;
			fundingDonations: number;
		};
	}

	let users = $state<any[]>([]);
	let total = $state(0);
	let page = $state(1);
	let limit = $state(20);
	let search = $state('');
	let roleFilter = $state('');
	let loading = $state(true);
	let error = $state('');

	async function loadUsers() {
		try {
			loading = true;
			const res = await adminApi.getUsers({ page, limit, search, role: roleFilter || undefined });
			users = res.users;
			total = res.total;
		} catch (e: any) {
			error = e.message || 'Failed to load users';
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		page = 1;
		loadUsers();
	}

	async function updateRole(userId: string, role: string) {
		try {
			await adminApi.updateUser(userId, { role });
			loadUsers();
		} catch (e: any) {
			error = e.message;
		}
	}

	async function deleteUser(userId: string) {
		if (!confirm('Are you sure you want to delete this user?')) return;
		try {
			await adminApi.deleteUser(userId);
			loadUsers();
		} catch (e: any) {
			error = e.message;
		}
	}

	onMount(loadUsers);
</script>

<svelte:head>
	<title>User Management - Admin - PEAL</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
		<p class="text-gray-500 dark:text-gray-400">{total} total users</p>
	</div>

	<div class="flex gap-4">
		<input
			type="text"
			placeholder="Search users..."
			bind:value={search}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
			class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
		/>
		<select
			bind:value={roleFilter}
			onchange={loadUsers}
			class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
		>
			<option value="">All Roles</option>
			<option value="woman">Women</option>
			<option value="sponsor">Sponsors</option>
			<option value="admin">Admins</option>
			<option value="banned">Banned</option>
		</select>
		<Button onclick={handleSearch}>Search</Button>
	</div>

	{#if error}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400">Loading...</p>
		</div>
	{:else}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead class="bg-gray-50 dark:bg-gray-700">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Activity</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
					{#each users as user}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<div>
									<p class="font-medium text-gray-900 dark:text-white">{user.name}</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<select
									value={user.role}
									onchange={(e) => updateRole(user.id, e.currentTarget.value)}
									class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
								>
									<option value="woman">Woman</option>
									<option value="sponsor">Sponsor</option>
									<option value="admin">Admin</option>
									<option value="banned">Banned</option>
								</select>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								{#if user.emailVerified}
									<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Verified</span>
								{:else}
									<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Unverified</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
								<div class="flex gap-4">
									<span>{user._count.videos} videos</span>
									<span>{user._count.fundingRequests} requests</span>
									<span>{user._count.fundingDonations} donations</span>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<Button variant="destructive" size="sm" onclick={() => deleteUser(user.id)}>
									Delete
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if total > limit}
			<div class="flex justify-center gap-2">
				{#if page > 1}
					<Button variant="secondary" onclick={() => { page--; loadUsers(); }}>Previous</Button>
				{/if}
				<span class="py-2 px-4 text-gray-500 dark:text-gray-400">
					Page {page} of {Math.ceil(total / limit)}
				</span>
				{#if page * limit < total}
					<Button variant="secondary" onclick={() => { page++; loadUsers(); }}>Next</Button>
				{/if}
			</div>
		{/if}
	{/if}
</div>
