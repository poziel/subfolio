<script setup>
import { computed, ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import { findKnownService, knownServices, serviceIconOptions } from '../data/serviceCatalog'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import SubfolioButton from './SubfolioButton.vue'

const {
  showAddModal,
  editingId,
  form,
  baseCategories,
  extraCategories,
  expenses,
  saving,
  closeModal,
  saveExpense,
  currencies,
  frequencyOptions,
  weekdays,
  ordinals,
  months,
  availableDatePatternTypes,
  getAutoTaxRate
} = useExpenses()
const { t } = useI18n()

const isEditing = computed(() => editingId.value !== null)
const categorySuggestions = ref([])
const servicePresetModel = ref(null)

const categoryOptions = computed(() => {
  const categories = new Set(baseCategories)
  extraCategories.value.forEach((item) => categories.add(item))
  expenses.value.forEach((item) => categories.add(item.category))
  return Array.from(categories).sort()
})

const modalTitle = computed(() => (isEditing.value ? t('expenseForm.editTitle') : t('expenseForm.addTitle')))
const modalSubtitle = computed(() =>
  isEditing.value ? t('expenseForm.editSubtitle') : t('expenseForm.addSubtitle')
)
const buttonLabel = computed(() => (isEditing.value ? t('expenseForm.saveButton') : t('expenseForm.addButton')))

const currencyOptions = computed(() => currencies.value.map((curr) => ({ value: curr, label: curr })))
const frequencySelectOptions = computed(() => frequencyOptions.map((freq) => ({ value: freq.value, label: t(`frequencies.${freq.value}`) })))
const servicePresetOptions = computed(() => knownServices.map((service) => ({ value: service.id, label: service.name })))
const iconOptions = computed(() => serviceIconOptions)
const patternTypeOptions = computed(() => availableDatePatternTypes.value.map((pt) => ({ value: pt.value, label: t(`expenseForm.patterns.${pt.value}`) === `expenseForm.patterns.${pt.value}` ? pt.label : t(`expenseForm.patterns.${pt.value}`) })))
const dayOptions = computed(() => daysInMonth.map((day) => ({ value: day, label: String(day) })))
const weekdayOptions = computed(() => weekdays.map((day, idx) => ({ value: idx, label: t(`expenseForm.weekdays.${idx}`) === `expenseForm.weekdays.${idx}` ? day : t(`expenseForm.weekdays.${idx}`) })))
const ordinalOptions = computed(() => ordinals.map((ord, idx) => ({ value: idx + 1, label: t(`expenseForm.ordinals.${idx}`) === `expenseForm.ordinals.${idx}` ? ord : t(`expenseForm.ordinals.${idx}`) })))
const monthOptions = computed(() => months.map((month, idx) => ({ value: idx, label: t(`expenseForm.months.${idx}`) === `expenseForm.months.${idx}` ? month : t(`expenseForm.months.${idx}`) })))
const autoTaxRate = computed(() => getAutoTaxRate(form.currency))
const addTaxModel = computed({
  get: () => !form.includesTax,
  set: (value) => {
    form.includesTax = !value
  }
})

const formatDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startDateModel = computed({
  get: () => (form.startDate ? new Date(`${form.startDate}T00:00:00`) : null),
  set: (date) => {
    form.startDate = date instanceof Date ? formatDateInput(date) : ''
  }
})

const searchCategories = (event) => {
  const query = event.query.toLowerCase().trim()
  categorySuggestions.value = categoryOptions.value.filter((item) =>
    item.toLowerCase().includes(query)
  )
}

const applyServicePreset = (value) => {
  const service = knownServices.find((item) => item.id === value)
  if (!service) return

  form.name = service.name
  form.url = service.url
  form.category = service.category
  form.icon = service.icon
}

const handleVisibleChange = (visible) => {
  if (!visible) closeModal()
}

watch(showAddModal, (visible) => {
  if (!visible) {
    servicePresetModel.value = null
    return
  }

  servicePresetModel.value = findKnownService(form.name)?.id || null
})

watch(() => form.frequency, () => {
  const availableTypes = availableDatePatternTypes.value
  if (!availableTypes.find((type) => type.value === form.datePattern.type)) {
    form.datePattern.type = availableTypes[0]?.value || 'day-of-month'
  }
})

watch(() => form.currency, () => {
  if (!form.includesTax) {
    form.taxRate = getAutoTaxRate(form.currency)
  }
})

watch(() => form.includesTax, (includes) => {
  form.taxRate = includes ? 0 : getAutoTaxRate(form.currency)
})

const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
</script>

<template>
  <Dialog
    :visible="showAddModal"
    modal
    :closable="false"
    :draggable="false"
    aria-labelledby="expense-modal-title"
    class="subfolio-expense-dialog w-[min(96vw,46rem)]"
    @update:visible="handleVisibleChange"
  >
    <template #header>
      <div class="subfolio-expense-dialog__header">
        <div class="min-w-0">
          <h2 id="expense-modal-title" class="subfolio-expense-dialog__title">{{ modalTitle }}</h2>
          <p class="subfolio-expense-dialog__subtitle">{{ modalSubtitle }}</p>
        </div>
        <SubfolioButton
          type="button"
          icon="pi pi-times"
          :aria-label="t('expenseForm.cancel')"
          variant="tertiary"
          theme="secondary"
          class="subfolio-expense-dialog__close"
          :disabled="saving"
          @click="closeModal"
        />
      </div>
    </template>

    <form id="subfolio-expense-form" class="subfolio-expense-form grid gap-5" @submit.prevent="saveExpense">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="subfolio-field sm:col-span-2">
          <label for="modal-service-preset">{{ t('expenseForm.servicePreset') }}</label>
          <Select
            v-model="servicePresetModel"
            input-id="modal-service-preset"
            :options="servicePresetOptions"
            option-label="label"
            option-value="value"
            show-clear
            :placeholder="t('expenseForm.servicePresetPlaceholder')"
            :disabled="saving"
            class="w-full"
            @update:model-value="applyServicePreset"
          />
        </div>

        <div class="subfolio-field sm:col-span-2">
          <label for="modal-expense-name">{{ t('expenseForm.name') }}</label>
          <InputText
            id="modal-expense-name"
            v-model="form.name"
            :placeholder="t('expenseForm.namePlaceholder')"
            :disabled="saving"
            class="w-full"
          />
        </div>

        <div class="subfolio-field">
          <label for="modal-expense-url">{{ t('expenseForm.serviceUrl') }} <span class="font-normal muted-copy">{{ t('expenseForm.optional') }}</span></label>
          <InputText
            id="modal-expense-url"
            v-model="form.url"
            type="url"
            placeholder="https://example.com"
            :disabled="saving"
            class="w-full"
          />
        </div>

        <div class="subfolio-field">
          <label for="modal-expense-icon">{{ t('expenseForm.icon') }}</label>
          <Select
            v-model="form.icon"
            input-id="modal-expense-icon"
            :options="iconOptions"
            option-label="label"
            option-value="value"
            show-clear
            :placeholder="t('expenseForm.iconPlaceholder')"
            :disabled="saving"
            class="w-full"
          >
            <template #value="{ value, placeholder }">
              <span v-if="value" class="subfolio-icon-select-value">
                <span :class="value" aria-hidden="true" />
                <span>{{ iconOptions.find((item) => item.value === value)?.label || value }}</span>
              </span>
              <span v-else>{{ placeholder }}</span>
            </template>
            <template #option="{ option }">
              <span class="subfolio-icon-select-value">
                <span :class="option.value" aria-hidden="true" />
                <span>{{ option.label }}</span>
              </span>
            </template>
          </Select>
        </div>

        <div class="subfolio-field sm:col-span-2">
          <label for="modal-expense-category">{{ t('expenseForm.category') }}</label>
          <AutoComplete
            id="modal-expense-category"
            v-model="form.category"
            :suggestions="categorySuggestions"
            dropdown
            :force-selection="false"
            :placeholder="t('expenseForm.categoryPlaceholder')"
            :disabled="saving"
            class="w-full"
            input-class="w-full"
            @complete="searchCategories"
          />
        </div>

        <div class="subfolio-field sm:col-span-2">
          <label for="modal-expense-note">{{ t('expenseForm.note') }} <span class="font-normal muted-copy">{{ t('expenseForm.optional') }}</span></label>
          <Textarea
            id="modal-expense-note"
            v-model="form.note"
            rows="3"
            auto-resize
            :placeholder="t('expenseForm.notePlaceholder')"
            :disabled="saving"
            class="w-full"
          />
        </div>

        <div class="subfolio-field">
          <label for="modal-expense-amount">{{ t('expenseForm.amount') }}</label>
          <InputNumber
            v-model="form.amount"
            input-id="modal-expense-amount"
            mode="decimal"
            :min="0"
            :min-fraction-digits="0"
            :max-fraction-digits="2"
            placeholder="19.99"
            :disabled="saving"
            class="w-full"
          />
        </div>

        <div class="subfolio-field">
          <label for="modal-expense-currency">{{ t('expenseForm.currency') }}</label>
          <Select
            v-model="form.currency"
            input-id="modal-expense-currency"
            :options="currencyOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('settings.currencyPlaceholder')"
            :disabled="saving"
            class="w-full"
          />
        </div>
      </div>

      <section class="subfolio-expense-section" aria-labelledby="modal-tax-treatment-title">
        <div class="subfolio-expense-section__header">
          <h3 id="modal-tax-treatment-title" class="subfolio-expense-section__title">
            {{ t('expenseForm.taxTreatment') }}
          </h3>
        </div>
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="font-semibold text-ink">{{ t('expenseForm.addTaxes') }}</p>
            <p class="text-sm muted-copy">{{ t('expenseForm.taxesIncluded') }}</p>
          </div>
          <ToggleSwitch v-model="addTaxModel" :disabled="saving" />
        </div>
        <Message v-if="addTaxModel" severity="info" class="mt-4" :closable="false">
          {{ t('expenseForm.taxApplied', { rate: autoTaxRate.toFixed(2) }) }}
        </Message>
      </section>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="subfolio-field">
          <label for="modal-expense-frequency">{{ t('expenseForm.frequency') }}</label>
          <Select
            v-model="form.frequency"
            input-id="modal-expense-frequency"
            :options="frequencySelectOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('expenseForm.selectFrequency')"
            :disabled="saving"
            class="w-full"
          />
        </div>

        <div v-if="form.frequency === 'custom'" class="subfolio-field">
          <label for="modal-expense-custom-freq">{{ t('expenseForm.timesPerYear') }}</label>
          <InputNumber
            v-model="form.customTimesPerYear"
            input-id="modal-expense-custom-freq"
            :min="1"
            :max="365"
            :disabled="saving"
            class="w-full"
          />
        </div>
      </div>

      <section class="subfolio-expense-section" aria-labelledby="modal-payment-schedule-title">
        <div class="subfolio-expense-section__header">
          <h3 id="modal-payment-schedule-title" class="subfolio-expense-section__title">
            {{ t('expenseForm.paymentSchedule') }}
          </h3>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="subfolio-field">
            <label for="modal-start-date">{{ t('expenseForm.startDate') }}</label>
            <DatePicker
              v-model="startDateModel"
              input-id="modal-start-date"
              date-format="yy-mm-dd"
              show-icon
              :disabled="saving"
              class="w-full"
            />
          </div>

          <div class="subfolio-field">
            <label for="modal-pattern-type">{{ t('expenseForm.patternType') }}</label>
            <Select
              v-model="form.datePattern.type"
              input-id="modal-pattern-type"
              :options="patternTypeOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('expenseForm.selectPattern')"
              :disabled="saving"
              class="w-full"
            />
          </div>

          <div v-if="form.datePattern.type === 'day-of-month'" class="subfolio-field sm:col-span-2">
            <label for="modal-pattern-day">{{ t('expenseForm.dayOfMonth') }}</label>
            <Select
              v-model="form.datePattern.dayOfMonth"
              input-id="modal-pattern-day"
              :options="dayOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('expenseForm.day')"
              :disabled="saving"
              class="w-full"
            />
          </div>

          <div v-if="form.datePattern.type === 'day-of-week'" class="subfolio-field sm:col-span-2">
            <label for="modal-pattern-weekday">{{ t('expenseForm.dayOfWeek') }}</label>
            <Select
              v-model="form.datePattern.dayOfWeek"
              input-id="modal-pattern-weekday"
              :options="weekdayOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('expenseForm.weekday')"
              :disabled="saving"
              class="w-full"
            />
          </div>

          <template v-if="form.datePattern.type === 'nth-weekday'">
            <div class="subfolio-field">
              <label for="modal-pattern-nth">{{ t('expenseForm.whichWeek') }}</label>
              <Select
                v-model="form.datePattern.nthWeek"
                input-id="modal-pattern-nth"
                :options="ordinalOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('expenseForm.week')"
                :disabled="saving"
                class="w-full"
              />
            </div>
            <div class="subfolio-field">
              <label for="modal-pattern-weekday2">{{ t('expenseForm.dayOfWeek') }}</label>
              <Select
                v-model="form.datePattern.dayOfWeek"
                input-id="modal-pattern-weekday2"
                :options="weekdayOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('expenseForm.weekday')"
                :disabled="saving"
                class="w-full"
              />
            </div>
          </template>

          <template v-if="form.datePattern.type === 'day-of-year'">
            <div class="subfolio-field">
              <label for="modal-pattern-month">{{ t('expenseForm.month') }}</label>
              <Select
                v-model="form.datePattern.month"
                input-id="modal-pattern-month"
                :options="monthOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('expenseForm.month')"
                :disabled="saving"
                class="w-full"
              />
            </div>
            <div class="subfolio-field">
              <label for="modal-pattern-day-year">{{ t('expenseForm.day') }}</label>
              <Select
                v-model="form.datePattern.dayOfMonth"
                input-id="modal-pattern-day-year"
                :options="dayOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('expenseForm.day')"
                :disabled="saving"
                class="w-full"
              />
            </div>
          </template>

          <template v-if="form.datePattern.type === 'nth-weekday-year'">
            <div class="subfolio-field">
              <label for="modal-pattern-nth-year">{{ t('expenseForm.whichWeek') }}</label>
              <Select
                v-model="form.datePattern.nthWeek"
                input-id="modal-pattern-nth-year"
                :options="ordinalOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('expenseForm.week')"
                :disabled="saving"
                class="w-full"
              />
            </div>
            <div class="subfolio-field">
              <label for="modal-pattern-weekday-year">{{ t('expenseForm.dayOfWeek') }}</label>
              <Select
                v-model="form.datePattern.dayOfWeek"
                input-id="modal-pattern-weekday-year"
                :options="weekdayOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('expenseForm.weekday')"
                :disabled="saving"
                class="w-full"
              />
            </div>
            <div class="subfolio-field sm:col-span-2">
              <label for="modal-pattern-month-year">{{ t('expenseForm.month') }}</label>
              <Select
                v-model="form.datePattern.month"
                input-id="modal-pattern-month-year"
                :options="monthOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('expenseForm.month')"
                :disabled="saving"
                class="w-full"
              />
            </div>
          </template>

          <div v-if="form.datePattern.type === 'interval'" class="subfolio-field sm:col-span-2">
            <label for="modal-pattern-interval">{{ t('expenseForm.everyXDays') }}</label>
            <InputNumber
              v-model="form.datePattern.intervalDays"
              input-id="modal-pattern-interval"
              :min="1"
              :max="365"
              placeholder="30"
              :disabled="saving"
              class="w-full"
            />
          </div>
        </div>
      </section>
    </form>

    <template #footer>
      <div class="subfolio-expense-dialog__footer">
        <SubfolioButton
          type="button"
          :label="t('expenseForm.cancel')"
          variant="secondary"
          theme="secondary"
          :disabled="saving"
          @click="closeModal"
        />
        <SubfolioButton
          type="submit"
          form="subfolio-expense-form"
          :label="buttonLabel"
          icon="pi pi-check"
          :loading="saving"
        />
      </div>
    </template>
  </Dialog>
</template>
