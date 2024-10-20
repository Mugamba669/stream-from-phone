<template>
  <div class="min-h-screen">
    <ClientOnly>
      <Playlist />
    </ClientOnly>
  </div>
</template>

<script setup>
import MusicPlayer from "~/components/MusicPlayer.vue";
import Playlist from "./components/playlist.vue";
</script>