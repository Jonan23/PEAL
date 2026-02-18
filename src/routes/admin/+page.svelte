<script lang="ts">
	import { onMount } from 'svelte';
	import { adminApi } from '$lib/api/endpoints';

	let stats = $state<any>(null);
	let analytics = $state<any>(null);
	let loading = $state(true);
	let error = $state('');

	async function loadData() {
		try {
			loading = true;
			const [statsRes, analyticsRes] = await Promise.all([
				adminApi.getDashboard(),
				adminApi.getAnalytics(),
			]);
			stats = statsRes.stats;
			analytics = analyticsRes.analytics;
		} catch (e: any) {
			error = e.message || 'Failed to load dashboard';
		} finally {
			loading = false;
		}
	}

	onMount(loadData);
</script>

<svelte:head>
	<title>Admin Dashboard - PEAL</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400">Loading...</p>
		</div>
	{:else if error}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
			{error}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<p class="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
				<p class="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
				<p class="text-sm text-green-500">+{analytics?.newUsers || 0} this month</p>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<p class="text-sm text-gray-500 dark:text-gray-400">Total Videos</p>
				<p class="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalVideos || 0}</p>
				<p class="text-sm text-green-500">+{analytics?.newVideos || 0} this month</p>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<p class="text-sm text-gray-500 dark:text-gray-400">Funds Raised</p>
				<p class="text-3xl font-bold text-gray-900 dark:text-white">${((stats?.totalDonationAmount || 0) / 100).toFixed(2)}</p>
				<p class="text-sm text-green-500">+${((analytics?.donationTotal || 0) / 100).toFixed(2)} this month</p>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<p class="text-sm text-gray-500 dark:text-gray-400">Pending Reports</p>
				<p class="text-3xl font-bold text-orange-500">{stats?.pendingReports || 0}</p>
				<a href="/admin/reports" class="text-sm text-pink-500 hover:underline">View all →</a>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h2>
				<div class="space-y-4">
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-300">Active Users</span>
						<span class="font-medium text-gray-900 dark:text-white">{stats?.activeUsers || 0}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-300">Active Funding Requests</span>
						<span class="font-medium text-gray-900 dark:text-white">{stats?.totalFundingRequests || 0}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-300">Total Donations</span>
						<span class="font-medium text-gray-900 dark:text-white">{stats?.totalDonations || 0}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-300">Available Mentors</span>
						<span class="font-medium text-gray-900 dark:text-white">{stats?.totalMentors || 0}</span>
					</div>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity (30 days)</h2>
				<div class="space-y-4">
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-300">New Users</span>
						<span class="font-medium text-green-500">+{analytics?.newUsers || 0}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-300">New Videos</span>
						<span class="font-medium text-green-500">+{analytics?.newVideos || 0}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-300">New Donations</span>
						<span class="font-medium text-green-500">+{analytics?.newDonations || 0}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-300">Donation Volume</span>
						<span class="font-medium text-green-500">${((analytics?.donationTotal || 0) / 100).toFixed(2)}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
