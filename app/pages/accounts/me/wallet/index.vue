<template>
    <NuxtLayout name="app">
        <ConfuseSpinner v-if="isLoading" message="Loading wallet..." />

        <div v-else-if="!wallet" class="mx-auto max-w-md p-6">
            <div class="card">
                <div class="card-body items-center text-center gap-4">
                    <IconWallet class="text-base-content/50 w-12 h-12" />
                    <h1 class="text-xl font-bold">No Wallet</h1>
                    <p class="text-base-content/60">
                        Create a wallet to start managing your funds.
                    </p>
                    <button class="btn btn-primary" @click="createWallet">
                        <IconPlus class="w-4 h-4" />
                        Create Wallet
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="mx-auto max-w-6xl">
            <!-- Header -->
            <div class="flex items-center gap-3 px-4 py-4">
                <button
                    class="btn btn-ghost btn-square btn-sm"
                    @click="router.back()"
                >
                    <IconArrowLeft class="w-5 h-5" />
                </button>
                <h1 class="text-xl font-bold">Wallet</h1>
            </div>

            <!-- Content Grid -->
            <div class="grid gap-4 px-4 py-4 lg:px-6 lg:grid-cols-3">
                <!-- Left Column - Main Content -->
                <div class="lg:col-span-2 space-y-4">
                    <!-- Balance Card -->
                    <div
                        class="card bg-linear-to-br from-primary to-primary/80 text-primary-content"
                    >
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <IconWallet class="w-5 h-5" />
                                    <span class="font-medium opacity-90"
                                        >Balance</span
                                    >
                                </div>
                                <div class="dropdown dropdown-end">
                                    <button
                                        class="btn btn-ghost btn-sm btn-square text-primary-content/80 hover:text-primary-content hover:bg-primary-content/10"
                                    >
                                        <IconMoreVertical class="w-4 h-4" />
                                    </button>
                                    <ul
                                        class="dropdown-content menu menu-sm bg-base-100 text-base-content rounded-box z-1 w-40 p-2 shadow-sm border border-base-200 mt-2"
                                    >
                                        <li>
                                            <button
                                                @click="
                                                    isBalanceVisible =
                                                        !isBalanceVisible
                                                "
                                            >
                                                <IconEyeOff
                                                    v-if="isBalanceVisible"
                                                    class="w-4 h-4"
                                                />
                                                <IconEye
                                                    v-else
                                                    class="w-4 h-4"
                                                />
                                                {{
                                                    isBalanceVisible
                                                        ? "Hide"
                                                        : "Show"
                                                }}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="mt-4 flex items-baseline gap-3">
                                <span class="text-4xl font-bold">
                                    {{
                                        isBalanceVisible
                                            ? formatAmount(
                                                  currentPocket?.amount || 0,
                                              )
                                            : "••••••"
                                    }}
                                </span>
                                <!-- Currency Selector -->
                                <div class="dropdown">
                                    <button
                                        class="badge badge-lg bg-primary-content/20 text-primary-content border-primary-content/30 hover:bg-primary-content/30 gap-1 cursor-pointer backdrop-blur-sm"
                                    >
                                        {{ formatCurrency(selectedCurrency) }}
                                        <IconChevronDown class="w-3 h-3" />
                                    </button>
                                    <ul
                                        class="dropdown-content menu menu-sm bg-base-100 text-base-content rounded-box z-1 w-32 p-2 shadow-sm border border-base-200 mt-2"
                                    >
                                        <li
                                            v-for="pocket in allPockets"
                                            :key="pocket.currency"
                                        >
                                            <button
                                                :class="{
                                                    active:
                                                        selectedCurrency ===
                                                        pocket.currency,
                                                }"
                                                @click="
                                                    selectedCurrency =
                                                        pocket.currency
                                                "
                                            >
                                                {{
                                                    formatCurrency(
                                                        pocket.currency,
                                                    )
                                                }}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="grid grid-cols-2 gap-3">
                        <button
                            class="btn btn-primary h-auto py-4"
                            @click="showTransferModal = true"
                        >
                            <div class="flex flex-col items-center gap-2">
                                <IconSend class="w-5 h-5" />
                                <span class="text-sm font-semibold"
                                    >Transfer</span
                                >
                            </div>
                        </button>
                        <button
                            class="btn btn-primary h-auto py-4"
                            @click="showFundModal = true"
                        >
                            <div class="flex flex-col items-center gap-2">
                                <IconGift class="w-5 h-5" />
                                <span class="text-sm font-semibold"
                                    >Create Fund</span
                                >
                            </div>
                        </button>
                    </div>

                    <!-- Tabs -->
                    <div
                        role="tablist"
                        class="tabs tabs-box bg-base-200/50 p-2 m-2"
                    >
                        <a
                            role="tab"
                            class="tab flex-1"
                            :class="{
                                'tab-active': activeTab === 'transactions',
                            }"
                            @click="activeTab = 'transactions'"
                        >
                            Transactions
                        </a>
                        <a
                            role="tab"
                            class="tab flex-1"
                            :class="{ 'tab-active': activeTab === 'funds' }"
                            @click="activeTab = 'funds'"
                        >
                            My Funds
                        </a>
                    </div>

                    <!-- Transactions Tab -->
                    <div v-if="activeTab === 'transactions'" class="p-2">
                        <!-- Filter -->
                        <div class="flex gap-2 mb-3 px-2">
                            <button
                                class="btn btn-xs"
                                :class="
                                    transactionFilter === 'all'
                                        ? 'btn-primary'
                                        : 'btn-ghost'
                                "
                                @click="transactionFilter = 'all'"
                            >
                                All
                            </button>
                            <button
                                class="btn btn-xs"
                                :class="
                                    transactionFilter === 'income'
                                        ? 'btn-primary'
                                        : 'btn-ghost'
                                "
                                @click="transactionFilter = 'income'"
                            >
                                Income
                            </button>
                            <button
                                class="btn btn-xs"
                                :class="
                                    transactionFilter === 'expense'
                                        ? 'btn-primary'
                                        : 'btn-ghost'
                                "
                                @click="transactionFilter = 'expense'"
                            >
                                Expense
                            </button>
                        </div>

                        <!-- Transaction List -->
                        <div class="divide-y divide-base-200">
                            <div
                                v-for="tx in filteredTransactions"
                                :key="tx.id"
                                class="flex items-center gap-3 p-3 hover:bg-base-200/50 transition-colors cursor-pointer rounded-lg"
                                @click="openTransactionModal(tx)"
                            >
                                <!-- Icon -->
                                <div
                                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    :class="
                                        isIncome(tx)
                                            ? 'bg-success/10 text-success'
                                            : 'bg-error/10 text-error'
                                    "
                                >
                                    <IconArrowDownLeft
                                        v-if="isIncome(tx)"
                                        class="w-5 h-5"
                                    />
                                    <IconArrowUpRight v-else class="w-5 h-5" />
                                </div>

                                <!-- Info -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium truncate">
                                            {{ getTransactionLabel(tx) }}
                                        </span>
                                        <span
                                            class="badge badge-sm badge-ghost"
                                            >{{ tx.currency }}</span
                                        >
                                    </div>
                                    <p class="text-xs text-base-content/60">
                                        {{ formatDate(tx.createdAt) }}
                                    </p>
                                </div>

                                <!-- Amount -->
                                <span
                                    class="font-semibold shrink-0"
                                    :class="
                                        isIncome(tx)
                                            ? 'text-success'
                                            : 'text-error'
                                    "
                                >
                                    {{ isIncome(tx) ? "+" : "-"
                                    }}{{ formatAmount(tx.amount) }}
                                </span>
                            </div>

                            <!-- Empty -->
                            <div
                                v-if="filteredTransactions.length === 0"
                                class="p-8 text-center text-base-content/50"
                            >
                                <IconReceipt
                                    class="w-12 h-12 mx-auto mb-3 opacity-50"
                                />
                                <p>No transactions</p>
                            </div>
                        </div>

                        <!-- Load More -->
                        <div v-if="hasMoreTransactions" class="p-3 text-center">
                            <button
                                class="btn btn-ghost btn-sm"
                                :disabled="isLoadingMore"
                                @click="loadMoreTransactions"
                            >
                                <IconLoader
                                    v-if="isLoadingMore"
                                    class="w-4 h-4 animate-spin"
                                />
                                Load More
                            </button>
                        </div>
                    </div>

                    <!-- Funds Tab -->
                    <div v-else class="p-2">
                        <div class="divide-y divide-base-200">
                            <div
                                v-for="fund in funds"
                                :key="fund.id"
                                class="flex items-center gap-3 p-3 hover:bg-base-200/50 transition-colors rounded-lg"
                            >
                                <div
                                    class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                                >
                                    <IconGift class="w-5 h-5 text-primary" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium truncate"
                                            >Fund</span
                                        >
                                        <span
                                            class="badge badge-sm badge-ghost"
                                            >{{ fund.currency }}</span
                                        >
                                    </div>
                                    <p class="text-xs text-base-content/60">
                                        {{ fund.claimedCount }}/{{
                                            fund.amountOfSplits
                                        }}
                                        claimed
                                    </p>
                                </div>
                                <div class="text-right shrink-0">
                                    <span class="font-semibold">{{
                                        formatAmount(fund.totalAmount)
                                    }}</span>
                                    <p class="text-xs text-base-content/60">
                                        {{ formatAmount(fund.remainingAmount) }}
                                        left
                                    </p>
                                </div>
                            </div>

                            <div
                                v-if="funds.length === 0"
                                class="p-8 text-center text-base-content/50"
                            >
                                <IconGift
                                    class="w-12 h-12 mx-auto mb-3 opacity-50"
                                />
                                <p>No funds</p>
                            </div>
                        </div>

                        <div v-if="hasMoreFunds" class="p-3 text-center">
                            <button
                                class="btn btn-ghost btn-sm"
                                :disabled="isLoadingMoreFunds"
                                @click="loadMoreFunds"
                            >
                                <IconLoader
                                    v-if="isLoadingMoreFunds"
                                    class="w-4 h-4 animate-spin"
                                />
                                Load More
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right Column - Sidebar -->
                <div class="space-y-4 hidden lg:block">
                    <!-- Stats Card -->
                    <div class="card bg-base-100">
                        <div class="card-body p-4">
                            <h3
                                class="text-sm font-semibold text-base-content/70 mb-3"
                            >
                                Statistics
                            </h3>
                            <div class="space-y-3">
                                <div
                                    class="flex items-center gap-3 p-2 rounded-xl bg-success/5"
                                >
                                    <div
                                        class="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center"
                                    >
                                        <IconArrowDownLeft
                                            class="w-4 h-4 text-success"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-xs text-base-content/60">
                                            Income
                                        </p>
                                        <p class="font-semibold text-success">
                                            {{
                                                formatAmount(
                                                    stats?.totalIncome || 0,
                                                )
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    class="flex items-center gap-3 p-2 rounded-xl bg-error/5"
                                >
                                    <div
                                        class="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center"
                                    >
                                        <IconArrowUpRight
                                            class="w-4 h-4 text-error"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-xs text-base-content/60">
                                            Expense
                                        </p>
                                        <p class="font-semibold text-error">
                                            {{
                                                formatAmount(
                                                    stats?.totalOutgoing || 0,
                                                )
                                            }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transfer Modal -->
            <dialog :open="showTransferModal" class="modal">
                <div class="modal-box max-w-md">
                    <h3 class="font-bold text-lg">Transfer</h3>
                    <div class="space-y-4 py-4">
                        <div>
                            <label class="label">Amount</label>
                            <input
                                v-model="transferForm.amount"
                                type="number"
                                step="0.01"
                                class="input input-bordered w-full"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label class="label">Currency</label>
                            <select
                                v-model="transferForm.currency"
                                class="select select-bordered w-full"
                            >
                                <option
                                    v-for="pocket in allPockets"
                                    :key="pocket.currency"
                                    :value="pocket.currency"
                                >
                                    {{ formatCurrency(pocket.currency) }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="label">Recipient Username</label>
                            <input
                                v-model="transferForm.recipient"
                                type="text"
                                class="input input-bordered w-full"
                                placeholder="username"
                            />
                        </div>
                        <div>
                            <label class="label">Remark (optional)</label>
                            <textarea
                                v-model="transferForm.remark"
                                class="textarea textarea-bordered w-full"
                                rows="2"
                                placeholder="Add a note..."
                            />
                        </div>
                        <div>
                            <label class="label">PIN Code</label>
                            <input
                                v-model="transferForm.pinCode"
                                type="password"
                                maxlength="6"
                                class="input input-bordered w-full"
                                placeholder="******"
                            />
                        </div>
                    </div>
                    <div class="modal-action">
                        <form method="dialog">
                            <button class="btn btn-ghost">Cancel</button>
                        </form>
                        <button
                            class="btn btn-primary"
                            :disabled="!isTransferValid || isSubmitting"
                            @click="submitTransfer"
                        >
                            <IconLoader
                                v-if="isSubmitting"
                                class="w-4 h-4 animate-spin"
                            />
                            <IconSend v-else class="w-4 h-4" />
                            Send
                        </button>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <!-- Fund Modal -->
            <dialog :open="showFundModal" class="modal">
                <div class="modal-box max-w-md">
                    <h3 class="font-bold text-lg">Create Fund</h3>
                    <div class="space-y-4 py-4">
                        <div>
                            <label class="label">Total Amount</label>
                            <input
                                v-model="fundForm.totalAmount"
                                type="number"
                                step="0.01"
                                class="input input-bordered w-full"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label class="label">Currency</label>
                            <select
                                v-model="fundForm.currency"
                                class="select select-bordered w-full"
                            >
                                <option
                                    v-for="pocket in allPockets"
                                    :key="pocket.currency"
                                    :value="pocket.currency"
                                >
                                    {{ formatCurrency(pocket.currency) }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="label">Number of Splits</label>
                            <input
                                v-model="fundForm.amountOfSplits"
                                type="number"
                                min="1"
                                class="input input-bordered w-full"
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <label class="label">Split Type</label>
                            <div class="join w-full">
                                <button
                                    class="btn join-item flex-1"
                                    :class="
                                        fundForm.splitType === 0
                                            ? 'btn-primary'
                                            : 'btn-ghost'
                                    "
                                    @click="fundForm.splitType = 0"
                                >
                                    Even
                                </button>
                                <button
                                    class="btn join-item flex-1"
                                    :class="
                                        fundForm.splitType === 1
                                            ? 'btn-primary'
                                            : 'btn-ghost'
                                    "
                                    @click="fundForm.splitType = 1"
                                >
                                    Random
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="label">Message (optional)</label>
                            <textarea
                                v-model="fundForm.message"
                                class="textarea textarea-bordered w-full"
                                rows="2"
                                placeholder="Add a message..."
                            />
                        </div>
                        <div>
                            <label class="label">PIN Code</label>
                            <input
                                v-model="fundForm.pinCode"
                                type="password"
                                maxlength="6"
                                class="input input-bordered w-full"
                                placeholder="******"
                            />
                        </div>
                    </div>
                    <div class="modal-action">
                        <form method="dialog">
                            <button class="btn btn-ghost">Cancel</button>
                        </form>
                        <button
                            class="btn btn-primary"
                            :disabled="!isFundValid || isSubmitting"
                            @click="submitFund"
                        >
                            <IconLoader
                                v-if="isSubmitting"
                                class="w-4 h-4 animate-spin"
                            />
                            <IconGift v-else class="w-4 h-4" />
                            Create
                        </button>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>

        <!-- Transaction Detail Modal -->
        <dialog :open="!!selectedTransaction" class="modal">
            <div class="modal-box max-w-md">
                <div class="flex items-center justify-between pb-4">
                    <h3 class="font-bold text-lg">Transaction Detail</h3>
                    <form method="dialog">
                        <button class="btn btn-ghost btn-sm btn-square">
                            <IconX class="w-4 h-4" />
                        </button>
                    </form>
                </div>
                <div v-if="selectedTransaction" class="space-y-4">
                    <div class="flex items-center justify-center">
                        <div
                            class="w-16 h-16 rounded-2xl flex items-center justify-center"
                            :class="
                                isIncome(selectedTransaction)
                                    ? 'bg-success/10 text-success'
                                    : 'bg-error/10 text-error'
                            "
                        >
                            <IconArrowDownLeft
                                v-if="isIncome(selectedTransaction)"
                                class="w-8 h-8"
                            />
                            <IconArrowUpRight v-else class="w-8 h-8" />
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-base-content/60">
                            {{
                                isIncome(selectedTransaction)
                                    ? "Received"
                                    : "Sent"
                            }}
                        </p>
                        <p
                            class="text-3xl font-bold"
                            :class="
                                isIncome(selectedTransaction)
                                    ? 'text-success'
                                    : 'text-error'
                            "
                        >
                            {{ isIncome(selectedTransaction) ? "+" : "-"
                            }}{{ formatAmount(selectedTransaction.amount) }}
                            {{ selectedTransaction.currency }}
                        </p>
                    </div>
                    <div class="divider" />
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-base-content/60">From</span>
                            <span class="font-medium">{{
                                selectedTransaction.payerWallet?.account
                                    ?.nick || "System"
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-base-content/60">To</span>
                            <span class="font-medium">{{
                                selectedTransaction.payeeWallet?.account
                                    ?.nick || "System"
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-base-content/60">Date</span>
                            <span>{{
                                formatDate(selectedTransaction.createdAt, true)
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-base-content/60">Type</span>
                            <span>{{
                                selectedTransaction.type === 0
                                    ? "Transfer"
                                    : "Payment"
                            }}</span>
                        </div>
                        <div v-if="selectedTransaction.remarks" class="pt-2">
                            <span class="text-base-content/60">Remarks</span>
                            <p class="mt-1 p-2 bg-base-200 rounded-lg">
                                {{ selectedTransaction.remarks }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </NuxtLayout>
</template>

<script setup lang="ts">
import {
    IconWallet,
    IconPlus,
    IconArrowLeft,
    IconMoreVertical,
    IconEye,
    IconEyeOff,
    IconChevronDown,
    IconSend,
    IconGift,
    IconArrowDownLeft,
    IconArrowUpRight,
    IconReceipt,
    IconLoader,
    IconX,
} from "#components";
import type {
    Wallet,
    WalletStats,
    Transaction,
    Fund,
    WalletPocket,
} from "~/utils/api";
import {
    fetchWallet,
    createWallet as apiCreateWallet,
    fetchWalletStats,
    fetchTransactions,
    fetchFunds,
    createTransfer,
    createFund,
    fetchAccount,
} from "~/utils/api";

const router = useRouter();

// State
const isLoading = ref(true);
const wallet = ref<Wallet | null>(null);
const stats = ref<WalletStats | null>(null);
const transactions = ref<Transaction[]>([]);
const funds = ref<Fund[]>([]);
const selectedCurrency = ref("points");
const activeTab = ref<"transactions" | "funds">("transactions");
const transactionFilter = ref<"all" | "income" | "expense">("all");
const isBalanceVisible = ref(true);

// Pagination
const txOffset = ref(0);
const fundOffset = ref(0);
const hasMoreTransactions = ref(false);
const hasMoreFunds = ref(false);
const isLoadingMore = ref(false);
const isLoadingMoreFunds = ref(false);

// Modals
const showTransferModal = ref(false);
const showFundModal = ref(false);
const selectedTransaction = ref<Transaction | null>(null);
const isSubmitting = ref(false);

// Forms
const transferForm = reactive({
    amount: "",
    currency: "points",
    recipient: "",
    remark: "",
    pinCode: "",
});

const fundForm = reactive({
    totalAmount: "",
    currency: "points",
    splitType: 0, // 0: even, 1: random
    amountOfSplits: "1",
    message: "",
    pinCode: "",
});

// Computed
const allPockets = computed<WalletPocket[]>(() => {
    if (!wallet.value) return [];
    const currencies = new Set(["points", "golds"]);
    wallet.value.pockets.forEach((p) => currencies.add(p.currency));
    return Array.from(currencies).map((currency) => {
        const existing = wallet.value!.pockets.find(
            (p) => p.currency === currency,
        );
        return (
            existing || {
                id: "",
                currency,
                amount: 0,
                walletId: wallet.value!.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );
    });
});

const currentPocket = computed(() => {
    return allPockets.value.find((p) => p.currency === selectedCurrency.value);
});

const filteredTransactions = computed(() => {
    if (transactionFilter.value === "all") return transactions.value;
    return transactions.value.filter((tx) => {
        const income = isIncome(tx);
        return transactionFilter.value === "income" ? income : !income;
    });
});

const isTransferValid = computed(() => {
    return (
        parseFloat(transferForm.amount) > 0 &&
        transferForm.recipient.trim() &&
        transferForm.pinCode.length === 6
    );
});

const isFundValid = computed(() => {
    return (
        parseFloat(fundForm.totalAmount) > 0 &&
        parseInt(fundForm.amountOfSplits) > 0 &&
        fundForm.pinCode.length === 6
    );
});

// Helpers
function formatAmount(amount: number): string {
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatCurrency(currency: string): string {
    return currency.charAt(0).toUpperCase() + currency.slice(1).toLowerCase();
}

function formatDate(dateStr: string, withTime = false): string {
    const date = new Date(dateStr);
    if (withTime) {
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function isIncome(tx: Transaction): boolean {
    return wallet.value?.id === tx.payeeWalletId;
}

function getTransactionLabel(tx: Transaction): string {
    if (isIncome(tx)) {
        return tx.payerWallet?.account?.nick || "System";
    }
    return tx.payeeWallet?.account?.nick || "System";
}

// API Actions
async function loadData() {
    try {
        const [w, s, txs, fds] = await Promise.all([
            fetchWallet(),
            fetchWalletStats(),
            fetchTransactions(),
            fetchFunds(),
        ]);
        wallet.value = w;
        stats.value = s;
        transactions.value = txs.items;
        hasMoreTransactions.value = txs.hasMore;
        funds.value = fds.items;
        hasMoreFunds.value = fds.hasMore;

        if (w && w.pockets.length > 0) {
            selectedCurrency.value = w.pockets[0].currency;
        }
    } catch (err) {
        console.error("Failed to load wallet:", err);
    }
}

async function createWallet() {
    try {
        wallet.value = await apiCreateWallet();
    } catch (err) {
        console.error("Failed to create wallet:", err);
        alert("Failed to create wallet");
    }
}

async function loadMoreTransactions() {
    isLoadingMore.value = true;
    txOffset.value += 20;
    try {
        const result = await fetchTransactions(txOffset.value);
        transactions.value.push(...result.items);
        hasMoreTransactions.value = result.hasMore;
    } finally {
        isLoadingMore.value = false;
    }
}

async function loadMoreFunds() {
    isLoadingMoreFunds.value = true;
    fundOffset.value += 20;
    try {
        const result = await fetchFunds(fundOffset.value);
        funds.value.push(...result.items);
        hasMoreFunds.value = result.hasMore;
    } finally {
        isLoadingMoreFunds.value = false;
    }
}

function openTransactionModal(tx: Transaction) {
    selectedTransaction.value = tx;
}

async function submitTransfer() {
    isSubmitting.value = true;
    try {
        const account = await fetchAccount(transferForm.recipient);
        if (!account?.id) {
            alert("User not found");
            return;
        }
        await createTransfer({
            amount: parseFloat(transferForm.amount),
            currency: transferForm.currency,
            payeeAccountId: account.id,
            remark: transferForm.remark,
            pinCode: transferForm.pinCode,
        });
        showTransferModal.value = false;
        // Reset form
        transferForm.amount = "";
        transferForm.recipient = "";
        transferForm.remark = "";
        transferForm.pinCode = "";
        await loadData();
    } catch (err) {
        console.error("Transfer failed:", err);
        alert("Transfer failed");
    } finally {
        isSubmitting.value = false;
    }
}

async function submitFund() {
    isSubmitting.value = true;
    try {
        await createFund({
            currency: fundForm.currency,
            totalAmount: parseFloat(fundForm.totalAmount),
            splitType: fundForm.splitType,
            amountOfSplits: parseInt(fundForm.amountOfSplits),
            recipientAccountIds: [], // Open fund - anyone can claim
            message: fundForm.message,
            pinCode: fundForm.pinCode,
        });
        showFundModal.value = false;
        // Reset form
        fundForm.totalAmount = "";
        fundForm.amountOfSplits = "1";
        fundForm.message = "";
        fundForm.pinCode = "";
        await loadData();
    } catch (err) {
        console.error("Fund creation failed:", err);
        alert("Failed to create fund");
    } finally {
        isSubmitting.value = false;
    }
}

onMounted(async () => {
    isLoading.value = true;
    await loadData();
    isLoading.value = false;
});

useHead({
    title: "Wallet",
});
</script>
