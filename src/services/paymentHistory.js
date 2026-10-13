import {
  formatDateOnly,
  normalizeRecurrenceSchedule,
  parseDateOnly
} from '../data/recurrenceRules'

export const paymentChangeTypes = {
  standard: 'standard',
  manual: 'manual',
  oneTime: 'one-time',
  effectiveFrom: 'effective-from'
}

const maxGeneratedOccurrences = 5000

const toNumber = (value, fallback = 0) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : fallback
}

const toDate = (value) => parseDateOnly(value)

const todayDate = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const addMonths = (date, months) => {
  const next = new Date(date)
  const day = next.getDate()
  next.setDate(1)
  next.setMonth(next.getMonth() + months)
  const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  next.setDate(Math.min(day, daysInMonth))
  return next
}

const getNthWeekdayOfMonth = (year, month, nthWeek, dayOfWeek) => {
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()
  const offset = (dayOfWeek - firstDayOfWeek + 7) % 7

  if (nthWeek === 5) {
    const lastDay = new Date(year, month + 1, 0)
    const lastDow = lastDay.getDay()
    const backwards = (lastDow - dayOfWeek + 7) % 7
    return new Date(year, month, lastDay.getDate() - backwards)
  }

  return new Date(year, month, 1 + offset + (nthWeek - 1) * 7)
}

const getCalendarMonthCandidate = (monthAnchor, anchorDate) => {
  const max = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate()
  return new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), Math.min(anchorDate.getDate(), max))
}

const getRelativeMonthCandidate = (monthAnchor, pattern = {}) =>
  getNthWeekdayOfMonth(
    monthAnchor.getFullYear(),
    monthAnchor.getMonth(),
    pattern.nthWeek || 1,
    pattern.dayOfWeek ?? 1
  )

const normalizeDetails = (details) => {
  if (!details) return {}
  if (typeof details === 'string') {
    try {
      return JSON.parse(details) || {}
    } catch {
      return { note: details }
    }
  }

  return typeof details === 'object' ? details : {}
}

export const sortPaymentHistoryRecords = (records) =>
  [...records].sort((a, b) => String(a.scheduledDate).localeCompare(String(b.scheduledDate)))

export const getPaymentOccurrenceDates = (expense = {}, options = {}) => {
  const recurrence = normalizeRecurrenceSchedule(expense.recurrenceSchedule, expense)
  const anchorDate = toDate(recurrence.paymentDate || recurrence.startsOn || expense.paymentDate || expense.startDate)
  const throughDate = toDate(options.throughDate) || todayDate()

  if (!anchorDate || anchorDate > throughDate) return []

  if (recurrence.scheduleType === 'one-time') {
    return [formatDateOnly(anchorDate)]
  }

  const repeatInterval = Math.max(1, Number(recurrence.repeat?.interval || recurrence.repeatInterval) || 1)
  const repeatUnit = recurrence.repeat?.unit || recurrence.repeatUnit || 'month'
  const occurrenceDates = []

  if (repeatUnit === 'day' || repeatUnit === 'week') {
    const stepDays = repeatUnit === 'week' ? repeatInterval * 7 : repeatInterval
    let candidate = new Date(anchorDate)

    while (candidate <= throughDate && occurrenceDates.length < maxGeneratedOccurrences) {
      occurrenceDates.push(formatDateOnly(candidate))
      candidate = addDays(candidate, stepDays)
    }

    return occurrenceDates
  }

  const intervalMonths = repeatUnit === 'year' ? repeatInterval * 12 : repeatInterval
  const pattern = recurrence.pattern || {}
  const usesRelativePattern = recurrence.repeatPattern === 'same-relative-weekday' ||
    pattern.type === 'same-relative-weekday'
  let monthAnchor = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
  let candidate = usesRelativePattern
    ? getRelativeMonthCandidate(monthAnchor, pattern)
    : getCalendarMonthCandidate(monthAnchor, anchorDate)

  while (candidate <= throughDate && occurrenceDates.length < maxGeneratedOccurrences) {
    occurrenceDates.push(formatDateOnly(candidate))
    monthAnchor = addMonths(monthAnchor, intervalMonths)
    candidate = usesRelativePattern
      ? getRelativeMonthCandidate(monthAnchor, pattern)
      : getCalendarMonthCandidate(monthAnchor, anchorDate)
  }

  return occurrenceDates
}

export const normalizePaymentHistoryRecord = (record = {}, expense = {}) => {
  const source = record || {}
  const scheduledDate = formatDateOnly(source.scheduledDate)
  const paidDate = formatDateOnly(source.paidDate || source.actualPaidDate || scheduledDate)
  const amount = toNumber(source.amount, toNumber(expense.amount))

  return {
    id: String(source.id || source.key || ''),
    user: source.user || '',
    expense: String(source.expense || source.expenseId || expense.id || ''),
    scheduledDate,
    paidDate,
    amount,
    currency: source.currency || expense.currency || 'CAD',
    status: source.status || 'paid',
    source: source.source || 'generated',
    changeType: source.changeType || paymentChangeTypes.standard,
    details: normalizeDetails(source.details),
    createdAt: source.createdAt || source.created || null,
    updatedAt: source.updatedAt || source.updated || null
  }
}

export const createGeneratedPaymentHistoryRecord = (expense, scheduledDate, occurrenceIndex = 0) => {
  const now = new Date().toISOString()

  return normalizePaymentHistoryRecord({
    expense: String(expense.id || ''),
    scheduledDate,
    paidDate: scheduledDate,
    amount: toNumber(expense.amount),
    currency: expense.currency || 'CAD',
    status: 'paid',
    source: 'generated',
    changeType: paymentChangeTypes.standard,
    details: {
      occurrence: occurrenceIndex + 1
    },
    createdAt: now,
    updatedAt: now
  }, expense)
}

export const buildPaymentHistoryRecords = (expense, existingRecords = [], options = {}) => {
  const normalizedExisting = existingRecords.map((record) => normalizePaymentHistoryRecord(record, expense))
  const existingByDate = new Map(normalizedExisting.map((record) => [record.scheduledDate, record]))
  const generated = getPaymentOccurrenceDates(expense, options)
    .map((scheduledDate, index) =>
      existingByDate.get(scheduledDate) || createGeneratedPaymentHistoryRecord(expense, scheduledDate, index)
    )
  const generatedDates = new Set(generated.map((record) => record.scheduledDate))
  const extraExisting = normalizedExisting.filter((record) => !generatedDates.has(record.scheduledDate))

  return sortPaymentHistoryRecords([...generated, ...extraExisting])
}

export const getMissingPaymentHistoryRecords = (expense, existingRecords = [], options = {}) => {
  const existingDates = new Set(existingRecords.map((record) => formatDateOnly(record.scheduledDate)))

  return getPaymentOccurrenceDates(expense, options)
    .filter((scheduledDate) => !existingDates.has(scheduledDate))
    .map((scheduledDate, index) => createGeneratedPaymentHistoryRecord(expense, scheduledDate, index))
}

export const buildManualPaymentHistoryUpdate = (record, patch = {}) => {
  const now = new Date().toISOString()
  const previousAmount = toNumber(record.amount)
  const nextAmount = toNumber(patch.amount, previousAmount)
  const nextPaidDate = formatDateOnly(patch.paidDate || record.paidDate || record.scheduledDate)
  const amountChanged = nextAmount !== previousAmount
  const paidDateChanged = nextPaidDate !== formatDateOnly(record.paidDate || record.scheduledDate)

  return {
    ...record,
    paidDate: nextPaidDate,
    amount: nextAmount,
    source: 'manual',
    changeType: amountChanged ? paymentChangeTypes.oneTime : paymentChangeTypes.manual,
    details: {
      ...normalizeDetails(record.details),
      ...(amountChanged ? { previousAmount } : {}),
      ...(paidDateChanged ? { previousPaidDate: record.paidDate || record.scheduledDate } : {}),
      correctedAt: now
    },
    updatedAt: now
  }
}

export const buildEffectiveFromPaymentUpdates = (records, { effectiveDate, amount, currency }) => {
  const normalizedDate = formatDateOnly(effectiveDate)
  const nextAmount = toNumber(amount)
  const now = new Date().toISOString()

  if (!normalizedDate || nextAmount <= 0) return []

  return records
    .filter((record) => record.scheduledDate >= normalizedDate)
    .map((record) => ({
      ...record,
      amount: nextAmount,
      currency: currency || record.currency,
      source: 'price-change',
      changeType: paymentChangeTypes.effectiveFrom,
      details: {
        ...normalizeDetails(record.details),
        effectiveFrom: normalizedDate,
        previousAmount: toNumber(record.amount),
        changedAt: now
      },
      updatedAt: now
    }))
}

export const getStartedPayingDate = (expense, records = []) => {
  const sortedRecords = sortPaymentHistoryRecords(records)
  return sortedRecords[0]?.scheduledDate || formatDateOnly(expense?.paymentDate || expense?.startDate)
}

export const hasPaymentDateShift = (record) =>
  Boolean(record?.paidDate && record?.scheduledDate && record.paidDate !== record.scheduledDate)
