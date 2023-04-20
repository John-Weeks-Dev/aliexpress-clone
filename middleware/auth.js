export default defineNuxtRouteMiddleware((from, to) => {
    const user = useSupabaseUser()

    if (!user.value && to.fullPath == '/checkout') {
        return navigateTo('/auth')
    }
})