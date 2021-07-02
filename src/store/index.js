import { createStore } from 'vuex';
import { auth, usersCollection } from '@/includes/firebase';
import { Howl } from 'howler';
import helper from '@/includes/helper';

export default createStore({
  state: {
    authModalShow: false,
    userLoggedIn: false,
    currentSong: {},
    sound: {},
    seek: '00:00',
    duration: '00:00',
    playerProgress: '0%',
  },
  mutations: {
    toggleAuthModal: (state) => {
      state.authModalShow = !state.authModalShow;
    },
    toggleAuth(state) {
      state.userLoggedIn = !state.userLoggedIn;
    },
    newSong(state, payload) {
      state.currentSong = payload;
      state.sound = new Howl({
        src: [payload.url],
        html5: true,
      });
    },
    updatePosition(state) {
      // return current pos of audio being played
      state.seek = helper.formatTime(state.sound.seek());
      // set the duration prop to the current duration of the song
      state.duration = helper.formatTime(state.sound.duration());

      // numeric value between 0 and 100
      state.playerProgress = `${(state.sound.seek() / state.sound.duration()) * 100}%`;
    },
  },
  getters: {
    // authModalShow: (state) => state.authModalShow,
    playing: (state) => {
      // computed function to toggle play and pause button
      if (state.sound.playing) {
        return state.sound.playing();
      }
      return false;
    },
  },
  actions: {
    async register({ commit }, payload) {
      const userCred = await auth.createUserWithEmailAndPassword(
        payload.email, payload.password,
      );

      await usersCollection.doc(userCred.user.uid).set({
        name: payload.name,
        email: payload.email,
        age: payload.age,
        country: payload.country,
      });

      await userCred.user.updateProfile({
        displayName: payload.name,
      });

      commit('toggleAuth');
    },
    async login({ commit }, payload) {
      await auth.signInWithEmailAndPassword(payload.email, payload.password);

      commit('toggleAuth');
    },
    init_login({ commit }) {
      const user = auth.currentUser;

      if (user) {
        commit('toggleAuth');
      }
    },
    async signout({ commit }) {
      await auth.signOut();

      commit('toggleAuth');

      // if (payload.route.meta.requiresAuth) {
      //   payload.router.push({ name: 'home' });
      // }
    },
    async newSong({ commit, state, dispatch }, payload) {
      // TODO: Update play button on song page

      // Delete the current song instance and remove it from memory if it exists
      if (state.sound instanceof Howl) {
        state.sound.unload();
      }

      commit('newSong', payload);

      state.sound.play();

      // listen to the play event
      state.sound.on('play', () => {
        // similar to setInterval function.
        // except this gets called before the next frame is painted onto the screen.
        requestAnimationFrame(() => {
          dispatch('progress');
        });
      });
    },
    async toggleAudio({ state }) {
      // Check if there is an existing Howl object
      if (!state.sound.playing) {
        return;
      }

      // If the playing function exists on the Howl object pause the song
      if (state.sound.playing()) {
        state.sound.pause();
      } else {
        state.sound.play();
      }
    },
    progress({ commit, state, dispatch }) {
      commit('updatePosition');

      // make sure song is playing before continuously calling the function
      if (state.sound.playing()) {
        requestAnimationFrame(() => {
          dispatch('progress');
        });
      }
    },
    updateSeek({ state, dispatch }, payload) {
      // If a song is not playing don't move the pos
      if (!state.sound.playing) {
        return;
      }

      // Gets true X pos by getting co-ordinate and dimensions
      const { x, width } = payload.currentTarget.getBoundingClientRect();
      // Document = 2000, Timeline = 1000, Click = 1000, Distance = 500
      const clickX = payload.clientX - x;
      const percentage = clickX / width;
      const seconds = state.sound.duration() * percentage;

      // update the pos
      state.sound.seek(seconds);

      // reflect the changes onto the audio player
      state.sound.once('seek', () => {
        dispatch('progress');
      });
    },
  },
});
