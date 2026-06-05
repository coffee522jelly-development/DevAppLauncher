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
		onclick,
		disabled = false,
		...rest
	}: {
		class?: string;
		variant?: Variant;
		size?: Size;
		builders?: any[];
		children?: import("svelte").Snippet;
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
	} & any = $props();
</script>

<ButtonPrimitive.Root
	class={cn(buttonVariants({ variant, size, className }))}
	{builders}
	{onclick}
	{disabled}
	{...rest}
>
	{@render children?.()}
</ButtonPrimitive.Root>
