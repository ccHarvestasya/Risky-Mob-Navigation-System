<script setup lang="ts">
import {
  LMap,
  LTileLayer,
  LControlLayers,
  LMarker,
} from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";

const center = ref([35.681, 139.763]);
const zoom = ref(14);
const marker = ref([35.681, 139.763]);
const tileProviders = ref([
  {
    name: "OpenStreetMap",
    visible: true,
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    name: "OpenStreetMap CyclOSM",
    visible: false,
    url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
]);
</script>

<template>
  <div class="mapPane">
    <!--マップ-->
    <l-map :zoom="zoom" :center="center">
      <!--レイヤーコントロール-->
      <l-control-layers position="topright"></l-control-layers>
      <!--レイヤ設定-->
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        layer-type="base"
      ></l-tile-layer>
      <!--マーカー-->
      <l-marker :lat-lng="marker"></l-marker>
    </l-map>
  </div>
</template>

<style scoped>
.mapPane {
  height: 100vh;
  width: 100vw;
  margin: 0;
  text-align: left;
}
</style>
