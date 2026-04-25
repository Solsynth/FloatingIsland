<template>
    <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div class="w-full max-w-md">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center gap-3">
                    <img src="/favicon.png" alt="Solar Network" class="w-10 h-10" >
                    <span class="text-2xl font-bold text-base-content">Solar Network</span>
                </div>
            </div>

            <ConfuseSpinner v-if="auth.isLoading.value" />

            <template v-else>
                <!-- Step 1: Username Entry -->
                <div v-if="step === 'lookup'" class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title text-2xl">Sign In</h2>
                        <p class="text-base-content/60 mb-4">
                            Login with your Solarpass and continue
                        </p>

                        <div v-if="error" class="alert alert-error text-sm mb-4">
                            <IconAlertCircle class="w-4 h-4" />
                            <span>{{ error }}</span>
                        </div>

                        <div class="form-control">
                            <input
                                v-model="account"
                                type="text"
                                placeholder="Username or email"
                                class="input input-bordered w-full"
                                @keydown.enter="handleLookup"
                            >
                        </div>

                        <button
                            class="btn btn-primary mt-4"
                            :disabled="!account || submitting"
                            @click="handleLookup"
                        >
                            <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
                            Continue
                        </button>

                        <!-- OIDC Buttons -->
                        <div class="divider text-base-content/40">or sign in with</div>
                        <div class="flex gap-2">
                            <button class="btn btn-outline flex-1 gap-2" @click="handleOidcLogin('github')">
                                <IconGithub class="w-4 h-4" />
                                GitHub
                            </button>
                            <button class="btn btn-outline flex-1 gap-2" @click="handleOidcLogin('google')">
                                <svg class="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </button>
                        </div>

                        <div class="text-center mt-4">
                            <NuxtLink to="/auth/create-account" class="text-sm text-primary hover:underline">
                                Create an account
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Factor Selection -->
                <div v-if="step === 'picker'" class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <!-- Progress -->
                        <div class="w-full bg-base-200 rounded-full h-1 mb-4">
                            <div
                                class="bg-primary h-1 rounded-full transition-all"
                                :style="{ width: `${auth.loginProgress.value * 100}%` }"
                            />
                        </div>

                        <LoginFactorList
                            :factors="auth.factors.value"
                            :selected-factor="auth.selectedFactor.value"
                            @select="auth.selectFactor($event)"
                        />

                        <button
                            class="btn btn-primary mt-4"
                            :disabled="!auth.selectedFactor.value"
                            @click="handleFactorSelect"
                        >
                            Continue
                        </button>
                    </div>
                </div>

                <!-- Step 3: Verification -->
                <div v-if="step === 'check'" class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <!-- Progress -->
                        <div class="w-full bg-base-200 rounded-full h-1 mb-4">
                            <div
                                class="bg-primary h-1 rounded-full transition-all"
                                :style="{ width: `${auth.loginProgress.value * 100}%` }"
                            />
                        </div>

                        <div v-if="error" class="alert alert-error text-sm mb-4">
                            <IconAlertCircle class="w-4 h-4" />
                            <span>{{ error }}</span>
                        </div>

                        <LoginAuthenticate
                            v-model="password"
                            :factor="auth.selectedFactor.value"
                            :submitting="submitting"
                            @submit="handleVerify"
                            @back="goBackToFactors"
                        />
                    </div>
                </div>

                <!-- Step 4: Success -->
                <div v-if="step === 'success'" class="card bg-base-100 shadow-xl">
                    <div class="card-body items-center text-center">
                        <div class="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                            <IconCheck class="w-8 h-8 text-success" />
                        </div>
                        <h2 class="card-title text-2xl">Login Successful</h2>
                        <p class="text-base-content/60">Redirecting you to the app...</p>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
});

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const { startLogin, loadFactors, loadChallenge, submitVerification, exchangeToken, fetchUser, clearLoginFlow, clearFactor } = auth;

const step = ref<"lookup" | "picker" | "check" | "success">("lookup");
const account = ref("");
const password = ref("");
const submitting = ref(false);
const error = ref<string | null>(null);

function updateQuery(params: Record<string, string>) {
    router.replace({ query: params });
}

async function handleLookup() {
    if (!account.value) return;
    submitting.value = true;
    error.value = null;

    try {
        await startLogin(account.value);
        const challengeId = auth.challenge.value!.id;
        const factors = await loadFactors(challengeId);

        updateQuery({
            challenge: challengeId,
            step: factors.length > 1 ? "picker" : "check",
        });

        if (factors.length === 1) {
            auth.selectFactor(factors[0]!);
            step.value = "check";
        } else if (factors.length > 1) {
            step.value = "picker";
        } else {
            error.value = "No verification methods available";
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : "Failed to start login";
    } finally {
        submitting.value = false;
    }
}

async function handleFactorSelect() {
    if (auth.selectedFactor.value) {
        step.value = "check";
    }
}

async function handleVerify() {
    if (!password.value) {
        error.value = "Password is required";
        return;
    }
    if (!auth.challenge.value) {
        error.value = "Login session expired. Please try again.";
        step.value = "lookup";
        return;
    }
    if (!auth.selectedFactor.value) {
        error.value = "Please select a verification method.";
        step.value = "picker";
        return;
    }

    submitting.value = true;
    error.value = null;

    try {
        const result = await submitVerification(auth.challenge.value.id, auth.selectedFactor.value.id, password.value);

        if (result.stepRemain > 0) {
            // More steps needed - go back to factor picker
            password.value = "";
            clearFactor();
            const factors = await loadFactors(result.id);
            updateQuery({ challenge: result.id, step: "picker" });
            if (factors.length === 1) {
                auth.selectFactor(factors[0]!);
                step.value = "check";
            } else {
                step.value = "picker";
            }
        } else {
            // Login complete - show success and redirect
            step.value = "success";
            const code = auth.challenge.value!.id;
            await exchangeToken(code);
            await fetchUser();
            clearLoginFlow();
            router.replace({ query: {} });
            navigateTo("/");
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : "Verification failed";
    } finally {
        submitting.value = false;
    }
}

function goBackToFactors() {
    password.value = "";
    clearFactor();
    step.value = "picker";
    if (auth.challenge.value) {
        updateQuery({ challenge: auth.challenge.value.id, step: "picker" });
    }
}

async function handleOidcLogin(provider: string) {
    const config = useRuntimeConfig();
    const returnUrl = `${window.location.origin}/auth/callback/${provider}`;
    const deviceId = await auth.getDeviceId();
    const url = `${config.public.apiBaseUrl}/padlock/auth/login/${provider}?returnUrl=${encodeURIComponent(returnUrl)}&deviceId=${deviceId}&flow=login`;
    window.location.href = url;
}

onMounted(async () => {
    auth.isLoading.value = false;
    clearLoginFlow();
    step.value = "lookup";

    const challengeId = route.query.challenge as string;
    const requestedStep = route.query.step as string;

    if (challengeId) {
        try {
            const challengeData = await loadChallenge(challengeId);
            const factors = await loadFactors(challengeId);
            if (factors.length > 0) {
                if (requestedStep === "check" && factors.length === 1) {
                    auth.selectFactor(factors[0]!);
                    step.value = "check";
                } else if (requestedStep === "picker" || factors.length > 1) {
                    step.value = "picker";
                } else if (factors.length === 1) {
                    auth.selectFactor(factors[0]!);
                    step.value = "check";
                }
            }
        } catch {
            clearLoginFlow();
            step.value = "lookup";
        }
    }
});
</script>
