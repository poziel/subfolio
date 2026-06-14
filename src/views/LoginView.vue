<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Panel from 'primevue/panel'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import {
  databaseProviders,
  defaultFirebaseConnection,
  defaultPocketBaseConnection,
  useDatabaseConnection
} from '../composables/useDatabaseConnection'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const { connection, saveConnection } = useDatabaseConnection()
const { t } = useI18n()
const { activeTheme } = useTheme()

const activeEntryTab = ref('account')
const accountMessage = ref('')
const accountForm = reactive({
  email: '',
  password: ''
})

const form = reactive({
  provider: connection.value?.provider || 'firebase',
  firebase: {
    ...defaultFirebaseConnection,
    ...(connection.value?.firebase || {})
  },
  pocketbase: {
    ...defaultPocketBaseConnection,
    ...(connection.value?.pocketbase || {})
  }
})

const errorMessage = ref('')

const providerOptions = databaseProviders

const isFirebase = computed(() => form.provider === 'firebase')
const isPocketBase = computed(() => form.provider === 'pocketbase')

const handleAccountSignIn = () => {
  accountMessage.value = t('connect.accountUnavailable')
}

const handleConnect = () => {
  errorMessage.value = ''

  try {
    saveConnection({
      provider: form.provider,
      firebase: form.firebase,
      pocketbase: form.pocketbase
    })
    router.push('/app')
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <div class="subfolio-connection-page flex h-dvh justify-center overflow-hidden px-6 py-8">
    <div class="grid w-full max-w-3xl content-start gap-8 pt-8 md:pt-[9vh]">
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
        <Tabs v-model:value="activeEntryTab" class="subfolio-entry-tabs">
          <TabList>
            <Tab value="account">{{ t('connect.account') }}</Tab>
            <Tab value="byodb">{{ t('connect.byodb') }}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel value="account">
              <form class="grid gap-5" @submit.prevent="handleAccountSignIn">
                <div class="grid gap-2">
                  <h1 class="font-serif text-3xl text-ink">{{ t('connect.signInTitle') }}</h1>
                  <p class="muted-copy">
                    {{ t('connect.signInBody') }}
                  </p>
                </div>

                <div class="subfolio-field">
                  <label for="account-email">{{ t('connect.email') }}</label>
                  <InputText
                    id="account-email"
                    v-model="accountForm.email"
                    type="email"
                    autocomplete="email"
                    :placeholder="t('connect.emailPlaceholder')"
                    class="w-full"
                  />
                </div>

                <div class="subfolio-field">
                  <label for="account-password">{{ t('connect.password') }}</label>
                  <Password
                    v-model="accountForm.password"
                    input-id="account-password"
                    autocomplete="current-password"
                    :feedback="false"
                    toggle-mask
                    fluid
                  />
                </div>

                <Message v-if="accountMessage" severity="info" :closable="false">
                  {{ accountMessage }}
                </Message>

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <RouterLink v-slot="{ navigate }" to="/" custom>
                    <Button
                      type="button"
                      :label="t('connect.returnOverview')"
                      icon="pi pi-arrow-left"
                      severity="secondary"
                      text
                      @click="navigate"
                    />
                  </RouterLink>
                  <Button type="submit" :label="t('connect.signIn')" icon="pi pi-user" />
                </div>
              </form>
            </TabPanel>

            <TabPanel value="byodb">
              <form class="grid gap-5" @submit.prevent="handleConnect">
                <div class="grid gap-2">
                  <h1 class="font-serif text-3xl text-ink">{{ t('connect.byodb') }}</h1>
                  <p class="muted-copy">
                    {{ t('connect.byodbBody') }}
                  </p>
                </div>

                <div class="subfolio-field">
                  <label for="provider">{{ t('connect.provider') }}</label>
                  <Select
                    v-model="form.provider"
                    input-id="provider"
                    :options="providerOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="t('connect.chooseProvider')"
                    class="w-full"
                  />
                </div>

                <Panel v-if="isFirebase" header="Firebase Realtime Database" toggleable>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div class="subfolio-field sm:col-span-2">
                      <label for="firebase-database-url">{{ t('connect.databaseUrl') }}</label>
                      <InputText
                        id="firebase-database-url"
                        v-model="form.firebase.databaseURL"
                        type="url"
                        placeholder="https://your-project-default-rtdb.firebaseio.com"
                        required
                        class="w-full"
                      />
                    </div>
                    <div class="subfolio-field sm:col-span-2">
                      <label for="firebase-api-key">{{ t('connect.apiKey') }}</label>
                      <InputText
                        id="firebase-api-key"
                        v-model="form.firebase.apiKey"
                        required
                        class="w-full"
                      />
                    </div>
                    <div class="subfolio-field">
                      <label for="firebase-project-id">{{ t('connect.projectId') }}</label>
                      <InputText id="firebase-project-id" v-model="form.firebase.projectId" class="w-full" />
                    </div>
                    <div class="subfolio-field">
                      <label for="firebase-app-id">{{ t('connect.appId') }}</label>
                      <InputText id="firebase-app-id" v-model="form.firebase.appId" class="w-full" />
                    </div>
                    <div class="subfolio-field">
                      <label for="firebase-auth-domain">{{ t('connect.authDomain') }}</label>
                      <InputText
                        id="firebase-auth-domain"
                        v-model="form.firebase.authDomain"
                        placeholder="your-project.firebaseapp.com"
                        class="w-full"
                      />
                    </div>
                    <div class="subfolio-field">
                      <label for="firebase-path">{{ t('connect.dataPath') }}</label>
                      <InputText id="firebase-path" v-model="form.firebase.path" required class="w-full" />
                    </div>
                  </div>
                </Panel>

                <Panel v-if="isPocketBase" header="PocketBase" toggleable>
                  <div class="grid gap-4">
                    <div class="subfolio-field">
                      <label for="pocketbase-url">{{ t('connect.pocketbaseUrl') }}</label>
                      <InputText
                        id="pocketbase-url"
                        v-model="form.pocketbase.url"
                        type="url"
                        placeholder="https://your-pocketbase.example.com"
                        required
                        class="w-full"
                      />
                    </div>
                    <div class="subfolio-field">
                      <label for="pocketbase-collection">{{ t('connect.collection') }}</label>
                      <InputText
                        id="pocketbase-collection"
                        v-model="form.pocketbase.collection"
                        required
                        class="w-full"
                      />
                    </div>
                  </div>
                </Panel>

                <Message v-if="errorMessage" severity="error" :closable="false">
                  {{ errorMessage }}
                </Message>

                <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <RouterLink v-slot="{ navigate }" to="/" custom>
                    <Button
                      type="button"
                      :label="t('connect.returnOverview')"
                      icon="pi pi-arrow-left"
                      severity="secondary"
                      text
                      @click="navigate"
                    />
                  </RouterLink>
                  <Button type="submit" :label="t('connect.connectDatabase')" icon="pi pi-database" />
                </div>
              </form>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </template>
    </Card>
    </div>
  </div>
</template>
