<template>
  <div class="min-h-screen bg-base-200">
    <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div class="w-full max-w-md">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <slot />
          </div>
        </div>
      </div>
    </div>

    <footer class="footer footer-center bg-base-100 p-6 text-base-content/60">
      <aside>
        <p>Floating Island &mdash; Solar Network</p>
      </aside>
    </footer>
  </div>
</template>
