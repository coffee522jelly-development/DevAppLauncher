<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		value = $bindable(),
		children,
		...rest
	}: {
		class?: string;
		value?: string;
		children?: import("svelte").Snippet;
	} & any = $props();
</script>

<TabsPrimitive.Root bind:value class={cn("relative flex flex-col", className)} {...rest}>
	{@render children?.()}
</TabsPrimitive.Root>
