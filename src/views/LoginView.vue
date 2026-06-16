<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import SubfolioButton from '../components/SubfolioButton.vue'
import { useAuth } from '../composables/useAuth'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const { login } = useAuth()
const { t } = useI18n()
const { activeTheme } = useTheme()

const loginForm = reactive({
  email: '',
  password: ''
})
const errorMessage = ref('')

const handleSignIn = async () => {
  errorMessage.value = ''

  try {
    login(loginForm)
    await router.push('/app')
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <div class="subfolio-connection-page flex h-dvh justify-center overflow-hidden px-6 py-8">
    <div class="grid w-full max-w-xl content-start gap-8 pt-8 md:pt-[9vh]">
      <header class="grid justify-items-center gap-3 text-center">
        <RouterLink class="inline-flex justify-center" to="/">
          <img
            :src="activeTheme === 'dark' ? '/images/subfolio-light-tagline-1.svg' : '/images/subfolio-dark-tagline-1.svg'"
            alt="Subfolio"
            class="h-[100px] w-auto max-w-[30rem]"
          />
        </RouterLink>
      </header>

      <Card class="subfolio-connection-card w-full">
        <template #content>
          <form class="grid gap-5" @submit.prevent="handleSignIn">
            <div class="grid gap-2">
              <h1 class="font-serif text-3xl text-ink">{{ t('connect.signInTitle') }}</h1>
              <p class="muted-copy">
                {{ t('connect.signInBody') }}
              </p>
            </div>

            <Message severity="info" :closable="false">
              {{ t('connect.temporaryAccess') }}
            </Message>

            <div class="subfolio-field">
              <label for="account-email">{{ t('connect.email') }}</label>
              <InputText
                id="account-email"
                v-model="loginForm.email"
                data-test-id="login-email"
                type="email"
                autocomplete="email"
                :placeholder="t('connect.emailPlaceholder')"
                class="w-full"
              />
            </div>

            <div class="subfolio-field">
              <label for="account-password">{{ t('connect.password') }}</label>
              <Password
                v-model="loginForm.password"
                data-test-id="login-password"
                input-id="account-password"
                autocomplete="current-password"
                :placeholder="t('connect.passwordPlaceholder')"
                :feedback="false"
                toggle-mask
                fluid
              />
            </div>

            <Message v-if="errorMessage" severity="error" :closable="false">
              {{ errorMessage }}
            </Message>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <RouterLink v-slot="{ navigate }" to="/" custom>
                <SubfolioButton
                  type="button"
                  :label="t('connect.returnOverview')"
                  icon="pi pi-arrow-left"
                  variant="tertiary"
                  theme="secondary"
                  @click="navigate"
                />
              </RouterLink>
              <SubfolioButton
                type="submit"
                data-test-id="login-submit"
                :label="t('connect.signIn')"
                icon="pi pi-user"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>
