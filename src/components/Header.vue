<template>
  <!-- Header -->
  <header id="header" class="bg-gray-700">
    <nav class="container mx-auto flex justify-start items-center py-5 px-4">
      <!-- App Name -->
      <router-link class="text-white font-bold uppercase text-2xl mr-4"
        :to="{ name: 'home' }" exact-active-class="no-active">
        Music
      </router-link>

      <div class="flex flex-grow items-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1">
          <!-- Navigation Links -->
          <li>
            <router-link class="px-2 text-white" :to="{ name: 'about' }">
              About
            </router-link>
          </li>
          <li v-if="!userLoggedIn">
            <a class="px-2 text-white" href="#" @click.prevent="toggleAuthModal">
              Login / Register
            </a>
          </li>
          <template v-else>
            <li>
              <router-link class="px-2 text-white" :to="{ name: 'manage' }">
                Manage
              </router-link>
            </li>
            <li>
              <a class="px-2 text-white" href="#"
                @click.prevent="signout">Logout</a>
            </li>
          </template>
        </ul>
        <ul class="flex flex-row mt-1 ml-auto">
          <li>
            <label class="px-2 align-bottom"
              v-icon-secondary="{ icon: 'globe', white: true }">
            </label>
            <select v-model="locale" @change="changeLocale($event)"
              class="py-1 px-3 text-gray-800 border border-gray-300 transition
              duration-500 focus:outline-none focus:border-black rounded">
              <option v-for="option in options" :value="option.value" :key="option.value">
                {{ option.text }}
              </option>
            </select>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import IconSecondary from '@/directives/icon-secondary';

export default {
  name: 'Header',
  directives: {
    'icon-secondary': IconSecondary,
  },
  computed: {
    ...mapState({
      userLoggedIn: (state) => state.auth.userLoggedIn,
    }),
  },
  data() {
    return {
      locale: 'en',
      options: [
        { text: 'English', value: 'en' },
        { text: 'Serbian', value: 'sr' },
        { text: 'French', value: 'fr' },
      ],
    };
  },
  methods: {
    ...mapMutations(['toggleAuthModal']),
    signout() {
      this.$store.dispatch('signout', {
        router: this.$router,
        route: this.$route,
      });

      if (this.$route.meta.requiresAuth) {
        this.$router.push({ name: 'home' });
      }
    },
    changeLocale(event) {
      console.log(event.target.value);
      this.$i18n.locale = event.target.value;
    },
    // toggleAuthModal() {
    //   this.$store.commit('toggleAuthModal');
    // },
  },
};
</script>
