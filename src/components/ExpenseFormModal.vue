<script setup>
import { computed, ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import { buildRecurrenceSummaryParts } from '../data/recurrenceRules'
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
  scheduleTypes,
  repeatUnits,
  repeatPatterns,
  repeatUnitSupportsPattern,
  getTaxRateOptions,
  getSelectedTaxRateOption,
  applyPreset
} = useExpenses()
const { t, locale } = useI18n()

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
const scheduleTypeOptions = computed(() =>
  scheduleTypes.map((type) => ({
    value: type,
    label: t(`expenseForm.scheduleTypes.${type}`)
  }))
)
const repeatUnitOptions = computed(() =>
  repeatUnits.map((unit) => ({
    value: unit,
    label: t(`expenseForm.repeatUnits.${unit}`)
  }))
)
const repeatPatternOptions = computed(() =>
  repeatPatterns.map((pattern) => ({
    value: pattern.value,
    label: t(`expenseForm.repeatPatterns.${pattern.value}`)
  }))
)
const presetGroups = computed(() =>
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
const isRecurringSchedule = computed(() => form.scheduleType === 'recurring')
const showRepeatPattern = computed(() => isRecurringSchedule.value && repeatUnitSupportsPattern(form.repeatUnit))
const recurrenceSummaryParts = computed(() => buildRecurrenceSummaryParts({
  scheduleType: form.scheduleType,
  paymentDate: form.paymentDate,
  repeatInterval: form.repeatInterval,
  repeatUnit: form.repeatUnit,
  repeatPattern: form.repeatPattern,
  paymentTimezone: form.paymentTimezone
}, locale.value))
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

const formatDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const paymentDateModel = computed({
  get: () => (form.paymentDate ? new Date(`${form.paymentDate}T00:00:00`) : null),
  set: (date) => {
    form.paymentDate = date instanceof Date ? formatDateInput(date) : ''
    form.startDate = form.paymentDate
  }
})

const searchCategories = (event) => {
  const query = event.query.toLowerCase().trim()
  categorySuggestions.value = categoryOptions.value.filter((item) =>
    item.toLowerCase().includes(query)
  )
}

const applypreset = (value) => {
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

watch(() => [form.scheduleType, form.repeatUnit], () => {
  if (form.scheduleType === 'recurring' && repeatUnitSupportsPattern(form.repeatUnit)) {
    form.repeatPattern = form.repeatPattern || 'same-calendar-day'
  } else {
    form.repeatPattern = null
  }
})

watch(() => form.paymentDate, (value) => {
  form.startDate = value
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
          <label for="modal-service-preset">{{ t('expenseForm.preset') }}</label>
          <Select
            v-model="form.presetId"
            input-id="modal-service-preset"
            :options="presetGroups"
            option-group-label="label"
            option-group-children="items"
            option-label="label"
            option-value="value"
            filter
            show-clear
            scroll-height="28rem"
            panel-class="subfolio-preset-panel"
            :placeholder="t('expenseForm.presetPlaceholder')"
            :disabled="saving"
            class="subfolio-preset-select w-full"
            data-test-id="recurrence-preset"
            @update:model-value="applypreset"
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
            {{ t('expenseForm.presetMaintained') }}
            <button
              v-if="!showPreferredNameField"
              type="button"
              class="subfolio-inline-action"
              :disabled="saving"
              data-test-id="recurrence-preferred-name-reveal"
              @click="revealPreferredName"
            >
              {{ t('expenseForm.presetCustomNameCta') }}
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

      <section class="subfolio-expense-section" aria-labelledby="modal-payment-schedule-title">
        <div class="subfolio-expense-section__header">
          <h3 id="modal-payment-schedule-title" class="subfolio-expense-section__title">
            {{ t('expenseForm.paymentSchedule') }}
          </h3>
          <p class="subfolio-recurrence-summary">
            <template
              v-for="(part, index) in recurrenceSummaryParts"
              :key="`${index}-${part.text}`"
            >
              <span
                :class="{ 'subfolio-recurrence-summary__value': part.emphasized }"
              >
                {{ part.text }}
              </span>
            </template>
          </p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="subfolio-field sm:col-span-2">
            <label for="modal-schedule-type">{{ t('expenseForm.scheduleType') }}</label>
            <SelectButton
              v-model="form.scheduleType"
              input-id="modal-schedule-type"
              :options="scheduleTypeOptions"
              option-label="label"
              option-value="value"
              :allow-empty="false"
              :disabled="saving"
              class="subfolio-segmented w-full"
              data-test-id="recurrence-schedule-type"
            />
          </div>

          <div class="subfolio-field sm:col-span-2">
            <label for="modal-payment-date">{{ t('expenseForm.paymentDate') }}</label>
            <DatePicker
              v-model="paymentDateModel"
              input-id="modal-payment-date"
              date-format="yy-mm-dd"
              show-icon
              :disabled="saving"
              class="w-full"
              data-test-id="recurrence-payment-date"
            />
          </div>

          <div v-if="isRecurringSchedule" class="subfolio-repeat-grid sm:col-span-2">
            <div class="subfolio-field">
              <label for="modal-repeat-interval">{{ t('expenseForm.repeatEvery') }}</label>
              <InputNumber
                v-model="form.repeatInterval"
                input-id="modal-repeat-interval"
                :min="1"
                :max="10000"
                :min-fraction-digits="0"
                :max-fraction-digits="0"
                :disabled="saving"
                class="w-full"
                data-test-id="recurrence-repeat-interval"
              />
            </div>

            <div class="subfolio-field">
              <label for="modal-repeat-unit">{{ t('expenseForm.repeatUnit') }}</label>
              <Select
                v-model="form.repeatUnit"
                input-id="modal-repeat-unit"
                :options="repeatUnitOptions"
                option-label="label"
                option-value="value"
                :disabled="saving"
                class="w-full"
                data-test-id="recurrence-repeat-unit"
              />
            </div>
          </div>

          <div v-if="showRepeatPattern" class="subfolio-field sm:col-span-2">
            <label for="modal-repeat-pattern">{{ t('expenseForm.repeatPattern') }}</label>
            <Select
              v-model="form.repeatPattern"
              input-id="modal-repeat-pattern"
              :options="repeatPatternOptions"
              option-label="label"
              option-value="value"
              :disabled="saving"
              class="w-full"
              data-test-id="recurrence-repeat-pattern"
            />
          </div>

          <div v-if="isRecurringSchedule" class="subfolio-field">
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
