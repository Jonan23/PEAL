<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 {className}"></div>
