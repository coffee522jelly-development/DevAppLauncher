<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";

	let {
		children,
		value = $bindable(),
		...rest
	}: any = $props();
</script>

<SelectPrimitive.Root bind:value {...rest}>
	{@render children?.()}
</SelectPrimitive.Root>
