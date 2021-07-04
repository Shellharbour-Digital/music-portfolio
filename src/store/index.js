import { createStore } from 'vuex';
import auth from './modules/auth';
// eslint-disable-next-line import/no-cycle
import player from './modules/player';

export default createStore({
  modules: {
    auth,
    player,
  },
});
