import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface DataColumn<Row> {
  key: string;
  label: string;
  /** Renders the cell; defaults to the raw value at `key`. */
  render?: (row: Row) => ReactNode;
  /** Bold, ink-coloured cell (used for the row heading column). */
  strong?: boolean;
}

interface DataTableProps<Row> {
  caption: string;
  columns: DataColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  className?: string;
}

/** Table with the dark header row used by scorecards, standings and statistics. */
export function DataTable<Row extends object>({ caption, columns, rows, rowKey, className }: DataTableProps<Row>) {
  return (
    <div className={cn("overflow-x-auto rounded-[4px] border border-[#e4e4e7] bg-white", className)}>
      <table className="w-full min-w-[680px] border-collapse text-left text-sm leading-[21px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-[#18181b] text-[10px] leading-[15px] font-bold tracking-[1px] text-white uppercase">
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-4 py-[14.4px] font-bold">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-[#e4e4e7] text-[#09090b] last:border-b-0">
              {columns.map((column) => {
                const value = column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "");

                return column.strong ? (
                  <th key={column.key} scope="row" className="px-4 py-4 font-bold">
                    {value}
                  </th>
                ) : (
                  <td key={column.key} className="px-4 py-4 font-normal">
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
