<template>
<div class="ymxyweixqwsxauxldgpvecjepnwxbylu" :class="{ warn }">
	<i v-if="warn"><i class="fas fa-exclamation-triangle"></i></i>
	<i v-else><i class="fas fa-info-circle"></i></i>
	<slot></slot>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
	props: {
		warn: {
			type: Boolean,
			required: false,
			default: false
		},
	},
});
</script>

<style lang="stylus" scoped>
.ymxyweixqwsxauxldgpvecjepnwxbylu
	margin 16px 0
	padding 16px
	font-size 90%
	background var(--infoBg)
	color var(--infoFg)

	&.warn
		background var(--infoWarnBg)
		color var(--infoWarnFg)

	&:first-child
		margin-top 0

	&:last-child
		margin-bottom 0

	> i
		margin-right 4px

</style>
