<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveNavigation from '$lib/components/adaptive-navigation.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Progress from '$lib/components/ui/progress.svelte';
	import { Plus, Target, Calendar, Check, X, ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import { goalsApi } from '$lib/api/endpoints';
	import type { Goal, GoalMilestone } from '$lib/api/types';

	let goals = $state<Goal[]>([]);
	let loading = $state(true);
	let showAddForm = $state(false);
	let expandedGoal = $state<string | null>(null);

	let newGoal = $state({
		title: '',
		description: '',
		category: 'business',
		targetDate: '',
		priority: 'medium'
	});

	let newMilestone = $state({
		goalId: '',
		title: ''
	});

	const categories = [
		{ value: 'business', label: 'Business' },
		{ value: 'education', label: 'Education' },
		{ value: 'career', label: 'Career' },
		{ value: 'personal', label: 'Personal' },
		{ value: 'health', label: 'Health & Wellness' },
		{ value: 'finance', label: 'Finance' }
	];

	const priorities = [
		{ value: 'low', label: 'Low', color: 'text-gray-500' },
		{ value: 'medium', label: 'Medium', color: 'text-yellow-500' },
		{ value: 'high', label: 'High', color: 'text-red-500' }
	];

	onMount(async () => {
		await loadGoals();
	});

	async function loadGoals() {
		loading = true;
		try {
			const response = await goalsApi.getAll();
			goals = response.goals;
		} catch (error) {
			console.error('Failed to load goals:', error);
		} finally {
			loading = false;
		}
	}

	async function handleAddGoal(e: Event) {
		e.preventDefault();
		try {
			await goalsApi.create({
				...newGoal,
				targetDate: new Date(newGoal.targetDate).toISOString()
			});
			showAddForm = false;
			newGoal = { title: '', description: '', category: 'business', targetDate: '', priority: 'medium' };
			await loadGoals();
		} catch (error) {
			console.error('Failed to create goal:', error);
		}
	}

	async function handleAddMilestone(goalId: string) {
		if (!newMilestone.title.trim()) return;
		
		try {
			await goalsApi.addMilestone(goalId, { title: newMilestone.title });
			newMilestone = { goalId: '', title: '' };
			await loadGoals();
		} catch (error) {
			console.error('Failed to add milestone:', error);
		}
	}

	async function toggleMilestone(goalId: string, milestone: GoalMilestone) {
		try {
			await goalsApi.updateMilestone(goalId, milestone.id, { completed: !milestone.completed });
			await loadGoals();
		} catch (error) {
			console.error('Failed to update milestone:', error);
		}
	}

	async function deleteGoal(id: string) {
		if (!confirm('Are you sure you want to delete this goal?')) return;
		try {
			await goalsApi.delete(id);
			await loadGoals();
		} catch (error) {
			console.error('Failed to delete goal:', error);
		}
	}

	function formatDate(date: string): string {
		return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getDaysRemaining(targetDate: string): number {
		const diff = new Date(targetDate).getTime() - Date.now();
		return Math.ceil(diff / (1000 * 60 * 60 * 24));
	}

	function toggleExpand(goalId: string) {
		expandedGoal = expandedGoal === goalId ? null : goalId;
	}
</script>

<svelte:head>
	<title>Goals - PEAL</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<AdaptiveNavigation />

	<main class="pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
		<div class="container mx-auto px-4 py-6 lg:p-8">
			<!-- Header -->
			<div class="mb-6 flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">Goals</h1>
					<p class="text-gray-600 dark:text-gray-400">Track your dreams and milestones</p>
				</div>
				<Button onclick={() => (showAddForm = !showAddForm)}>
					<Plus class="mr-2 h-4 w-4" />
					Add Goal
				</Button>
			</div>

			<!-- Add Goal Form -->
			{#if showAddForm}
				<Card class="mb-6 p-6">
					<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">New Goal</h2>
					<form onsubmit={handleAddGoal} class="space-y-4">
						<Input
							label="Title"
							placeholder="What do you want to achieve?"
							bind:value={newGoal.title}
							required
						/>
						<Textarea
							label="Description"
							placeholder="Describe your goal..."
							bind:value={newGoal.description}
							rows={2}
						/>
						<div class="grid gap-4 md:grid-cols-3">
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
								<select
									bind:value={newGoal.category}
									class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
								>
									{#each categories as cat}
										<option value={cat.value}>{cat.label}</option>
									{/each}
								</select>
							</div>
							<Input type="date" label="Target Date" bind:value={newGoal.targetDate} required />
							<div>
								<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
								<select
									bind:value={newGoal.priority}
									class="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
								>
									{#each priorities as pri}
										<option value={pri.value}>{pri.label}</option>
									{/each}
								</select>
							</div>
						</div>
						<div class="flex gap-3">
							<Button type="button" variant="secondary" onclick={() => (showAddForm = false)}>Cancel</Button>
							<Button type="submit">Create Goal</Button>
						</div>
					</form>
				</Card>
			{/if}

			<!-- Goals List -->
			{#if loading}
				<div class="flex items-center justify-center py-20">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
				</div>
			{:else if goals.length === 0}
				<Card class="p-8 text-center">
					<Target class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">No goals yet</h3>
					<p class="mb-4 text-gray-500 dark:text-gray-400">Start by adding your first goal</p>
					<Button onclick={() => (showAddForm = true)}>
						<Plus class="mr-2 h-4 w-4" />
						Add Goal
					</Button>
				</Card>
			{:else}
				<div class="space-y-4">
					{#each goals as goal (goal.id)}
						<Card class="overflow-hidden">
							<div class="p-5">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="mb-2 flex items-center gap-2">
											<h3 class="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
											<Badge variant={goal.status === 'completed' ? 'default' : goal.status === 'on_hold' ? 'secondary' : 'secondary'}>
												{goal.status.replace('_', ' ')}
											</Badge>
											<span class="text-sm {priorities.find(p => p.value === goal.priority)?.color}">
												{priorities.find(p => p.value === goal.priority)?.label}
											</span>
										</div>
										{#if goal.description}
											<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
										{/if}

										<div class="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
											<span class="flex items-center gap-1">
												<Calendar class="h-4 w-4" />
												{formatDate(goal.targetDate)}
												{#if goal.status !== 'completed'}
													({#if getDaysRemaining(goal.targetDate) < 0}
														<span class="text-red-500">Overdue</span>
													{:else}
														{getDaysRemaining(goal.targetDate)} days left
													{/if})
												{/if}
											</span>
											<Badge variant="secondary">{categories.find(c => c.value === goal.category)?.label}</Badge>
										</div>

										<Progress value={goal.progress} max={100} />
										<p class="mt-1 text-right text-xs text-gray-500">{goal.progress}% complete</p>
									</div>
									<div class="ml-4 flex gap-2">
										<Button variant="ghost" size="sm" onclick={() => deleteGoal(goal.id)}>
											<Trash2 class="h-4 w-4 text-gray-400" />
										</Button>
										<Button variant="ghost" size="sm" onclick={() => toggleExpand(goal.id)}>
											{#if expandedGoal === goal.id}
												<ChevronUp class="h-4 w-4" />
											{:else}
												<ChevronDown class="h-4 w-4" />
											{/if}
										</Button>
									</div>
								</div>

								{#if expandedGoal === goal.id}
									<div class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
										<h4 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">Milestones</h4>
										
										{#if goal.milestones && goal.milestones.length > 0}
											<div class="mb-4 space-y-2">
												{#each goal.milestones as milestone (milestone.id)}
													<div
														class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
													>
														<button
															type="button"
															onclick={() => toggleMilestone(goal.id, milestone)}
															class="flex h-5 w-5 items-center justify-center rounded-full border-2 {milestone.completed ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-gray-600'}"
														>
															{#if milestone.completed}
																<Check class="h-3 w-3 text-white" />
															{/if}
														</button>
														<span class={milestone.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}>
															{milestone.title}
														</span>
													</div>
												{/each}
											</div>
										{/if}

										<div class="flex gap-2">
											<input
												type="text"
												placeholder="Add a milestone..."
												class="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														newMilestone.goalId = goal.id;
														newMilestone.title = (e.target as HTMLInputElement).value;
														handleAddMilestone(goal.id);
														(e.target as HTMLInputElement).value = '';
													}
												}}
											/>
											<Button size="sm" variant="secondary" onclick={() => {
												const input = document.querySelector(`input[data-goal="${goal.id}"]`) as HTMLInputElement;
												if (input?.value) {
													newMilestone.goalId = goal.id;
													newMilestone.title = input.value;
													handleAddMilestone(goal.id);
													input.value = '';
												}
											}}>Add</Button>
										</div>
									</div>
								{/if}
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</div>
