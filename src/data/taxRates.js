export const taxRatesByCurrency = {
  CAD: 5,
  USD: 0,
  EUR: 20,
  GBP: 20,
  AUD: 10,
  NZD: 15,
  JPY: 10,
  CHF: 7.7,
  MXN: 16,
  BRL: 17,
  SGD: 8
}

export const getTaxRateForCurrency = (currency) => {
  return taxRatesByCurrency[currency] ?? 0
}
