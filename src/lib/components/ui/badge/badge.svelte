<script lang="ts">
	import { badgeVariants, type Variant } from "./index.js";
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		variant = "default",
		children,
		...rest
	}: {
		class?: string;
		variant?: Variant;
		children?: import("svelte").Snippet;
	} & import("svelte/elements").HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn(badgeVariants({ variant, className }))} {...rest}>
	{@render children?.()}
</div>
