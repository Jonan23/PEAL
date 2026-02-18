<script lang="ts">
	import { Play, Heart, MessageCircle, Share2 } from 'lucide-svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import type { Video } from '$lib/api/types';

	interface Props {
		video: Video;
		onclick?: () => void;
	}

	let { video, onclick }: Props = $props();

	const categoryColors: Record<string, string> = {
		entrepreneurship: 'from-emerald-500 to-teal-500',
		motivation: 'from-rose-500 to-pink-500',
		mentorship: 'from-violet-500 to-purple-500',
		education: 'from-blue-500 to-cyan-500',
		marketing: 'from-orange-500 to-amber-500'
	};

	const gradient = categoryColors[video.category || ''] || 'from-rose-500 to-orange-500';

	function formatDuration(seconds: number | undefined): string {
		if (!seconds) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function formatNumber(num: number): string {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	}
</script>

<button
	{onclick}
	class="group relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800"
>
	<img
		src={video.thumbnailUrl || video.videoUrl}
		alt={video.title}
		class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
	/>

	<!-- Gradient Overlay -->
	<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

	<!-- Category Badge -->
	{#if video.category}
		<div class="absolute top-3 left-3">
			<span
				class="rounded-lg bg-gradient-to-r px-2 py-1 text-xs font-medium {gradient} text-white capitalize"
			>
				{video.category}
			</span>
		</div>
	{/if}

	<!-- Duration -->
	{#if video.videoDuration}
		<span
			class="absolute top-3 right-3 rounded-lg bg-black/50 px-2 py-1 text-xs font-medium text-white"
		>
			{formatDuration(video.videoDuration)}
		</span>
	{/if}

	<!-- Content Overlay -->
	<div class="absolute right-0 bottom-0 left-0 p-3 text-white">
		<div class="mb-2 flex items-end gap-2">
			<Avatar src={video.author?.avatarUrl} alt={video.author?.name || 'User'} size="sm" />
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium">{video.author?.name || 'Unknown'}</p>
				<p class="truncate text-xs text-gray-300">{video.title}</p>
			</div>
		</div>

		<!-- Stats -->
		<div class="flex items-center gap-3 text-xs">
			<span class="flex items-center gap-1">
				<Heart class="h-3.5 w-3.5" />
				{formatNumber(video.likesCount)}
			</span>
			<span class="flex items-center gap-1">
				<MessageCircle class="h-3.5 w-3.5" />
				{formatNumber(video.commentsCount)}
			</span>
			<span class="flex items-center gap-1">
				<Share2 class="h-3.5 w-3.5" />
				{formatNumber(video.sharesCount)}
			</span>
		</div>
	</div>

	<!-- Play Button on Hover -->
	<div
		class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
	>
		<div
			class="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
		>
			<Play class="ml-1 h-6 w-6 text-white" />
		</div>
	</div>
</button>
