import React, { useState } from "react";

export default function TableBS({
  columns = [],
  data = [],
  filters = [],
  renderCell,
  renderActions,
  cyname="" 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(
    filters.reduce((acc, f) => {
      acc[f.key] = "";
      return acc;
    }, {})
  );

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredData = data.filter((row) => {
    const matchSearch = columns.some((col) =>
      String(row[col.key] ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    const matchFilters = Object.entries(selectedFilters).every(
      ([key, value]) => {
        if (!value) return true;
        return String(row[key] ?? "").toLowerCase() === value.toLowerCase();
      }
    );

    return matchSearch && matchFilters;
  });

  return (
    <>
      {/* Search + Filters */}
      <div className="row mb-3">
        <div className="col-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filters.map((filter, idx) => (
          <div className="col-2" key={idx}>
            <select
              className="form-select"
              value={selectedFilters[filter.key]}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt, i) => (
                <option key={i} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Table */}
      <table className={["table", "table-hover", cyname].join(" ")}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {renderActions && <th className="text-end"></th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {renderCell
                      ? renderCell(col.key, row[col.key], row)
                      : row[col.key]}
                  </td>
                ))}
                {renderActions && (
                  <td className="text-end">{renderActions(row)}</td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="text-center text-muted"
              >
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
