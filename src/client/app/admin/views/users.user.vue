<template>
<div class="kofvwchc">
	<div>
		<a :href="user | userPage(null, true)" :key="Math.random()">
			<mk-avatar class="avatar" :user="user" :disable-link="true"/>
		</a>
	</div>
	<div @click="click(user.id)">
		<header>
			<b><mk-user-name :key="Math.random()" :user="user"/></b>
			<span class="username">@{{ user | acct }}</span>
			<span class="roles">
				<span class="role" v-for="role in roles" :key="role" :title="role">{{ $t(`@.roles.${role}`) }}</span>
			</span>
			<span class="statuses">
				<span class="status" v-for="status in statuses" :key="status" :title="status">{{ $t(`@.userStatuses.${status}`) }}</span>
			</span>
			<span class="is-verified" v-if="user.isVerified" :title="$t('@.verified-user')"><fa icon="star"/></span>
		</header>
		<div>
			<span>{{ $t('users.updatedAt') }}: <mk-time :time="user.updatedAt" mode="detail"/></span>
		</div>
		<div>
			<span>{{ $t('users.createdAt') }}: <mk-time :time="user.createdAt" mode="detail"/></span>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../i18n';
import { getUserRoles } from '../../common/scripts/get-user-roles'
import { getUserStatuses } from '../../common/scripts/get-user-statuses'

export default Vue.extend({
	i18n: i18n('admin/views/users.vue'),
	props: ['user', 'click'],
	data() {
		return {
		};
	},

	computed: {
		roles(): any {
			return getUserRoles(this.user);
		},
		statuses(): any {
			return getUserStatuses(this.user);
		},
	},
});
</script>

<style lang="stylus" scoped>
.kofvwchc
	display flex
	padding 16px
	border-top solid 1px var(--faceDivider)

	> div:first-child
		> a
			> .avatar
				width 64px
				height 64px

	> div:last-child
		flex 1
		cursor zoom-in
		padding-left 16px

		@media (max-width 500px)
			font-size 14px

		> header
			> .username
				margin-left 8px
				opacity 0.7

			>.roles
				> .role
					flex-shrink 0
					align-self center
					margin 0 0 0 .5em
					padding 1px 6px
					font-size 80%
					border-radius 3px
					background var(--noteHeaderAdminBg)
					color var(--noteHeaderAdminFg)

			>.statuses
				> .status
					flex-shrink 0
					align-self center
					margin 0 0 0 .5em
					padding 1px 6px
					font-size 80%
					border-radius 3px
					background var(--face)
					color var(--faceText)

			> .is-verified
				margin 0 0 0 .5em
				color #4dabf7

	&:hover
		color var(--primaryForeground)
		background var(--primary)
		text-decoration none
		border-radius 3px

	&:active
		color var(--primaryForeground)
		background var(--primaryDarken10)
		border-radius 3px
</style>
