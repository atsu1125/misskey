<template>
<div class="tkfdzaxtkdeianobciwadajxzbddorql" :class="{ mini: narrow }" :title="title">
	<mk-avatar class="avatar" :user="note.user"/>
	<div class="main">
		<mk-note-header class="header" :note="note"/>
		<div class="body">
			<p v-if="note.cw != null" class="cw">
				<mfm v-if="note.cw != ''" class="text" :text="note.cw" :author="note.user" :i="$store.state.i" :custom-emojis="note.emojis" :hashtags="note.tags" :basic="!!note.notHaveDecorationMfm" />
				<mk-cw-button v-model="showContent" :note="note"/>
			</p>
			<div class="content" v-show="note.cw == null || showContent">
				<mk-sub-note-content class="text" :class="{ scroll : true }" :note="note"/>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: {
		note: {
			type: Object,
			required: true
		}
	},

	inject: {
		narrow: {
			default: false
		}
	},

	data() {
		return {
			showContent: false
		};
	},

	computed: {
		title(): string {
			return new Date(this.note.createdAt).toLocaleString();
		}
	}
});
</script>

<style lang="stylus" scoped>
.tkfdzaxtkdeianobciwadajxzbddorql
	display flex
	padding 16px 32px
	font-size 0.9em
	background linear-gradient(to bottom, var(--face), var(--subNoteBg) 10%, var(--subNoteBg) 90%, var(--face) 100%)

	&.mini
		padding 16px
		font-size 10px

		> .avatar
			margin 0 8px 0 0
			width 38px
			height 38px

	> .avatar
		flex-shrink 0
		display block
		margin 0 12px 0 0
		width 48px
		height 48px
		border-radius 8px

	> .main
		flex 1
		min-width 0

		> .body

			> .cw
				cursor default
				display block
				margin 0
				padding 0
				overflow-wrap break-word
				color var(--noteText)

				> .text
					margin-right 8px

			> .content
				> .text
					cursor default
					margin 0
					padding 0
					color var(--subNoteText)
					font-size calc(1em + var(--fontSize))

					&.scroll
						max-height 180px
						overflow hidden auto
						padding-left 0.2em
					pre
						max-height 120px
						font-size 80%

</style>
