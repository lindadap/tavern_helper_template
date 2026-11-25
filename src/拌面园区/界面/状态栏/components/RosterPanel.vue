<script setup lang="ts">
import { computed, ref } from 'vue';
import { ROSTER_SOFT_CAP, type RosterMember } from '../../../schema';
import { resolveImpressionColorHex } from '../../../heteromorph-pool';
import type { ArchivedRosterMember, RosterArchiveMap } from '../roster-archive';

const props = defineProps<{
  roster: Record<string, RosterMember>;
  archive: RosterArchiveMap;
  busy: boolean;
  canEdit: boolean;
  notice: string;
}>();

const emit = defineEmits<{
  'archive-member': [name: string];
  'recall-member': [name: string];
}>();

const expanded = ref(false);
const activeTab = ref<'active' | 'archive'>('active');
const confirmingArchive = ref<string | null>(null);

const activeEntries = computed(() => Object.entries(props.roster));
const archiveEntries = computed<[string, ArchivedRosterMember][]>(() => Object.entries(props.archive));
const activeCount = computed(() => activeEntries.value.length);
const archiveCount = computed(() => archiveEntries.value.length);
const isParkFull = computed(() => activeCount.value >= ROSTER_SOFT_CAP);

function toggleExpand() {
  expanded.value = !expanded.value;
  confirmingArchive.value = null;
}

function firstChar(name: string): string {
  const chars = Array.from(name.trim());
  return chars[0] ?? '异';
}

function emblemStyle(colorName: string) {
  const hex = resolveImpressionColorHex(colorName);
  return {
    '--emblem-color': hex,
  };
}

function requestArchive(name: string) {
  if (props.busy || !props.canEdit) return;
  confirmingArchive.value = name;
}

function confirmArchive(name: string) {
  confirmingArchive.value = null;
  emit('archive-member', name);
}

function requestRecall(name: string) {
  if (props.busy || !props.canEdit || isParkFull.value) return;
  emit('recall-member', name);
}
</script>

<template>
  <section class="roster-section" aria-label="园区名册">
    <button
      type="button"
      class="roster-toggle"
      :aria-expanded="expanded"
      @click="toggleExpand"
    >
      <span class="toggle-left">
        <svg class="roster-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="3.5" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.5a3.5 3.5 0 0 1 0 6.8" />
        </svg>
        <span class="toggle-title">园区异种娘名册</span>
        <span class="count-chip">在园 {{ activeCount }}/{{ ROSTER_SOFT_CAP }}</span>
        <span v-if="archiveCount > 0" class="count-chip chip-muted">外派 {{ archiveCount }}</span>
      </span>

      <span class="toggle-right">
        <span class="toggle-hint">{{ expanded ? '收起' : '展开' }}</span>
        <svg class="chevron-icon" :class="{ 'is-open': expanded }" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </button>

    <div v-if="expanded" class="roster-body">
      <div v-if="archiveCount > 0" class="roster-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="tab-btn"
          :class="{ 'is-active': activeTab === 'active' }"
          :aria-selected="activeTab === 'active'"
          @click="activeTab = 'active'"
        >
          在园成员 ({{ activeCount }})
        </button>
        <button
          type="button"
          role="tab"
          class="tab-btn"
          :class="{ 'is-active': activeTab === 'archive' }"
          :aria-selected="activeTab === 'archive'"
          @click="activeTab = 'archive'"
        >
          已外派 · 可召回 ({{ archiveCount }})
        </button>
      </div>

      <p v-if="notice" class="roster-notice" role="status">{{ notice }}</p>

      <div v-if="activeTab === 'active' || archiveCount === 0" class="member-list">
        <p v-if="activeEntries.length === 0" class="empty-tip">
          当前暂无其他在园异种娘。
        </p>

        <article
          v-for="[name, member] in activeEntries"
          :key="name"
          class="member-card"
        >
          <div class="emblem" :style="emblemStyle(member.印象颜色)" aria-hidden="true">
            {{ firstChar(name) }}
          </div>

          <div class="member-main">
            <div class="member-head">
              <div class="name-row">
                <strong class="member-name">{{ name }}</strong>
                <span class="meta-chip">{{ member.种族 }}</span>
                <span class="meta-chip chip-loc">{{ member.位置 }}</span>
              </div>

              <div v-if="canEdit" class="member-ops">
                <template v-if="confirmingArchive === name">
                  <button type="button" class="op-btn op-confirm" :disabled="busy" @click="confirmArchive(name)">确认外派</button>
                  <button type="button" class="op-btn" @click="confirmingArchive = null">取消</button>
                </template>
                <button v-else type="button" class="op-btn" :disabled="busy" @click="requestArchive(name)">外派归档</button>
              </div>
            </div>

            <p class="member-brief">{{ member.简介 }}</p>

            <p class="member-traits">
              <span>{{ member.性格 }}</span>
              <span class="sep">·</span>
              <span>{{ member.外貌 }}</span>
              <span class="sep">·</span>
              <span>{{ member.印象颜色 }}</span>
              <span class="sep">·</span>
              <span>{{ member.服装风格 }}</span>
            </p>

            <div class="stat-pills">
              <span class="stat-pill pill-obedience">
                驯服 · {{ member.$驯服阶段 }} {{ member.服从度 }}
              </span>
              <span class="stat-pill pill-trust">
                信任 · {{ member.$信任阶段 }} {{ member.好感度 }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="member-list">
        <article
          v-for="[name, member] in archiveEntries"
          :key="name"
          class="member-card is-archived"
        >
          <div class="emblem" :style="emblemStyle(member.印象颜色)" aria-hidden="true">
            {{ firstChar(name) }}
          </div>

          <div class="member-main">
            <div class="member-head">
              <div class="name-row">
                <strong class="member-name">{{ name }}</strong>
                <span class="meta-chip">{{ member.种族 }}</span>
                <span class="meta-chip">第{{ member.archivedDay }}天外派</span>
              </div>

              <button
                type="button"
                class="op-btn op-recall"
                :disabled="busy || !canEdit || isParkFull"
                @click="requestRecall(name)"
              >
                {{ isParkFull ? '在园已满' : '召回园区' }}
              </button>
            </div>

            <p class="member-brief">{{ member.简介 }}</p>

            <p class="member-traits">
              <span>{{ member.性格 }}</span>
              <span class="sep">·</span>
              <span>{{ member.印象颜色 }}</span>
              <span class="sep">·</span>
              <span>{{ member.服装风格 }}</span>
            </p>

            <div class="stat-pills">
              <span class="stat-pill pill-obedience">
                驯服 · {{ member.$驯服阶段 }} {{ member.服从度 }}
              </span>
              <span class="stat-pill pill-trust">
                信任 · {{ member.$信任阶段 }} {{ member.好感度 }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.roster-section {
  position: relative;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--c-border-glass);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.roster-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px solid var(--c-border-glass);
  background: linear-gradient(150deg, var(--c-surface-strong), var(--c-surface));
  color: var(--c-text-primary);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.16s ease;
}

.roster-toggle:hover {
  border-color: color-mix(in srgb, var(--c-stage) 58%, var(--c-border-glass));
  transform: translateY(-1px);
}

.toggle-left,
.toggle-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.roster-icon,
.chevron-icon {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

.roster-icon {
  width: 15px;
  height: 15px;
  color: var(--c-stage);
}

.toggle-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  white-space: nowrap;
}

.count-chip {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  background: color-mix(in srgb, var(--c-stage) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-stage) 42%, transparent);
  color: var(--c-text-primary);
  white-space: nowrap;
}

.chip-muted {
  background: color-mix(in srgb, var(--c-surface) 80%, transparent);
  border-color: var(--c-border-glass);
  color: var(--c-text-muted);
}

.toggle-hint {
  font-size: 11.5px;
  color: var(--c-text-muted);
}

.chevron-icon {
  width: 14px;
  height: 14px;
  color: var(--c-text-muted);
  transition: transform 0.2s ease;
}

.chevron-icon.is-open {
  transform: rotate(90deg);
}

.roster-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.roster-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.tab-btn {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid var(--c-border-glass);
  background: var(--c-surface);
  color: var(--c-text-muted);
  font: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

.tab-btn.is-active {
  background: color-mix(in srgb, var(--c-stage) 18%, var(--c-surface-strong));
  border-color: color-mix(in srgb, var(--c-stage) 55%, var(--c-border-glass));
  color: var(--c-text-primary);
}

.roster-notice {
  margin: 0;
  font-size: 11.5px;
  color: var(--c-stage);
  padding: 0 2px;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-tip {
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed var(--c-border-glass);
  font-size: 12px;
  color: var(--c-text-muted);
  text-align: center;
}

.member-card {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 10px;
  padding: 10px 11px;
  border-radius: 12px;
  border: 1px solid var(--c-border-glass);
  background: linear-gradient(155deg, var(--c-surface-strong), var(--c-surface));
  align-items: start;
}

.member-card.is-archived {
  border-style: dashed;
}

.emblem {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(
    145deg,
    var(--emblem-color, #6d94c5),
    color-mix(in srgb, var(--emblem-color, #6d94c5) 68%, #101538)
  );
  border: 1px solid color-mix(in srgb, var(--emblem-color, #6d94c5) 65%, #ffffff);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--emblem-color, #6d94c5) 35%, transparent);
  user-select: none;
}

.member-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.member-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}

.name-row {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  min-width: 0;
}

.member-name {
  font-size: 13.5px;
  color: var(--c-text-primary);
}

.meta-chip {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  color: var(--c-text-muted);
  border: 1px solid var(--c-border-glass);
  background: color-mix(in srgb, var(--c-surface) 85%, transparent);
  white-space: nowrap;
}

.chip-loc {
  color: var(--c-text-primary);
  border-color: color-mix(in srgb, var(--c-accent) 45%, var(--c-border-glass));
}

.member-ops {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.op-btn {
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid var(--c-border-glass);
  background: var(--c-surface-strong);
  color: var(--c-text-muted);
  font: inherit;
  font-size: 10.5px;
  cursor: pointer;
  white-space: nowrap;
}

.op-btn:hover:not(:disabled) {
  color: var(--c-text-primary);
  border-color: color-mix(in srgb, var(--c-accent) 55%, var(--c-border-glass));
}

.op-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.op-confirm,
.op-recall {
  background: linear-gradient(100deg, var(--c-primary), var(--c-stage));
  border-color: transparent;
  color: #ffffff;
  font-weight: 600;
}

.member-brief {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--c-text-primary);
  overflow-wrap: anywhere;
}

.member-traits {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--c-text-muted);
  overflow-wrap: anywhere;
}

.sep {
  margin: 0 4px;
  opacity: 0.6;
}

.stat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.stat-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}

.pill-obedience {
  background: color-mix(in srgb, var(--c-primary) 18%, var(--c-surface-strong));
  border: 1px solid color-mix(in srgb, var(--c-primary) 48%, transparent);
  color: var(--c-text-primary);
}

.pill-trust {
  background: color-mix(in srgb, var(--c-stage) 16%, var(--c-surface-strong));
  border: 1px solid color-mix(in srgb, var(--c-stage) 48%, transparent);
  color: var(--c-text-primary);
}

@media (max-width: 390px) {
  .member-card {
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 8px;
    padding: 8px 9px;
  }

  .emblem {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>
