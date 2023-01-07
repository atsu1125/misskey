<template>
	<div class="badges2226">
		<span v-for="def in defs" :key="def.label" class="badge">
			<fa v-if="def.icon != null" class="icon" :class="def.class" :icon="def.icon" :title="def.label"/>
			<span v-else class="label" :class="def.class">{{ def.label }}</span>
		</span>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PropType } from 'vue/types/v3-component-props';
import i18n from '../../../i18n';
import { PackedUser, ThinPackedUser } from '../../../../../models/packed-schemas';
import { getUserRoles } from '../../scripts/get-user-roles';
import { IconDefinition, faCrown, faStar, faRobot, faPaw, faUserShield, faWrench } from '@fortawesome/free-solid-svg-icons';

export default defineComponent({
	i18n: i18n(''),

	props: {
		user: {
			type: Object as PropType<PackedUser | ThinPackedUser>,
			required: true,
		},
		withRoles: {
			type: Boolean,
			required: false,
		}
	},

	data() {
		return {
			//faCrown, faPaw,
		};
	},

	computed: {
		defs() {
			const items = [] as {
				label: string;
				class: string;
				icon?: IconDefinition | string;
			}[];

			if (this.withRoles && this.user.isAdmin) {
				items.push({
					label: this.$t('@.admin-user'),
					class: 'admin',
					icon: faWrench,
				});
			}

			if (this.withRoles && this.user.isModerator) {
				items.push({
					label: this.$t('@.moderator'),
					class: 'moderator',
					icon: faUserShield,
				});
			}

			if (this.user.isVerified) {
				items.push({
					label: this.$t('@.verified-user'),
					class: 'verified',
					icon: faStar,
				});
			}

			if (this.user.isBot) {
				items.push({
					label: this.$t('@.bot-user'),
					class: 'bot',
					icon: faRobot,
				});
			}

			if (this.user.isCat) {
				items.push({
					label: this.$t('@.cat-user'),
					class: 'cat',
					icon: faPaw,
				});
			}

			// roles
//			if (this.withRoles) {
//				for (const role of getUserRoles(this.user).filter(x => x !== 'admin')) {
//					items.push({
//						label: this.$t(`@.roles.${role}`),
//						class: role,
//					});
//				}
//			}

			return items;
		},
	},
});
</script>

<style lang="stylus" scoped>
.badges2226
	> .badge
		margin-right 0.3em

		> .icon
			color var(--noteHeaderBadgeFg)
			&.admin
				color #f15f71
			&.moderator
				color #ff9e3d
			&.verified
				color #4dabf7

		> .label
			color var(--faceText)
			background #ffffff22
			font-size 0.9em
			border-radius 3px
			padding 3px
			opacity 0.8
</style>
