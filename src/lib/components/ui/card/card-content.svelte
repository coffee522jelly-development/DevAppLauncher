<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		children,
		...rest
	}: {
		class?: string;
		children?: import("svelte").Snippet;
	} & import("svelte/elements").HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn("p-6 pt-0", className)} {...rest}>
	{@render children?.()}
</div>
