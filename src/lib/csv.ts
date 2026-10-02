/**
 * Minimal RFC 4180-style CSV parser (no external dependency).
 * Supports quoted fields, escaped quotes (""), commas and newlines inside
 * quotes, and CRLF/LF line endings. Blank lines are skipped.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  // Strip UTF-8 BOM if present
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text

  const pushRow = () => {
    row.push(field)
    field = ""
    if (!(row.length === 1 && row[0].trim() === "")) {
      rows.push(row)
    }
    row = []
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
    } else if (ch === ",") {
      row.push(field)
      field = ""
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++
      pushRow()
    } else {
      field += ch
    }
  }
  if (field !== "" || row.length > 0) {
    pushRow()
  }
  return rows
}

/** Strip everything except digits (matches backend phone normalisation). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "")
}
