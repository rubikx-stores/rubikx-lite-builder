<template>
  <div
    class="bg-white flex justify-center items-center min-h-screen h-screen w-screen fixed inset-0 z-[10000]"
  >
    <div class="absolute top-1/3">
      <div class="flex items-center justify-center mt-4">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        >
          <span
            class="!absolute !m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Loading...</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
