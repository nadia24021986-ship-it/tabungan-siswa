export function formatCurrency(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID')
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function formatMonthLabel(monthIndex: number): string {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return names[monthIndex]
}

