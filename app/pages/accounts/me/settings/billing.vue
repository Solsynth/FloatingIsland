<template>
    <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Billing & Subscription</h1>

        <!-- Current Plan -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Current Plan</h2>

                <div class="p-4 bg-base-200 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <p class="text-lg font-bold">Free Plan</p>
                            <p class="text-sm text-base-content/60">Basic features</p>
                        </div>
                        <span class="badge badge-neutral">Active</span>
                    </div>
                    <div class="text-sm text-base-content/60">
                        <p>• 1,000 posts per month</p>
                        <p>• 5GB storage</p>
                        <p>• Basic analytics</p>
                    </div>
                </div>

                <NuxtLink to="/pricing" class="btn btn-primary w-fit">
                    <IconCreditCard class="w-4 h-4" />
                    Upgrade Plan
                </NuxtLink>
            </div>
        </div>

        <!-- Payment Methods -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Payment Methods</h2>

                <div v-if="paymentMethods.length === 0" class="text-center py-8 text-base-content/60">
                    <IconCreditCard class="w-8 h-8 mx-auto mb-2" />
                    <p>No payment methods added</p>
                </div>

                <div v-else class="space-y-2">
                    <div
                        v-for="method in paymentMethods"
                        :key="method.id"
                        class="flex items-center justify-between p-3 bg-base-200 rounded-xl"
                    >
                        <div class="flex items-center gap-3">
                            <IconCreditCard class="w-5 h-5 text-base-content/60" />
                            <div>
                                <p class="font-medium">•••• {{ method.last4 }}</p>
                                <p class="text-xs text-base-content/60">Expires {{ method.expMonth }}/{{ method.expYear }}</p>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-ghost text-error" @click="removePaymentMethod(method.id)">
                            <IconTrash class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <button class="btn btn-outline w-fit" @click="addPaymentMethod">
                    <IconPlus class="w-4 h-4" />
                    Add Payment Method
                </button>
            </div>
        </div>

        <!-- Billing History -->
        <div class="card">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Billing History</h2>

                <div v-if="invoices.length === 0" class="text-center py-8 text-base-content/60">
                    <IconReceipt class="w-8 h-8 mx-auto mb-2" />
                    <p>No invoices yet</p>
                </div>

                <div v-else class="space-y-2">
                    <div
                        v-for="invoice in invoices"
                        :key="invoice.id"
                        class="flex items-center justify-between p-3 bg-base-200 rounded-xl"
                    >
                        <div>
                            <p class="font-medium">{{ invoice.description }}</p>
                            <p class="text-xs text-base-content/60">{{ formatDate(invoice.date) }}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="font-medium">${{ invoice.amount }}</span>
                            <button class="btn btn-sm btn-ghost" @click="downloadInvoice(invoice.id)">
                                <IconDownload class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    IconCreditCard,
    IconTrash,
    IconPlus,
    IconReceipt,
    IconDownload,
} from "#components";

const paymentMethods = ref([
    // TODO: Fetch from API
]);

const invoices = ref([
    // TODO: Fetch from API
]);

async function removePaymentMethod(_id: string) {
    // TODO: Implement API
    paymentMethods.value = paymentMethods.value.filter((m) => m.id !== _id);
}

async function addPaymentMethod() {
    // TODO: Implement Stripe integration
    alert("Payment method addition coming soon");
}

async function downloadInvoice(_id: string) {
    // TODO: Implement API
    alert("Invoice download coming soon");
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

useHead({
    title: "Billing & Subscription",
});
</script>
