<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Search, Send, MoreVertical, Phone, Video } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { messagesApi } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import type { Conversation, Message, User } from '$lib/api/types';

	let conversations = $state<Conversation[]>([]);
	let selectedConversation = $state<Conversation | null>(null);
	let messages = $state<Message[]>([]);
	let currentUser = $state<User | null>(null);
	let loading = $state(true);
	let messageInput = $state('');
	let searchQuery = $state('');

	onMount(async () => {
		await authStore.initialize();
		currentUser = $authStore.user;

		try {
			const response = await messagesApi.getConversations();
			conversations = response.conversations;

			if (conversations.length > 0) {
				await selectConversation(conversations[0].id);
			}
		} catch (error) {
			console.error('Failed to load conversations:', error);
		} finally {
			loading = false;
		}
	});

	async function selectConversation(conversationId: string) {
		try {
			const response = await messagesApi.getConversation(conversationId);
			selectedConversation = response.conversation;
			messages = response.messages;
		} catch (error) {
			console.error('Failed to load conversation:', error);
		}
	}

	async function sendMessage() {
		if (messageInput.trim() && selectedConversation) {
			try {
				const response = await messagesApi.sendMessage(selectedConversation.id, messageInput);
				messages = [...messages, response.message];
				messageInput = '';
			} catch (error) {
				console.error('Failed to send message:', error);
			}
		}
	}

	function getOtherParticipant(conversation: Conversation): User | undefined {
		return conversation.participants?.find(p => p.user)?.user;
	}

	const filteredConversations = $derived(
		conversations.filter((conv) => {
			const otherUser = getOtherParticipant(conv);
			return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
		})
	);

	function formatTime(date: string): string {
		const d = new Date(date);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		if (hours < 1) return 'now';
		if (hours < 24) return `${hours}h`;
		return d.toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Messages - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto h-[calc(100vh-7rem)] px-4 lg:p-4">
			<Card class="flex h-full overflow-hidden">
				<!-- Chat List -->
				<div class="w-full border-r border-gray-200 dark:border-gray-700 md:w-80">
					<!-- Header -->
					<div class="border-b border-gray-200 p-4 dark:border-gray-700">
						<h1 class="mb-3 text-xl font-bold text-gray-900 dark:text-white">{$t.messages.title}</h1>
						<div class="relative">
							<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								bind:value={searchQuery}
								placeholder={$t.messages.searchConversations}
								class="w-full h-10 rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
							/>
						</div>
					</div>

					<!-- Chat List -->
					<div class="h-[calc(100%-80px)] overflow-y-auto">
						{#if loading}
							<div class="flex items-center justify-center py-10">
								<div class="h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
							</div>
						{:else if filteredConversations.length === 0}
							<div class="py-10 text-center text-gray-500 dark:text-gray-400">
								<p>{$t.messages.noMessagesYet}</p>
							</div>
						{:else}
							{#each filteredConversations as conversation (conversation.id)}
								{@const otherUser = getOtherParticipant(conversation)}
								<button
									onclick={() => selectConversation(conversation.id)}
									class="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 {selectedConversation?.id === conversation.id ? 'bg-rose-50 dark:bg-rose-900/20' : ''}"
								>
									<Avatar src={otherUser?.avatarUrl} alt={otherUser?.name || 'User'} size="lg" />
									<div class="flex-1 overflow-hidden">
										<div class="flex items-center justify-between">
											<p class="font-medium text-gray-900 dark:text-white truncate">{otherUser?.name || 'Unknown'}</p>
											<span class="text-xs text-gray-500">{formatTime(conversation.createdAt)}</span>
										</div>
										<p class="truncate text-sm text-gray-500">{$t.messages.startConversation}</p>
									</div>
								</button>
							{/each}
						{/if}
					</div>
				</div>

				<!-- Chat Area - Hidden on mobile -->
				<div class="hidden flex-1 flex-col md:flex">
					{#if selectedConversation}
						{@const otherUser = getOtherParticipant(selectedConversation)}
						<!-- Chat Header -->
						<div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
							<div class="flex items-center gap-3">
								<Avatar src={otherUser?.avatarUrl} alt={otherUser?.name || 'User'} size="lg" />
								<div>
									<p class="font-medium text-gray-900 dark:text-white">{otherUser?.name || 'Unknown'}</p>
									<p class="text-sm text-gray-500">{$t.messages.online}</p>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<button
									class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<Phone class="h-5 w-5 text-gray-600 dark:text-gray-400" />
								</button>
								<button
									class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<Video class="h-5 w-5 text-gray-600 dark:text-gray-400" />
								</button>
								<button
									class="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<MoreVertical class="h-5 w-5 text-gray-600 dark:text-gray-400" />
								</button>
							</div>
						</div>

						<!-- Messages -->
						<div class="flex-1 overflow-y-auto p-4">
							<div class="space-y-4">
								{#each messages as message (message.id)}
									<div class="flex {message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}">
										<div
											class="max-w-[70%] rounded-2xl px-4 py-2 {message.senderId === currentUser?.id
												? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
												: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}"
										>
											<p class="text-sm">{message.content}</p>
											<p class="mt-1 text-xs {message.senderId === currentUser?.id ? 'text-white/70' : 'text-gray-500'}">
												{formatTime(message.createdAt)}
											</p>
										</div>
									</div>
								{/each}
								{#if messages.length === 0}
									<div class="py-10 text-center text-gray-500 dark:text-gray-400">
										<p>{$t.messages.startConversation}</p>
									</div>
								{/if}
							</div>
						</div>

						<!-- Message Input -->
						<div class="border-t border-gray-200 p-4 dark:border-gray-700">
							<form onsubmit={(e) => { e.preventDefault(); sendMessage(); }} class="flex items-center gap-2">
								<input
									type="text"
									bind:value={messageInput}
									placeholder={$t.messages.typeMessage}
									class="flex-1 h-10 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
								/>
								<Button type="submit">
									<Send class="h-4 w-4" />
								</Button>
							</form>
						</div>
					{:else}
						<div class="flex flex-1 items-center justify-center text-gray-500 dark:text-gray-400">
							<p>{$t.messages.startConversation}</p>
						</div>
					{/if}
				</div>
			</Card>
		</div>
	</main>
</div>
