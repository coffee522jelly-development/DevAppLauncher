<script lang="ts">
	import { Label as LabelPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		children,
		...rest
	}: {
		class?: string;
		children?: import("svelte").Snippet;
	} & any = $props();
</script>

<LabelPrimitive.Root
	class={cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	)}
	{...rest}
>
	{@render children?.()}
</LabelPrimitive.Root>
