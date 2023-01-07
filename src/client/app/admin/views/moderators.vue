<template>
<div>
	<ui-card>
		<template #title><fa icon="plus"/> {{ $t('add-moderator.title') }}</template>
		<section class="fit-top">
			<ui-input v-model="username" type="text">
				<template #prefix>@</template>
			</ui-input>
			<ui-horizon-group>
				<ui-button @click="add" :disabled="changing || !$store.getters.isAdmin">{{ $t('add-moderator.add') }}</ui-button>
				<ui-button @click="remove" :disabled="changing || !$store.getters.isAdmin">{{ $t('add-moderator.remove') }}</ui-button>
			</ui-horizon-group>
		</section>
	</ui-card>
	<ui-card>
		<template #title><fa :icon="faHeadset"/> {{ $t('moderators.title') }}</template>
		<section class="fit-top">
			<div>
				<x-user v-for="moderator in moderators" :key="moderator.id" :user='moderator'/>
			</div>
			<ui-button v-if="existMore" @click="fetchModerators">{{ $t('@.load-more') }}</ui-button>
		</section>
	</ui-card>
</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue';
import i18n from '../../i18n';
import parseAcct from "../../../../misc/acct/parse";
import { PackedUser } from '../../../../models/packed-schemas';
import XUser from './users.user.vue';
import { faHeadset } from '@fortawesome/free-solid-svg-icons';


export default defineComponent({
	i18n: i18n('admin/views/moderators.vue'),

	components: {
		XUser,
	},

	data() {
		return {
			$root: getCurrentInstance() as any,
			username: '',
			changing: false,
			moderators: [] as PackedUser[],
			existMore: false,
			limit: 10,
			offset: 0,
			faHeadset,
		};
	},

	mounted() {
		this.fetchModerators();
	},

	methods: {
		fetchModerators(refresh?: boolean) {
			if (refresh) this.offset = 0;
			this.$root.api('admin/show-users', {
				state: 'moderator',
				origin: 'local',
				offset: this.offset,
				limit: this.limit + 1,
			}).then((moderators: PackedUser[]) => {
				if (moderators.length == this.limit + 1) {
					moderators.pop();
					this.existMore = true;
				} else {
					this.existMore = false;
				}
				this.moderators = refresh ? moderators : this.moderators.concat(moderators);
				this.offset += this.limit;
			});
		},

		async add() {
			this.changing = true;

			const process = async () => {
				const user = await this.$root.api('users/show', parseAcct(this.username));
				await this.$root.api('admin/moderators/add', { userId: user.id });
				this.$root.dialog({
					type: 'success',
					text: this.$t('add-moderator.added')
				});
			};

			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.toString()
				});
			});

			this.changing = false;
			this.fetchModerators(true);
		},

		async remove() {
			this.changing = true;

			const process = async () => {
				const user = await this.$root.api('users/show', parseAcct(this.username));
				await this.$root.api('admin/moderators/remove', { userId: user.id });
				this.$root.dialog({
					type: 'success',
					text: this.$t('add-moderator.removed')
				});
			};

			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.toString()
				});
			});

			this.changing = false;
			this.fetchModerators(true);
		},
	}
});
</script>
