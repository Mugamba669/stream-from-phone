<template lang="html">
     <div class="bg-white text-black rounded-lg shadow-lg p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-4">
          <!-- Placeholder for album art -->
          <div class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
            <!-- <img
              v-if="currentSong"
              :src="getAlbumArt(currentSong)"
              alt="Album Art"
              class="object-cover w-full h-full" -->
            <!-- /> -->
          </div>

          <div>
            <h2 class="text-xl font-bold">
              {{ currentSong ? currentSong.name : "No Song Playing" }}
            </h2>
            <p class="text-sm text-gray-600">
              {{ currentSong ? formatDate(currentSong.lastModified) : "" }}
            </p>
          </div>
        </div>

        <!-- Player controls -->
        <div class="flex space-x-4">
          <button @click="$emit('prevSong')" :disabled="!playlist.length">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-8 h-8 text-gray-800"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 12H5m0 0l7-7m-7 7l7 7"
              />
            </svg>
          </button>

          <button @click="$emit('togglePlayPause')" :disabled="!playlist.length">
            <svg
              v-if="isPlaying"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-10 h-10 text-green-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 9v6m4-6v6"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-10 h-10 text-green-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.752 11.168l-6.49-3.745A1 1 0 007 8.745v6.51a1 1 0 001.262.972l6.49-3.745a1 1 0 000-1.744z"
              />
            </svg>
          </button>

          <button @click="$emit('nextSong')" :disabled="!playlist.length">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-8 h-8 text-gray-800"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h14m0 0l-7-7m7 7l-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="h-2 bg-gray-300 rounded-lg overflow-hidden">
        <div
          class="h-full bg-blue-500 transition-all duration-500"
          :style="{ width: songProgress + '%' }"
        ></div>
      </div>
    </div>
</template>
<script>
export default {
  name: "player",
  props: {
    currentSong: {
      type:Object,
    },
    songProgress: {
      type: Number,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    playlist: {
      type: Array,
      default: [],
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    formatSize(size) {
      return (size / (1024 * 1024)).toFixed(2) + " MB";
    },
  },
};
</script>
<style lang="" scoped>
</style>