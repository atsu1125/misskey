<template>
<div class="mkw-sunmoon">
	<ui-container>
		<template #header>{{ $t('title') }}</template>
		<template #func><button title="設定" @click="setting"><fa icon="cog"/></button></template>

		<div class="mkw-sunmoon--body">
			<div class="lunar-calendar">
				<p class="moonface"><img :src="moonFace" height="64"></p>
				<p class="moonage">{{ moonAge }}</p>
			</div>
			<div class="suntime">
				<div>
					<p><i class="fas fa-arrow-up"></i>{{ this.$t('sunRise') }}: <b>{{ sunRiseTime }}</b></p>
					</div>
					<div>
					<p><i class="fas fa-arrow-down"></i>{{ this.$t('sunSet') }}: <b>{{ sunSetTime }}</b></p>
				</div>
			</div>
		</div>
	</ui-container>
</div>
</template>

<script lang="ts">
import define from '../../../common/define-widget';
import i18n from '../../../i18n';
import moment from "moment";
import SunCalc from "suncalc";
import { twemojiSvgBase } from '../../../../../misc/twemoji-base';
export default define({
	name: 'sunmoon',
	props: () => ({
		longitude: 135
	})
}).extend({
	i18n: i18n('common/views/widgets/sunmoon.vue'),
	data() {
		return {
			now: new Date(),
			year: 2000,
			month: 1,
			day: 1,
			sunRiseTime: "00:00",
			sunSetTime: "00:00",
			moonAge: "0.0",
			moonFace: `${twemojiSvgBase}/1f313.svg`,
			clock: 0,
			latitude: 0,
		};
	},
	created() {
		this.tick();
		this.clock = setInterval(this.tick, 8000);
	},
	beforeUnmount() {
		clearInterval(this.clock);
	},
	methods: {
		setting() {
			this.$root.dialog({
				title: 'Longitude',
				input: {
					type: 'longitude',
					default: this.props.longitude
				}
			}).then(({ canceled, result: longitude }) => {
				if (canceled) return;
				this.props.longitude = longitude;
				this.save();
				this.fetch();
			});
		},
		tick() {
			const now = new Date();
			const nd = now.getDate();
			const nm = now.getMonth();
			const ny = now.getFullYear();
			this.year = ny;
			this.month = nm + 1;
			this.day = nd;
			let hour12 = now;
			hour12.setHours(12);
			hour12.setMinutes(0);
			hour12.setSeconds(0);
			const sunTimes = SunCalc.getTimes(hour12, this.latitude, this.props.longitude);
			const moonTimes = SunCalc.getMoonIllumination(now);
			const sunRiseTime0 = sunTimes["sunrise"];
			const sunSetTime0 = sunTimes["sunset"];
			this.sunRiseTime = moment(sunRiseTime0).format("HH:mm");
			this.sunSetTime = moment(sunSetTime0).format("HH:mm");
			const moonPhase = moonTimes["phase"];
			this.moonAge = (29.5 * moonPhase).toFixed(1);
			const moonFaceImg = ["a", "2", "3", "4", "d", "6", "7", "8"][Math.floor(8 * moonPhase)];
			this.moonFace = `${twemojiSvgBase}/1f31${moonFaceImg}.svg`;
		}
	}
});
</script>

<style lang="stylus" scoped>
.mkw-sunmoon
	.mkw-sunmoon--body
		padding 16px 0
		display flex
		justify-content center
		align-items center
		&:after
			content ""
		> .lunar-calendar
			float left
			width 40%
			text-align center
			> p
				margin 0
				line-height 18px
				font-size 0.9em
				color var(--text)
			> .moonface
				line-height 72px
				font-size 4em
		> .suntime
			display block
			float right
			text-align center
			width 60%
			padding 0 16px 0 0
			box-sizing border-box
			> div
				margin-bottom 16px
				&:last-child
					margin-bottom 0
				> p
					margin 0 0 2px 0
					font-size 1em
					line-height 18px
					color var(--text)
					> b
						margin-left 2px
</style>
