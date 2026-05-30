<script lang="ts">
	import { Separator as SeparatorPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		orientation = "horizontal",
		decorative = true,
		...rest
	}: {
		class?: string;
		orientation?: "horizontal" | "vertical";
		decorative?: boolean;
	} & any = $props();
</script>

<SeparatorPrimitive.Root
	{decorative}
	{orientation}
	class={cn(
		"shrink-0 bg-border",
		orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
		className
	)}
	{...rest}
/>
