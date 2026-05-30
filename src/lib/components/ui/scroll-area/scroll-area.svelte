<script lang="ts">
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		children,
		orientation = "vertical",
		...rest
	}: {
		class?: string;
		children?: import("svelte").Snippet;
		orientation?: "vertical" | "horizontal" | "both";
	} & any = $props();
</script>

<ScrollAreaPrimitive.Root class={cn("relative overflow-hidden", className)} {orientation} {...rest}>
	<ScrollAreaPrimitive.Viewport class="h-full w-full rounded-[inherit]">
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	<ScrollAreaPrimitive.Scrollbar
		orientation="vertical"
		class="flex touch-none select-none transition-colors w-2.5 border-l border-l-transparent p-[1px]"
	>
		<ScrollAreaPrimitive.Thumb
			class="relative flex-1 rounded-full bg-border"
		/>
	</ScrollAreaPrimitive.Scrollbar>
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>
