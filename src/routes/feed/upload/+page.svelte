<script lang="ts">
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import { ArrowLeft, Upload, Video, Image, Hash, Play } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';

	let title = $state('');
	let description = $state('');
	let category = $state('motivation');
	let hashtags = $state<string[]>([]);
	let newHashtag = $state('');
	let isUploading = $state(false);
	let uploadProgress = $state(0);

	const categories = [
		{ value: 'motivation', label: $t.categories.motivation },
		{ value: 'entrepreneurship', label: $t.categories.entrepreneurship },
		{ value: 'mentorship', label: $t.categories.mentorship },
		{ value: 'education', label: $t.categories.education },
		{ value: 'marketing', label: $t.categories.marketing },
		{ value: 'technology', label: $t.categories.technology }
	];

	function addHashtag() {
		if (newHashtag && !hashtags.includes(newHashtag) && hashtags.length < 5) {
			hashtags = [...hashtags, newHashtag];
			newHashtag = '';
		}
	}

	function removeHashtag(tag: string) {
		hashtags = hashtags.filter((h) => h !== tag);
	}

	async function handleUpload(e: Event) {
		e.preventDefault();
		isUploading = true;
		
		const interval = setInterval(() => {
			uploadProgress += 10;
			if (uploadProgress >= 100) {
				clearInterval(interval);
			}
		}, 200);

		await new Promise((r) => setTimeout(r, 2500));
		goto('/feed');
	}
</script>

<svelte:head>
	<title>Share Video - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto max-w-2xl px-4 py-6 lg:p-8">
			<!-- Header -->
			<div class="mb-6 flex items-center gap-4">
				<button
					onclick={() => goto('/feed')}
					class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<ArrowLeft class="h-5 w-5 text-gray-600 dark:text-gray-400" />
				</button>
				<div>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
						{$t.feedUpload.title}
					</h1>
					<p class="text-gray-600 dark:text-gray-400">{$t.feedUpload.subtitle}</p>
				</div>
			</div>

			<form onsubmit={handleUpload}>
				<Card class="p-6">
					<div class="space-y-6">
						<!-- Video Upload -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.feedUpload.video}
							</label>
							<div
								class="relative flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-rose-500 dark:border-gray-700 dark:bg-gray-800"
							>
								{#if isUploading}
									<div class="flex flex-col items-center">
										<div class="mb-3 h-12 w-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
										<p class="text-sm font-medium text-gray-900 dark:text-white">{uploadProgress}%</p>
									</div>
								{:else}
									<Video class="mb-3 h-12 w-12 text-gray-400" />
									<p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
										{$t.feedUpload.clickToUploadVideo}
									</p>
									<p class="text-xs text-gray-500">{$t.feedUpload.mp4MovMax500mb}</p>
								{/if}
							</div>
						</div>

						<!-- Thumbnail -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.feedUpload.thumbnail}
							</label>
							<div
								class="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-rose-500 dark:border-gray-700"
							>
								<Image class="mb-2 h-8 w-8 text-gray-400" />
								<p class="text-sm text-gray-500">{$t.feedUpload.clickToUploadThumbnail}</p>
							</div>
						</div>

						<!-- Title -->
						<Input
							label={$t.feedUpload.videoTitle}
							placeholder={$t.feedUpload.videoTitlePlaceholder}
							bind:value={title}
							required
						/>

						<!-- Description -->
						<Textarea
							label={$t.feedUpload.description}
							placeholder={$t.feedUpload.descriptionPlaceholder}
							bind:value={description}
							rows={4}
							required
						/>

						<!-- Category -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.feedUpload.category}
							</label>
							<select
								bind:value={category}
								class="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:border-transparent focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							>
								{#each categories as cat}
									<option value={cat.value}>{cat.label}</option>
								{/each}
							</select>
						</div>

						<!-- Hashtags -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.feedUpload.hashtags}
							</label>
							<div class="mb-3 flex flex-wrap gap-2">
								{#each hashtags as tag}
									<span
										class="flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
									>
										#{tag}
										<button onclick={() => removeHashtag(tag)} class="ml-1 hover:text-rose-900">
											×
										</button>
									</span>
								{/each}
							</div>
							{#if hashtags.length < 5}
								<div class="flex gap-2">
									<input
										type="text"
										bind:value={newHashtag}
										placeholder={$t.feedUpload.addHashtag}
										class="flex h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
										onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
									/>
									<Button variant="secondary" size="sm" onclick={addHashtag} disabled={!newHashtag}>
										<Hash class="h-4 w-4" />
									</Button>
								</div>
							{/if}
						</div>
					</div>

					<!-- Submit -->
					<div class="mt-8 flex gap-3">
						<Button variant="secondary" onclick={() => goto('/feed')} class="flex-1">
							{$t.common.cancel}
						</Button>
						<Button type="submit" loading={isUploading} class="flex-1">
							{isUploading ? $t.feedUpload.uploading : $t.feedUpload.publish}
						</Button>
					</div>
				</Card>
			</form>
		</div>
	</main>
</div>
