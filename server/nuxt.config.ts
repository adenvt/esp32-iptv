// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules : ['@nuxtjs/tailwindcss', '@privyid/pong'],
  app     : {
    head: {
      link: [
        {
          rel : 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel        : 'preconnect',
          href       : 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel : 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0',
        },
      ],
    },
  },
})
