<script lang="ts">
	import { ArrowLeft, Mail } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import { t } from '$lib/i18n';

	let email = $state('');
	let loading = $state(false);
	let submitted = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			await new Promise((r) => setTimeout(r, 1500));
			submitted = true;
		} catch {
			error = 'Failed to send reset email. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password - PEAL</title>
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
				{$t.auth.forgotPassword}
			</h1>
		</div>

		<!-- Form Card -->
		<div class="card p-6">
			{#if submitted}
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
					>
						<Mail class="h-8 w-8 text-emerald-500" />
					</div>
					<h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Check your email</h2>
					<p class="mb-6 text-gray-600 dark:text-gray-400">
						We've sent password reset instructions to <strong>{email}</strong>
					</p>
					<a
						href="/login"
						class="inline-flex items-center gap-2 text-rose-500 hover:text-rose-600"
					>
						<ArrowLeft class="h-4 w-4" />
						Back to login
					</a>
				</div>
			{:else}
				<p class="mb-6 text-center text-gray-600 dark:text-gray-400">
					Enter your email address and we'll send you instructions to reset your password.
				</p>

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

					<Button type="submit" class="w-full" size="lg" {loading}>
						{#if loading}
							Sending...
						{:else}
							Send Reset Link
						{/if}
					</Button>
				</form>

				<p class="mt-6 text-center">
					<a
						href="/login"
						class="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600"
					>
						<ArrowLeft class="h-4 w-4" />
						Back to login
					</a>
				</p>
			{/if}
		</div>
	</div>
</div>
