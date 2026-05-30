<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";

	let {
		children,
		open = $bindable(false),
		...rest
	}: any = $props();
</script>

<DialogPrimitive.Root bind:open {...rest}>
	{@render children?.()}
</DialogPrimitive.Root>
