<script setup>
import { computed, ref, watch } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Panel from 'primevue/panel'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'

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

const categoryOptions = computed(() => {
  const categories = new Set(baseCategories)
  extraCategories.value.forEach((item) => categories.add(item))
  expenses.value.forEach((item) => categories.add(item.category))
  return Array.from(categories).sort()
})

const modalTitle = computed(() => (isEditing.value ? t('expenseForm.editTitle') : t('expenseForm.addTitle')))
const buttonLabel = computed(() => (isEditing.value ? t('expenseForm.saveButton') : t('expenseForm.addButton')))

const currencyOptions = computed(() => currencies.value.map((curr) => ({ value: curr, label: curr })))
const frequencySelectOptions = computed(() => frequencyOptions.map((freq) => ({ value: freq.value, label: t(`frequencies.${freq.value}`) })))
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

const handleVisibleChange = (visible) => {
  if (!visible) closeModal()
}

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
    :header="modalTitle"
    modal
    class="subfolio-expense-dialog w-[min(96vw,46rem)]"
    @update:visible="handleVisibleChange"
  >
    <form class="grid gap-5" @submit.prevent="saveExpense">
      <div class="grid gap-4 sm:grid-cols-2">
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

        <div class="subfolio-field sm:col-span-2">
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

      <Panel :header="t('expenseForm.taxTreatment')" toggleable>
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
      </Panel>

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

      <Panel :header="t('expenseForm.paymentSchedule')" toggleable>
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
      </Panel>

      <div class="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          :label="t('expenseForm.cancel')"
          severity="secondary"
          outlined
          :disabled="saving"
          @click="closeModal"
        />
        <Button
          type="submit"
          :label="buttonLabel"
          icon="pi pi-check"
          :loading="saving"
        />
      </div>
    </form>
  </Dialog>
</template>
