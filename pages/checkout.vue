<template>
    <MainLayout>
        <div id="CheckoutPage" class="mt-4 max-w-[1200px] mx-auto px-2">
  
            <div class="md:flex gap-4 justify-between mx-auto w-full">
                <div class="md:w-[65%]">
                    <div class="bg-white rounded-lg p-4">

                        <div class="text-xl font-semibold mb-2">Shipping Address</div>

                        <div v-if="currentAddress && currentAddress.data">
                            <NuxtLink 
                                to="/address"
                                class="flex items-center pb-2 text-blue-500 hover:text-red-400"
                            >
                                <Icon name="mdi:plus" size="18" class="mr-2"/>
                                Update Address
                            </NuxtLink>

                            <div class="pt-2 border-t">
                                <div class="underline pb-1">Delivery Address</div>
                                <ul class="text-xs">
                                    <li class="flex items-center gap-2">
                                        <div>Contact name:</div> 
                                        <div class="font-bold">{{ currentAddress.data.name }}</div>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <div>Address:</div> 
                                        <div class="font-bold">{{ currentAddress.data.address }}</div>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <div>Zip Code:</div> 
                                        <div class="font-bold">{{ currentAddress.data.zipcode }}</div>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <div>City:</div> 
                                        <div class="font-bold">{{ currentAddress.data.city }}</div>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <div>Country:</div> 
                                        <div class="font-bold">{{ currentAddress.data.country }}</div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <NuxtLink 
                            v-else
                            to="/address"
                            class="flex items-center text-blue-500 hover:text-red-400"
                        >
                            <Icon name="mdi:plus" size="18" class="mr-2"/>
                            Add New Address
                        </NuxtLink>
                    </div>

                    <div id="Items" class="bg-white rounded-lg p-4 mt-4">
                        <div v-for="product in userStore.checkout">
                            <CheckoutItem :product="product" />
                        </div>
                    </div>
                </div>

                <div class="md:hidden block my-4"/>
                <div class="md:w-[35%]">
                    <div id="PlaceOrder" class="bg-white rounded-lg p-4">

                        <div class="text-2xl font-extrabold mb-2">Summary</div>

                        <div class="flex items-center justify-between my-4">
                            <div class="">Total Shipping</div>
                            <div class="">Free</div>
                        </div>

                        <div class="border-t" />

                        <div class="flex items-center justify-between my-4">
                            <div class="font-semibold">Total</div>
                            <div class="text-2xl font-semibold">
                                $ <span class="font-extrabold">{{ total / 100 }}</span>
                            </div>
                        </div>

                        <form @submit.prevent="pay()">
                            <div 
                                class="border border-gray-500 p-2 rounded-sm" 
                                id="card-element" 
                            />

                            <p 
                                id="card-error" 
                                role="alert" 
                                class="text-red-700 text-center font-semibold" 
                            />

                            <button 
                                :disabled="isProcessing"
                                type="submit"
                                class="
                                mt-4
                                    bg-gradient-to-r 
                                  from-[#FE630C] 
                                  to-[#FF3200]
                                    w-full 
                                    text-white 
                                    text-[21px] 
                                    font-semibold 
                                    p-1.5 
                                    rounded-full
                                "
                                :class="isProcessing ? 'opacity-70' : 'opacity-100'"
                            >
                                <Icon v-if="isProcessing" name="eos-icons:loading" />
                                <div v-else>Place order</div>
                            </button>
                        </form>

                    </div>

                    <div class="bg-white rounded-lg p-4 mt-4">
                        <div class="text-lg font-semibold mb-2 mt-2">AliExpress</div>
                        <p class="my-2">
                            AliExpress keeps your information and payment safe
                        </p>

                    </div>
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
const route = useRoute()

definePageMeta({ middleware: "auth" })

let stripe = null
let elements = null
let card = null
let form = null
let total = ref(0)
let clientSecret = null
let currentAddress = ref(null)
let isProcessing = ref(false)

onBeforeMount(async () => {
    if (userStore.checkout.length < 1) {
        return navigateTo('/shoppingcart')
    }

    total.value = 0.00
    if (user.value) {
        currentAddress.value = await useFetch(`/api/prisma/get-address-by-user/${user.value.id}`)
        setTimeout(() => userStore.isLoading = false, 200)
    }
})

watchEffect(() => {
    if (route.fullPath == '/checkout' && !user.value) {
        return navigateTo('/auth')
    }
})

onMounted(async () => {
    isProcessing.value = true

    userStore.checkout.forEach(item => {
        total.value += item.price
    })
})

watch(() => total.value, () => {
    if (total.value > 0) {
        stripeInit()
    }
})

const stripeInit = async () => {
    const runtimeConfig = useRuntimeConfig()
    stripe = Stripe(runtimeConfig.stripePk);

    let res = await $fetch('/api/stripe/paymentintent', {
        method: 'POST',
        body: {
            amount: total.value,
        }
    })
    clientSecret = res.client_secret

    elements = stripe.elements();
    var style = {
        base: {
            fontSize: "18px",
        },
        invalid: {
            fontFamily: 'Arial, sans-serif',
            color: "#EE4B2B",
            iconColor: "#EE4B2B"
        }
    };
    card = elements.create("card", { 
        hidePostalCode: true, 
        style: style 
    });

    // Stripe injects an iframe into the DOM
    card.mount("#card-element");
    card.on("change", function (event) {
        // Disable the Pay button if there are no card details in the Element
        document.querySelector("button").disabled = event.empty;
        document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
    });

    isProcessing.value = false
}

const pay = async () => {
    if (currentAddress.value && currentAddress.value.data == '') {
        showError('Please add shipping address')
        return 
    }
    isProcessing.value = true
    
    let result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: card },
    })

    if (result.error) {
        showError(result.error.message);
        isProcessing.value = false
    } else {
        await createOrder(result.paymentIntent.id)
        userStore.cart = []
        userStore.checkout = []
        setTimeout(() => {
            return navigateTo('/success')
        }, 500)
    }
}

const createOrder = async (stripeId) => {
    await useFetch('/api/prisma/create-order', {
        method: "POST",
        body: {
            userId: user.value.id,
            stripeId: stripeId,
            name: currentAddress.value.data.name,
            address: currentAddress.value.data.address,
            zipcode: currentAddress.value.data.zipcode,
            city: currentAddress.value.data.city,
            country: currentAddress.value.data.country,
            products: userStore.checkout
        }
    })
}

const showError = (errorMsgText) => {
    let errorMsg = document.querySelector("#card-error");

    errorMsg.textContent = errorMsgText;
    setTimeout(() => { errorMsg.textContent = "" }, 4000);
};

</script>
