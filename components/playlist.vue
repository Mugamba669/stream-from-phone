<template>
  <div
    class="p-6 bg-gradient-to-r from-purple-500 to-indigo-500 min-h-screen text-white"
  >
    <h1 class="text-3xl font-bold mb-6 text-center">
      Music Library & Playlist
      <input
        type="text"
        v-model="serverAddress"
        placeholder="Server Address"
        class="text-black text-sm p-2 border-[2px] rounded-md outline-none border-[#00ffccee] placeholder:text-gray-300 placeholder:text-md"
      />

      <input
        type="text"
        @input="updateFolder"
        placeholder="Enter a folder"
        class="text-black text-sm p-2 border-[2px] rounded-md outline-none border-[#00ffccee] placeholder:text-gray-300 placeholder:text-md"
      />
      <button class="text-white bg-blue-800 p-3" @click="fetchData">
        Fetch
      </button>
    </h1>

    <!-- Music player -->
    <player
      :currentSong="currentSong"
      :isPlaying="isPlaying"
      @nextSong="nextSong"
      @prevSong="previousSong"
      @togglePlayPause="togglePlayPause"
      :songProgress="songProgress"
    />
    <br />
    <input
      type="range"
      class="w-full"
      step="0.01"
      min="0.17"
      v-model="volume"
      max="1"
    />
    <p>{{ volume }} dB</p>
    <!-- Playlist -->
    <div class="my-5 flex flex-row justify-between items-stretch">
      <h2 class="text-xl font-bold mb-4">SONGS FROM {{ folderName }}</h2>
      <input
        type="search"
        v-model="search"
        class="text-black text-md p-3 outline-none"
        id=""
      />
    </div>
    <ul class="space-y-4 h-[500px] overflow-y-auto">
      <li
        v-for="(item, index) in playlist"
        :key="index"
        @click="playSongFromPlaylist(index)"
        class="bg-white shadow-md rounded-lg p-4 flex items-center justify-between cursor-pointer"
      >
        <div>
          <p class="font-semibold text-gray-800">{{ item.name }}</p>
          <p class="text-sm text-gray-600">
            Last modified:
            {{ item.lastModified ? formatDate(item.lastModified) : "Unknown" }}
          </p>
        </div>
        <span
          v-if="item.type === 'file'"
          class="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-lg"
        >
          File Size: {{ formatSize(item.size) }}
        </span>
      </li>
    </ul>
    <audio ref="audioPlayer" src="" id="audio"></audio>
  </div>
</template>

<script>
import NodeID3 from "node-id3";
import player from "./player/player.vue";

// import getLocalIP from "~/test";

export default {
  components: { player },
  data() {
    return {
      // player: document.getElementById("audio"),
      items: [],
      playlist: [],
      currentSong: null,
      isPlaying: false,
      songProgress: 0,
      volume: 0.17,
      search: "",
      folderName: "/Music/04 April",
      serverAddress:
        localStorage.getItem("address") == null
          ? "192.168.7.221"
          : localStorage.getItem("address"),
    };
  },
  created() {
    this.playlist.filter((song) => song.name === search);
  },
  methods: {
    fetchData() {
      localStorage.setItem("address", this.serverAddress);
      this.fetchSongs();
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    updateVolume(volume) {
      this.$refs.audioPlayer.volume = volume.target.value;
    },
    formatSize(size) {
      return (size / (1024 * 1024)).toFixed(2) + " MB";
    },
    // Add song to the playlist and play
    playSong(song) {
      if (!this.playlist.includes(song)) {
        this.playlist.push(song);
      }

      this.playSongFromPlaylist(this.playlist.length - 1);
    },
    // Play song by index from playlist
    playSongFromPlaylist(index) {
      this.currentSong = this.playlist[index];
      const url =
        "http://" +
        this.serverAddress +
        ":8080/download?file=" +
        this.currentSong.path;

      this.$refs.audioPlayer.src = url;
      this.$refs.audioPlayer.play();
      this.isPlaying = true;
      this.updateProgress();
    },
    pause() {
      this.$refs.audioPlayer.pause();
      this.isPlaying = false;
    },
    togglePlayPause() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.$refs.audioPlayer.play();
        this.isPlaying = true;
      }
    },
    nextSong() {
      const currentIndex = this.playlist.indexOf(this.currentSong);
      const nextIndex = (currentIndex + 1) % this.playlist.length;
      this.playSongFromPlaylist(nextIndex);
    },
    previousSong() {
      const currentIndex = this.playlist.indexOf(this.currentSong);
      const previousIndex =
        (currentIndex - 1 + this.playlist.length) % this.playlist.length;
      this.playSongFromPlaylist(previousIndex);
    },
    updateProgress() {
      this.$refs.audioPlayer.addEventListener("timeupdate", () => {
        const progress =
          (this.$refs.audioPlayer.currentTime /
            this.$refs.audioPlayer.duration) *
          100;
        this.songProgress = progress || 0;
      });
    },
    updateFolder(e) {
      this.fetchSongs();
      this.folderName = e.target.value;
    },
    // Fetch songs
    async fetchSongs() {
      try {
        const response = await fetch(
          "http://" +
            this.serverAddress +
            ":8080?path=/storage/emulated/0" +
            this.folderName
        );
        const data = await response.json();
        this.items = data.items;
        this.playlist = data.items.filter(
          (predicate) => predicate.type == "file"
        ); // Add fetched songs to playlist
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    },
  },
  mounted() {
    this.fetchSongs();
    navigator.mediaSession.setActionHandler("nexttrack", this.nextSong);
    navigator.mediaSession.setActionHandler("previoustrack", this.nextSong);

    this.$refs.audioPlayer.volume = this.volume;
    // if song ended start a new song
    this.$refs.audioPlayer.onended = () => {
      this.nextSong();
      const url =
        "http://" +
        this.serverAddress +
        ":8080/download?file=" +
        this.currentSong.path;
    };
    if (this.currentSong != null) {
      const url =
        "http://" +
        this.serverAddress +
        ":8080/download?file=" +
        this.currentSong.path;
    }
  },
};
</script>

<style scoped>
body {
  font-family: "Inter", sans-serif;
}
</style>
