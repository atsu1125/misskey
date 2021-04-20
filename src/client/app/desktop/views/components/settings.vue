<template>
<div class="mk-settings">
	<div class="nav" :class="{ inWindow }">
		<router-link to="/i/settings/profile" active-class="active"><i class="fas fa-user fa-fw"></i>{{ $t('@._settings.profile') }}</router-link>
		<router-link to="/i/settings/appearance" active-class="active"><i class="fas fa-palette fa-fw"></i>{{ $t('@._settings.appearance') }}</router-link>
		<router-link to="/i/settings/behavior" active-class="active"><i class="fas fa-desktop fa-fw"></i>{{ $t('@._settings.behavior') }}</router-link>
		<router-link to="/i/settings/notification" active-class="active"><i class="far fa-bell fa-fw"></i>{{ $t('@._settings.notification') }}</router-link>
		<router-link to="/i/settings/drive" active-class="active"><i class="fas fa-cloud fa-fw"></i>{{ $t('@.drive') }}</router-link>
		<router-link to="/i/settings/hashtags" active-class="active"><i class="fas fa-hashtag fa-fw"></i>{{ $t('@._settings.tags') }}</router-link>
		<router-link to="/i/settings/muteAndBlock" active-class="active"><i class="fas fa-ban fa-fw"></i>{{ $t('@._settings.mute-and-block') }}</router-link>
		<router-link to="/i/settings/extendedNotification" active-class="active"><fa :icon="faLightbulb" fixed-width/>{{ $t('@._settings.extended-notification') }}</router-link>
		<router-link to="/i/settings/apps" active-class="active"><i class="fas fa-puzzle-piece fa-fw"></i>{{ $t('@._settings.apps') }}</router-link>
		<router-link to="/i/settings/security" active-class="active"><i class="fas fa-unlock-alt fa-fw"></i>{{ $t('@._settings.security') }}</router-link>
		<router-link to="/i/settings/api" active-class="active"><i class="fas fa-key fa-fw"></i>API</router-link>
		<router-link to="/i/settings/other" active-class="active"><i class="fas fa-cogs fa-fw"></i>{{ $t('@._settings.other') }}</router-link>
	</div>
	<div class="pages">
		<x-settings :page="page"/>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
import XSettings from '../../../common/views/components/settings/settings.vue';
import { faLightbulb } from '@fortawesome/free-regular-svg-icons';

export default Vue.extend({
	i18n: i18n(),
	components: {
		XSettings,
	},
	props: {
		page: {
			type: String,
			required: true,
		},
		inWindow: {
			type: Boolean,
			required: false,
			default: true
		}
	},
	data() {
		return {
			faLightbulb,
		};
	},
});
</script>

<style lang="stylus" scoped>
.mk-settings
	display flex
	width 100%
	height 100%

	> .nav
		flex 0 0 200px
		width 100%
		height 100%
		padding 16px 0 0 0
		overflow auto
		z-index 1
		font-size 15px

		> a
			display block
			padding 10px 16px
			margin 0
			color var(--desktopSettingsNavItem)
			cursor pointer
			user-select none
			transition margin-left 0.2s ease

			> [data-icon]
				margin-right 4px

			&:hover
				color var(--desktopSettingsNavItemHover)

			&.active
				margin-left 8px
				color var(--primary) !important

	> .pages
		width 100%
		height 100%
		flex auto
		overflow auto

</style>
