<script setup lang="ts">
import {
  LMap,
  LTileLayer,
  LControl,
  LMarker,
  LIcon,
  LPopup,
  LTooltip,
} from "@vue-leaflet/vue-leaflet";
import L from "leaflet";
import { ref } from "vue";
import worldsjson from "../assets/worlds.json";
import mapsJson from "../assets/maps.json";
import namesPositionsJson from "../assets/namesPositions.json";

let mapPath = "/src/assets/map0/{z}/{x}/{y}.jpg";

/** 初期表示位置 */
const center = ref([-128, 128]);
/** ズーム */
const zoom = ref(2);
/** 最大ズーム */
const maxZoom = ref(3);
/** マーカー */
const marker = ref([0, 0]);
/** 地図 */
const tileProviders = ref([
  {
    name: "FF14",
    visible: true,
    url: mapPath,
    attribution: "©2010-2022 SQUARE ENIX CO., LTD. All Rights Reserved.",
  },
]);
const crs = ref(L.CRS.Simple);
/** ワールドID */
let worldId = 0;
/** 地図ID */
let mapId = 0;
/** 地図サイズ */
let mapSize = 409;
/** モブタイプ */
const mobType = ref("mob");

const datacenters = worldsjson.filter((item) => {
  if (item.id === 0) return true;
})[0]?.datacenters;

const worlds = datacenters.filter((item) => {
  if (item.id === 0) return true;
})[0]?.worlds;

const posX = ref("0.0");
const posY = ref("0.0");
const posLat = ref("0.0");
const posLng = ref("0.0");
const onMarkerDrag = (ev: { latlng: { lat: number; lng: number } }) => {
  posX.value = toFF14Pos(ev.latlng.lng);
  posLng.value = ev.latlng.lng.toString();
  posY.value = toFF14Pos(ev.latlng.lat * -1);
  posLat.value = ev.latlng.lat.toString();
};

/**
 * マップ一覧取得
 */
const maps = mapsJson
  .filter((item) => {
    if (item.class === 1) return true; // モブハン
    if (item.class === 3) return true; // モブハン＆トレハン
  })
  .sort((item1, item2) => {
    if (item1.displayOrder > item2.displayOrder) return 1;
    if (item1.displayOrder < item2.displayOrder) return -1;
    return 0;
  })
  .sort((item1, item2) => {
    if (item1.version < item2.version) return 1;
    if (item1.version > item2.version) return -1;
    return 0;
  });

/** エーテライト座標 */
const aetherytes = ref(
  namesPositionsJson.filter((item) => {
    if (item.mapId === mapId && item.class === "Aetheryte") return true;
  })
);

/** ポジション */
const riskyMobs = ref(
  new Array<{
    posX: number;
    posY: number;
    positionId: number;
    mobs: { class: string; name: string }[];
  }>()
);

/**
 * ワールド選択
 * @param id ワールドID
 */
const onSelectWorld = (id: number) => {
  console.log(id);
};

/**
 * マップ選択
 * @param id マップID
 */
const onSelectMap = (id: number) => {
  console.log("マップ選択: " + id);
  mapId = id;

  // 地図交換
  tileProviders.value[0].url = `/src/assets/map${id}/{z}/{x}/{y}.jpg`;
  // 地図サイズ取得
  mapSize = maps.filter((item) => {
    if (item.mapId === id) return true;
  })[0]?.mapSize;

  // エーテライト
  aetherytes.value = namesPositionsJson.filter((item) => {
    if (item.mapId === mapId && item.class === "Aetheryte") return true;
  });

  onSelectMobType();
};

/**
 * 座標算出
 * @param pos Leaflet座標
 */
const toFF14Pos = (pos: number): string => {
  const num = (Math.round((pos / 256) * mapSize + 10) / 10).toString();
  return num;
};

const toLatLng = (pos: number): number => {
  const num = ((pos - 10) / mapSize) * 256;
  return num;
};

/**
 * モブタイプ変更
 */
const onSelectMobType = () => {
  console.log(mobType.value);
  riskyMobs.value = new Array<{
    posX: number;
    posY: number;
    positionId: number;
    mobs: { class: string; name: string }[];
  }>();
  if (mobType.value === "mob") return;

  const namesPositions = namesPositionsJson.filter((item) => {
    if (
      item.mapId === mapId &&
      (item.class === "Mob_S" ||
        item.class === "Mob_A" ||
        item.class === "Mob_B")
    )
      return true;
  });
  console.log(namesPositionsJson);

  // 座標ベースにS, A, Bモブ再構築
  for (const namePosition of namesPositions) {
    for (const pos of namePosition.positions) {
      const position = riskyMobs.value.filter((item) => {
        if (item.positionId === pos.positionId) return true;
      })[0];
      const mob = { class: namePosition.class, name: namePosition.name_jp };
      if (position === undefined) {
        riskyMobs.value.push({
          posX: pos.posX,
          posY: pos.posY,
          positionId: pos.positionId,
          mobs: [mob],
        });
      } else {
        position.mobs.push(mob);
      }
    }
  }
};
// _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
onSelectMap(mapId);
</script>

<template>
  <div class="mapPane">
    <!--マップ-->
    <l-map
      :zoom="zoom"
      :maxZoom="maxZoom"
      :center="center"
      :crs="crs"
      :options="{
        zoomControl: false,
      }"
    >
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
      <!-- エーテライトマーカー -->
      <l-marker
        v-for="aetheryte in aetherytes"
        :lat-lng="{
          lat: Number(toLatLng(aetheryte.positions[0].posY) * -1),
          lng: Number(toLatLng(aetheryte.positions[0].posX)),
        }"
      >
        <l-icon :icon-size="[32, 32]" icon-url="/src/assets/aetheryte.png" />
        <l-tooltip :options="{ permanent: true, opacity: 0.8 }">
          {{ aetheryte.name_jp }}
        </l-tooltip>
      </l-marker>
      <!-- モブマーカー -->
      <l-marker
        v-for="riskyMob in riskyMobs"
        :lat-lng="{
          lat: Number(toLatLng(riskyMob.posY) * -1),
          lng: Number(toLatLng(riskyMob.posX)),
        }"
      >
        <l-popup>
          <div v-for="positionName in riskyMob.mobs">
            [{{ positionName.class }}]{{ positionName.name }}
          </div>
        </l-popup>
      </l-marker>
      <!-- 座標マーカー -->
      <l-marker
        :lat-lng="marker"
        :draggable="true"
        :zIndexOffset="0"
        v-on:drag="onMarkerDrag"
      ></l-marker>
      <!-- コントロール -->
      <l-control position="topright">
        <div>
          <label
            ><input
              type="radio"
              name="type"
              value="mob"
              v-on:change="onSelectMobType"
              v-model="mobType"
            />モブ手配書</label
          ><br />
          <label
            ><input
              type="radio"
              name="type"
              value="risky"
              v-on:change="onSelectMobType"
              v-model="mobType"
            />リスキーモブ</label
          >
        </div>
        <div class="panel">
          X: {{ posX }}<br />
          Y: {{ posY }}<br />
          Lng: {{ posLng }}<br />
          Lat {{ posLat }}
        </div>
      </l-control>
      <l-control position="bottomleft">
        <ul id="worlds">
          <li v-for="world in worlds">
            <button @click="onSelectWorld(world.id)">{{ world.name }}</button>
          </li>
        </ul>
        <ul id="maps">
          <li v-for="map in maps">
            <button @click="onSelectMap(map.mapId)">
              {{ map.mapName_jp }}
            </button>
          </li>
        </ul>
      </l-control>
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
#worlds,
#maps {
  margin: 0;
  padding: 0;
  overflow: auto;
  white-space: nowrap;
  /* border: 1px solid #000; */
}
#worlds li,
#maps li {
  display: inline-block;
}
</style>
