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

<div
	class={cn(
		"flex flex-col space-y-1.5 text-center sm:text-left",
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
