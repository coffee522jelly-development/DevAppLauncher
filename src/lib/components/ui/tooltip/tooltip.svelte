<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		class: className = undefined,
		delayDuration = 400,
		...rest
	}: any = $props();
</script>

<TooltipPrimitive.Root {delayDuration} {...rest} />
