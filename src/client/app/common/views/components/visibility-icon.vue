<template>
	<div style="display: inline-flex; align-items: center;">
		<div v-if="visibility == 'public'" :title="$t('@.note-visibility.public')">
			<i class="fas fa-globe"></i>
		</div>
		<div v-else-if="visibility == 'home'" :title="$t('@.note-visibility.home')">
			<i class="fas fa-home"></i>
		</div>
		<div v-else-if="visibility == 'followers'" :title="$t('@.note-visibility.followers')">
			<i class="fas fa-lock"></i>
		</div>
		<div v-else-if="visibility == 'specified'" :title="$t('@.note-visibility.specified')">
			<i class="fas fa-envelope"></i>
		</div>
		<div class="wrap" v-else-if="visibility == 'local-public'" :title="$t('@.note-visibility.local-public')">
			<div><i class="fas fa-globe"></i></div>
			<div class="localOnly"><i class="fas fa-heart"></i></div>
		</div>
		<div class="wrap" v-else-if="visibility == 'local-home'" :title="$t('@.note-visibility.local-home')">
			<div><i class="fas fa-home"></i></div>
			<div class="localOnly"><i class="fas fa-heart"></i></div>
		</div>
		<div class="wrap" v-else-if="visibility == 'local-followers'" :title="$t('@.note-visibility.local-followers')">
			<div><i class="fas fa-lock"></i></div>
			<div class="localOnly"><i class="fas fa-heart"></i></div>
		</div>
		<div class="wrap" v-else-if="visibility == 'local-specified'" :title="$t('@.note-visibility.local-specified')">
			<div><i class="fas fa-envelope"></i></div>
			<div class="localOnly"><i class="fas fa-heart"></i></div>
		</div>
		<div v-if="visibility == 'once-public'" :title="$t('@.note-visibility.once-public')">
			<fa :icon="faHandHoldingHeart"/>
		</div>
		<div v-else-if="visibility == 'once-home'" :title="$t('@.note-visibility.once-home')">
			<fa :icon="faHandHoldingHeart"/>
		</div>
		<div v-else-if="visibility == 'once-specified'" :title="$t('@.note-visibility.once-specified')">
			<fa :icon="faSatelliteDish"/>
		</div>

		<div v-if="withText" style="margin-left: 0.3em">
			<span v-if="visibility == 'public'">{{ $t('@.note-visibility.public') }}</span>
			<span v-else-if="visibility == 'home'">{{ $t('@.note-visibility.home') }}</span>
			<span v-else-if="visibility == 'followers'">{{ $t('@.note-visibility.followers') }}</span>
			<span v-else-if="visibility == 'specified'">{{ $t('@.note-visibility.specified') }}</span>
			<span v-else-if="visibility == 'local-public'">{{ $t('@.note-visibility.local-public') }}</span>
			<span v-else-if="visibility == 'local-home'">{{ $t('@.note-visibility.local-home') }}</span>
			<span v-else-if="visibility == 'local-followers'">{{ $t('@.note-visibility.local-followers') }}</span>
			<span v-else-if="visibility == 'once-public'">{{ $t('@.note-visibility.once-public') }}</span>
			<span v-else-if="visibility == 'once-home'">{{ $t('@.note-visibility.once-home') }}</span>
			<span v-else-if="visibility == 'once-specified'">{{ $t('@.note-visibility.once-specified') }}</span>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
import { faHandHoldingHeart, faSatelliteDish } from '@fortawesome/free-solid-svg-icons';

export default Vue.extend({
	i18n: i18n(),
	props: {
		v: {
			type: String,
			required: true
		},
		localOnly: {
			type: Boolean,
			required: false,
			default: false
		},
		copyOnce: {
			type: Boolean,
			required: false,
			default: false
		},
		withText: {
			type: Boolean,
			required: false,
			default: false
		},
	},
	data() {
		return {
			faHandHoldingHeart, faSatelliteDish
		}
	},
	computed: {
		visibility(): string {
			return this.localOnly ? `local-${this.v}` : this.copyOnce ? `once-${this.v}` : this.v;
		},
	},
});
</script>

<style lang="stylus" scoped>
	.wrap
		> .localOnly
			color var(--primary)
			position absolute
			top -0.5em
			right -0.5em
			transform scale(0.8)
</style>
