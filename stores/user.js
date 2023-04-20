// stores/counter.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isMenuOverlay: false,
    isLoading: false,
    cart: [],
    checkout: []
  }),
  persist: true
})