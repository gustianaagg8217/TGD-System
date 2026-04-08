export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export const formatNumber = (num, decimals = 2) => {
  return Number(num).toFixed(decimals)
}
