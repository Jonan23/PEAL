<script lang="ts">
	import { X, Heart, MessageCircle, Share2, Bookmark } from 'lucide-svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import type { Video } from '$lib/data/mock';

	interface Props {
		video: Video | null;
		open?: boolean;
		onClose?: () => void;
	}

	let { video, open = false, onClose }: Props = $props();

	function formatNumber(num: number): string {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	}
</script>

{#if open && video}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
		<button
			onclick={onClose}
			class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
		>
			<X class="h-5 w-5" />
		</button>

		<div
			class="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white lg:flex-row dark:bg-gray-900"
		>
			<!-- Video Section -->
			<div class="relative flex flex-1 items-center justify-center bg-black">
				<video
					src={video.videoUrl}
					poster={video.thumbnail}
					controls
					class="max-h-full max-w-full"
					autoplay
				>
					<track kind="captions" />
				</video>
			</div>

			<!-- Info Sidebar -->
			<div class="flex w-full flex-col bg-white p-4 lg:w-96 dark:bg-gray-900">
				<!-- Author -->
				<div class="mb-4 flex items-center gap-3">
					<Avatar src={video.author.avatar} alt={video.author.name} size="lg" />
					<div class="flex-1">
						<p class="font-medium text-gray-900 dark:text-white">{video.author.name}</p>
						<p class="text-sm text-gray-500">{video.author.location || 'Location not set'}</p>
					</div>
					<button
						class="rounded-full bg-rose-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rose-600"
					>
						Follow
					</button>
				</div>

				<!-- Title & Description -->
				<div class="mb-4">
					<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{video.title}</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">{video.description}</p>
				</div>

				<!-- Tags -->
				<div class="mb-4 flex flex-wrap gap-2">
					{#each video.tags as tag}
						<Badge>#{tag}</Badge>
					{/each}
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-4 border-t border-gray-100 py-3 dark:border-gray-800">
					<button
						class="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-rose-500 dark:text-gray-400"
					>
						<Heart class="h-5 w-5" />
						<span class="text-sm">{formatNumber(video.likes)}</span>
					</button>
					<button
						class="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-rose-500 dark:text-gray-400"
					>
						<MessageCircle class="h-5 w-5" />
						<span class="text-sm">{formatNumber(video.comments)}</span>
					</button>
					<button
						class="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-rose-500 dark:text-gray-400"
					>
						<Share2 class="h-5 w-5" />
						<span class="text-sm">{formatNumber(video.shares)}</span>
					</button>
					<button
						class="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-rose-500 dark:text-gray-400"
					>
						<Bookmark class="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
