<template>
  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
        <div class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)">
        </div>
        <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button type="button" class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full
            focus:outline-none" @click.prevent="newSong(song)">
            <i class="fas"
              :class="{ 'fa-play': !songPageToggle, 'fa-pause': songPageToggle }"></i>
        </button>
        <div class="z-50 text-left ml-8">
            <!-- Song Info -->
            <div class="text-3xl font-bold">{{ song.modified_name }}</div>
            <div>{{ song.genre }}</div>
        </div>
        </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6" id="comments">
        <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <!-- Comment Count -->
            <span class="card-title">
              {{ $tc('song.comment_count', song.comment_count, {
                count: song.comment_count
              }) }}
            </span>
            <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
            <div class="text-white text-center p-4 mb-4" v-if="comment_show_alert"
                :class="comment_alert_variant">
                {{ comment_alert_message }}
            </div>
            <vee-form :validation-schema="schema" @submit="addComment" v-if="userLoggedIn">
            <vee-field as="textarea" name="comment"
                class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition
                duration-500 focus:outline-none focus:border-black rounded mb-4"
                placeholder="Your comment here..."></vee-field>
            <ErrorMessage class="text-red-600" name="comment" />
            <button type="submit" class="py-1.5 px-3 rounded text-white bg-green-600 block"
                :disabled="comment_in_submission">
                Submit
            </button>
            </vee-form>
            <!-- Sort Comments -->
            <select v-model="sort"
            class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition
            duration-500 focus:outline-none focus:border-black rounded">
            <option value="1">Latest</option>
            <option value="2">Oldest</option>
            </select>
        </div>
        </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto">
        <li class="p-6 bg-gray-50 border border-gray-200"
            v-for="comment in sortedComments" :key="comment.docId">
        <!-- Comment Author -->
        <div class="mb-5">
            <div class="font-bold">{{ comment.name }}</div>
            <time>{{ comment.datePosted }}</time>
        </div>

        <p>
            {{ comment.content }}
        </p>
        </li>
    </ul>
  </main>
</template>

<script>
import { songsCollection, auth, commentsCollection } from '@/includes/firebase';
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'Song',
  data() {
    return {
      song: {},
      schema: {
        comment: 'required|min:3',
      },
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_variant: 'bg-blue-500',
      comment_alert_message: 'Please wait! Your comment is being submitted',
      comments: [],
      sort: '1',
    };
  },
  computed: {
    // Get userLoggedIn from store and display form in they are logged in
    ...mapState({
      userLoggedIn: (state) => state.auth.userLoggedIn,
    }),
    ...mapGetters(['songPageToggle']),
    sortedComments() {
      // computed properties should not change data propeties. this is a work around
      // slice returns a new array as without it there is an eslint error
      return this.comments.slice().sort((a, b) => {
        //   1 = latest to oldest
        if (this.sort === '1') {
          // To make a proper comparision, the params have to be converted back to a date object
          // positive val returned puts b first in the array. if 0 is returned then the index stays.
          return new Date(b.datePosted) - new Date(a.datePosted);
        }

        // asc order
        return new Date(a.datePosted) - new Date(b.datePosted);
      });
    },
  },
  async beforeRouteEnter(to, from, next) {
    // Get the song from firebase querying for the id from the route
    const docSnapshot = await songsCollection.doc(to.params.id).get();

    next((vm) => {
    // Redirect to home if song doesn't exist
      if (!docSnapshot.exists) {
        vm.$router.push({ name: 'home' });
        return;
      }

      // Grab the sort param, update the sort prop but not assing it to the query param
      const { sort } = vm.$route.query;
      // make sure the query param is a valid value
      // eslint-disable-next-line no-param-reassign
      vm.sort = sort === '1' || sort === '2' ? sort : '1';

      // eslint-disable-next-line no-param-reassign
      vm.song = docSnapshot.data();
      vm.getComments();
    });
  },
  methods: {
    ...mapActions(['newSong']),
    async addComment(values, { resetForm }) {
      this.comment_in_submission = true;
      this.comment_show_alert = true;
      this.comment_alert_variant = 'bg-blue-500';
      this.comment_alert_message = 'Please wait! Your comment is being submitted';

      const comment = {
        content: values.comment,
        // firebase cannot store date objects so we have to convert it to a string
        datePosted: new Date().toString(),
        sid: this.$route.params.id,
        name: auth.currentUser.displayName,
        uid: auth.currentUser.uid,
      };

      await commentsCollection.add(comment);

      // update comment count after submit
      this.song.comment_count += 1;
      await songsCollection.doc(this.$route.params.id).update({
        comment_count: this.song.comment_count,
      });

      // fetch comments on submission
      this.getComments();

      this.comment_in_submission = false;
      this.comment_alert_variant = 'bg-green-500';
      this.comment_alert_message = 'Comment added!';

      resetForm();
    },
    async getComments() {
      const snapshots = await commentsCollection.where('sid', '==', this.$route.params.id)
        .get();

      // make sure we don't have dupe comments
      this.comments = [];

      snapshots.forEach((doc) => [
        this.comments.push({
          docId: doc.id,
          ...doc.data(),
        }),
      ]);
    },
  },
  watch: {
    // Update query param when the sort val changes
    sort(newVal) {
      // Prevent the watcher from updating the route if the param already matches the sort val
      if (newVal === this.$route.query.sort) {
        return;
      }
      this.$router.push({
        query: {
          sort: newVal,
        },
      });
    },
  },
};
</script>
