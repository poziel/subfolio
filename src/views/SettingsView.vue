<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { useSettings } from '../composables/useSettings'
import { useDatabaseConnection } from '../composables/useDatabaseConnection'
import { useI18n } from '../composables/useI18n'

const {
  displayedCurrency,
  availableCurrencies,
  allCurrencies,
  setDisplayedCurrency,
  setAvailableCurrencies,
  conversionStatus,
  defaultOrdering,
  setDefaultOrdering
} = useSettings()

const { connection, providerLabel } = useDatabaseConnection()
const { t } = useI18n()

const sortedCurrencies = computed(() => [...allCurrencies].sort())
const currencyOptions = computed(() => sortedCurrencies.value.map((curr) => ({ value: curr, label: curr })))

const displayedModel = computed({
  get: () => displayedCurrency.value,
  set: (next) => {
    setDisplayedCurrency(next)
    if (!availableCurrencies.value.includes(next)) {
      setAvailableCurrencies([...availableCurrencies.value, next])
    }
  }
})

const availableModel = computed({
  get: () => availableCurrencies.value,
  set: (next) => {
    const merged = new Set(next)
    merged.add(displayedCurrency.value)
    setAvailableCurrencies(Array.from(merged))
  }
})

const statusSeverity = computed(() => {
  if (conversionStatus.value === 'loading') return 'info'
  if (conversionStatus.value === 'error') return 'warn'
  return 'success'
})

const statusLabel = computed(() => {
  if (conversionStatus.value === 'loading') return t('settings.ratesRefreshing')
  if (conversionStatus.value === 'error') return t('settings.ratesOffline')
  return t('settings.ratesReady')
})

const orderingOptions = computed(() => [
  { value: 'dateAdded', label: t('settings.orderingDateAdded') },
  { value: 'amountAsc', label: t('settings.orderingAmountAsc') },
  { value: 'amountDesc', label: t('settings.orderingAmountDesc') },
  { value: 'category', label: t('settings.orderingCategory') },
  { value: 'manual', label: t('settings.orderingManual') }
])

const orderingModel = computed({
  get: () => defaultOrdering.value,
  set: (value) => setDefaultOrdering(value)
})

const connectionDetail = computed(() => {
  if (connection.value?.provider === 'firebase') {
    return connection.value.firebase.databaseURL
  }

  if (connection.value?.provider === 'pocketbase') {
    return `${connection.value.pocketbase.url} / ${connection.value.pocketbase.collection}`
  }

  return t('settings.noConnection')
})
</script>

<template>
  <div class="app-page">
    <header class="grid gap-2">
      <h1 class="font-serif text-3xl text-ink">{{ t('settings.title') }}</h1>
      <p class="muted-copy">{{ t('settings.intro') }}</p>
      <p class="text-sm muted-copy">{{ t('settings.local') }}</p>
    </header>

    <Card>
      <template #title>{{ t('settings.databaseTitle') }}</template>
      <template #subtitle>{{ providerLabel }}</template>
      <template #content>
        <p class="break-all muted-copy">{{ connectionDetail }}</p>
      </template>
      <template #footer>
        <RouterLink v-slot="{ navigate }" to="/connect" custom>
          <Button
            type="button"
            :label="t('settings.changeConnection')"
            icon="pi pi-database"
            severity="secondary"
            outlined
            @click="navigate"
          />
        </RouterLink>
      </template>
    </Card>

    <Card>
      <template #title>{{ t('settings.currencyTitle') }}</template>
      <template #subtitle>{{ t('settings.currencySubtitle') }}</template>
      <template #content>
        <div class="grid gap-5">
          <div class="grid gap-3 lg:grid-cols-[1fr_16rem] lg:items-center">
            <div>
              <p class="font-semibold text-ink">{{ t('settings.displayedCurrency') }}</p>
              <p class="text-sm muted-copy">{{ t('settings.displayedCurrencyDetail') }}</p>
            </div>
            <Select
              v-model="displayedModel"
              :options="currencyOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('settings.currencyPlaceholder')"
              class="w-full"
            />
          </div>

          <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start">
            <div>
              <div class="mb-2 flex items-center gap-2">
                <p class="font-semibold text-ink">{{ t('settings.availableCurrencies') }}</p>
                <Tag :value="statusLabel" :severity="statusSeverity" rounded />
              </div>
              <p class="text-sm muted-copy">{{ t('settings.availableCurrenciesDetail') }}</p>
            </div>
            <MultiSelect
              v-model="availableModel"
              :options="currencyOptions"
              option-label="label"
              option-value="value"
              filter
              :placeholder="t('settings.selectCurrencies')"
              display="chip"
              class="subfolio-currency-select w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <Card>
      <template #title>{{ t('settings.orderingTitle') }}</template>
      <template #subtitle>{{ t('settings.orderingSubtitle') }}</template>
      <template #content>
        <div class="grid gap-5">
          <div class="grid gap-3 lg:grid-cols-[1fr_18rem] lg:items-center">
            <div>
              <p class="font-semibold text-ink">{{ t('settings.defaultOrdering') }}</p>
              <p class="text-sm muted-copy">{{ t('settings.defaultOrderingDetail') }}</p>
            </div>
            <Select
              v-model="orderingModel"
              :options="orderingOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('settings.orderingPlaceholder')"
              class="w-full"
            />
          </div>

          <Message v-if="defaultOrdering === 'manual'" severity="info" :closable="false">
            {{ t('settings.manualNotice') }}
          </Message>
        </div>
      </template>
    </Card>
  </div>
</template>
