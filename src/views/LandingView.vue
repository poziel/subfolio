<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import PublicSiteShell from '../components/PublicSiteShell.vue'
import { useI18n } from '../composables/useI18n'

const expenseName = ref('Design Suite')
const category = ref('Subscriptions')
const frequency = ref('Monthly')
const amount = ref(24)
const { t } = useI18n()

const categoryLabelMap = {
  Subscriptions: 'landing.subscriptions',
  Utilities: 'landing.utilities',
  Wellness: 'landing.wellness',
  Housing: 'landing.housing'
}

const frequencyLabelMap = {
  Monthly: 'landing.monthly',
  Quarterly: 'landing.quarterly',
  Yearly: 'landing.yearly'
}

const categoryOptions = computed(() =>
  Object.entries(categoryLabelMap).map(([value, labelKey]) => ({ value, label: t(labelKey) }))
)

const frequencyOptions = computed(() =>
  Object.entries(frequencyLabelMap).map(([value, labelKey]) => ({ value, label: t(labelKey) }))
)

const demoExpenses = ref([
  { name: 'Design Suite', category: 'Subscriptions', frequency: 'Monthly', due: 'Mar 18', amount: '$24' },
  { name: 'Internet', category: 'Utilities', frequency: 'Monthly', due: 'Mar 21', amount: '$74' },
  { name: 'Gym', category: 'Wellness', frequency: 'Monthly', due: 'Mar 26', amount: '$39' }
])

const localizeCategory = (value) => t(categoryLabelMap[value] || 'landing.category')
const localizeFrequency = (value) => t(frequencyLabelMap[value] || 'landing.frequency')

const addDemoExpense = () => {
  const name = expenseName.value.trim()
  if (!name) return

  demoExpenses.value = [
    {
      name,
      category: category.value,
      frequency: frequency.value,
      due: frequency.value === 'Yearly' ? 'Apr 02' : 'Mar 30',
      amount: `$${Number(amount.value || 0).toFixed(0)}`
    },
    ...demoExpenses.value
  ].slice(0, 5)

  expenseName.value = ''
}

const insightCards = [
  {
    titleKey: 'landing.trackTitle',
    detailKey: 'landing.trackDetail',
    icon: 'pi pi-list-check'
  },
  {
    titleKey: 'landing.forecastTitle',
    detailKey: 'landing.forecastDetail',
    icon: 'pi pi-chart-line'
  },
  {
    titleKey: 'landing.byodbTitle',
    detailKey: 'landing.byodbDetail',
    icon: 'pi pi-database'
  },
  {
    titleKey: 'landing.portableTitle',
    detailKey: 'landing.portableDetail',
    icon: 'pi pi-send'
  }
]
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-14 md:gap-16">
      <section class="subfolio-landing-hero grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-12">
        <div class="grid min-w-0 gap-6">
          <h1 class="subfolio-hero-title font-serif text-5xl text-ink sm:text-6xl md:text-7xl xl:text-8xl">
            {{ t('landing.heroTitle') }}
          </h1>
          <p class="max-w-xl text-lg muted-copy md:text-xl">
            {{ t('landing.heroBody') }}
          </p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <RouterLink v-slot="{ navigate }" to="/app" custom>
              <Button :label="t('common.openApp')" class="w-full sm:w-auto" @click="navigate" />
            </RouterLink>
            <RouterLink v-slot="{ navigate }" to="/features" custom>
              <Button :label="t('landing.exploreFeatures')" icon="pi pi-table" severity="secondary" outlined class="w-full sm:w-auto" @click="navigate" />
            </RouterLink>
          </div>
        </div>

        <Card class="subfolio-hero-demo w-full min-w-0">
          <template #title>{{ t('landing.formTitle') }}</template>
          <template #subtitle>{{ t('landing.obligationsSubtitle') }}</template>
          <template #content>
            <form class="grid gap-5" @submit.prevent="addDemoExpense">
              <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <div class="subfolio-field">
                  <label for="hero-expense-name">{{ t('landing.expenseName') }}</label>
                  <InputText id="hero-expense-name" v-model="expenseName" class="w-full" />
                </div>
                <div class="subfolio-field">
                  <label for="hero-expense-amount">{{ t('landing.amount') }}</label>
                  <InputNumber
                    v-model="amount"
                    input-id="hero-expense-amount"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    class="w-full"
                  />
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                <div class="subfolio-field">
                  <label for="hero-expense-category">{{ t('landing.category') }}</label>
                  <Select
                    v-model="category"
                    input-id="hero-expense-category"
                    :options="categoryOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                  />
                </div>
                <div class="subfolio-field">
                  <label for="hero-expense-frequency">{{ t('landing.frequency') }}</label>
                  <Select
                    v-model="frequency"
                    input-id="hero-expense-frequency"
                    :options="frequencyOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                  />
                </div>
                <Button type="submit" :label="t('landing.previewExpense')" icon="pi pi-plus" severity="secondary" outlined />
              </div>

              <div class="subfolio-table-wrap">
                <DataTable :value="demoExpenses" class="subfolio-datatable" table-style="min-width: 36rem">
                  <Column field="name" :header="t('landing.expense')" />
                  <Column field="category" :header="t('landing.category')">
                    <template #body="{ data }">
                      <Tag :value="localizeCategory(data.category)" severity="secondary" rounded />
                    </template>
                  </Column>
                  <Column field="frequency" :header="t('landing.frequency')">
                    <template #body="{ data }">
                      {{ localizeFrequency(data.frequency) }}
                    </template>
                  </Column>
                  <Column field="amount" :header="t('landing.amount')" body-class="text-right">
                    <template #body="{ data }">
                      <span class="font-semibold text-accent-dark">{{ data.amount }}</span>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </form>
          </template>
        </Card>
      </section>

      <section class="grid gap-5 md:grid-cols-4">
        <Card v-for="item in insightCards" :key="item.titleKey" class="subfolio-card">
          <template #content>
            <div class="grid gap-3">
              <Tag severity="secondary" rounded class="subfolio-card-icon w-fit">
                <span :class="item.icon" />
              </Tag>
              <h2 class="text-xl font-semibold text-ink">{{ t(item.titleKey) }}</h2>
              <p class="muted-copy">{{ t(item.detailKey) }}</p>
            </div>
          </template>
        </Card>
      </section>

      <Card>
        <template #content>
          <div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 class="font-serif text-3xl text-ink">{{ t('landing.useConnectionTitle') }}</h2>
              <p class="mt-2 max-w-2xl muted-copy">
                {{ t('landing.useConnectionBody') }}
              </p>
            </div>
            <RouterLink v-slot="{ navigate }" to="/app" custom>
              <Button :label="t('common.openApp')" @click="navigate" />
            </RouterLink>
          </div>
        </template>
      </Card>
    </div>
  </PublicSiteShell>
</template>
