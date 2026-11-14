/*
  Download a table as CSV or Excel (FR-C9 shortlist export). No library needed.

    downloadTable({
      fileName: 'AI Engineer Trainee shortlist 2026-11-14',
      format: 'csv',                       // or 'excel'
      columns: [{ key: 'name', label: 'Name' }, { key: 'gpa', label: 'GPA' }],
      rows: [{ name: 'Sara', gpa: 3.7 }],
    })
*/

function escapeCsv(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadTable({ fileName, format = 'csv', columns, rows }) {
  if (format === 'excel') {
    // SpreadsheetML 2003 - opens directly in Excel
    const header = columns.map((c) => `<Cell><Data ss:Type="String">${escapeXml(c.label)}</Data></Cell>`).join('')
    const body = rows
      .map(
        (row) =>
          `<Row>${columns
            .map((c) => {
              const v = row[c.key]
              const type = typeof v === 'number' ? 'Number' : 'String'
              return `<Cell><Data ss:Type="${type}">${escapeXml(Array.isArray(v) ? v.join(', ') : v)}</Data></Cell>`
            })
            .join('')}</Row>`,
      )
      .join('')
    const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Shortlist"><Table><Row>${header}</Row>${body}</Table></Worksheet></Workbook>`
    triggerDownload(new Blob([xml], { type: 'application/vnd.ms-excel' }), `${fileName}.xls`)
    return
  }

  const lines = [
    columns.map((c) => escapeCsv(c.label)).join(','),
    ...rows.map((row) => columns.map((c) => escapeCsv(Array.isArray(row[c.key]) ? row[c.key].join('; ') : row[c.key])).join(',')),
  ]
  // BOM so Excel opens Arabic names correctly
  triggerDownload(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }), `${fileName}.csv`)
}
