<template>
  <div class="p-6 bg-teal-500 min-h-screen text-white">
    <h1 class="text-3xl font-bold mb-6 text-center">
      Ethereal tunes <br />
      <input
        type="text"
        v-model="serverAddress"
        placeholder="Server Address"
        class="text-black text-sm p-2 border-[2px] rounded-md outline-none border-[#00ffccee] placeholder:text-gray-300 placeholder:text-md"
      />
      <!-- 
      <input
        type="text"
        @input="updateFolder"
        placeholder="Enter a folder"
        class="text-black text-sm p-2 border-[2px] rounded-md outline-none border-[#00ffccee] placeholder:text-gray-300 placeholder:text-md"
      /> -->
      <button
        class="text-white bg-blue-800 p-3 rounded-md border-[5px] border-blue-600 m-2 text-sm"
        @click="fetchData"
      >
        Fetch
      </button>
    </h1>
    <input
      type="range"
      class="w-full"
      step="0.01"
      v-model="volume"
      min="0"
      @input="updateVolume"
      max="1"
    />
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
    {{ currentSong }}

    <p>{{ Math.round(Number(volume) * 100) }} dB</p>
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
    <div class="flex flex-row place-content-center">
      <ul class="space-y-4 h-[500px] w-full mx-5 overflow-y-auto">
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
              {{
                item.lastModified ? formatDate(item.lastModified) : "Unknown"
              }}
            </p>
          </div>
          <span
            v-if="item.type === 'file'"
            class="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-lg"
          >
            File Size: {{ formatSize(item.size) }}
          </span>
        </li>
        <div
          class="flex flex-col justify-center h-full text-center"
          v-if="playlist.length == 0"
        >
          <p class="text-xl font-serif font-bold">No Songs Found</p>
        </div>
      </ul>
      <div class="space-y-4 w-full h-[500px] overflow-y-scroll">
        <p
          class="border shadow-md border-white hover:bg-white hover:text-black cursor-pointer p-2 rounded-md"
          v-for="(folder, i) in folders"
          :key="i"
          @click="openFolder(folder)"
        >
          <b class="text-lg font-bold">{{ folder.name }}</b
          ><br />
          <span class="text-md">{{ folder.path }}</span>
        </p>
      </div>
    </div>
    <audio ref="audioPlayer" src="" id="audio"></audio>
  </div>
</template>

<script>
import player from "./player/player.vue";

export default {
  ssr: false,
  components: { player },
  data() {
    return {
      // player: document.getElementById("audio"),
      items: [],
      playlist: [],
      folders: [],
      currentSong: null,
      isPlaying: false,
      songProgress: 0,
      volume: 0.17,
      search: "",
      pathURL:
        localStorage.getItem("path") == null
          ? "/storage/emulated/0"
          : localStorage.getItem("path"),
      folderName: "/Music/04 April",
      serverAddress: "",
    };
  },
  created() {
    this.playlist.filter((song) => song.name === search);
  },
  methods: {
    async openFolder(data) {
      this.pathURL = data.path;
      localStorage.setItem("path", data.path);
      this.folderName = data.name;
      this.fetchData();
    },
    fetchData() {
      localStorage.setItem("address", this.serverAddress);
      this.fetchSongs();
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    updateVolume(volume) {
      this.volume = volume.target.value;
      localStorage.setItem("volume", this.volume);
      this.$refs.audioPlayer.volume = this.volume;
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
          "http://" + this.serverAddress + ":8080?path=" + this.pathURL
        );
        const data = await response.json();
        this.items = data.items;
        this.playlist = data.items.filter(
          (predicate) =>
            predicate.type === "file" && predicate.extension === ".mp3"
        ); // Add fetched songs to playlist
        this.folders = data.items.filter(
          (predicate) => predicate.type == "directory"
        );
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    },
  },
  mounted() {
    this.serverAddress =
      localStorage.getItem("address") == null
        ? "192.168.7.221"
        : localStorage.getItem("address");
    // retrive volume
    this.volume =
      localStorage.getItem("volume") == null
        ? 0.17
        : localStorage.getItem("volume");
    this.fetchSongs();
    navigator.mediaSession.setActionHandler("nexttrack", this.nextSong);
    navigator.mediaSession.setActionHandler("previoustrack", this.nextSong);

    this.$refs.audioPlayer.volume = this.volume;
    // if song ended start a new song
    this.$refs.audioPlayer.onended = () => {
      this.nextSong();
    };
  },
};
</script>

<style scoped>
body {
  font-family: "Inter", sans-serif;
}
</style>
