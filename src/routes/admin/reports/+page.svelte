<script lang="ts">
	import { onMount } from 'svelte';
	import { moderationApi } from '$lib/api/endpoints';
	import Button from '$lib/components/ui/button.svelte';

	let reports = $state<any[]>([]);
	let stats = $state<any>(null);
	let statusFilter = $state('pending');
	let loading = $state(true);
	let error = $state('');

	async function loadReports() {
		try {
			loading = true;
			const [reportsRes, statsRes] = await Promise.all([
				moderationApi.getPending(),
				moderationApi.getStats(),
			]);
			reports = reportsRes.reports;
			stats = statsRes.stats;
		} catch (e: any) {
			error = e.message || 'Failed to load reports';
		} finally {
			loading = false;
		}
	}

	async function handleReview(reportId: string, action: 'dismiss' | 'warn' | 'remove_content' | 'ban_user') {
		try {
			await moderationApi.review(reportId, action);
			loadReports();
		} catch (e: any) {
			error = e.message;
		}
	}

	function getContentTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			video: 'Video',
			comment: 'Comment',
			user: 'User',
			funding_request: 'Funding Request',
			success_story: 'Success Story',
		};
		return labels[type] || type;
	}

	function getReasonLabel(reason: string): string {
		const labels: Record<string, string> = {
			spam: 'Spam',
			harassment: 'Harassment',
			inappropriate: 'Inappropriate Content',
			misinformation: 'Misinformation',
			other: 'Other',
		};
		return labels[reason] || reason;
	}

	onMount(loadReports);
</script>

<svelte:head>
	<title>Moderation Reports - Admin - PEAL</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Moderation Reports</h1>
	</div>

	{#if stats}
		<div class="grid grid-cols-4 gap-4">
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
				<p class="text-sm text-gray-500 dark:text-gray-400">Pending</p>
				<p class="text-2xl font-bold text-orange-500">{stats.pending}</p>
			</div>
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
				<p class="text-sm text-gray-500 dark:text-gray-400">Reviewed</p>
				<p class="text-2xl font-bold text-green-500">{stats.reviewed}</p>
			</div>
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
				<p class="text-sm text-gray-500 dark:text-gray-400">Dismissed</p>
				<p class="text-2xl font-bold text-gray-500">{stats.dismissed}</p>
			</div>
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
				<p class="text-sm text-gray-500 dark:text-gray-400">Actioned</p>
				<p class="text-2xl font-bold text-red-500">{stats.actioned}</p>
			</div>
		</div>
	{/if}

	{#if error}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400">Loading...</p>
		</div>
	{:else if reports.length === 0}
		<div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
			<p class="text-gray-500 dark:text-gray-400">No pending reports</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each reports as report}
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<div class="flex justify-between items-start">
						<div>
							<div class="flex items-center gap-2 mb-2">
								<span class="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
									{getContentTypeLabel(report.contentType)}
								</span>
								<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
									{getReasonLabel(report.reason)}
								</span>
							</div>
							<p class="text-gray-900 dark:text-white font-medium">
								Content ID: {report.contentId}
							</p>
							{#if report.description}
								<p class="text-gray-600 dark:text-gray-300 mt-2">{report.description}</p>
							{/if}
							<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
								Reported by: {report.reporterId} • {new Date(report.createdAt).toLocaleDateString()}
							</p>
						</div>
						<div class="flex flex-col gap-2">
							<Button variant="ghost" size="sm" onclick={() => handleReview(report.id, 'dismiss')}>
								Dismiss
							</Button>
							<Button variant="secondary" size="sm" onclick={() => handleReview(report.id, 'warn')}>
								Warn User
							</Button>
							<Button variant="destructive" size="sm" onclick={() => handleReview(report.id, 'remove_content')}>
								Remove Content
							</Button>
							<Button variant="destructive" size="sm" onclick={() => handleReview(report.id, 'ban_user')}>
								Ban User
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
