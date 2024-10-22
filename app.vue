<template>
  <div class="min-h-screen">
    <ClientOnly>
      <Playlist />
    </ClientOnly>
  </div>
</template>

<script setup>
import Playlist from "./components/playlist.vue";
</script>