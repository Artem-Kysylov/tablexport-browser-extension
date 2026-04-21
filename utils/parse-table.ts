export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

const UI_NOISE_SELECTORS = [
  'button',
  'svg',
  '[role="button"]',
  '[aria-hidden="true"]',
  '[data-tablexport-bridge-button]',
].join(',');

const normalizeCellText = (value: string): string =>
  value
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getCellText = (cell: HTMLElement): string => {
  const clone = cell.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(UI_NOISE_SELECTORS).forEach((node) => node.remove());
  return normalizeCellText(clone.textContent ?? '');
};

const readRow = (row: HTMLTableRowElement): string[] =>
  Array.from(row.cells).map((cell) => getCellText(cell as HTMLElement));

const hasContent = (cells: string[]): boolean =>
  cells.some((cell) => cell.length > 0);

export const parseHtmlTable = (table: HTMLTableElement): ParsedTable | null => {
  const theadRow = table.tHead?.rows[0];
  const bodyRows = Array.from(table.tBodies).flatMap((body) =>
    Array.from(body.rows),
  );

  let headers: string[] = [];
  let rows: string[][] = [];

  if (theadRow) {
    headers = readRow(theadRow);
    rows = bodyRows.map(readRow).filter(hasContent);
  } else {
    const allRows = Array.from(table.rows);
    if (allRows.length === 0) return null;
    headers = readRow(allRows[0]);
    rows = allRows.slice(1).map(readRow).filter(hasContent);
  }

  if (!hasContent(headers) && rows.length === 0) return null;

  const columnCount = Math.max(
    headers.length,
    ...rows.map((row) => row.length),
    0,
  );

  if (columnCount < 1) return null;

  const pad = (row: string[]): string[] =>
    row.length === columnCount
      ? row
      : [...row, ...Array.from({ length: columnCount - row.length }, () => '')];

  return {
    headers: pad(headers),
    rows: rows.map(pad),
  };
};

const escapeTsvCell = (value: string): string =>
  value.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');

export const tableToTsv = (table: ParsedTable): string => {
  const lines: string[] = [];
  if (table.headers.some((header) => header.length > 0)) {
    lines.push(table.headers.map(escapeTsvCell).join('\t'));
  }
  table.rows.forEach((row) => {
    lines.push(row.map(escapeTsvCell).join('\t'));
  });
  return lines.join('\n');
};
