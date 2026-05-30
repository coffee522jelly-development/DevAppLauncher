<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		...rest
	}: {
		class?: string;
	} & any = $props();
</script>

<DialogPrimitive.Title
	class={cn(
		"text-lg font-semibold leading-none tracking-tight",
		className
	)}
	{...rest}
/>
