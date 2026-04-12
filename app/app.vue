<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 shadow-lg px-4 lg:px-8">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl gap-2">
          <IconMountain />
          FloatingIsland
        </a>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1 gap-2">
          <li><a><IconHome class="w-4 h-4" /> Home</a></li>
          <li><a><IconInfo class="w-4 h-4" /> About</a></li>
        </ul>
      </div>
    </div>

    <div class="container mx-auto py-16 px-4">
      <div class="hero min-h-[60vh] bg-base-100 rounded-2xl shadow-xl">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <div class="flex justify-center mb-6">
              <div class="p-4 bg-primary/10 rounded-full">
                <IconRocket class="w-16 h-16 text-primary" />
              </div>
            </div>
            <h1 class="text-5xl font-bold">Welcome!</h1>
            <p class="py-6 text-base-content/70">
              Your Nuxt 4 project is set up with Tailwind v4, DaisyUI v5, and Lucide icons.
              Ready to build something amazing.
            </p>
            <div class="flex gap-3 justify-center">
              <button class="btn btn-primary gap-2">
                <IconSparkles class="w-4 h-4" />
                Get Started
              </button>
              <button class="btn btn-outline gap-2">
                <IconGithub class="w-4 h-4" />
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <IconPalette class="w-10 h-10 text-primary mb-2" />
            <h2 class="card-title">DaisyUI v5</h2>
            <p>Beautiful component classes with Tailwind v4</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <IconPenTool class="w-10 h-10 text-secondary mb-2" />
            <h2 class="card-title">Tailwind v4</h2>
            <p>Zero-config, fast CSS framework</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <IconLucide class="w-10 h-10 text-accent mb-2" />
            <h2 class="card-title">Lucide Icons</h2>
            <p>Beautiful & consistent icon set</p>
          </div>
        </div>
      </div>
    </div>

    <footer class="footer footer-center bg-base-100 text-base-content p-8 mt-16">
      <aside>
        <IconHeart class="w-5 h-5 inline" />
        <p>Built with Nuxt 4, Tailwind v4, DaisyUI v5 & Lucide Icons</p>
      </aside>
    </footer>
  </div>
</template>
