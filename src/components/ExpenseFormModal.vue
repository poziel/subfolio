<script setup>
import { computed, ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import { findKnownServiceById, groupedKnownServices, knownServices, serviceIconOptions } from '../data/serviceCatalog'
import { getTimeZoneOptions } from '../data/timeZones'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import SubfolioIconTile from './icons/SubfolioIconTile.vue'
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
  getTaxRateOptions,
  getSelectedTaxRateOption,
  applyPreset
} = useExpenses()
const { t } = useI18n()

const isEditing = computed(() => editingId.value !== null)
const categorySuggestions = ref([])

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
const servicePresetGroups = computed(() =>
  groupedKnownServices(knownServices).map((group) => ({
    label: group.label,
    items: group.items.map((service) => ({
      value: service.id,
      label: service.name,
      category: service.category,
      icon: service.icon,
      url: service.url
    }))
  }))
)
const iconOptions = computed(() => serviceIconOptions)
const patternTypeOptions = computed(() => availableDatePatternTypes.value.map((pt) => ({ value: pt.value, label: t(`expenseForm.patterns.${pt.value}`) === `expenseForm.patterns.${pt.value}` ? pt.label : t(`expenseForm.patterns.${pt.value}`) })))
const dayOptions = computed(() => daysInMonth.map((day) => ({ value: day, label: String(day) })))
const weekdayOptions = computed(() => weekdays.map((day, idx) => ({ value: idx, label: t(`expenseForm.weekdays.${idx}`) === `expenseForm.weekdays.${idx}` ? day : t(`expenseForm.weekdays.${idx}`) })))
const ordinalOptions = computed(() => ordinals.map((ord, idx) => ({ value: idx + 1, label: t(`expenseForm.ordinals.${idx}`) === `expenseForm.ordinals.${idx}` ? ord : t(`expenseForm.ordinals.${idx}`) })))
const monthOptions = computed(() => months.map((month, idx) => ({ value: idx, label: t(`expenseForm.months.${idx}`) === `expenseForm.months.${idx}` ? month : t(`expenseForm.months.${idx}`) })))
const timeZoneOptions = computed(() => getTimeZoneOptions(form.paymentTimezone))
const taxRateOptions = computed(() =>
  getTaxRateOptions(form.currency).map((rate) => ({
    value: rate.id,
    label: rate.label,
    rate: rate.rate
  }))
)
const selectedTaxRateOption = computed(() =>
  getSelectedTaxRateOption(form.currency, form.taxRateId, form.taxRate)
)
const hasMultipleTaxRates = computed(() => taxRateOptions.value.length > 1)
const selectedPreset = computed(() => findKnownServiceById(form.presetId))
const showPreferredName = ref(false)
const hasPreferredPresetName = computed(() =>
  Boolean(selectedPreset.value && form.name && form.name !== selectedPreset.value.name)
)
const showPreferredNameField = computed(() =>
  Boolean(selectedPreset.value && (showPreferredName.value || hasPreferredPresetName.value))
)
const preferredNamePlaceholder = computed(() => selectedPreset.value?.name || t('expenseForm.namePlaceholder'))
const addTaxModel = computed({
  get: () => !form.includesTax,
  set: (value) => {
    form.includesTax = !value
  }
})
const taxRateModel = computed({
  get: () => selectedTaxRateOption.value?.id || null,
  set: (value) => {
    const option = getSelectedTaxRateOption(form.currency, value, null)
    applyTaxRateOption(option)
  }
})
const intervalModel = computed({
  get: () => form.frequency === 'hourly' ? form.datePattern.intervalHours : form.datePattern.intervalDays,
  set: (value) => {
    if (form.frequency === 'hourly') {
      form.datePattern.intervalHours = value
    } else {
      form.datePattern.intervalDays = value
    }
  }
})
const intervalLabel = computed(() =>
  form.frequency === 'hourly' ? t('expenseForm.everyXHours') : t('expenseForm.everyXDays')
)

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
  applyPreset(value)
  showPreferredName.value = false
}

const revealPreferredName = () => {
  if (!selectedPreset.value) return
  showPreferredName.value = true
}

const removePreferredName = () => {
  if (!selectedPreset.value) return
  form.name = selectedPreset.value.name
  showPreferredName.value = false
}

function applyTaxRateOption(option) {
  form.taxRateId = option?.id || null
  form.taxRate = option?.rate ?? 0
}

function syncTaxRateSelection() {
  if (form.includesTax) {
    applyTaxRateOption(null)
    return
  }

  applyTaxRateOption(getSelectedTaxRateOption(form.currency, form.taxRateId, form.taxRate))
}

const handleVisibleChange = (visible) => {
  if (!visible) closeModal()
}

watch(() => form.frequency, () => {
  const availableTypes = availableDatePatternTypes.value
  if (!availableTypes.find((type) => type.value === form.datePattern.type)) {
    form.datePattern.type = availableTypes[0]?.value || 'day-of-month'
  }
})

watch(() => form.currency, syncTaxRateSelection)

watch(() => form.includesTax, syncTaxRateSelection)

watch(() => form.presetId, () => {
  showPreferredName.value = false
})

watch(() => showAddModal.value, (visible) => {
  if (visible && hasPreferredPresetName.value) {
    showPreferredName.value = true
  }
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
            v-model="form.presetId"
            input-id="modal-service-preset"
            :options="servicePresetGroups"
            option-group-label="label"
            option-group-children="items"
            option-label="label"
            option-value="value"
            filter
            show-clear
            scroll-height="28rem"
            panel-class="subfolio-preset-panel"
            :placeholder="t('expenseForm.servicePresetPlaceholder')"
            :disabled="saving"
            class="subfolio-preset-select w-full"
            data-test-id="recurrence-preset"
            @update:model-value="applyServicePreset"
          >
            <template #optiongroup="{ option }">
              <span class="text-xs font-extrabold uppercase muted-copy">
                {{ option.label }}
              </span>
            </template>
            <template #option="{ option }">
              <span class="subfolio-preset-option">
                <SubfolioIconTile :icon="option.icon" size="sm" tone="neutral" />
                <span class="min-w-0">
                  <span class="block truncate font-semibold">{{ option.label }}</span>
                  <span class="block truncate text-xs muted-copy">{{ option.category }}</span>
                </span>
              </span>
            </template>
            <template #value="{ value, placeholder }">
              <span v-if="findKnownServiceById(value)" class="subfolio-preset-value">
                <SubfolioIconTile :icon="findKnownServiceById(value).icon" size="sm" tone="neutral" />
                <span class="truncate">{{ findKnownServiceById(value).name }}</span>
              </span>
              <span v-else>{{ placeholder }}</span>
            </template>
          </Select>
        </div>

        <div v-if="selectedPreset" class="subfolio-preset-assist sm:col-span-2">
          <p>
            {{ t('expenseForm.servicePresetMaintained') }}
            <button
              v-if="!showPreferredNameField"
              type="button"
              class="subfolio-inline-action"
              :disabled="saving"
              data-test-id="recurrence-preferred-name-reveal"
              @click="revealPreferredName"
            >
              {{ t('expenseForm.servicePresetCustomNameCta') }}
            </button>
          </p>
        </div>

        <div v-if="showPreferredNameField" class="subfolio-field sm:col-span-2">
          <div class="subfolio-field__label-row">
            <label for="modal-preferred-name">{{ t('expenseForm.preferredName') }}</label>
            <button
              type="button"
              class="subfolio-inline-action"
              :disabled="saving"
              data-test-id="recurrence-preferred-name-remove"
              @click="removePreferredName"
            >
              {{ t('expenseForm.removePreferredName') }}
            </button>
          </div>
          <InputText
            id="modal-preferred-name"
            v-model="form.name"
            :placeholder="preferredNamePlaceholder"
            :disabled="saving"
            class="w-full"
            data-test-id="recurrence-preferred-name"
          />
        </div>

        <template v-if="!selectedPreset">
        <div class="subfolio-field sm:col-span-2">
          <label for="modal-expense-name">{{ t('expenseForm.name') }}</label>
          <InputText
            id="modal-expense-name"
            v-model="form.name"
            :placeholder="t('expenseForm.namePlaceholder')"
            :disabled="saving"
            class="w-full"
            data-test-id="recurrence-name"
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
            data-test-id="recurrence-url"
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
            data-test-id="recurrence-icon"
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
        </template>

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
            data-test-id="recurrence-category"
            @complete="searchCategories"
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
            data-test-id="recurrence-amount"
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
            filter
            :placeholder="t('settings.currencyPlaceholder')"
            :disabled="saving"
            class="w-full"
            data-test-id="recurrence-currency"
          />
        </div>
      </div>

      <div class="subfolio-tax-card">
        <div class="subfolio-tax-card__summary">
          <div class="subfolio-tax-card__copy">
            <label for="modal-tax-enabled">{{ t('expenseForm.addTaxes') }}</label>
            <p>{{ t('expenseForm.taxesIncluded') }}</p>
          </div>
          <ToggleSwitch
            v-model="addTaxModel"
            input-id="modal-tax-enabled"
            :disabled="saving"
            data-test-id="recurrence-tax-enabled"
          />
        </div>
        <div v-if="addTaxModel && hasMultipleTaxRates" class="subfolio-field subfolio-tax-card__select">
          <label for="modal-tax-rate">{{ t('expenseForm.taxJurisdiction') }}</label>
          <Select
            v-model="taxRateModel"
            input-id="modal-tax-rate"
            :options="taxRateOptions"
            option-label="label"
            option-value="value"
            filter
            :placeholder="t('expenseForm.taxJurisdictionPlaceholder')"
            :disabled="saving"
            class="w-full"
            data-test-id="recurrence-tax-rate"
          />
        </div>
        <p v-else-if="addTaxModel && selectedTaxRateOption" class="subfolio-tax-card__selected">
          {{ t('expenseForm.taxSelected', { tax: selectedTaxRateOption.label }) }}
        </p>
      </div>

      <div
        class="subfolio-frequency-grid"
        :class="{ 'subfolio-frequency-grid--custom': form.frequency === 'custom' }"
      >
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
            data-test-id="recurrence-frequency"
          />
        </div>

        <div v-if="form.frequency === 'custom'" class="subfolio-field">
          <label for="modal-expense-custom-freq">{{ t('expenseForm.timesPerYear') }}</label>
          <InputNumber
            v-model="form.customTimesPerYear"
            input-id="modal-expense-custom-freq"
            :min="0.01"
            :max="10000"
            :min-fraction-digits="0"
            :max-fraction-digits="2"
            :disabled="saving"
            class="w-full"
            data-test-id="recurrence-times-per-year"
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
              data-test-id="recurrence-start-date"
            />
          </div>

          <div v-if="form.frequency === 'daily' || form.frequency === 'hourly'" class="subfolio-field">
            <label for="modal-start-time">{{ t('expenseForm.startTime') }}</label>
            <InputText
              id="modal-start-time"
              v-model="form.startTime"
              type="time"
              :disabled="saving"
              class="w-full"
              data-test-id="recurrence-start-time"
            />
          </div>

          <div class="subfolio-field">
            <label for="modal-payment-timezone">{{ t('expenseForm.paymentTimezone') }}</label>
            <Select
              v-model="form.paymentTimezone"
              input-id="modal-payment-timezone"
              :options="timeZoneOptions"
              option-label="label"
              option-value="value"
              filter
              :disabled="saving"
              class="w-full"
              data-test-id="recurrence-payment-timezone"
            />
          </div>

          <div v-if="form.frequency !== 'once'" class="subfolio-field">
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
              data-test-id="recurrence-pattern-type"
            />
          </div>

          <div v-if="form.frequency !== 'once' && form.datePattern.type === 'day-of-month'" class="subfolio-field sm:col-span-2">
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

          <div v-if="form.frequency !== 'once' && form.datePattern.type === 'day-of-week'" class="subfolio-field sm:col-span-2">
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

          <template v-if="form.frequency !== 'once' && form.datePattern.type === 'nth-weekday'">
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

          <template v-if="form.frequency !== 'once' && form.datePattern.type === 'day-of-year'">
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

          <template v-if="form.frequency !== 'once' && form.datePattern.type === 'nth-weekday-year'">
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

          <div v-if="form.frequency !== 'once' && form.datePattern.type === 'interval'" class="subfolio-field sm:col-span-2">
            <label for="modal-pattern-interval">{{ intervalLabel }}</label>
            <InputNumber
              v-model="intervalModel"
              input-id="modal-pattern-interval"
              :min="1"
              :max="form.frequency === 'hourly' ? 8760 : 3650"
              placeholder="1"
              :disabled="saving"
              class="w-full"
              data-test-id="recurrence-interval"
            />
          </div>
        </div>
      </section>

      <div class="subfolio-field">
        <label for="modal-expense-note">{{ t('expenseForm.note') }} <span class="font-normal muted-copy">{{ t('expenseForm.optional') }}</span></label>
        <Textarea
          id="modal-expense-note"
          v-model="form.note"
          rows="3"
          auto-resize
          :placeholder="t('expenseForm.notePlaceholder')"
          :disabled="saving"
          class="w-full"
          data-test-id="recurrence-note"
        />
      </div>
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
