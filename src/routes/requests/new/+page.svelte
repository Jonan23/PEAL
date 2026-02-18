<script lang="ts">
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import { ArrowLeft, Upload, DollarSign, Calendar, FileText, Image, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import { requestsApi } from '$lib/api';
	import { uploadFile, validateImageFile, formatFileSize } from '$lib/api/upload';

	let title = $state('');
	let description = $state('');
	let goalAmount = $state('');
	let category = $state('education');
	let deadline = $state('');
	let isSubmitting = $state(false);
	let error = $state('');

	let coverFile = $state<File | null>(null);
	let coverPreview = $state<string | null>(null);

	const categories = [
		{ value: 'education', label: $t.categories.education },
		{ value: 'business', label: $t.categories.business },
		{ value: 'healthcare', label: $t.categories.healthcare },
		{ value: 'technology', label: $t.categories.technology },
		{ value: 'arts', label: $t.categories.arts },
		{ value: 'entrepreneurship', label: $t.categories.entrepreneurship }
	];

	function handleCoverSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const validation = validateImageFile(file);
		if (!validation.valid) {
			error = validation.error || 'Invalid image file';
			return;
		}

		coverFile = file;
		coverPreview = URL.createObjectURL(file);
		error = '';
	}

	function clearCover() {
		coverFile = null;
		coverPreview = null;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!title.trim()) {
			error = 'Please enter a title';
			return;
		}

		if (!description.trim()) {
			error = 'Please enter a description';
			return;
		}

		if (!goalAmount || parseFloat(goalAmount) < 100) {
			error = 'Please enter a valid funding goal (minimum $100)';
			return;
		}

		if (!deadline) {
			error = 'Please select a deadline';
			return;
		}

		isSubmitting = true;

		try {
			let coverImageUrl: string | undefined;
			if (coverFile) {
				const result = await uploadFile(coverFile, 'image');
				coverImageUrl = result.url;
			}

			await requestsApi.create({
				title: title.trim(),
				description: description.trim(),
				goalAmount: parseFloat(goalAmount),
				deadline: new Date(deadline).toISOString(),
				category,
				coverImageUrl
			});

			goto('/requests');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to create request';
			error = message;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Create Request - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto max-w-2xl px-4 py-6 lg:p-8">
			<!-- Header -->
			<div class="mb-6 flex items-center gap-4">
				<button
					onclick={() => goto('/requests')}
					class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<ArrowLeft class="h-5 w-5 text-gray-600 dark:text-gray-400" />
				</button>
				<div>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
						{$t.requests.new.title}
					</h1>
					<p class="text-gray-600 dark:text-gray-400">{$t.requests.new.subtitle}</p>
				</div>
			</div>

			<form onsubmit={handleSubmit}>
				<Card class="p-6">
					{#if error}
						<div class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
							{error}
						</div>
					{/if}

					<div class="space-y-6">
						<!-- Cover Image -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.requests.new.coverImage}
							</label>

							{#if coverPreview}
								<div class="relative inline-block">
									<img src={coverPreview} alt="Cover" class="h-40 rounded-xl object-cover" />
									<button
										type="button"
										onclick={clearCover}
										class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
									>
										<X class="h-4 w-4" />
									</button>
									{#if coverFile}
										<p class="mt-1 text-xs text-gray-500">{formatFileSize(coverFile.size)}</p>
									{/if}
								</div>
							{:else}
								<label
									class="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-rose-500 dark:border-gray-700"
								>
									<Image class="mb-2 h-8 w-8 text-gray-400" />
									<p class="text-sm text-gray-500">{$t.requests.new.clickToUploadCover}</p>
									<p class="text-xs text-gray-400">{$t.requests.new.jpgPngMax5mb}</p>
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										class="hidden"
										onchange={handleCoverSelect}
										disabled={isSubmitting}
									/>
								</label>
							{/if}
						</div>

						<!-- Title -->
						<Input
							label={$t.requests.new.requestTitle}
							placeholder={$t.requests.new.requestTitlePlaceholder}
							bind:value={title}
							required
							disabled={isSubmitting}
						/>

						<!-- Description -->
						<Textarea
							label={$t.requests.new.description}
							placeholder={$t.requests.new.descriptionPlaceholder}
							bind:value={description}
							rows={5}
							required
							disabled={isSubmitting}
						/>

						<!-- Category -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.requests.new.category}
							</label>
							<select
								bind:value={category}
								class="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus:border-transparent focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
								disabled={isSubmitting}
							>
								{#each categories as cat}
									<option value={cat.value}>{cat.label}</option>
								{/each}
							</select>
						</div>

						<!-- Goal Amount -->
						<div>
							<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
								{$t.requests.new.fundingGoal}
							</label>
							<div class="relative">
								<DollarSign
									class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
								/>
								<input
									type="number"
									bind:value={goalAmount}
									placeholder={$t.requests.new.fundingGoalPlaceholder}
									min="100"
									step="100"
									required
									disabled={isSubmitting}
									class="flex h-10 w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm transition-colors placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
								/>
							</div>
						</div>

						<!-- Deadline -->
						<Input 
							type="date" 
							label={$t.requests.new.campaignEndDate} 
							bind:value={deadline} 
							required 
							disabled={isSubmitting}
							min={new Date().toISOString().split('T')[0]}
						/>
					</div>

					<!-- Submit -->
					<div class="mt-8 flex gap-3">
						<Button variant="secondary" type="button" onclick={() => goto('/requests')} class="flex-1" disabled={isSubmitting}>
							{$t.common.cancel}
						</Button>
						<Button type="submit" loading={isSubmitting} class="flex-1">
							{isSubmitting ? $t.requests.new.creating : $t.common.create}
						</Button>
					</div>
				</Card>
			</form>
		</div>
	</main>
</div>
