import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { formatCurrency } from '@/utils/format'

export interface ReportRow {
  no: number
  tanggal: string
  siswa: string
  jenis: string
  nominal: number
  saldoAkhir: string
  catatan: string
}

export function exportToPDF(rows: ReportRow[], title: string, subtitle: string) {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text(title, 14, 15)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(subtitle, 14, 21)

  autoTable(doc, {
    startY: 26,
    head: [['No', 'Tanggal', 'Siswa', 'Jenis', 'Nominal', 'Saldo Akhir', 'Catatan']],
    body: rows.map((r) => [r.no, r.tanggal, r.siswa, r.jenis, formatCurrency(r.nominal), r.saldoAkhir, r.catatan]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 64, 175] }
  })

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`)
}

export function exportToExcel(rows: ReportRow[], title: string) {
  const worksheet = XLSX.utils.json_to_sheet(
    rows.map((r) => ({
      No: r.no,
      Tanggal: r.tanggal,
      Siswa: r.siswa,
      Jenis: r.jenis,
      Nominal: r.nominal,
      'Saldo Akhir': r.saldoAkhir,
      Catatan: r.catatan
    }))
  )
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan')
  XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.xlsx`)
}

export async function exportToJPG(elementId: string, title: string) {
  const el = document.getElementById(elementId)
  if (!el) return
  const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 })
  const link = document.createElement('a')
  link.download = `${title.replace(/\s+/g, '_')}.jpg`
  link.href = canvas.toDataURL('image/jpeg', 0.95)
  link.click()
}

export function printReport(elementId: string) {
  const el = document.getElementById(elementId)
  if (!el) return
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`
    <html>
      <head>
        <title>Cetak Laporan</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
          th { background: #1E40AF; color: white; }
        </style>
      </head>
      <body>${el.innerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

