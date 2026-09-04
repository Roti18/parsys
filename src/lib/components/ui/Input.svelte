<script lang="ts">
	interface Props {
		id?: string;
		name?: string;
		type?: string;
		value?: any;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		min?: number | string;
		max?: number | string;
		step?: number | string;
		class?: string;
		[key: string]: any;
	}

	let {
		id = undefined,
		name = undefined,
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		required = false,
		disabled = false,
		min = undefined,
		max = undefined,
		step = undefined,
		class: className = '',
		...restProps
	}: Props = $props();
</script>

<input
	{id}
	{name}
	{type}
	bind:value
	{placeholder}
	{required}
	{disabled}
	{min}
	{max}
	{step}
	class="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#1c1c1e] px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-[#2c2c2e] focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 dark:hover:border-white/12 disabled:opacity-50 disabled:cursor-not-allowed {className}"
	{...restProps}
/>
