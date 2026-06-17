import { getDefaultPaymentTimezone } from './timeZones'

export { getDefaultPaymentTimezone } from './timeZones'

export const scheduleTypes = ['one-time', 'recurring']
export const repeatUnits = ['year', 'month', 'week', 'day']

export const repeatPatterns = [
  { value: 'same-calendar-day', label: 'Same calendar day' },
  { value: 'same-relative-weekday', label: 'Same relative weekday' }
]

const recurringType = 'recurring'
const oneTimeType = 'one-time'
const repeatPatternUnits = new Set(['month', 'year'])
const calendarPattern = 'same-calendar-day'
const relativeWeekdayPattern = 'same-relative-weekday'

export const normalizeDatePattern = (pattern = {}) => ({
  type: pattern.type || 'day-of-month',
  dayOfMonth: Number(pattern.dayOfMonth) || 1,
  dayOfWeek: Number.isInteger(pattern.dayOfWeek) ? pattern.dayOfWeek : 1,
  nthWeek: Number(pattern.nthWeek) || 1,
  month: Number.isInteger(pattern.month) ? pattern.month : 0,
  intervalDays: Number(pattern.intervalDays) || 1,
  intervalHours: Number(pattern.intervalHours) || 1
})

export const normalizeScheduleType = (value) => (
  value === oneTimeType || value === 'once' ? oneTimeType : recurringType
)

export const normalizeRepeatInterval = (value) => {
  const interval = Math.floor(Number(value))
  return Number.isFinite(interval) && interval > 0 ? interval : 1
}

export const normalizeRepeatUnit = (unit) => {
  if (unit === 'minute' || unit === 'hour') return 'day'
  return repeatUnits.includes(unit) ? unit : 'month'
}

export const repeatUnitSupportsPattern = (unit) => (
  repeatPatternUnits.has(normalizeRepeatUnit(unit))
)

export const normalizeRepeatPattern = (pattern, unit) => {
  if (!repeatUnitSupportsPattern(unit)) return null
  return pattern === relativeWeekdayPattern ? relativeWeekdayPattern : calendarPattern
}

export const parseDateOnly = (value) => {
  if (!value) return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const formatDateOnly = (value) => {
  const date = parseDateOnly(value)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getRelativeWeekday = (value) => {
  const date = parseDateOnly(value)
  if (!date) {
    return {
      nthWeek: 1,
      dayOfWeek: 1,
      month: 0
    }
  }

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const nthWeek = date.getDate() + 7 > daysInMonth ? 5 : Math.ceil(date.getDate() / 7)

  return {
    nthWeek,
    dayOfWeek: date.getDay(),
    month: date.getMonth()
  }
}

export const buildRecurrenceSchedule = (source = {}) => {
  const normalized = normalizeRecurrenceInput(source)

  if (normalized.scheduleType === oneTimeType) {
    return {
      version: 3,
      scheduleType: oneTimeType,
      timezone: null,
      paymentDate: normalized.paymentDate,
      paymentTime: null,
      repeat: null,
      repeatInterval: null,
      repeatUnit: null,
      repeatPattern: null,
      pattern: { type: oneTimeType },
      summary: buildRecurrenceSummary(normalized),

      // Legacy aliases keep older records, adapters, and seeded data readable.
      startsOn: normalized.paymentDate,
      startsAt: null,
      frequency: 'once',
      interval: null,
      timesPerYear: 1
    }
  }

  return {
    version: 3,
    scheduleType: recurringType,
    timezone: normalized.paymentTimezone,
    paymentDate: normalized.paymentDate,
    paymentTime: null,
    repeat: {
      interval: normalized.repeatInterval,
      unit: normalized.repeatUnit
    },
    repeatInterval: normalized.repeatInterval,
    repeatUnit: normalized.repeatUnit,
    repeatPattern: normalized.repeatPattern,
    pattern: buildPatternDetails(normalized),
    summary: buildRecurrenceSummary(normalized),

    // Legacy aliases keep older records, adapters, and seeded data readable.
    startsOn: normalized.paymentDate,
    startsAt: null,
    frequency: normalized.legacyFrequency,
    interval: normalized.repeatInterval,
    timesPerYear: getTimesPerYearFromRepeat(normalized)
  }
}

export const normalizeRecurrenceSchedule = (schedule, source = {}) => {
  if (!schedule) return buildRecurrenceSchedule(source)

  if (Number(schedule.version) >= 2 || schedule.repeat || schedule.paymentDate || schedule.scheduleType) {
    return buildRecurrenceSchedule({
      ...source,
      scheduleType: schedule.scheduleType || source.scheduleType,
      paymentTimezone: schedule.timezone || source.paymentTimezone,
      paymentDate: schedule.paymentDate || schedule.startsOn || source.paymentDate || source.startDate,
      repeatInterval: schedule.repeat?.interval || schedule.repeatInterval || source.repeatInterval,
      repeatUnit: schedule.repeat?.unit || schedule.repeatUnit || source.repeatUnit,
      repeatPattern: schedule.repeatPattern || schedule.pattern?.type || source.repeatPattern
    })
  }

  return buildRecurrenceSchedule({
    ...source,
    paymentTimezone: schedule.timezone || source.paymentTimezone,
    startDate: schedule.startsOn || source.startDate,
    frequency: schedule.frequency || source.frequency,
    customTimesPerYear: schedule.timesPerYear || source.customTimesPerYear,
    datePattern: schedule.pattern || source.datePattern
  })
}

export const buildRecurrenceSummary = (source = {}, locale = 'en') => (
  buildRecurrenceSummaryParts(source, locale).map((part) => part.text).join('')
)

export const buildRecurrenceSummaryParts = (source = {}, locale = 'en') => {
  const normalized = normalizeRecurrenceInput(source)
  const paymentDate = parseDateOnly(normalized.paymentDate)
  const textLocale = getTextLocale(locale)
  const dateLocale = textLocale === 'fr' ? 'fr-CA' : 'en-US'

  if (!paymentDate) {
    return textLocale === 'fr'
      ? [plain('Choisissez une date de paiement pour voir le calendrier.')]
      : [plain('Choose a payment date to preview the schedule.')]
  }

  if (normalized.scheduleType === oneTimeType) {
    return textLocale === 'fr'
      ? [
          plain('Paiement prevu le '),
          value(formatLongDate(paymentDate, dateLocale)),
          plain('.')
        ]
      : [
          plain('Payment scheduled for '),
          value(formatLongDate(paymentDate, dateLocale)),
          plain('.')
        ]
  }

  const everyValue = getEveryValue(normalized.repeatInterval, normalized.repeatUnit, textLocale)
  const parts = textLocale === 'fr'
    ? [plain('Revient tous les '), value(everyValue)]
    : [plain('Occurs every '), value(everyValue)]
  const patternParts = getPatternSummaryParts(normalized, paymentDate, dateLocale, textLocale)

  if (patternParts.length) parts.push(...patternParts)
  parts.push(plain('.'))

  return parts
}

export const deriveLegacyDatePattern = (source = {}) => {
  const normalized = normalizeRecurrenceInput(source)
  if (normalized.scheduleType === oneTimeType) return { type: 'once' }

  const paymentDate = parseDateOnly(normalized.paymentDate)
  const relative = getRelativeWeekday(paymentDate)

  if (normalized.repeatUnit === 'year') {
    if (normalized.repeatPattern === relativeWeekdayPattern) {
      return {
        type: 'nth-weekday-year',
        nthWeek: relative.nthWeek,
        dayOfWeek: relative.dayOfWeek,
        month: relative.month
      }
    }

    return {
      type: 'day-of-year',
      month: paymentDate ? paymentDate.getMonth() : 0,
      dayOfMonth: paymentDate ? paymentDate.getDate() : 1
    }
  }

  if (normalized.repeatUnit === 'month') {
    if (normalized.repeatPattern === relativeWeekdayPattern) {
      return {
        type: 'nth-weekday',
        nthWeek: relative.nthWeek,
        dayOfWeek: relative.dayOfWeek
      }
    }

    return {
      type: 'day-of-month',
      dayOfMonth: paymentDate ? paymentDate.getDate() : 1
    }
  }

  if (normalized.repeatUnit === 'week') {
    return {
      type: 'day-of-week',
      dayOfWeek: paymentDate ? paymentDate.getDay() : 1
    }
  }

  return {
    type: 'interval',
    intervalDays: normalized.repeatInterval,
    intervalHours: 1
  }
}

export const deriveLegacyFrequency = (source = {}) => {
  const normalized = normalizeRecurrenceInput(source)
  if (normalized.scheduleType === oneTimeType) return 'once'

  const interval = normalized.repeatInterval
  const unit = normalized.repeatUnit

  if (unit === 'year' && interval === 1) return 'yearly'
  if (unit === 'month' && interval === 1) return 'monthly'
  if (unit === 'month' && interval === 3) return 'quarterly'
  if (unit === 'month' && interval === 6) return 'semi-annually'
  if (unit === 'week' && interval === 1) return 'weekly'
  if (unit === 'week' && interval === 2) return 'bi-weekly'
  if (unit === 'day') return 'daily'
  return 'custom'
}

export const getTimesPerYearFromRepeat = (source = {}) => {
  const normalized = normalizeRecurrenceInput(source)
  if (normalized.scheduleType === oneTimeType) return 1

  const interval = normalized.repeatInterval

  if (normalized.repeatUnit === 'day') return 365 / interval
  if (normalized.repeatUnit === 'week') return 52 / interval
  if (normalized.repeatUnit === 'month') return 12 / interval
  if (normalized.repeatUnit === 'year') return 1 / interval
  return 12
}

const normalizeRecurrenceInput = (source = {}) => {
  const inferred = inferRepeatFromLegacy(source)
  const scheduleType = normalizeScheduleType(source.scheduleType || inferred.scheduleType)
  const repeatUnit = scheduleType === oneTimeType
    ? null
    : normalizeRepeatUnit(source.repeatUnit || inferred.repeatUnit)
  const repeatInterval = scheduleType === oneTimeType
    ? null
    : normalizeRepeatInterval(source.repeatInterval || inferred.repeatInterval)
  const repeatPattern = scheduleType === oneTimeType
    ? null
    : normalizeRepeatPattern(source.repeatPattern || inferred.repeatPattern, repeatUnit)
  const paymentDate = formatDateOnly(source.paymentDate || source.startDate || source.startsOn)

  return {
    scheduleType,
    paymentDate,
    paymentTimezone: scheduleType === oneTimeType
      ? null
      : source.paymentTimezone || source.timezone || getDefaultPaymentTimezone(),
    repeatInterval,
    repeatUnit,
    repeatPattern,
    legacyFrequency: scheduleType === oneTimeType
      ? 'once'
      : source.frequency || deriveLegacyFrequencyFromParts(repeatInterval, repeatUnit)
  }
}

const inferRepeatFromLegacy = (source = {}) => {
  const scheduleType = normalizeScheduleType(source.scheduleType || source.recurrenceSchedule?.scheduleType || source.frequency)
  const frequency = source.frequency || 'monthly'
  const pattern = normalizeDatePattern(source.datePattern)
  const isRelativeMonthly = ['nth-weekday', 'ordinal-weekday'].includes(pattern.type)
  const isRelativeYearly = ['nth-weekday-year', 'ordinal-weekday-in-month'].includes(pattern.type)
  const isIntervalPattern = ['interval', 'day-interval'].includes(pattern.type)

  if (scheduleType === oneTimeType || pattern.type === 'once') {
    return {
      scheduleType: oneTimeType,
      repeatInterval: null,
      repeatUnit: null,
      repeatPattern: null
    }
  }

  if (source.recurrenceSchedule?.repeat) {
    return {
      scheduleType: recurringType,
      repeatInterval: source.recurrenceSchedule.repeat.interval,
      repeatUnit: source.recurrenceSchedule.repeat.unit,
      repeatPattern: source.recurrenceSchedule.repeatPattern || source.recurrenceSchedule.pattern?.type
    }
  }

  if (frequency === 'yearly') {
    return {
      scheduleType: recurringType,
      repeatInterval: 1,
      repeatUnit: 'year',
      repeatPattern: isRelativeYearly ? relativeWeekdayPattern : calendarPattern
    }
  }

  if (frequency === 'quarterly') {
    return {
      scheduleType: recurringType,
      repeatInterval: 3,
      repeatUnit: 'month',
      repeatPattern: isRelativeMonthly ? relativeWeekdayPattern : calendarPattern
    }
  }

  if (frequency === 'semi-annually') {
    return {
      scheduleType: recurringType,
      repeatInterval: 6,
      repeatUnit: 'month',
      repeatPattern: isRelativeMonthly ? relativeWeekdayPattern : calendarPattern
    }
  }

  if (frequency === 'monthly') {
    return {
      scheduleType: recurringType,
      repeatInterval: 1,
      repeatUnit: 'month',
      repeatPattern: isRelativeMonthly ? relativeWeekdayPattern : calendarPattern
    }
  }

  if (frequency === 'bi-weekly') {
    return {
      scheduleType: recurringType,
      repeatInterval: 2,
      repeatUnit: 'week',
      repeatPattern: null
    }
  }

  if (frequency === 'weekly') {
    return {
      scheduleType: recurringType,
      repeatInterval: 1,
      repeatUnit: 'week',
      repeatPattern: null
    }
  }

  if (frequency === 'daily' || frequency === 'hourly') {
    return {
      scheduleType: recurringType,
      repeatInterval: frequency === 'daily' && isIntervalPattern ? Number(pattern.intervalDays) || 1 : 1,
      repeatUnit: 'day',
      repeatPattern: null
    }
  }

  if (frequency === 'custom') {
    return {
      scheduleType: recurringType,
      repeatInterval: isIntervalPattern
        ? Number(pattern.intervalDays) || 1
        : Math.max(1, Math.round(365 / (Number(source.customTimesPerYear) || 12))),
      repeatUnit: 'day',
      repeatPattern: null
    }
  }

  return {
    scheduleType: recurringType,
    repeatInterval: 1,
    repeatUnit: 'month',
    repeatPattern: calendarPattern
  }
}

const buildPatternDetails = (source) => {
  const paymentDate = parseDateOnly(source.paymentDate)

  if (source.scheduleType === oneTimeType) {
    return { type: oneTimeType }
  }

  if (!repeatUnitSupportsPattern(source.repeatUnit)) {
    return {
      type: 'fixed-interval',
      unit: source.repeatUnit,
      interval: source.repeatInterval,
      dayOfWeek: source.repeatUnit === 'week' && paymentDate ? paymentDate.getDay() : null
    }
  }

  if (source.repeatPattern === relativeWeekdayPattern) {
    const relative = getRelativeWeekday(paymentDate)
    return {
      type: relativeWeekdayPattern,
      nthWeek: relative.nthWeek,
      dayOfWeek: relative.dayOfWeek,
      month: source.repeatUnit === 'year' ? relative.month : null
    }
  }

  return {
    type: calendarPattern,
    dayOfMonth: paymentDate ? paymentDate.getDate() : 1,
    month: source.repeatUnit === 'year' && paymentDate ? paymentDate.getMonth() : null
  }
}

const deriveLegacyFrequencyFromParts = (interval, unit) => {
  if (unit === 'year' && interval === 1) return 'yearly'
  if (unit === 'month' && interval === 1) return 'monthly'
  if (unit === 'month' && interval === 3) return 'quarterly'
  if (unit === 'month' && interval === 6) return 'semi-annually'
  if (unit === 'week' && interval === 1) return 'weekly'
  if (unit === 'week' && interval === 2) return 'bi-weekly'
  if (unit === 'day') return 'daily'
  return 'custom'
}

const plain = (text) => ({ text, emphasized: false })
const value = (text) => ({ text, emphasized: true })

const getTextLocale = (locale = 'en') => (
  String(locale).startsWith('fr') ? 'fr' : 'en'
)

const getEveryValue = (interval, unit, locale) => {
  const normalizedInterval = normalizeRepeatInterval(interval)
  const label = getUnitLabel(unit, normalizedInterval, locale)
  return normalizedInterval === 1 ? label : `${normalizedInterval} ${label}`
}

const getUnitLabel = (unit, count, locale) => {
  const labels = {
    en: {
      day: ['day', 'days'],
      week: ['week', 'weeks'],
      month: ['month', 'months'],
      year: ['year', 'years']
    },
    fr: {
      day: ['jour', 'jours'],
      week: ['semaine', 'semaines'],
      month: ['mois', 'mois'],
      year: ['an', 'ans']
    }
  }
  const unitLabels = labels[locale]?.[unit] || labels.en.month
  return count === 1 ? unitLabels[0] : unitLabels[1]
}

const getPatternSummaryParts = (source, paymentDate, dateLocale, textLocale) => {
  if (source.repeatUnit === 'day') return []

  if (source.repeatUnit === 'week') {
    return textLocale === 'fr'
      ? [plain(' le '), value(formatWeekday(paymentDate, dateLocale))]
      : [plain(' on '), value(formatWeekday(paymentDate, dateLocale))]
  }

  const relative = getRelativeWeekday(paymentDate)
  const weekday = formatWeekday(paymentDate, dateLocale)
  const monthDay = formatMonthDay(paymentDate, dateLocale)
  const dayOrdinal = formatDayOrdinal(paymentDate.getDate(), textLocale)
  const relativeOrdinal = formatRelativeOrdinal(relative.nthWeek, textLocale)
  const month = formatMonth(paymentDate, dateLocale)

  if (source.repeatPattern === relativeWeekdayPattern) {
    if (source.repeatUnit === 'year') {
      return textLocale === 'fr'
        ? [plain(' le '), value(`${relativeOrdinal} ${weekday} de ${month}`)]
        : [plain(' on the '), value(`${relativeOrdinal} ${weekday} of ${month}`)]
    }

    return textLocale === 'fr'
      ? [plain(' le '), value(`${relativeOrdinal} ${weekday}`)]
      : [plain(' on the '), value(`${relativeOrdinal} ${weekday}`)]
  }

  if (source.repeatUnit === 'year') {
    return textLocale === 'fr'
      ? [plain(' le '), value(monthDay)]
      : [plain(' on '), value(monthDay)]
  }

  return textLocale === 'fr'
    ? [plain(' le '), value(dayOrdinal)]
    : [plain(' on the '), value(dayOrdinal)]
}

const formatLongDate = (date, locale) => (
  new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
)

const formatWeekday = (date, locale) => (
  new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)
)

const formatMonth = (date, locale) => (
  new Intl.DateTimeFormat(locale, { month: 'long' }).format(date)
)

const formatMonthDay = (date, locale) => (
  new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' }).format(date)
)

const formatRelativeOrdinal = (value, locale) => {
  if (locale === 'fr') return value === 5 ? 'dernier' : `${value}e`
  if (value === 5) return 'last'
  if (value === 1) return '1st'
  if (value === 2) return '2nd'
  if (value === 3) return '3rd'
  return `${value}th`
}

const formatDayOrdinal = (value, locale) => {
  if (locale === 'fr') return `${value}`

  const mod100 = value % 100
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`
  const mod10 = value % 10
  if (mod10 === 1) return `${value}st`
  if (mod10 === 2) return `${value}nd`
  if (mod10 === 3) return `${value}rd`
  return `${value}th`
}
