<template>
<div class="mk-user-timeline">
	<div class="command">
		<ui-button @click="fetchOutbox()">{{ $t('fetch-posts') }}</ui-button>
	</div>
	<mk-notes ref="timeline" :make-promise="makePromise" @inited="() => $emit('loaded')"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';

const fetchLimit = 10;

export default Vue.extend({
	i18n: i18n('mobile/views/components/user-timeline.vue'),

	props: ['user', 'withMedia'],

	data() {
		return {
			makePromise: cursor => this.$root.api('users/notes', {
				userId: this.user.id,
				limit: fetchLimit + 1,
				withFiles: this.withMedia,
				untilId: cursor ? cursor : undefined,
			}, false, !this.$store.getters.isSignedIn).then(notes => {
				if (notes.length == fetchLimit + 1) {
					notes.pop();
					return {
						notes: notes,
						cursor: notes[notes.length - 1].id
					};
				} else {
					return {
						notes: notes,
						cursor: null
					};
				}
			})
		};
	},

	methods: {
		fetchOutbox() {
			this.$root.api('ap/fetch-outbox', {
				userId: this.user.id,
				sync: true
			}).then(() => {
				(this.$refs.timeline as any).reload();
			});
		},
	}
});
</script>

<style lang="stylus" scoped>
.command
	margin 16px 0
</style>
