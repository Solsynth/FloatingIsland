<template>
    <NuxtLink
        :to="`/realms/${realm.slug}`"
        class="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-base-200/50 hover:bg-base-200 rounded-xl sm:rounded-2xl transition-colors group"
    >
        <!-- Realm Picture -->
        <div class="shrink-0">
            <div v-if="pictureUrl" class="avatar">
                <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl">
                    <img :src="pictureUrl" :alt="realm.name" class="object-cover w-full h-full" >
                </div>
            </div>
            <div v-else class="avatar avatar-placeholder">
                <div
                    class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary text-primary-content flex items-center justify-center text-lg sm:text-xl font-bold"
                >
                    {{ realm.name.charAt(0).toUpperCase() }}
                </div>
            </div>
        </div>

        <!-- Realm Info -->
        <div class="min-w-0 flex-1 overflow-hidden">
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <h3 class="font-bold text-sm sm:text-base truncate">{{ realm.name }}</h3>
                <span
                    v-if="!realm.isPublic"
                    class="badge badge-xs sm:badge-sm badge-ghost gap-1 self-start sm:self-auto"
                >
                    <IconLock class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span class="hidden sm:inline">Private</span>
                </span>
                <span
                    v-if="realm.boostLevel > 0"
                    class="badge badge-xs sm:badge-sm badge-primary gap-1 self-start sm:self-auto"
                >
                    <IconRocket class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Lv {{ realm.boostLevel }}
                </span>
            </div>
            <p
                v-if="realm.description"
                class="text-xs sm:text-sm text-base-content/60 line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1"
            >
                {{ realm.description }}
            </p>
        </div>

        <!-- Arrow -->
        <IconChevronRight
            class="w-4 h-4 sm:w-5 sm:h-5 text-base-content/30 group-hover:text-base-content/60 transition-colors shrink-0 mt-1 sm:mt-0"
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
