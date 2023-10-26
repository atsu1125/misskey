import Vue from 'vue';

Vue.filter('kmg', (v, digits = 0) => {
	if (v == null) return 'N/A';
	if (v == 0) return '0';
	const sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R', 'Q'];
	const isMinus = v < 0;
	if (isMinus) v = -v;
	const i = Math.floor(Math.log(v) / Math.log(1024));
	return (isMinus ? '-' : '') + (v / Math.pow(1024, i)).toFixed(digits).replace(/(\.[1-9]*)0+$/, '$1').replace(/\.$/, '') + (sizes[i] ?? `e+${ i * 3 }B`);
});
