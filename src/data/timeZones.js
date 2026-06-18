const fallbackTimeZones = [
  'UTC',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'America/Anchorage',
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Chicago',
  'America/Denver',
  'America/Detroit',
  'America/Halifax',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Phoenix',
  'America/Sao_Paulo',
  'America/St_Johns',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jerusalem',
  'Asia/Kolkata',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Pacific/Auckland',
  'Pacific/Honolulu'
]

export const getDefaultPaymentTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export const getSupportedTimeZones = () => {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone')
    }
  } catch {
    // Fall back below.
  }

  return fallbackTimeZones
}

export const getTimeZoneOptions = (selectedTimeZone) => {
  const zones = new Set(getSupportedTimeZones())

  if (selectedTimeZone) {
    zones.add(selectedTimeZone)
  }

  return Array.from(zones)
    .sort((a, b) => a.localeCompare(b))
    .map((zone) => ({
      value: zone,
      label: zone.replace(/_/g, ' ')
    }))
}
