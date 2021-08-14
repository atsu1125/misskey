<template>
<div class="tsuchiya" :data-children-count="children">
	<slot></slot>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
	provide: {
		concat: true
	},
	data() {
		return {
			children: 0
		};
	},
	mounted() {
		this.$nextTick(() => {
			this.children = this.$slots.default.length;
		});
	}
});
</script>

<style lang="stylus" scoped>
.tsuchiya
	border-radius 6px
	display flex
	gap 1px
	min-width 100px
	overflow hidden

	.dmtdnykelhudezerjlfpbhgovrgnqqgr
		border-radius 0
</style>
