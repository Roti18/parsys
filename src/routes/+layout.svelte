<script lang="ts">
	import './layout.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/stores';

	let { children, data } = $props();
	let sidebarOpen = $state(false);
	
	let isAuthRoute = $derived($page.url.pathname.startsWith('/login') || $page.url.pathname.startsWith('/register'));
</script>

{#if isAuthRoute}
	{@render children()}
{:else}
	<div class="min-h-screen bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-zinc-100 flex transition-colors duration-300">
		<Sidebar bind:isOpen={sidebarOpen} />
		<div class="flex-1 lg:ml-64 flex flex-col min-h-screen">
			<Header bind:sidebarOpen={sidebarOpen} user={data.user} />
			<main class="flex-1 p-4 sm:p-8">
				<div class="max-w-4xl mx-auto">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
{/if}
