<script lang="ts">
	import { onMount } from 'svelte';
	let { children } = $props();
	import "../app.css";

	let theme = $state("light");

	onMount(() => {
		theme = localStorage.getItem('theme') || 'night';
		document.documentElement.setAttribute('data-theme', theme);
	});

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme);
		}
	});

	// Listen for theme changes from children
	onMount(() => {
		const handleThemeChange = (e: any) => {
			theme = e.detail.theme;
		};
		window.addEventListener('theme-change', handleThemeChange);
		return () => window.removeEventListener('theme-change', handleThemeChange);
	});
</script>

{@render children()}
