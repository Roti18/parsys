<script lang="ts">
	import Input from './Input.svelte';

	let { type = 'search', value = $bindable(''), placeholder = 'Cari...' } = $props();
</script>

<Input {type} bind:value {placeholder} />

