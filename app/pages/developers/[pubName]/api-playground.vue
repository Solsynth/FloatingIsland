<template>
  <NuxtLayout name="developer">
    <template #rightbar>
      <!-- API Explorer Sidebar -->
      <div class="card bg-base-100 shadow-sm rounded-none min-h-full">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold">API Explorer</h3>
            <button
              v-if="!loadingSwagger && endpointGroups.length"
              class="btn btn-ghost btn-xs"
              @click="collapseAll = !collapseAll"
            >
              {{ collapseAll ? "Expand" : "Collapse" }}
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loadingSwagger" class="space-y-2 animate-pulse">
            <div class="h-4 bg-base-300/50 rounded w-3/4" />
            <div class="h-3 bg-base-300/50 rounded w-1/2" />
            <div class="h-3 bg-base-300/50 rounded w-2/3" />
            <div class="h-3 bg-base-300/50 rounded w-1/2" />
          </div>

          <!-- Error -->
          <p v-else-if="swaggerError" class="text-xs text-error">
            {{ swaggerError }}
          </p>

          <!-- Endpoint Groups -->
          <div v-else-if="endpointGroups.length" class="space-y-1">
            <div
              v-for="(group, gi) in endpointGroups"
              :key="gi"
              class="collapse collapse-arrow rounded-xl"
              :class="{ 'collapse-open': !collapseAll }"
            >
              <input type="checkbox" :checked="!collapseAll" />
              <div
                class="collapse-title text-xs font-semibold text-base-content/60 min-h-0 py-2 px-2"
              >
                {{ group.tag }} ({{ group.endpoints.length }})
              </div>
              <div class="collapse-content px-1 pb-1">
                <button
                  v-for="(ep, ei) in group.endpoints"
                  :key="ei"
                  class="flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-xs transition-all text-left hover:bg-base-200/80"
                  :class="
                    selectedEndpoint === ep.path + ep.method
                      ? 'bg-primary/10 text-primary'
                      : 'text-base-content/70'
                  "
                  @click="selectEndpoint(ep)"
                >
                  <span
                    class="shrink-0 rounded px-1 py-0.5 text-[10px] font-bold w-12 text-center"
                    :class="methodBadgeClass(ep.method)"
                    >{{ ep.method }}</span
                  >
                  <span class="truncate font-mono">{{ ep.path }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <p v-else class="text-xs text-base-content/40">No endpoints found</p>
        </div>
      </div>
    </template>

    <div class="mx-auto max-w-5xl">
      <!-- Service Selector -->
      <div
        class="flex flex-row items-center justify-center gap-3 mb-4 pb-4 border-b border-base-300/20"
      >
        <fieldset class="fieldset w-44">
          <legend class="fieldset-legend">Service</legend>
          <select
            v-model="selectedService"
            class="select w-full text-sm select-sm"
            @change="onServiceChange"
          >
            <option v-for="svc in services" :key="svc.id" :value="svc.id">
              {{ svc.label }}
            </option>
          </select>
        </fieldset>
        <p class="text-xs text-base-content/40 leading-tight block mt-7">
          {{ currentService?.description }}
        </p>
      </div>

      <!-- Request Builder Card -->
      <div class="card bg-base-100 shadow-sm mb-6">
        <div class="card-body p-5">
          <!-- Method + URL row -->
          <div class="flex items-start gap-3 mb-4">
            <div class="w-28 shrink-0">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">
                  {{ t("developer.playground.method") }}
                </legend>
                <select
                  v-model="method"
                  class="select w-full font-mono text-sm"
                  :class="methodColorClass"
                >
                  <option value="GET" class="text-info">GET</option>
                  <option value="POST" class="text-success">POST</option>
                  <option value="PUT" class="text-warning">PUT</option>
                  <option value="PATCH" class="text-warning">PATCH</option>
                  <option value="DELETE" class="text-error">DELETE</option>
                </select>
              </fieldset>
            </div>
            <div class="flex-1">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">
                  {{ t("developer.playground.url") }}
                </legend>
                <div class="relative">
                  <input
                    v-model="url"
                    type="url"
                    class="input w-full font-mono text-sm pr-8"
                    placeholder="https://api.solian.app/..."
                    @keyup.enter="handleSend"
                  />
                  <button
                    v-if="url"
                    class="absolute right-1 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-square"
                    @click="url = ''"
                  >
                    <IconX class="w-3.5 h-3.5" />
                  </button>
                </div>
              </fieldset>
            </div>
            <div class="shrink-0 pt-1.5">
              <button
                class="btn btn-primary mt-7"
                :class="{ loading: isLoading }"
                :disabled="isLoading || !url.trim()"
                @click="handleSend"
              >
                <IconSend v-if="!isLoading" class="w-4 h-4" />
                {{
                  isLoading
                    ? t("developer.playground.sending")
                    : t("developer.playground.send")
                }}
              </button>
            </div>
          </div>

          <!-- Headers Section -->
          <div
            class="collapse collapse-arrow bg-base-200/40 border border-base-300/20 rounded-xl mb-4"
          >
            <input type="checkbox" :checked="customHeaders.length > 0" />
            <div
              class="collapse-title text-sm font-semibold text-base-content/70 min-h-0 py-3"
            >
              {{ t("developer.playground.headers") }} ({{
                customHeaders.length
              }})
            </div>
            <div class="collapse-content">
              <div class="pt-2 space-y-2">
                <div
                  v-for="(header, i) in customHeaders"
                  :key="i"
                  class="flex items-center gap-2"
                >
                  <input
                    v-model="header.key"
                    type="text"
                    class="input input-sm w-48 font-mono text-xs"
                    :placeholder="t('developer.playground.key')"
                  />
                  <input
                    v-model="header.value"
                    type="text"
                    class="input input-sm flex-1 font-mono text-xs"
                    :placeholder="t('developer.playground.value')"
                  />
                  <button
                    class="btn btn-ghost btn-sm btn-square"
                    @click="removeHeader(i)"
                  >
                    <IconX class="w-4 h-4" />
                  </button>
                </div>
                <button class="btn btn-ghost btn-sm" @click="addHeader">
                  <IconPlus class="w-4 h-4" />
                  {{ t("developer.playground.addHeader") }}
                </button>
              </div>
            </div>
          </div>

          <!-- Body Section -->
          <div v-if="showBody">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">
                {{ t("developer.playground.body") }}
              </legend>
              <textarea
                v-model="body"
                class="textarea w-full font-mono text-sm"
                rows="6"
                placeholder='{ "key": "value" }'
              />
            </fieldset>
          </div>
        </div>
      </div>

      <!-- Response Card -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold">
              {{ t("developer.playground.response") }}
            </h3>
            <div v-if="responseStatus" class="flex items-center gap-3 text-sm">
              <span class="font-semibold"
                >{{ t("developer.playground.status") }}:
                <span :class="statusColorClass" class="font-mono">{{
                  responseStatus
                }}</span>
              </span>
              <span v-if="responseTime" class="text-base-content/50">
                {{ t("developer.playground.time") }}: {{ responseTime }}ms
              </span>
              <button
                v-if="responseBody"
                class="btn btn-ghost btn-xs"
                @click="copyResponse"
              >
                <IconCopy class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Auth Token Badge -->
          <div
            v-if="tokenValue"
            class="mb-4 p-3 rounded-xl bg-base-200/60 text-xs text-base-content/60 flex items-center gap-2"
          >
            <span class="font-semibold shrink-0">Authorization:</span>
            <code class="flex-1 truncate font-mono"
              >Bearer {{ tokenValue.slice(0, 48) }}...</code
            >
            <button class="btn btn-ghost btn-xs shrink-0" @click="copyToken">
              <IconCopy class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Loading skeleton -->
          <div v-if="isLoading" class="space-y-3 animate-pulse">
            <div class="h-4 bg-base-300/50 rounded w-1/4" />
            <div class="h-32 bg-base-300/50 rounded" />
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!responseBody"
            class="flex flex-col items-center justify-center py-12 text-base-content/30"
          >
            <IconSend class="w-10 h-10 mb-3" />
            <p class="text-sm">{{ t("developer.playground.noResponse") }}</p>
          </div>

          <template v-else>
            <!-- Response Headers -->
            <div
              class="collapse collapse-arrow bg-base-200/40 border border-base-300/20 rounded-xl mb-3"
            >
              <input type="checkbox" />
              <div
                class="collapse-title text-xs font-semibold text-base-content/50 min-h-0 py-2.5"
              >
                Response Headers ({{ Object.keys(responseHeaders).length }})
              </div>
              <div class="collapse-content">
                <div
                  class="text-xs font-mono text-base-content/60 space-y-0.5 max-h-40 overflow-y-auto scrollbar-none pt-1"
                >
                  <div
                    v-for="(val, key) in responseHeaders"
                    :key="key"
                    class="truncate py-0.5"
                  >
                    <span class="font-semibold text-base-content/70"
                      >{{ key }}:</span
                    >
                    {{ val }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Response Body -->
            <pre
              class="rounded-xl bg-base-300/30 p-4 overflow-auto max-h-96 text-sm font-mono leading-relaxed scrollbar-none min-w-0 text-wrap"
            ><code>{{ responseBody }}</code></pre>
          </template>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconSend, IconX, IconPlus, IconCopy } from "#components";

const { t } = useI18n();
const { token } = useAuth();
const { $toast } = useNuxtApp();

// ---- Service definitions ----
const API_BASE = "https://api.solian.app";

interface ApiService {
  id: string;
  label: string;
  description: string;
  swaggerUrl: string;
}

const services: ApiService[] = [
  {
    id: "develop",
    label: "Develop API",
    description: "Developer platform — bots, apps, projects, and miniapps",
    swaggerUrl: `${API_BASE}/swagger/develop/v1/swagger.json`,
  },
  {
    id: "padlock",
    label: "Padlock API",
    description:
      "Authentication & authorization — accounts, auth, permissions, E2EE",
    swaggerUrl: `${API_BASE}/swagger/padlock/v1/swagger.json`,
  },
];

const selectedService = ref(services[0]!.id);
const currentService = computed(() =>
  services.find((s) => s.id === selectedService.value),
);

// ---- Swagger state ----
const loadingSwagger = ref(true);
const swaggerError = ref("");
const swaggerSpec = ref<any>(null);
const collapseAll = ref(false);
const selectedEndpoint = ref("");

interface SwaggerEndpoint {
  method: string;
  path: string;
  summary: string;
  operationId?: string;
  parameters?: any[];
  requestBody?: any;
  bodyExample?: string;
}

interface EndpointGroup {
  tag: string;
  endpoints: SwaggerEndpoint[];
}

const endpointGroups = ref<EndpointGroup[]>([]);

// ---- Request state ----
const method = ref<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">("GET");
const url = ref("");
const body = ref("");
const customHeaders = ref<Array<{ key: string; value: string }>>([]);
const isLoading = ref(false);
const responseStatus = ref<number | null>(null);
const responseHeaders = ref<Record<string, string>>({});
const responseBody = ref<string | null>(null);
const responseTime = ref<number | null>(null);

const tokenValue = computed(() => token.value?.token ?? null);
const showBody = computed(() =>
  ["POST", "PUT", "PATCH"].includes(method.value),
);

const methodColorClass = computed(() => {
  switch (method.value) {
    case "GET":
      return "text-info";
    case "POST":
      return "text-success";
    case "PUT":
    case "PATCH":
      return "text-warning";
    case "DELETE":
      return "text-error";
    default:
      return "";
  }
});

const statusColorClass = computed(() => {
  if (!responseStatus.value) return "";
  if (responseStatus.value < 300) return "text-success";
  if (responseStatus.value < 400) return "text-warning";
  return "text-error";
});

function methodBadgeClass(m: string): string {
  switch (m) {
    case "GET":
      return "bg-info/10 text-info";
    case "POST":
      return "bg-success/10 text-success";
    case "PUT":
    case "PATCH":
      return "bg-warning/10 text-warning";
    case "DELETE":
      return "bg-error/10 text-error";
    default:
      return "bg-base-300 text-base-content/50";
  }
}

function addHeader() {
  customHeaders.value.push({ key: "", value: "" });
}
function removeHeader(i: number) {
  customHeaders.value.splice(i, 1);
}

// ---- Service switching ----
function onServiceChange() {
  selectedEndpoint.value = "";
  url.value = "";
  body.value = "";
  customHeaders.value = [];
  responseStatus.value = null;
  responseHeaders.value = {};
  responseBody.value = null;
  responseTime.value = null;
  loadSwagger();
}

// ---- Swagger loading ----
async function loadSwagger() {
  const svc = currentService.value;
  if (!svc) return;

  loadingSwagger.value = true;
  swaggerError.value = "";
  endpointGroups.value = [];
  try {
    const res = await fetch(svc.swaggerUrl);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const spec = await res.json();
    swaggerSpec.value = spec;
    parseEndpoints(spec);
  } catch (e: any) {
    swaggerError.value = e?.message || "Failed to load API spec";
    $toast.error(`Failed to load ${svc.label} spec`);
  } finally {
    loadingSwagger.value = false;
  }
}

function parseEndpoints(spec: any) {
  const paths = spec.paths || {};
  const schemas = spec.components?.schemas || {};
  const groupsMap: Record<string, SwaggerEndpoint[]> = {};

  for (const [path, methods] of Object.entries(paths)) {
    const pathMethods = methods as Record<string, any>;
    for (const [m, ep] of Object.entries(pathMethods)) {
      const s = ep as any;
      const tag = s.tags?.[0] || "Other";
      if (!groupsMap[tag]) groupsMap[tag] = [];

      const endpoint: SwaggerEndpoint = {
        method: m.toUpperCase(),
        path,
        summary: s.summary || s.operationId || "",
        operationId: s.operationId,
        parameters: s.parameters,
        requestBody: s.requestBody,
      };

      // Build example request body from schema
      if (s.requestBody) {
        const schemaRef =
          s.requestBody?.content?.["application/json"]?.schema?.$ref;
        if (schemaRef) {
          const name = schemaRef.split("/").pop();
          const schema = schemas[name];
          if (schema) {
            endpoint.bodyExample = buildExample(name, schema, schemas);
          }
        }
      }

      groupsMap[tag].push(endpoint);
    }
  }

  endpointGroups.value = Object.entries(groupsMap).map(([tag, endpoints]) => ({
    tag,
    endpoints,
  }));

  collapseAll.value = false;
}

function buildExample(
  name: string,
  schema: any,
  schemas: any,
  depth = 0,
): string {
  if (depth > 2) return '"..."';
  if (!schema || !schema.properties) return "{}";

  const example: Record<string, any> = {};
  const required = schema.required || [];

  for (const [propName, prop] of Object.entries(schema.properties) as any) {
    const isReq = required.includes(propName);
    if (!isReq && depth > 0) continue;

    if (prop.example !== undefined) {
      example[propName] = prop.example;
    } else if (prop.type === "string") {
      example[propName] = isReq ? "string" : null;
    } else if (prop.type === "integer" || prop.type === "number") {
      example[propName] = 0;
    } else if (prop.type === "boolean") {
      example[propName] = false;
    } else if (prop.type === "array") {
      example[propName] = [];
    } else if (prop.$ref) {
      const refName = prop.$ref.split("/").pop();
      const refSchema = schemas[refName];
      example[propName] = refSchema
        ? JSON.parse(buildExample(refName, refSchema, schemas, depth + 1))
        : null;
    } else if (prop.type === "object" && prop.properties) {
      example[propName] = JSON.parse(
        buildExample(propName, prop, schemas, depth + 1),
      );
    } else {
      example[propName] = null;
    }
  }

  return JSON.stringify(example, null, 2);
}

// ---- Select endpoint from sidebar ----
function selectEndpoint(ep: SwaggerEndpoint) {
  selectedEndpoint.value = ep.path + ep.method;
  method.value = ep.method as any;
  url.value = `${API_BASE}${ep.path}`;

  // Set body example if available
  if (ep.bodyExample) {
    body.value = ep.bodyExample;
  } else if (showBody.value) {
    body.value = "";
  }

  // Auto-add Content-Type header for POST/PUT/PATCH
  const hasContentType = customHeaders.value.some(
    (h) => h.key.toLowerCase() === "content-type",
  );
  if (showBody.value && !hasContentType) {
    customHeaders.value.push({
      key: "Content-Type",
      value: "application/json",
    });
  }

  $toast.success(`Loaded ${ep.method} ${ep.path}`);
}

// ---- Send request ----
async function handleSend() {
  if (!url.value.trim()) return;

  isLoading.value = true;
  responseStatus.value = null;
  responseHeaders.value = {};
  responseBody.value = null;
  responseTime.value = null;

  const startTime = performance.now();

  try {
    const headers: Record<string, string> = {};
    if (tokenValue.value) {
      headers["Authorization"] = `Bearer ${tokenValue.value}`;
    }
    for (const h of customHeaders.value) {
      if (h.key.trim()) headers[h.key.trim()] = h.value;
    }

    const fetchOptions: RequestInit = { method: method.value, headers };

    if (showBody.value && body.value.trim()) {
      fetchOptions.body = body.value;
    }

    const res = await fetch(url.value.trim(), fetchOptions);
    const endTime = performance.now();
    responseTime.value = Math.round(endTime - startTime);
    responseStatus.value = res.status;

    res.headers.forEach((value, key) => {
      responseHeaders.value[key] = value;
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const json = await res.json();
        responseBody.value = JSON.stringify(json, null, 2);
      } catch {
        responseBody.value = await res.text();
      }
    } else {
      responseBody.value = await res.text();
    }
  } catch (e: any) {
    $toast.error(e?.message || "Request failed");
    responseBody.value = `Error: ${e?.message || "Unknown error"}`;
    responseTime.value = Math.round(performance.now() - startTime);
  } finally {
    isLoading.value = false;
  }
}

async function copyResponse() {
  if (responseBody.value) {
    try {
      await navigator.clipboard.writeText(responseBody.value);
      $toast.success("Copied to clipboard");
    } catch {
      $toast.error("Failed to copy");
    }
  }
}

async function copyToken() {
  if (tokenValue.value) {
    try {
      await navigator.clipboard.writeText(tokenValue.value);
      $toast.success("Token copied to clipboard");
    } catch {
      $toast.error("Failed to copy token");
    }
  }
}

onMounted(() => {
  loadSwagger();
});
</script>
