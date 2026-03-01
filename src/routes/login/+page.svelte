<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ArrowRight } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { t } from '$lib/i18n';
	import { renderGoogleButton } from '$lib/auth/google';
	import { authStore } from '$lib/stores/auth';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');
	let googleContainer: HTMLDivElement;

	onMount(async () => {
		if (!googleContainer) return;

		try {
			await renderGoogleButton(googleContainer, async (idToken) => {
				loading = true;
				error = '';

				const result = await authStore.googleAuth(idToken);
				if (result.success) {
					goto('/dashboard');
				} else {
					error = result.error || 'Google sign-in failed';
				}

				loading = false;
			});
		} catch {
			// Google auth not configured for this environment.
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		const result = await authStore.login(email, password);
		
		if (result.success) {
			goto('/dashboard');
		} else {
			error = result.error || 'Login failed';
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>Login - PEAL</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
>
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<div
				class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500"
			>
				<span class="text-2xl font-bold text-white">P</span>
			</div>
			<h1
				class="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent"
			>
				{$t.auth.welcomeBack}
			</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">{$t.auth.signInToContinue}</p>
		</div>

		<!-- Form Card -->
		<div class="card p-6">
			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<div class="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
						{error}
					</div>
				{/if}
				
				<Input
					type="email"
					label={$t.auth.email}
					placeholder="you@example.com"
					bind:value={email}
					required
				/>

				<Input
					type="password"
					label={$t.auth.password}
					placeholder="Enter your password"
					bind:value={password}
					required
				/>

				<div class="flex items-center justify-between">
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							class="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
						/>
						<span class="text-gray-600 dark:text-gray-400">{$t.auth.rememberMe}</span>
					</label>
					<a href="/forgot-password" class="text-sm text-rose-500 hover:text-rose-600"
						>{$t.auth.forgotPassword}</a
					>
				</div>

				<Button type="submit" class="w-full" size="lg" {loading}>
					{#if loading}
						{$t.auth.signingIn}
					{:else}
						{$t.auth.signIn}
						<ArrowRight class="ml-2 h-4 w-4" />
					{/if}
				</Button>
			</form>

			<!-- Divider -->
			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-4 text-gray-500 dark:bg-gray-900">{$t.auth.continueWith}</span>
				</div>
			</div>

			<!-- Social Login -->
			<div class="flex justify-center" bind:this={googleContainer}></div>
		</div>

		<!-- Sign Up Link -->
		<p class="mt-6 text-center text-gray-600 dark:text-gray-400">
			{$t.auth.noAccount}
			<a href="/register" class="font-medium text-rose-500 hover:text-rose-600">{$t.auth.signUp}</a>
		</p>
	</div>
</div>
