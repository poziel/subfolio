<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import SubfolioButton from '../components/SubfolioButton.vue'
import { getAuthErrorMessage, useAuth } from '../composables/useAuth'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const router = useRouter()
const {
  currentUser,
  isAuthenticated,
  needsVerification,
  createAccount,
  signIn,
  resendVerification,
  confirmVerification,
  restoreSession
} = useAuth()
const { t } = useI18n()
const { activeTheme } = useTheme()

const mode = ref('signIn')
const errorMessage = ref('')
const statusMessage = ref('')
const statusSeverity = ref('success')
const isSubmitting = ref(false)
const verificationEmail = ref('')

const signInForm = reactive({
  identity: '',
  password: ''
})
const signUpForm = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  passwordConfirm: ''
})

const modeOptions = computed(() => [
  { value: 'signIn', label: t('connect.signIn') },
  { value: 'signUp', label: t('connect.createAccount') }
])

const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/app')
    ? route.query.redirect
    : '/app'
)

const clearFeedback = () => {
  errorMessage.value = ''
  statusMessage.value = ''
}

const setStatus = (message, severity = 'success') => {
  statusMessage.value = message
  statusSeverity.value = severity
}

const setVerificationEmail = (email) => {
  verificationEmail.value = email || currentUser.value?.email || ''
}

const switchMode = (nextMode) => {
  mode.value = nextMode
  clearFeedback()
}

const completeIfAuthenticated = async () => {
  if (!isAuthenticated.value) return false
  await router.push(redirectTarget.value)
  return true
}

const runAuthAction = async (action) => {
  clearFeedback()
  isSubmitting.value = true

  try {
    await action()
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSignIn = () =>
  runAuthAction(async () => {
    const record = await signIn(signInForm)

    if (record?.verified) {
      await completeIfAuthenticated()
      return
    }

    setVerificationEmail(record?.email)
    setStatus(t('connect.verificationRequired'), 'warn')
  })

const handleCreateAccount = () =>
  runAuthAction(async () => {
    const email = await createAccount(signUpForm)
    signUpForm.password = ''
    signUpForm.passwordConfirm = ''
    setVerificationEmail(email)
    mode.value = 'signIn'
    setStatus(t('connect.verificationSent', { email }))
  })

const handleResendVerification = () =>
  runAuthAction(async () => {
    const email = await resendVerification(verificationEmail.value)
    setVerificationEmail(email)
    setStatus(t('connect.verificationResent', { email }))
  })

onMounted(async () => {
  const token = route.query.verification || route.query.token

  if (typeof token === 'string' && token) {
    await runAuthAction(async () => {
      await confirmVerification(token)

      if (await completeIfAuthenticated()) return

      mode.value = 'signIn'
      setStatus(t('connect.verificationConfirmed'))
      await router.replace({
        name: 'connect',
        query: route.query.redirect ? { redirect: route.query.redirect } : {}
      })
    })
    return
  }

  const restored = await restoreSession()

  if (restored) {
    await completeIfAuthenticated()
    return
  }

  if (needsVerification.value) {
    setVerificationEmail(currentUser.value?.email)
    setStatus(t('connect.verificationRequired'), 'warn')
  }
})
</script>

<template>
  <div class="subfolio-connection-page flex min-h-dvh justify-center overflow-y-auto px-6 py-8">
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
          <div class="grid gap-5">
            <div class="connect-mode-switch" role="tablist" :aria-label="t('connect.accountMode')">
              <button
                v-for="option in modeOptions"
                :key="option.value"
                type="button"
                class="connect-mode-switch__button"
                :class="{ 'connect-mode-switch__button--active': mode === option.value }"
                :aria-selected="mode === option.value"
                role="tab"
                @click="switchMode(option.value)"
              >
                {{ option.label }}
              </button>
            </div>

            <form v-if="mode === 'signIn'" class="grid gap-5" @submit.prevent="handleSignIn">
              <div class="grid gap-2">
                <h1 class="font-serif text-3xl text-ink">{{ t('connect.signInTitle') }}</h1>
                <p class="muted-copy">
                  {{ t('connect.signInBody') }}
                </p>
              </div>

              <div class="subfolio-field">
                <label for="account-identity">{{ t('connect.identity') }}</label>
                <InputText
                  id="account-identity"
                  v-model="signInForm.identity"
                  data-test-id="login-identity"
                  type="text"
                  autocomplete="username"
                  :placeholder="t('connect.identityPlaceholder')"
                  class="w-full"
                  required
                />
              </div>

              <div class="subfolio-field">
                <label for="account-password">{{ t('connect.password') }}</label>
                <Password
                  v-model="signInForm.password"
                  data-test-id="login-password"
                  input-id="account-password"
                  autocomplete="current-password"
                  :placeholder="t('connect.passwordPlaceholder')"
                  :feedback="false"
                  toggle-mask
                  fluid
                  required
                />
              </div>

              <Message v-if="needsVerification" severity="warn" :closable="false">
                <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <span>{{ t('connect.verificationRequired') }}</span>
                  <SubfolioButton
                    type="button"
                    data-test-id="verification-resend"
                    :label="t('connect.resendVerification')"
                    icon="pi pi-send"
                    variant="secondary"
                    size="small"
                    :loading="isSubmitting"
                    @click="handleResendVerification"
                  />
                </div>
              </Message>

              <Message v-if="errorMessage" severity="error" :closable="false">
                {{ errorMessage }}
              </Message>
              <Message v-if="statusMessage" :severity="statusSeverity" :closable="false">
                {{ statusMessage }}
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
                  :loading="isSubmitting"
                />
              </div>
            </form>

            <form v-else class="grid gap-5" @submit.prevent="handleCreateAccount">
              <div class="grid gap-2">
                <h1 class="font-serif text-3xl text-ink">{{ t('connect.createAccountTitle') }}</h1>
                <p class="muted-copy">
                  {{ t('connect.createAccountBody') }}
                </p>
              </div>

              <div class="subfolio-field">
                <label for="create-account-name">{{ t('connect.displayName') }}</label>
                <InputText
                  id="create-account-name"
                  v-model="signUpForm.name"
                  data-test-id="signup-name"
                  autocomplete="name"
                  :placeholder="t('connect.displayNamePlaceholder')"
                  class="w-full"
                />
              </div>

              <div class="subfolio-field">
                <label for="create-account-username">{{ t('connect.username') }}</label>
                <InputText
                  id="create-account-username"
                  v-model="signUpForm.username"
                  data-test-id="signup-username"
                  autocomplete="username"
                  :placeholder="t('connect.usernamePlaceholder')"
                  class="w-full"
                  required
                />
              </div>

              <div class="subfolio-field">
                <label for="create-account-email">{{ t('connect.email') }}</label>
                <InputText
                  id="create-account-email"
                  v-model="signUpForm.email"
                  data-test-id="signup-email"
                  type="email"
                  autocomplete="email"
                  :placeholder="t('connect.emailPlaceholder')"
                  class="w-full"
                  required
                />
              </div>

              <div class="subfolio-field">
                <label for="create-account-password">{{ t('connect.password') }}</label>
                <Password
                  v-model="signUpForm.password"
                  data-test-id="signup-password"
                  input-id="create-account-password"
                  autocomplete="new-password"
                  :placeholder="t('connect.createPasswordPlaceholder')"
                  :feedback="false"
                  toggle-mask
                  fluid
                  required
                />
              </div>

              <div class="subfolio-field">
                <label for="create-account-password-confirm">{{ t('connect.passwordConfirm') }}</label>
                <Password
                  v-model="signUpForm.passwordConfirm"
                  data-test-id="signup-password-confirm"
                  input-id="create-account-password-confirm"
                  autocomplete="new-password"
                  :placeholder="t('connect.passwordConfirmPlaceholder')"
                  :feedback="false"
                  toggle-mask
                  fluid
                  required
                />
              </div>

              <Message v-if="errorMessage" severity="error" :closable="false">
                {{ errorMessage }}
              </Message>
              <Message v-if="statusMessage" :severity="statusSeverity" :closable="false">
                {{ statusMessage }}
              </Message>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SubfolioButton
                  type="button"
                  :label="t('connect.haveAccount')"
                  icon="pi pi-arrow-left"
                  variant="tertiary"
                  theme="secondary"
                  @click="switchMode('signIn')"
                />
                <SubfolioButton
                  type="submit"
                  data-test-id="signup-submit"
                  :label="t('connect.createAccount')"
                  icon="pi pi-user-plus"
                  :loading="isSubmitting"
                />
              </div>
            </form>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.connect-mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
  background: var(--color-surface-muted);
}

.connect-mode-switch__button {
  min-height: 2.45rem;
  border: 1px solid transparent;
  border-radius: calc(var(--radius-sm) - 0.2rem);
  background: transparent;
  color: var(--color-copy-secondary);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.1;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.connect-mode-switch__button:hover,
.connect-mode-switch__button:focus-visible {
  color: var(--color-ink);
  outline: 0;
}

.connect-mode-switch__button--active {
  border-color: color-mix(in srgb, var(--brand-teal) 42%, transparent);
  background: var(--color-surface-strong);
  color: var(--color-ink);
  box-shadow:
    0 1px 4px rgba(23, 60, 57, 0.12),
    inset 0 -2px 0 var(--brand-teal);
}
</style>
