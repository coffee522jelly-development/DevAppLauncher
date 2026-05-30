<script lang="ts">
	import { Button as ButtonPrimitive } from "bits-ui";
	import { buttonVariants, type Variant, type Size } from "./index.js";
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		variant = "default",
		size = "default",
		builders = [],
		children,
		...rest
	}: {
		class?: string;
		variant?: Variant;
		size?: Size;
		builders?: any[];
		children?: import("svelte").Snippet;
	} & any = $props();
</script>

<ButtonPrimitive.Root
	class={cn(buttonVariants({ variant, size, className }))}
	{builders}
	{...rest}
>
	{@render children?.()}
</ButtonPrimitive.Root>
