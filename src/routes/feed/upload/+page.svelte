<script lang="ts">
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import { ArrowLeft, Upload, Video, Image, Hash, Play, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import { videosApi } from '$lib/api';
	import { uploadFile, validateVideoFile, validateImageFile, formatFileSize } from '$lib/api/upload';

	let title = $state('');
	let description = $state('');
	let category = $state('motivation');
	let hashtags = $state<string[]>([]);
	let newHashtag = $state('');
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let error = $state('');

	let videoFile = $state<File | null>(null);
	let thumbnailFile = $state<File | null>(null);
	let videoPreview = $state<string | null>(null);
	let thumbnailPreview = $state<string | null>(null);

	const categories = [
		{ value: 'motivation', label: $t.categories.motivation },
		{ value: 'entrepreneurship', label: $t.categories.entrepreneurship },
		{ value: 'mentorship', label: $t.categories.mentorship },
		{ value: 'education', label: $t.categories.education },
		{ value: 'marketing', label: $t.categories.marketing },
		{ value: 'technology', label: $t.categories.technology }
	];

	function addHashtag() {
		const cleanTag = newHashtag.replace(/#/g, '').trim();
		if (cleanTag && !hashtags.includes(cleanTag) && hashtags.length < 5) {
			hashtags = [...hashtags, cleanTag];
			newHashtag = '';
		}
	}

	function removeHashtag(tag: string) {
		hashtags = hashtags.filter((h) => h !== tag);
	}

	function handleVideoSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const validation = validateVideoFile(file);
		if (!validation.valid) {
			error = validation.error || 'Invalid video file';
			return;
		}

		videoFile = file;
		videoPreview = URL.createObjectURL(file);
		error = '';
	}

	function handleThumbnailSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const validation = validateImageFile(file);
		if (!validation.valid) {
			error = validation.error || 'Invalid image file';
			return;
		}

		thumbnailFile = file;
		thumbnailPreview = URL.createObjectURL(file);
		error = '';
	}

	function clearVideo() {
		videoFile = null;
		videoPreview = null;
	}

	function clearThumbnail() {
		thumbnailFile = null;
		thumbnailPreview = null;
	}

	async function handleUpload(e: Event) {
		e.preventDefault();
		error = '';

		if (!videoFile) {
			error = 'Please select a video to upload';
			return;
		}

		if (!title.trim()) {
			error = 'Please enter a title';
			return;
		}

		isUploading = true;
		uploadProgress = 0;

		try {
			uploadProgress = 10;
			const videoResult = await uploadFile(videoFile, 'video', (progress) => {
				uploadProgress = 10 + (progress * 0.6);
			});

			uploadProgress = 70;

			let thumbnailUrl: string | undefined;
			if (thumbnailFile) {
				const thumbResult = await uploadFile(thumbnailFile, 'image');
				thumbnailUrl = thumbResult.url;
			}

			uploadProgress = 85;

			await videosApi.create({
				title: title.trim(),
				description: description.trim() || undefined,
				videoUrl: videoResult.url,
				thumbnailUrl,
				category,
				tags: hashtags
			});

			uploadProgress = 100;
			goto('/feed');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Upload failed';
			error = message;
		} finally {
			isUploading = false;
		}
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
					{#if error}
						<div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
							{error}
						</div>
					{/if}

					<div class="space-y-6">
						<!-- Video Upload -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.feedUpload.video}
							</label>

							{#if videoPreview}
								<div class="relative rounded-xl overflow-hidden bg-gray-900">
									<video src={videoPreview} class="w-full max-h-64 object-contain" controls></video>
									<button
										type="button"
										onclick={clearVideo}
										class="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
									>
										<X class="h-4 w-4" />
									</button>
									{#if videoFile}
										<p class="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
											{formatFileSize(videoFile.size)}
										</p>
									{/if}
								</div>
							{:else}
								<label
									class="relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-rose-500 dark:border-gray-700 dark:bg-gray-800"
								>
									{#if isUploading}
										<div class="flex flex-col items-center">
											<div class="mb-3 h-12 w-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
											<p class="text-sm font-medium text-gray-900 dark:text-white">{Math.round(uploadProgress)}%</p>
										</div>
									{:else}
										<Video class="mb-3 h-12 w-12 text-gray-400" />
										<p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
											{$t.feedUpload.clickToUploadVideo}
										</p>
										<p class="text-xs text-gray-500">{$t.feedUpload.mp4MovMax500mb}</p>
									{/if}
									<input
										type="file"
										accept="video/mp4,video/webm,video/quicktime"
										class="hidden"
										onchange={handleVideoSelect}
										disabled={isUploading}
									/>
								</label>
							{/if}
						</div>

						<!-- Thumbnail -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.feedUpload.thumbnail}
							</label>

							{#if thumbnailPreview}
								<div class="relative inline-block">
									<img src={thumbnailPreview} alt="Thumbnail" class="h-32 rounded-xl object-cover" />
									<button
										type="button"
										onclick={clearThumbnail}
										class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
									>
										<X class="h-4 w-4" />
									</button>
								</div>
							{:else}
								<label
									class="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-rose-500 dark:border-gray-700"
								>
									<Image class="mb-2 h-8 w-8 text-gray-400" />
									<p class="text-sm text-gray-500">{$t.feedUpload.clickToUploadThumbnail}</p>
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										class="hidden"
										onchange={handleThumbnailSelect}
										disabled={isUploading}
									/>
								</label>
							{/if}
						</div>

						<!-- Title -->
						<Input
							label={$t.feedUpload.videoTitle}
							placeholder={$t.feedUpload.videoTitlePlaceholder}
							bind:value={title}
							required
							disabled={isUploading}
						/>

						<!-- Description -->
						<Textarea
							label={$t.feedUpload.description}
							placeholder={$t.feedUpload.descriptionPlaceholder}
							bind:value={description}
							rows={4}
							disabled={isUploading}
						/>

						<!-- Category -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.feedUpload.category}
							</label>
							<select
								bind:value={category}
								class="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:border-transparent focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
								disabled={isUploading}
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
										<button type="button" onclick={() => removeHashtag(tag)} class="ml-1 hover:text-rose-900">
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
										disabled={isUploading}
									/>
									<Button variant="secondary" size="sm" onclick={addHashtag} disabled={!newHashtag || isUploading}>
										<Hash class="h-4 w-4" />
									</Button>
								</div>
							{/if}
						</div>
					</div>

					<!-- Submit -->
					<div class="mt-8 flex gap-3">
						<Button variant="secondary" type="button" onclick={() => goto('/feed')} class="flex-1" disabled={isUploading}>
							{$t.common.cancel}
						</Button>
						<Button type="submit" loading={isUploading} class="flex-1">
							{isUploading ? `${Math.round(uploadProgress)}%` : $t.feedUpload.publish}
						</Button>
					</div>
				</Card>
			</form>
		</div>
	</main>
</div>
