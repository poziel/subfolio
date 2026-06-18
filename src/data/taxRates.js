const formatRate = (rate) => {
  const numericRate = Number(rate) || 0
  return Number.isInteger(numericRate) ? String(numericRate) : String(numericRate)
}

const formatJurisdiction = (item) =>
  item.region ? `${item.country} - ${item.region}` : item.country

const buildLabel = (item) =>
  `${formatJurisdiction(item)} ${item.taxName} (${formatRate(item.rate)}%)`

const rawTaxRateCatalog = [
  { id: 'cad-ca-gst', currency: 'CAD', country: 'Canada', region: 'GST only', taxName: 'GST', rate: 5 },
  { id: 'cad-ca-ab-gst', currency: 'CAD', country: 'Canada', region: 'Alberta', taxName: 'GST', rate: 5 },
  { id: 'cad-ca-bc-gst-pst', currency: 'CAD', country: 'Canada', region: 'British Columbia', taxName: 'GST/PST', rate: 12 },
  { id: 'cad-ca-mb-gst-rst', currency: 'CAD', country: 'Canada', region: 'Manitoba', taxName: 'GST/RST', rate: 12 },
  { id: 'cad-ca-nb-hst', currency: 'CAD', country: 'Canada', region: 'New Brunswick', taxName: 'HST', rate: 15 },
  { id: 'cad-ca-nl-hst', currency: 'CAD', country: 'Canada', region: 'Newfoundland and Labrador', taxName: 'HST', rate: 15 },
  { id: 'cad-ca-nt-gst', currency: 'CAD', country: 'Canada', region: 'Northwest Territories', taxName: 'GST', rate: 5 },
  { id: 'cad-ca-ns-hst', currency: 'CAD', country: 'Canada', region: 'Nova Scotia', taxName: 'HST', rate: 14 },
  { id: 'cad-ca-nu-gst', currency: 'CAD', country: 'Canada', region: 'Nunavut', taxName: 'GST', rate: 5 },
  { id: 'cad-ca-on-hst', currency: 'CAD', country: 'Canada', region: 'Ontario', taxName: 'HST', rate: 13 },
  { id: 'cad-ca-pe-hst', currency: 'CAD', country: 'Canada', region: 'Prince Edward Island', taxName: 'HST', rate: 15 },
  { id: 'cad-ca-qc-gst-qst', currency: 'CAD', country: 'Canada', region: 'Quebec', taxName: 'GST/QST', rate: 14.975 },
  { id: 'cad-ca-sk-gst-pst', currency: 'CAD', country: 'Canada', region: 'Saskatchewan', taxName: 'GST/PST', rate: 11 },
  { id: 'cad-ca-yt-gst', currency: 'CAD', country: 'Canada', region: 'Yukon', taxName: 'GST', rate: 5 },

  { id: 'eur-at-vat', currency: 'EUR', country: 'Austria', taxName: 'VAT', rate: 20 },
  { id: 'eur-be-vat', currency: 'EUR', country: 'Belgium', taxName: 'VAT', rate: 21 },
  { id: 'eur-hr-vat', currency: 'EUR', country: 'Croatia', taxName: 'VAT', rate: 25 },
  { id: 'eur-cy-vat', currency: 'EUR', country: 'Cyprus', taxName: 'VAT', rate: 19 },
  { id: 'eur-ee-vat', currency: 'EUR', country: 'Estonia', taxName: 'VAT', rate: 24 },
  { id: 'eur-fi-vat', currency: 'EUR', country: 'Finland', taxName: 'VAT', rate: 25.5 },
  { id: 'eur-fr-vat', currency: 'EUR', country: 'France', taxName: 'VAT', rate: 20 },
  { id: 'eur-de-vat', currency: 'EUR', country: 'Germany', taxName: 'VAT', rate: 19 },
  { id: 'eur-gr-vat', currency: 'EUR', country: 'Greece', taxName: 'VAT', rate: 24 },
  { id: 'eur-ie-vat', currency: 'EUR', country: 'Ireland', taxName: 'VAT', rate: 23 },
  { id: 'eur-it-vat', currency: 'EUR', country: 'Italy', taxName: 'VAT', rate: 22 },
  { id: 'eur-lv-vat', currency: 'EUR', country: 'Latvia', taxName: 'VAT', rate: 21 },
  { id: 'eur-lt-vat', currency: 'EUR', country: 'Lithuania', taxName: 'VAT', rate: 21 },
  { id: 'eur-lu-vat', currency: 'EUR', country: 'Luxembourg', taxName: 'VAT', rate: 17 },
  { id: 'eur-mt-vat', currency: 'EUR', country: 'Malta', taxName: 'VAT', rate: 18 },
  { id: 'eur-nl-vat', currency: 'EUR', country: 'Netherlands', taxName: 'VAT', rate: 21 },
  { id: 'eur-pt-mainland-vat', currency: 'EUR', country: 'Portugal', region: 'Mainland', taxName: 'VAT', rate: 23 },
  { id: 'eur-pt-azores-vat', currency: 'EUR', country: 'Portugal', region: 'Azores', taxName: 'VAT', rate: 16 },
  { id: 'eur-pt-madeira-vat', currency: 'EUR', country: 'Portugal', region: 'Madeira', taxName: 'VAT', rate: 22 },
  { id: 'eur-sk-vat', currency: 'EUR', country: 'Slovakia', taxName: 'VAT', rate: 23 },
  { id: 'eur-si-vat', currency: 'EUR', country: 'Slovenia', taxName: 'VAT', rate: 22 },
  { id: 'eur-es-vat', currency: 'EUR', country: 'Spain', taxName: 'VAT', rate: 21 },

  { id: 'usd-us-no-federal-sales-tax', currency: 'USD', country: 'United States', taxName: 'No federal sales tax', rate: 0 },
  { id: 'gbp-gb-vat', currency: 'GBP', country: 'United Kingdom', taxName: 'VAT', rate: 20 },
  { id: 'aud-au-gst', currency: 'AUD', country: 'Australia', taxName: 'GST', rate: 10 },
  { id: 'nzd-nz-gst', currency: 'NZD', country: 'New Zealand', taxName: 'GST', rate: 15 },
  { id: 'jpy-jp-consumption-tax', currency: 'JPY', country: 'Japan', taxName: 'Consumption tax', rate: 10 },
  { id: 'chf-ch-vat', currency: 'CHF', country: 'Switzerland', taxName: 'VAT', rate: 8.1 },
  { id: 'mxn-mx-vat', currency: 'MXN', country: 'Mexico', taxName: 'VAT', rate: 16 },
  { id: 'brl-br-vat-estimate', currency: 'BRL', country: 'Brazil', taxName: 'VAT estimate', rate: 17 },
  { id: 'sgd-sg-gst', currency: 'SGD', country: 'Singapore', taxName: 'GST', rate: 9 }
]

export const taxRateCatalog = rawTaxRateCatalog.map((item) => ({
  ...item,
  label: item.label || buildLabel(item)
}))

export const taxRatesByCurrency = taxRateCatalog.reduce((rates, item) => {
  if (rates[item.currency] === undefined) {
    rates[item.currency] = item.rate
  }
  return rates
}, {})

export const getTaxRateOptionsForCurrency = (currency) => {
  const normalizedCurrency = currency || ''
  const options = taxRateCatalog.filter((item) => item.currency === normalizedCurrency)

  if (options.length) return options

  return [{
    id: `${normalizedCurrency || 'currency'}-none`,
    currency: normalizedCurrency,
    country: 'No maintained tax rate',
    taxName: 'No tax',
    rate: 0,
    label: 'No maintained tax rate (0%)'
  }]
}

export const getDefaultTaxRateOptionForCurrency = (currency) =>
  getTaxRateOptionsForCurrency(currency)[0]

export const getTaxRateForCurrency = (currency) =>
  getDefaultTaxRateOptionForCurrency(currency)?.rate ?? 0

export const getTaxRateOptionForSelection = (currency, taxRateId, taxRate) => {
  const options = getTaxRateOptionsForCurrency(currency)
  const selectedOption = options.find((item) => item.id === taxRateId)
  if (selectedOption) return selectedOption

  const numericRate = Number(taxRate)
  if (Number.isFinite(numericRate)) {
    const rateMatch = options.find((item) => Number(item.rate) === numericRate)
    if (rateMatch) return rateMatch
  }

  return options[0]
}
