<template>
    <NuxtLink
        :to="`/realms/${realm.slug}`"
        class="flex items-center gap-4 p-4 bg-base-200/50 hover:bg-base-200 rounded-2xl transition-colors group"
    >
        <!-- Realm Picture -->
        <div class="shrink-0">
            <div v-if="pictureUrl" class="avatar">
                <div class="w-16 h-16 rounded-2xl">
                    <img :src="pictureUrl" :alt="realm.name" class="object-cover" />
                </div>
            </div>
            <div v-else class="avatar avatar-placeholder">
                <div
                    class="w-16 h-16 rounded-2xl bg-primary text-primary-content flex items-center justify-center text-xl font-bold"
                >
                    {{ realm.name.charAt(0).toUpperCase() }}
                </div>
            </div>
        </div>

        <!-- Realm Info -->
        <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
                <h3 class="font-bold truncate">{{ realm.name }}</h3>
                <span
                    v-if="!realm.isPublic"
                    class="badge badge-sm badge-ghost gap-1"
                >
                    <IconLock class="w-3 h-3" />
                    Private
                </span>
            </div>
            <p
                v-if="realm.description"
                class="text-sm text-base-content/60 truncate"
            >
                {{ realm.description }}
            </p>
            <div class="flex items-center gap-3 mt-1 text-xs text-base-content/50">
                <span v-if="realm.boostLevel > 0" class="flex items-center gap-1">
                    <IconRocket class="w-3 h-3 text-primary" />
                    Lv {{ realm.boostLevel }}
                </span>
            </div>
        </div>

        <!-- Arrow -->
        <IconChevronRight
            class="w-5 h-5 text-base-content/30 group-hover:text-base-content/60 transition-colors"
        />
    </NuxtLink>
</template>

<script setup lang="ts">
import type { Realm } from "~/types/realm";
import { getFileUrl } from "~/utils/files";

interface Props {
    realm: Realm;
}

const props = defineProps<Props>();

const pictureUrl = computed(() => getFileUrl(props.realm.picture?.id));
</script>
