<script lang="ts">
	import './layout.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import { page, navigating } from '$app/stores';

	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let { children, data } = $props();
	let sidebarOpen = $state(false);
	
	let isAuthRoute = $derived($page.url.pathname.startsWith('/login') || $page.url.pathname.startsWith('/register'));

	let progress = tweened(0, {
		duration: 300,
		easing: cubicOut
	});

	let visible = $state(false);
	let fadingOut = $state(false);

	$effect(() => {
		if ($navigating) {
			visible = true;
			fadingOut = false;
			progress.set(0, { duration: 0 });
			
			setTimeout(() => {
				if ($navigating) {
					progress.set(0.3, { duration: 500 });
					setTimeout(() => {
						if ($navigating) progress.set(0.85, { duration: 10000, easing: cubicOut });
					}, 500);
				}
			}, 10);
		} else {
			if (visible) {
				progress.set(1, { duration: 250 }).then(() => {
					fadingOut = true;
					setTimeout(() => {
						visible = false;
					}, 300);
				});
			}
		}
	});
</script>

{#if visible}
	<div class="fixed top-0 left-0 w-full h-[3px] z-[100] bg-transparent pointer-events-none">
		<div 
			class="h-full bg-blue-600 dark:bg-blue-500 transition-opacity duration-300 shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
			style="width: {$progress * 100}%; opacity: {fadingOut ? 0 : 1};"
		></div>
	</div>
{/if}

{#if isAuthRoute}
	{@render children()}
{:else}
	<div class="min-h-screen bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-zinc-100 flex transition-colors duration-300">
		<Sidebar bind:isOpen={sidebarOpen} />
		<div class="flex-1 min-w-0 lg:ml-64 flex flex-col min-h-screen">
			<Header bind:sidebarOpen={sidebarOpen} user={data.user} />
			<main class="flex-1 min-w-0 p-4 sm:p-8">
				<div class="max-w-4xl mx-auto">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
{/if}
