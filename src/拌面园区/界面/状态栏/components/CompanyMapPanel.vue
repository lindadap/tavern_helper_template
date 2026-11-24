<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DEFAULT_LOCATION, isCompanyLocation, type CompanyLocation } from '../../../schema';
import { COMPANY_FLOORS, COMPANY_ROOM_MAP, type MapOccupant, type RoomIconKey } from '../map-data';

const props = defineProps<{
  playerLocation: string;
  occupants: MapOccupant[];
  busy: boolean;
  notice: string;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  'move-player': [location: CompanyLocation];
}>();

function resolveInitialSelected(loc: string): CompanyLocation {
  return isCompanyLocation(loc) ? loc : DEFAULT_LOCATION;
}

const selectedId = ref<CompanyLocation>(resolveInitialSelected(props.playerLocation));

watch(
  () => props.playerLocation,
  next => {
    if (isCompanyLocation(next)) {
      selectedId.value = next;
    }
  },
);

const occupantsByRoom = computed(() => {
  const map: Record<string, MapOccupant[]> = {};
  for (const occ of props.occupants) {
    const key = occ.location;
    if (!map[key]) map[key] = [];
    map[key].push(occ);
  }
  return map;
});

const outdoorOccupants = computed(() =>
  props.occupants.filter(occ => !isCompanyLocation(occ.location)),
);

const selectedRoom = computed(() => COMPANY_ROOM_MAP[selectedId.value]);
const selectedOccupants = computed(() => occupantsByRoom.value[selectedId.value] ?? []);
const playerAtSelected = computed(() => props.playerLocation === selectedId.value);

function occupantsIn(roomId: CompanyLocation) {
  return occupantsByRoom.value[roomId] ?? [];
}

function hasPlayer(roomId: CompanyLocation) {
  return props.playerLocation === roomId;
}

function hasNpc(roomId: CompanyLocation) {
  return occupantsIn(roomId).some(occ => occ.kind === 'npc');
}

function selectRoom(roomId: CompanyLocation) {
  selectedId.value = roomId;
}

function moveToSelected() {
  if (props.busy || !props.canEdit || playerAtSelected.value) return;
  emit('move-player', selectedId.value);
}

function iconPaths(icon: RoomIconKey): string[] {
  switch (icon) {
    case 'office':
      return ['M4 19h16', 'M6 19V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12', 'M9 10h6', 'M9 14h4'];
    case 'bedroom':
      return ['M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5', 'M3 15h18', 'M7 11V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2'];
    case 'dorm':
      return ['M4 11l8-6 8 6', 'M6 10v9h12v-9', 'M10 19v-5h4v5'];
    case 'desk':
      return ['M3 10h18', 'M5 10v9', 'M19 10v9', 'M8 6h8v4H8z'];
    case 'dining':
      return ['M6 4v7a2 2 0 0 0 2 2v7', 'M9 4v4', 'M16 4v16', 'M16 4c2.2 0 3 2 3 4.5S18.2 13 16 13'];
    case 'medical':
      return ['M12 6v12', 'M6 12h12', 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z'];
    case 'arena':
      return ['M12 3l8 4v6c0 4.5-3.2 7.2-8 8-4.8-.8-8-3.5-8-8V7l8-4z', 'M9 12l2 2 4-4'];
  }
}
</script>

<template>
  <section class="map-section" aria-label="园区室内平面图">
    <div class="map-header">
      <div class="map-title-group">
        <svg class="title-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
          <path d="M9 4v14" />
          <path d="M15 6v14" />
        </svg>
        <span class="map-title">园区平面图</span>
      </div>
      <div class="map-actions">
        <span class="legend-item">
          <i class="dot dot-player" aria-hidden="true"></i>
          你
        </span>
        <span class="legend-item">
          <i class="dot dot-npc" aria-hidden="true"></i>
          异种娘
        </span>
      </div>
    </div>

    <div class="floor-stack">
      <div v-for="floor in COMPANY_FLOORS" :key="floor.code" class="floor-row">
        <div class="floor-rail" :class="{ 'is-basement': floor.code === 'B1', 'is-top': floor.code === '3F' }">
          <span class="floor-code">{{ floor.code }}</span>
        </div>

        <div class="room-grid" :class="`cols-${floor.columns}`">
          <button
            v-for="room in floor.rooms"
            :key="room.id"
            type="button"
            class="room-tile"
            :class="{
              'is-selected': selectedId === room.id,
              'is-player': hasPlayer(room.id),
              'is-together': hasPlayer(room.id) && hasNpc(room.id),
              'has-image': Boolean(room.imageUrl),
            }"
            :style="room.imageUrl ? { backgroundImage: `url(${room.imageUrl})` } : undefined"
            @click="selectRoom(room.id)"
          >
            <span v-if="room.imageUrl" class="tile-scrim" aria-hidden="true"></span>
            <div class="tile-top">
              <svg class="room-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path v-for="(d, idx) in iconPaths(room.icon)" :key="idx" :d="d" />
              </svg>
              <span class="room-name">{{ room.shortTitle }}</span>
            </div>

            <div class="tile-occupants">
              <span
                v-for="occ in occupantsIn(room.id)"
                :key="occ.id"
                class="occ-pill"
                :class="occ.kind === 'player' ? 'occ-player' : 'occ-npc'"
              >
                <i class="pill-dot" aria-hidden="true"></i>
                {{ occ.name }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div v-if="outdoorOccupants.length > 0" class="outdoor-bar">
      <span class="outdoor-label">外出中</span>
      <div class="outdoor-list">
        <span v-for="occ in outdoorOccupants" :key="occ.id" class="outdoor-chip">
          {{ occ.name }} · {{ occ.location }}
        </span>
      </div>
    </div>

    <div class="room-detail card">
      <div
        v-if="selectedRoom.imageUrl"
        class="detail-banner"
        :style="{ backgroundImage: `url(${selectedRoom.imageUrl})` }"
      ></div>

      <div class="detail-head">
        <div class="detail-title-wrap">
          <span class="detail-floor">{{ selectedRoom.floor }}</span>
          <strong class="detail-name">{{ selectedRoom.shortTitle }}</strong>
        </div>
        <div class="detail-who">
          <template v-if="selectedOccupants.length > 0">
            <span
              v-for="occ in selectedOccupants"
              :key="occ.id"
              class="occ-pill"
              :class="occ.kind === 'player' ? 'occ-player' : 'occ-npc'"
            >
              <i class="pill-dot" aria-hidden="true"></i>
              {{ occ.name }}
            </span>
          </template>
          <span v-else class="detail-empty">暂无人员</span>
        </div>
      </div>

      <p class="detail-desc">{{ selectedRoom.description }}</p>

      <div class="detail-footer">
        <span class="detail-notice" role="status">
          {{ notice || (!canEdit ? '历史楼层仅供查看' : '') }}
        </span>
        <button
          type="button"
          class="move-btn"
          :class="{ 'is-here': playerAtSelected }"
          :disabled="busy || !canEdit || playerAtSelected"
          @click="moveToSelected"
        >
          {{ playerAtSelected ? '当前在此' : busy ? '移动中…' : '前往此处' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.map-section {
  position: relative;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--c-border-glass);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.map-title-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.title-icon,
.room-icon {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

.title-icon {
  width: 15px;
  height: 15px;
  color: var(--c-stage);
}

.map-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--c-text-primary);
}

.map-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--c-text-muted);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.dot-player {
  background: var(--c-primary);
  box-shadow: 0 0 6px color-mix(in srgb, var(--c-primary) 75%, transparent);
}

.dot-npc {
  background: var(--c-stage);
  box-shadow: 0 0 6px color-mix(in srgb, var(--c-stage) 75%, transparent);
}

.floor-stack {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.floor-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 7px;
  align-items: stretch;
}

.floor-rail {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--c-border-glass);
  background: color-mix(in srgb, var(--c-surface) 88%, transparent);
  color: var(--c-text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  user-select: none;
}

.floor-rail.is-top {
  color: var(--c-primary);
  border-color: color-mix(in srgb, var(--c-primary) 42%, var(--c-border-glass));
}

.floor-rail.is-basement {
  color: var(--c-accent);
  border-color: color-mix(in srgb, var(--c-accent) 42%, var(--c-border-glass));
}

.room-grid {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.room-grid.cols-1 {
  grid-template-columns: minmax(0, 1fr);
}

.room-grid.cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.room-grid.cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.room-tile {
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 58px;
  padding: 8px 9px;
  border-radius: 12px;
  border: 1px solid var(--c-border-glass);
  background:
    linear-gradient(155deg, var(--c-surface-strong), var(--c-surface));
  background-size: cover;
  background-position: center;
  color: var(--c-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  transition: border-color 0.2s ease, transform 0.16s ease, box-shadow 0.2s ease;
}

.room-tile:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--c-accent) 60%, var(--c-border-glass));
}

.room-tile.is-player {
  border-color: color-mix(in srgb, var(--c-primary) 68%, var(--c-border-glass));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c-primary) 26%, transparent);
}

.room-tile.is-together {
  border-color: color-mix(in srgb, var(--c-stage) 78%, var(--c-primary));
  box-shadow:
    0 0 14px color-mix(in srgb, var(--c-stage) 24%, transparent),
    inset 0 0 0 1px color-mix(in srgb, var(--c-stage) 32%, transparent);
}

.room-tile.is-selected {
  outline: 2px solid color-mix(in srgb, var(--c-accent) 85%, transparent);
  outline-offset: 1px;
}

.tile-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12, 18, 36, 0.35), rgba(12, 18, 36, 0.72));
  pointer-events: none;
}

.room-tile.has-image .room-name,
.room-tile.has-image .room-icon {
  color: #f8fbff;
}

.tile-top,
.tile-occupants {
  position: relative;
  z-index: 1;
}

.tile-top {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.room-icon {
  width: 13px;
  height: 13px;
  color: var(--c-text-muted);
}

.room-name {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--c-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile-occupants {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 18px;
  align-items: center;
}

.occ-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.pill-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.occ-player {
  background: color-mix(in srgb, var(--c-primary) 22%, var(--c-surface-strong));
  border: 1px solid color-mix(in srgb, var(--c-primary) 58%, transparent);
  color: var(--c-text-primary);
}

.occ-npc {
  background: color-mix(in srgb, var(--c-stage) 18%, var(--c-surface-strong));
  border: 1px solid color-mix(in srgb, var(--c-stage) 58%, transparent);
  color: var(--c-text-primary);
}

.outdoor-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px dashed var(--c-border-glass);
  background: color-mix(in srgb, var(--c-surface) 80%, transparent);
  font-size: 11.5px;
}

.outdoor-label {
  color: var(--c-text-muted);
  font-weight: 600;
  flex-shrink: 0;
}

.outdoor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.outdoor-chip {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--c-border-glass);
  background: var(--c-surface-strong);
  color: var(--c-text-primary);
}

.room-detail {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.detail-banner {
  height: 88px;
  border-radius: 9px;
  background-size: cover;
  background-position: center;
  border: 1px solid var(--c-border-glass);
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.detail-floor {
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  background: color-mix(in srgb, var(--c-stage) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-stage) 42%, transparent);
  color: var(--c-stage);
}

.detail-name {
  font-size: 13px;
  color: var(--c-text-primary);
}

.detail-who {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.detail-empty {
  font-size: 11px;
  color: var(--c-text-muted);
}

.detail-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--c-text-muted);
}

.detail-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.detail-notice {
  font-size: 11.5px;
  color: var(--c-text-muted);
  min-height: 16px;
}

.move-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-primary) 50%, var(--c-border-glass));
  background: linear-gradient(100deg, var(--c-primary), var(--c-stage));
  color: #ffffff;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.move-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.move-btn.is-here,
.move-btn:disabled {
  background: var(--c-surface-strong);
  border-color: var(--c-border-glass);
  color: var(--c-text-muted);
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 390px) {
  .floor-row {
    grid-template-columns: 26px minmax(0, 1fr);
    gap: 5px;
  }

  .room-grid {
    gap: 5px;
  }

  .room-tile {
    padding: 7px 6px;
    min-height: 54px;
  }

  .room-name {
    font-size: 11px;
  }

  .occ-pill {
    padding: 1px 5px;
    font-size: 10px;
  }
}
</style>
