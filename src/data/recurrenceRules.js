import { getDefaultPaymentTimezone } from './timeZones'

export { getDefaultPaymentTimezone } from './timeZones'

export const normalizeDatePattern = (pattern = {}) => ({
  type: pattern.type || 'day-of-month',
  dayOfMonth: Number(pattern.dayOfMonth) || 1,
  dayOfWeek: Number.isInteger(pattern.dayOfWeek) ? pattern.dayOfWeek : 1,
  nthWeek: Number(pattern.nthWeek) || 1,
  month: Number.isInteger(pattern.month) ? pattern.month : 0,
  intervalDays: Number(pattern.intervalDays) || 1,
  intervalHours: Number(pattern.intervalHours) || 1
})

export const buildRecurrenceSchedule = (source = {}) => {
  const frequency = source.frequency || 'monthly'
  const pattern = normalizeDatePattern(source.datePattern)
  const customTimesPerYear = Number(source.customTimesPerYear) || null

  return {
    version: 1,
    timezone: source.paymentTimezone || getDefaultPaymentTimezone(),
    startsOn: source.startDate || null,
    startsAt: source.startTime || null,
    frequency,
    interval: getFrequencyInterval(frequency, pattern),
    timesPerYear: frequency === 'custom' ? customTimesPerYear : null,
    pattern: getSchedulePattern(frequency, pattern)
  }
}

export const normalizeRecurrenceSchedule = (schedule, source = {}) => {
  if (!schedule) return buildRecurrenceSchedule(source)

  return {
    version: Number(schedule.version) || 1,
    timezone: schedule.timezone || source.paymentTimezone || getDefaultPaymentTimezone(),
    startsOn: schedule.startsOn || source.startDate || null,
    startsAt: schedule.startsAt || source.startTime || null,
    frequency: schedule.frequency || source.frequency || 'monthly',
    interval: Number(schedule.interval) || getFrequencyInterval(source.frequency || 'monthly', source.datePattern || {}),
    timesPerYear: Number(schedule.timesPerYear) || (source.frequency === 'custom' ? Number(source.customTimesPerYear) || 1 : null),
    pattern: schedule.pattern || getSchedulePattern(source.frequency || 'monthly', source.datePattern || {})
  }
}

const getFrequencyInterval = (frequency, pattern = {}) => {
  if (frequency === 'once') return 1
  if (frequency === 'bi-weekly') return 2
  if (frequency === 'quarterly') return 3
  if (frequency === 'semi-annually') return 6
  if (frequency === 'daily') return Number(pattern.intervalDays) || 1
  if (frequency === 'hourly') return Number(pattern.intervalHours) || 1
  return 1
}

const getSchedulePattern = (frequency, pattern = {}) => {
  if (frequency === 'once') {
    return {
      type: 'once'
    }
  }

  if (frequency === 'weekly' || frequency === 'bi-weekly') {
    return {
      type: 'start-date-interval',
      dayOfWeek: Number.isInteger(pattern.dayOfWeek) ? pattern.dayOfWeek : null
    }
  }

  if (frequency === 'daily') {
    return {
      type: 'daily-interval',
      intervalDays: Number(pattern.intervalDays) || 1
    }
  }

  if (frequency === 'hourly') {
    return {
      type: 'hourly-interval',
      intervalHours: Number(pattern.intervalHours) || 1
    }
  }

  if (frequency === 'yearly' && pattern.type === 'nth-weekday-year') {
    return {
      type: 'ordinal-weekday-in-month',
      month: Number.isInteger(pattern.month) ? pattern.month : 0,
      nthWeek: Number(pattern.nthWeek) || 1,
      dayOfWeek: Number.isInteger(pattern.dayOfWeek) ? pattern.dayOfWeek : 1
    }
  }

  if (frequency === 'yearly') {
    return {
      type: 'fixed-calendar-date',
      month: Number.isInteger(pattern.month) ? pattern.month : 0,
      dayOfMonth: Number(pattern.dayOfMonth) || 1
    }
  }

  if (pattern.type === 'nth-weekday') {
    return {
      type: 'ordinal-weekday',
      nthWeek: Number(pattern.nthWeek) || 1,
      dayOfWeek: Number.isInteger(pattern.dayOfWeek) ? pattern.dayOfWeek : 1
    }
  }

  if (pattern.type === 'interval') {
    return {
      type: 'day-interval',
      intervalDays: Number(pattern.intervalDays) || 1
    }
  }

  return {
    type: 'fixed-day-of-month',
    dayOfMonth: Number(pattern.dayOfMonth) || 1
  }
}
