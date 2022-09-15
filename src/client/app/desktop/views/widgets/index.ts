import Vue from 'vue';

import wNotifications from './notifications.vue';
import wTimemachine from './timemachine.vue';
import wActivity from './activity.vue';
import wTrends from './trends.vue';
import wPolls from './polls.vue';
import wMessaging from './messaging.vue';
import wProfile from './profile.vue';
import wCustomize from './customize.vue';
import wAichan from './aichan.vue';

Vue.component('mkw-notifications', wNotifications);
Vue.component('mkw-timemachine', wTimemachine);
Vue.component('mkw-activity', wActivity);
Vue.component('mkw-trends', wTrends);
Vue.component('mkw-polls', wPolls);
Vue.component('mkw-messaging', wMessaging);
Vue.component('mkw-profile', wProfile);
Vue.component('mkw-customize', wCustomize);
Vue.component('mkw-aichan', wAichan);
