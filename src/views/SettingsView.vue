<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import SubfolioIconTile from '../components/icons/SubfolioIconTile.vue'
import SubfolioButton from '../components/SubfolioButton.vue'
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
  setDefaultOrdering,
  contentLayoutMode,
  contentLayoutModes,
  setContentLayoutMode,
  metricIds,
  selectedMetricSlots,
  setSelectedMetricSlots,
  incomeType,
  salaryCurrency,
  annualSalary,
  hourlyRate,
  hoursPerWeek,
  weeksPerYear,
  annualIncome,
  annualIncomeDisplayed,
  formatMoney
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

const metricOptions = computed(() =>
  [
    { value: '', label: t('settings.metricNone') },
    ...metricIds.map((id) => ({
      value: id,
      label: t(`summaryMetrics.${id}`)
    }))
  ]
)

const incomeTypeOptions = computed(() => [
  { value: 'annual', label: t('settings.incomeTypeAnnual') },
  { value: 'hourly', label: t('settings.incomeTypeHourly') }
])

const contentLayoutOptions = computed(() =>
  contentLayoutModes.map((value) => ({
    value,
    label: t(`settings.contentLayout_${value}`)
  }))
)

const orderingModel = computed({
  get: () => defaultOrdering.value,
  set: (value) => setDefaultOrdering(value)
})

const contentLayoutModel = computed({
  get: () => contentLayoutMode.value,
  set: (value) => setContentLayoutMode(value)
})

const metricSlotIndexes = [0, 1, 2, 3]

const setMetricSlot = (index, value) => {
  const nextSlots = [...selectedMetricSlots.value]
  nextSlots[index] = value || ''
  setSelectedMetricSlots(nextSlots)
}

const incomeTypeModel = computed({
  get: () => incomeType.value,
  set: (value) => {
    incomeType.value = value
  }
})

const salaryCurrencyModel = computed({
  get: () => salaryCurrency.value,
  set: (value) => {
    salaryCurrency.value = value
    if (!availableCurrencies.value.includes(value)) {
      setAvailableCurrencies([...availableCurrencies.value, value])
    }
  }
})

const annualSalaryModel = computed({
  get: () => annualSalary.value,
  set: (value) => {
    annualSalary.value = value
  }
})

const hourlyRateModel = computed({
  get: () => hourlyRate.value,
  set: (value) => {
    hourlyRate.value = value
  }
})

const hoursPerWeekModel = computed({
  get: () => hoursPerWeek.value,
  set: (value) => {
    hoursPerWeek.value = value
  }
})

const weeksPerYearModel = computed({
  get: () => weeksPerYear.value,
  set: (value) => {
    weeksPerYear.value = value
  }
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
    <header class="grid gap-2">
      <h1 class="font-serif text-4xl text-ink">{{ t('settings.title') }}</h1>
      <p class="muted-copy">{{ t('settings.intro') }}</p>
      <p class="text-sm muted-copy">{{ t('settings.local') }}</p>
    </header>

    <Card>
      <template #content>
          <div class="flex flex-col gap-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <SubfolioIconTile icon="pi pi-database" />
              <div>
                <h2 class="text-xl font-semibold text-ink">{{ t('settings.databaseTitle') }}</h2>
                <p class="mt-1 break-all text-sm muted-copy">{{ connectionDetail }}</p>
              </div>
            </div>
            <Tag :value="providerLabel" severity="info" rounded />
          </div>
          <Message severity="success" :closable="false">
            {{ t('settings.databaseTitle') }}: {{ providerLabel }}
          </Message>
        </div>
      </template>
      <template #footer>
        <RouterLink v-slot="{ navigate }" to="/connect" custom>
          <SubfolioButton
            type="button"
            :label="t('settings.changeConnection')"
            icon="pi pi-database"
            variant="secondary"
            theme="secondary"
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
          <div class="settings-panel-row">
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

          <div class="settings-panel-row lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
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
      <template #title>{{ t('settings.layoutTitle') }}</template>
      <template #subtitle>{{ t('settings.layoutSubtitle') }}</template>
      <template #content>
        <div class="settings-panel-row">
          <div>
            <p class="font-semibold text-ink">{{ t('settings.contentLayout') }}</p>
            <p class="text-sm muted-copy">{{ t('settings.contentLayoutDetail') }}</p>
          </div>
          <Select
            v-model="contentLayoutModel"
            data-test-id="settings-content-layout"
            :options="contentLayoutOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>
      </template>
    </Card>

    <Card>
      <template #title>{{ t('settings.orderingTitle') }}</template>
      <template #subtitle>{{ t('settings.orderingSubtitle') }}</template>
      <template #content>
        <div class="grid gap-5">
          <div class="settings-panel-row">
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

    <Card>
      <template #title>{{ t('settings.metricCardsTitle') }}</template>
      <template #subtitle>{{ t('settings.metricCardsSubtitle') }}</template>
      <template #content>
        <div class="grid gap-5">
          <div>
            <p class="font-semibold text-ink">{{ t('settings.metricCards') }}</p>
            <p class="text-sm muted-copy">{{ t('settings.metricCardsDetail') }}</p>
          </div>
          <div class="settings-metric-slots">
            <label
              v-for="index in metricSlotIndexes"
              :key="index"
              class="settings-metric-slot"
            >
              <span class="settings-metric-slot__label">
                {{ t('settings.metricSlotLabel', { number: index + 1 }) }}
              </span>
              <Select
                :model-value="selectedMetricSlots[index] || ''"
                :data-test-id="`settings-summary-metric-${index + 1}`"
                :options="metricOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('settings.metricCardsPlaceholder')"
                class="w-full"
                @update:model-value="setMetricSlot(index, $event)"
              />
            </label>
          </div>
        </div>
      </template>
    </Card>

    <Card>
      <template #title>{{ t('settings.incomeTitle') }}</template>
      <template #subtitle>{{ t('settings.incomeSubtitle') }}</template>
      <template #content>
        <div class="grid gap-5">
          <div class="settings-panel-row">
            <div>
              <p class="font-semibold text-ink">{{ t('settings.incomeType') }}</p>
              <p class="text-sm muted-copy">{{ t('settings.incomeTypeDetail') }}</p>
            </div>
            <Select
              v-model="incomeTypeModel"
              :options="incomeTypeOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>

          <div class="settings-panel-row">
            <div>
              <p class="font-semibold text-ink">{{ t('settings.salaryCurrency') }}</p>
              <p class="text-sm muted-copy">{{ t('settings.salaryCurrencyDetail') }}</p>
            </div>
            <Select
              v-model="salaryCurrencyModel"
              :options="currencyOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('settings.currencyPlaceholder')"
              class="w-full"
            />
          </div>

          <div v-if="incomeType === 'annual'" class="settings-panel-row">
            <div>
              <p class="font-semibold text-ink">{{ t('settings.annualSalary') }}</p>
              <p class="text-sm muted-copy">{{ t('settings.annualSalaryDetail') }}</p>
            </div>
            <InputNumber
              v-model="annualSalaryModel"
              mode="currency"
              :currency="salaryCurrency"
              locale="en-CA"
              :min="0"
              class="w-full"
            />
          </div>

          <div v-else class="grid gap-5">
            <div class="settings-panel-row">
              <div>
                <p class="font-semibold text-ink">{{ t('settings.hourlyRate') }}</p>
                <p class="text-sm muted-copy">{{ t('settings.hourlyRateDetail') }}</p>
              </div>
              <InputNumber
                v-model="hourlyRateModel"
                mode="currency"
                :currency="salaryCurrency"
                locale="en-CA"
                :min="0"
                class="w-full"
              />
            </div>

            <div class="settings-panel-row lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)_minmax(0,15rem)]">
              <div>
                <p class="font-semibold text-ink">{{ t('settings.workSchedule') }}</p>
                <p class="text-sm muted-copy">{{ t('settings.workScheduleDetail') }}</p>
              </div>
              <InputNumber
                v-model="hoursPerWeekModel"
                :min="1"
                :max="168"
                :suffix="` ${t('settings.hoursPerWeekSuffix')}`"
                class="w-full"
              />
              <InputNumber
                v-model="weeksPerYearModel"
                :min="1"
                :max="52"
                :suffix="` ${t('settings.weeksPerYearSuffix')}`"
                class="w-full"
              />
            </div>
          </div>

          <Message severity="info" :closable="false">
            {{ t('settings.annualIncomePreview') }}:
            {{ formatMoney(annualIncomeDisplayed, displayedCurrency) }}
            <span v-if="salaryCurrency !== displayedCurrency" class="muted-copy">
              ({{ formatMoney(annualIncome, salaryCurrency, { withCode: true }) }})
            </span>
          </Message>
        </div>
      </template>
    </Card>
</template>
