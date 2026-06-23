<script setup>
const version = __APP_VERSION__
</script>

<template>
  <div
    class="flex justify-between gap-2 lg:px-12 mx-2 py-3 border-t border-t-gray-900"
  >
    <p
      class="pbx-myPrimaryParagraph lg:text-base text-xs lg:font-semibold font-medium border-b border-gray-400"
    >
      <a
        href="https://www.npmjs.com/package/@myissue/vue-website-page-builder"
        target="_blank"
        class="pbx-myPrimaryLink text-myPrimaryDarkGrayColor"
      >
        Install via npm
      </a>
    </p>

    <p
      class="pbx-myPrimaryParagraph lg:text-base text-xs lg:font-semibold font-medium border-b border-gray-400"
    >
      <a
        href="https://github.com/myissue-studio/vue-website-page-builder"
        target="_blank"
        class="pbx-myPrimaryLink text-myPrimaryDarkGrayColor"
      >
        View on GitHub
      </a>
    </p>

    <p
      class="pbx-myPrimaryParagraph lg:text-base text-xs lg:font-semibold font-medium border-b border-gray-400"
    >
      <a
        href="https://myissue-studio.github.io/vue-website-page-builder"
        target="_blank"
        class="pbx-myPrimaryLink text-myPrimaryDarkGrayColor"
      >
        Guide
      </a>
    </p>

    <p
      class="pbx-myPrimaryParagraph lg:text-base text-xs lg:font-semibold font-medium border-b border-gray-400"
    >
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSeGgtmskw4T7o2Q50C6UCh3EidVbYDhrTXNUMsd6EykpzGTOQ/viewform"
        target="_blank"
        class="pbx-myPrimaryLink text-myPrimaryDarkGrayColor"
      >
        Contact us
      </a>
    </p>

    <p
      class="pbx-myPrimaryParagraph lg:text-base text-xs lg:font-semibold font-medium border-b border-gray-400"
    >
      <span class="text-myPrimaryDarkGrayColor">v{{ version }}</span>
    </p>
  </div>
</template>
