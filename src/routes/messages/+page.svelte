<script lang="ts">
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Search, Send, MoreVertical, Phone, Video } from 'lucide-svelte';
	import { mockUsers } from '$lib/data/mock';
	import { t } from '$lib/i18n';

	const currentUser = mockUsers[0];
	const users = mockUsers.slice(0, 5);

	let selectedChat = $state(users[0]);
	let messageInput = $state('');
	let searchQuery = $state('');

	const filteredUsers = $derived(
		users.filter((user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	const mockMessages = [
		{ id: 1, sender: 'other', text: 'Hi! I saw your profile and I think I can help with your business.', time: '2h ago' },
		{ id: 2, sender: 'me', text: 'Thank you so much! I would love to hear more.', time: '1h ago' },
		{ id: 3, sender: 'other', text: 'Of course! Let me share some resources that helped me.', time: '45m ago' },
		{ id: 4, sender: 'me', text: 'That would be amazing! I appreciate your support.', time: '30m ago' }
	];

	function sendMessage() {
		if (messageInput.trim()) {
			messageInput = '';
		}
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
						{#each filteredUsers as user}
							<button
								onclick={() => (selectedChat = user)}
								class="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 {selectedChat.id === user.id ? 'bg-rose-50 dark:bg-rose-900/20' : ''}"
							>
								<Avatar src={user.avatar} alt={user.name} size="lg" />
								<div class="flex-1 overflow-hidden">
									<div class="flex items-center justify-between">
										<p class="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
										<span class="text-xs text-gray-500">2h</span>
									</div>
									<p class="truncate text-sm text-gray-500">Thank you so much!</p>
								</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Chat Area - Hidden on mobile -->
				<div class="hidden flex-1 flex-col md:flex">
					<!-- Chat Header -->
					<div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
						<div class="flex items-center gap-3">
							<Avatar src={selectedChat.avatar} alt={selectedChat.name} size="lg" />
							<div>
								<p class="font-medium text-gray-900 dark:text-white">{selectedChat.name}</p>
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
							{#each mockMessages as message}
								<div class="flex {message.sender === 'me' ? 'justify-end' : 'justify-start'}">
									<div
										class="max-w-[70%] rounded-2xl px-4 py-2 {message.sender === 'me'
											? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
											: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}"
									>
										<p class="text-sm">{message.text}</p>
										<p class="mt-1 text-xs {message.sender === 'me' ? 'text-white/70' : 'text-gray-500'}">
											{message.time}
										</p>
									</div>
								</div>
							{/each}
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
				</div>
			</Card>
		</div>
	</main>
</div>
