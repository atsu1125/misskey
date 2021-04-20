<template>
<mk-ui>
	<template #header><span style="margin-right:4px;"><i class="far fa-sticky-note"></i></span>{{ $t('title') }}</template>
	<main v-if="!fetching">
		<div>
			<mk-note-detail :note="note" :key="note.id"/>
		</div>
		<footer>
			<router-link v-if="note.prev" :to="note.prev"><i class="fas fa-angle-left"></i> {{ $t('prev') }}</router-link>
			<router-link v-if="note.next" :to="note.next">{{ $t('next') }} <i class="fas fa-angle-right"></i></router-link>
		</footer>
	</main>
</mk-ui>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
import Progress from '../../../common/scripts/loading';

export default Vue.extend({
	i18n: i18n('mobile/views/pages/note.vue'),
	data() {
		return {
			fetching: true,
			note: null
		};
	},
	watch: {
		$route: 'fetch'
	},
	created() {
		this.fetch();
	},
	mounted() {
		document.title = this.$root.instanceName;
	},
	methods: {
		fetch() {
			Progress.start();
			this.fetching = true;

			this.$root.api('notes/show', {
				noteId: this.$route.params.note
			}).then(note => {
				this.note = note;
			}).catch((e: any) => {
				this.$root.dialog({
					type: 'error',
					text: e?.message || `Error`
				});
			}).finally(() => {
				this.fetching = false;

				Progress.done();
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
main
	text-align center

	> footer
		margin-top 16px

		> a
			display inline-block
			margin 0 16px

</style>
