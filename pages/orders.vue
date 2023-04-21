<template>
    <MainLayout>
        <div id="OrdersPage" class="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
            <div class="bg-white w-full p-6 min-h-[150px]">
                <div class="flex items-center text-xl">
                    <Icon name="carbon:delivery" color="#5FCB04" size="35"/>
                    <span class="pl-4">Orders</span>
                </div>
                <div 
                    v-if="orders && orders.data" 
                    v-for="order in orders.data" 
                    class="text-sm pl-[50px]"
                >
                    <div class="border-b py-1">
                        <p>Stripe ID: {{ order.stripeId }}</p>

                        <div class="pt-2"></div>

                        <div v-for="item in order.orderItem">
                            <NuxtLink 
                                class="flex items-center gap-3 p-1 hover:underline hover:text-blue-500" 
                                :to="`/item/${item.productId}`"
                            >
                                <img width="40" :src="item.product.url">
                                {{ item.product.title }}
                            </NuxtLink>
                        </div>

                        <div class="pt-2 pb-5">
                            Delivery Address: {{ order.name }}, {{ order.address }}, {{ order.zipcode }}, {{ order.city }}, {{ order.country }}
                        </div>
                    </div>
                </div>

                <div v-else class="flex items-center justify-center">
                    You have no order history
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script setup>
import MainLayout from '~/layouts/MainLayout.vue';
import { useUserStore } from '~/stores/user';
const userStore = useUserStore()
const user = useSupabaseUser()

let orders = ref(null)

onBeforeMount(async () => {
    orders.value = await useFetch(`/api/prisma/get-all-orders-by-user/${user.value.id}`)
})

onMounted(() => {
    if (!user.value) {
        return navigateTo('/auth')
    }

    setTimeout(() => userStore.isLoading = false, 200)
})
</script>
