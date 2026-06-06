<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		children,
		...rest
	}: {
		class?: string;
		children?: import("svelte").Snippet;
	} & import("svelte/elements").HTMLAttributes<HTMLHeadingElement> = $props();
</script>

<h3
	class={cn("font-semibold leading-none tracking-tight", className)}
	{...rest}
>
	{@render children?.()}
</h3>
