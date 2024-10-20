<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8"
  >
    <div class="max-w-6xl mx-auto">
      <h1
        class="text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500"
      >
        Fancy Music Player
      </h1>

      <!-- File upload -->
      <div class="mb-8">
        <label
          for="folder-upload"
          class="flex flex-col items-center px-4 py-6 bg-indigo-800 text-white rounded-lg shadow-lg tracking-wide uppercase border border-indigo-600 cursor-pointer hover:bg-indigo-700 hover:text-white"
        >
          <svg
            class="w-8 h-8"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"
            />
          </svg>
          <span class="mt-2 text-base leading-normal">Select a folder</span>
          <input
            id="folder-upload"
            type="file"
            webkitdirectory
            directory
            multiple
            @change="handleFolderUpload"
            class="hidden"
          />
        </label>
      </div>

      <!-- Player container -->
      <div class="bg-indigo-800 rounded-lg shadow-xl p-6 mb-8">
        <!-- Now Playing -->
        <div v-if="currentTrack" class="flex items-center mb-6">
          <img
            :src="currentTrack.cover || '/default-cover.jpg'"
            alt="Album Art"
            class="w-24 h-24 object-cover rounded-lg shadow-lg mr-6"
          />
          <div>
            <h2 class="text-2xl font-semibold">{{ currentTrack.title }}</h2>
            <p class="text-indigo-300">{{ currentTrack.artist }}</p>
            <p class="text-indigo-400">{{ currentTrack.album }}</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-4">
          <div class="bg-indigo-600 rounded-full h-2">
            <div
              class="bg-pink-500 rounded-full h-2"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-sm mt-1">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Audio controls -->
        <div class="flex justify-center items-center space-x-6 mb-6">
          <button @click="prevTrack" class="text-indigo-300 hover:text-white">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
              />
            </svg>
          </button>
          <button
            @click="togglePlayPause"
            class="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3"
          >
            <svg
              v-if="!isPlaying"
              class="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button @click="nextTrack" class="text-indigo-300 hover:text-white">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z"
              />
            </svg>
          </button>
        </div>

        <!-- Volume control -->
        <div class="flex items-center space-x-2">
          <svg
            class="w-5 h-5 text-indigo-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
              clip-rule="evenodd"
            />
          </svg>
          <input
            type="range"
            v-model="volume"
            min="0"
            max="1"
            step="0.01"
            class="w-full h-2 bg-indigo-600 rounded-lg cursor-pointer"
            @input="updateVolume"
          />
        </div>
      </div>

      <!-- Equalizer -->
      <div class="bg-indigo-800 rounded-lg shadow-xl p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Equalizer</h2>
        <div class="grid grid-cols-10 gap-4">
          <div
            v-for="(band, index) in equalizer"
            :key="index"
            class="flex flex-col items-center"
          >
            <input
              type="range"
              v-model="band.gain"
              min="-12"
              max="12"
              step="0.1"
              class="w-full h-32 appearance-none bg-indigo-600 rounded-lg orient-vertical"
              @input="updateEqualizer(index)"
            />
            <span class="mt-2 text-sm">{{ band.frequency }}Hz</span>
          </div>
        </div>
      </div>

      <!-- Room Effects -->
      <!-- <div class="bg-indigo-800 rounded-lg shadow-xl p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Room Effects</h2>
        <select
          v-model="selectedRoomEffect"
          @change="applyRoomEffect"
          class="bg-indigo-700 text-white px-4 py-2 rounded-lg w-full"
        >
          <option value="none">None</option>
          <option value="smallRoom">Small Room</option>
          <option value="mediumRoom">Medium Room</option>
          <option value="largeRoom">Large Room</option>
          <option value="studio">Studio</option>
          <option value="scene">Scene</option>
          <option value="lightScene">Light Scene</option>
        </select>
      </div> -->

      <!-- Playlist -->
      <div class="bg-indigo-800 rounded-lg shadow-xl p-6">
        <h2 class="text-2xl font-semibold mb-4">Playlist</h2>
        <ul class="space-y-2">
          <li
            v-for="(track, index) in playlist"
            :key="index"
            @click="playTrack(index)"
            class="flex items-center cursor-pointer hover:bg-indigo-700 p-2 rounded-lg transition duration-200"
          >
            <img
              :src="track.cover || '/default-cover.jpg'"
              alt="Album Art"
              class="w-12 h-12 object-cover rounded-lg mr-4"
            />
            <div>
              <p class="font-semibold">{{ track.title }}</p>
              <p class="text-sm text-indigo-300">
                {{ track.artist }} - {{ track.album }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Buffer } from "buffer";
import { ref, computed, onMounted, watch } from "vue";
import { parseBlob } from "music-metadata-browser";

const playlist = ref([]);
const currentTrackIndex = ref(0);
const isPlaying = ref(false);
const audioElement = ref(null);
const audioContext = ref(null);
const sourceNode = ref(null);
const gainNode = ref(null);
const equalizerNodes = ref([]);
const equalizer = ref([
  { frequency: 32, gain: 0 },
  { frequency: 64, gain: 0 },
  { frequency: 125, gain: 0 },
  { frequency: 250, gain: 0 },
  { frequency: 500, gain: 0 },
  { frequency: 1000, gain: 0 },
  { frequency: 2000, gain: 0 },
  { frequency: 4000, gain: 0 },
  { frequency: 8000, gain: 0 },
  { frequency: 16000, gain: 0 },
]);
const volume = ref(1);
const currentTime = ref(0);
const duration = ref(0);
const progress = computed(
  () => (currentTime.value / duration.value) * 100 || 0
);

const currentTrack = computed(
  () => playlist.value[currentTrackIndex.value] || null
);

onMounted(() => {
  audioElement.value = new Audio();
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
  sourceNode.value = audioContext.value.createMediaElementSource(
    audioElement.value
  );
  gainNode.value = audioContext.value.createGain();

  // Create equalizer nodes
  equalizer.value.forEach((band, index) => {
    const filter = audioContext.value.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = band.frequency;
    filter.gain.value = band.gain;
    filter.Q.value = 1;
    equalizerNodes.value.push(filter);
  });

  // Connect nodes
  sourceNode.value.connect(equalizerNodes.value[0]);
  for (let i = 0; i < equalizerNodes.value.length - 1; i++) {
    equalizerNodes.value[i].connect(equalizerNodes.value[i + 1]);
  }
  equalizerNodes.value[equalizerNodes.value.length - 1].connect(gainNode.value);
  gainNode.value.connect(audioContext.value.destination);

  audioElement.value.addEventListener("ended", nextTrack);
  audioElement.value.addEventListener("timeupdate", updateTime);
  audioElement.value.addEventListener("loadedmetadata", () => {
    duration.value = audioElement.value.duration;
    console.log("Audio metadata loaded. Duration:", duration.value);
  });
  audioElement.value.addEventListener("error", (e) => {
    console.error("Audio error:", e);
  });
});

const handleFolderUpload = async (event) => {
  const files = event.target.files;
  playlist.value = [];
  for (let file of files) {
    if (file.type.startsWith("audio/")) {
      const trackUrl = URL.createObjectURL(file);
      try {
        const metadata = await parseBlob(file);
        const picture = metadata.common.picture && metadata.common.picture[0];
        let coverUrl = null;
        if (picture) {
          const blob = new Blob([picture.data], { type: picture.format });
          coverUrl = URL.createObjectURL(blob);
        }
        playlist.value.push({
          src: trackUrl,
          title: metadata.common.title || file.name,
          artist: metadata.common.artist || "Unknown Artist",
          album: metadata.common.album || "Unknown Album",
          cover: coverUrl,
        });
        console.log(
          "Added track to playlist:",
          playlist.value[playlist.value.length - 1]
        );
      } catch (error) {
        console.error("Error reading metadata:", error);
        playlist.value.push({
          src: trackUrl,
          title: file.name,
          artist: "Unknown Artist",
          album: "Unknown Album",
          cover: null,
        });
      }
    }
  }
  if (playlist.value.length > 0) {
    console.log("Playlist populated. Playing first track.");
    playTrack(0);
  } else {
    console.warn("No valid audio files were found in the selected folder.");
  }
};

const playTrack = (index) => {
  if (index >= 0 && index < playlist.value.length) {
    currentTrackIndex.value = index;
    const track = playlist.value[index];
    console.log("Attempting to play track:", track.title);
    audioElement.value.src = track.src;
    audioElement.value
      .play()
      .then(() => {
        console.log("Playback started successfully");
        isPlaying.value = true;
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
        isPlaying.value = false;
      });
  }
};

const togglePlayPause = () => {
  if (audioElement.value.paused) {
    console.log("Resuming playback");
    audioElement.value
      .play()
      .then(() => {
        console.log("Playback resumed successfully");
        isPlaying.value = true;
      })
      .catch((error) => {
        console.error("Error resuming audio:", error);
        isPlaying.value = false;
      });
  } else {
    console.log("Pausing playback");
    audioElement.value.pause();
    isPlaying.value = false;
  }
};

const nextTrack = () => {
  console.log("Playing next track");
  playTrack((currentTrackIndex.value + 1) % playlist.value.length);
};

const prevTrack = () => {
  console.log("Playing previous track");
  playTrack(
    (currentTrackIndex.value - 1 + playlist.value.length) %
      playlist.value.length
  );
};

const updateEqualizer = (index) => {
  equalizerNodes.value[index].gain.setValueAtTime(
    equalizer.value[index].gain,
    audioContext.value.currentTime
  );
  console.log(`Equalizer band ${index} updated:`, equalizer.value[index].gain);
};

const updateVolume = () => {
  if (gainNode.value) {
    gainNode.value.gain.setValueAtTime(
      volume.value,
      audioContext.value.currentTime
    );
    console.log("Volume updated:", volume.value);
  }
};

const updateTime = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
  }
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

watch(isPlaying, (newValue) => {
  console.log("isPlaying changed:", newValue);
  if (newValue && audioContext.value.state === "suspended") {
    audioContext.value.resume();
  }
});
</script>
<style scoped>
input[type="range"] {
  -webkit-appearance: slider-vertical;
  appearance: slider-vertical;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #ec4899;
  cursor: pointer;
  border-radius: 50%;
}
input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #ec4899;
  cursor: pointer;
  border-radius: 50%;
}
</style>