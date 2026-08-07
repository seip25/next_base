"use client";

import React, { useState, useEffect, useMemo } from "react";

// Helper function for language check safely
const getLang = () => {
  if (typeof window !== "undefined" && typeof window.lang === "function") {
    try {
      return window.lang();
    } catch (e) {
      return true;
    }
  }
  return true;
};

/**
 * ResponsiveDataTable JavaScript Class adapted for Bluebird CSS
 */
export class ResponsiveDataTable {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    if (!this.container) return;
    this.defaults = {
      data: [],
      columns: [],
      rowsPerPage: 10,
      search: true,
      pagination: true,
      headerTitles: {},
      summaryFields: ["id"],
      edit: false,
      delete: false,
      breakpoint: 768,
    };
    this.options = { ...this.defaults, ...options };
    this.currentPage = 1;
    this.filteredData = [...this.options.data];
    this.isMobile = typeof window !== "undefined" ? window.innerWidth < this.options.breakpoint : false;
    this.init();
    if (typeof window !== "undefined") {
      this.resizeHandler = () => this.handleResize();
      window.addEventListener("resize", this.resizeHandler);
    }
  }

  init() {
    this.renderContainer();
    this.updateTable();
    if (this.options.search) this.setupSearch();
  }

  destroy() {
    if (typeof window !== "undefined" && this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < this.options.breakpoint;
    if (wasMobile !== this.isMobile) this.updateTable();
  }

  renderContainer() {
    const isEs = getLang();
    this.container.innerHTML = `
      <section class="datatable-wrapper w-full">
        ${
          this.options.search
            ? `<div class="mb-4 flex items-center justify-between">
                <input type="search" class="datatable-search-input w-full max-w-xs" placeholder="${isEs ? "Buscar..." : "Search..."}" aria-label="Search"/>
              </div>`
            : ""
        }

        <div class="overflow-x-auto rounded-xl border border-surface">
          <table class="datatable-table min-w-full divide-y divide-surface text-sm hidden"></table>
          <div class="datatable-mobile"></div>
        </div>

        ${
          this.options.pagination
            ? `<nav class="datatable-pagination mt-4 flex items-center justify-center gap-1.5" aria-label="Pagination"></nav>`
            : ""
        }
      </section>`;
  }

  renderTable() {
    const table = this.container.querySelector(".datatable-table");
    const mobileView = this.container.querySelector(".datatable-mobile");
    if (!table || !mobileView) return;
    if (this.isMobile) {
      table.classList.add("hidden");
      mobileView.classList.remove("hidden");
      this.renderMobileView();
    } else {
      table.classList.remove("hidden");
      mobileView.classList.add("hidden");
      this.renderDesktopTable();
    }
  }

  renderDesktopTable() {
    const table = this.container.querySelector(".datatable-table");
    const isEs = getLang();
    table.innerHTML = `
      <thead>
        <tr class="datatable-header"></tr>
      </thead>
      <tbody class="datatable-body divide-y divide-surface"></tbody>`;
    const headerRow = table.querySelector("thead tr");
    this.options.columns.forEach((column) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider bg-surface border-b";
      th.textContent = this.options.headerTitles[column.key] || column.title || column.key;
      headerRow.appendChild(th);
    });

    if (this.options.edit || this.options.delete) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider bg-surface border-b";
      th.textContent = isEs ? "Acciones" : "Actions";
      headerRow.appendChild(th);
    }

    const startIndex = (this.currentPage - 1) * this.options.rowsPerPage;
    const endIndex = startIndex + this.options.rowsPerPage;
    const paginatedData = this.filteredData.slice(startIndex, endIndex);
    const tbody = table.querySelector("tbody");

    paginatedData.forEach((item) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-surface transition-colors";
      this.options.columns.forEach((column) => {
        const td = document.createElement("td");
        td.className = "px-4 py-3 whitespace-nowrap align-middle font-medium";
        const value = item[column.key];
        if (value && typeof value === "string" && /<[a-z][\s\S]*>/i.test(value)) {
          td.innerHTML = value;
        } else {
          td.textContent = value !== undefined && value !== null ? value : "-";
        }
        row.appendChild(td);
      });

      if (this.options.edit || this.options.delete) {
        const td = document.createElement("td");
        td.className = "px-4 py-3 whitespace-nowrap align-middle";
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "flex items-center gap-2";

        if (this.options.edit) {
          const btn = document.createElement("button");
          btn.className = "btn-sm outline";
          btn.textContent = isEs ? "Editar" : "Edit";
          btn.onclick = (e) => this.handleAction("edit", e, item);
          actionsDiv.appendChild(btn);
        }
        if (this.options.delete) {
          const btn = document.createElement("button");
          btn.className = "btn-sm destructive";
          btn.textContent = isEs ? "Eliminar" : "Delete";
          btn.onclick = (e) => this.handleAction("delete", e, item);
          actionsDiv.appendChild(btn);
        }
        td.appendChild(actionsDiv);
        row.appendChild(td);
      }
      tbody.appendChild(row);
    });
  }

  renderMobileView() {
    const mobileView = this.container.querySelector(".datatable-mobile");
    if (!mobileView) return;
    mobileView.innerHTML = "";
    const isEs = getLang();
    const startIndex = (this.currentPage - 1) * this.options.rowsPerPage;
    const endIndex = startIndex + this.options.rowsPerPage;
    const paginatedData = this.filteredData.slice(startIndex, endIndex);

    paginatedData.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card mb-4 p-4 rounded-2xl border flex flex-col gap-3";

      const summary = document.createElement("h3");
      summary.className = "text-base font-black border-b pb-2 mb-1 flex items-center justify-between";
      this.options.summaryFields.forEach((fieldKey) => {
        const value = item[fieldKey];
        summary.innerHTML += `<span>${value || "-"}</span>`;
      });
      card.appendChild(summary);

      const details = document.createElement("dl");
      details.className = "grid grid-cols-1 gap-x-4 gap-y-2 text-xs pb-2 border-b mb-1";
      this.options.columns.forEach((column) => {
        if (this.options.summaryFields.includes(column.key)) return;
        const dt = document.createElement("dt");
        dt.className = "font-bold text-secondary uppercase tracking-wider";
        dt.textContent = this.options.headerTitles[column.key] || column.title || column.key;
        const dd = document.createElement("dd");
        dd.className = "font-semibold text-left break-all";
        const cellValue = item[column.key];
        if (cellValue && typeof cellValue === "string" && /<[a-z][\s\S]*>/i.test(cellValue)) {
          dd.innerHTML = cellValue;
        } else {
          dd.textContent = cellValue !== undefined && cellValue !== null ? cellValue : "-";
        }
        details.appendChild(dt);
        details.appendChild(dd);
      });
      card.appendChild(details);

      if (this.options.edit || this.options.delete) {
        const actions = document.createElement("div");
        actions.className = "flex items-center gap-2 justify-end";
        if (this.options.edit) {
          const btn = document.createElement("button");
          btn.className = "btn-sm outline";
          btn.textContent = isEs ? "Editar" : "Edit";
          btn.onclick = (e) => this.handleAction("edit", e, item);
          actions.appendChild(btn);
        }
        if (this.options.delete) {
          const btn = document.createElement("button");
          btn.className = "btn-sm destructive";
          btn.textContent = isEs ? "Eliminar" : "Delete";
          btn.onclick = (e) => this.handleAction("delete", e, item);
          actions.appendChild(btn);
        }
        card.appendChild(actions);
      }
      mobileView.appendChild(card);
    });
  }

  renderPagination() {
    const pagination = this.container.querySelector(".datatable-pagination");
    if (!pagination || !this.options.pagination) return;
    pagination.innerHTML = "";
    const pageCount = Math.ceil(this.filteredData.length / this.options.rowsPerPage);
    if (pageCount <= 1) return;

    const btnClass = "btn-sm ";
    const activeBtnClass = btnClass + "primary";
    const inactiveBtnClass = btnClass + "outline";
    const disabledBtnClass = btnClass + "outline opacity-50 cursor-not-allowed";

    const prevButton = document.createElement("button");
    prevButton.textContent = "«";
    prevButton.className = this.currentPage === 1 ? disabledBtnClass : inactiveBtnClass;
    prevButton.disabled = this.currentPage === 1;
    prevButton.onclick = () => this.changePage(this.currentPage - 1);
    pagination.appendChild(prevButton);

    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > pageCount) {
      end = pageCount;
      start = Math.max(1, end - maxVisible + 1);
    }
    if (start > 1) {
      const firstButton = document.createElement("button");
      firstButton.className = inactiveBtnClass;
      firstButton.textContent = "1";
      firstButton.onclick = () => this.changePage(1);
      pagination.appendChild(firstButton);
      if (start > 2) pagination.appendChild(this.createEllipsis());
    }
    for (let i = start; i <= end; i++) {
      const button = document.createElement("button");
      button.className = i === this.currentPage ? activeBtnClass : inactiveBtnClass;
      button.textContent = i;
      button.onclick = () => this.changePage(i);
      pagination.appendChild(button);
    }
    if (end < pageCount) {
      if (end < pageCount - 1) pagination.appendChild(this.createEllipsis());
      const lastButton = document.createElement("button");
      lastButton.className = inactiveBtnClass;
      lastButton.textContent = pageCount;
      lastButton.onclick = () => this.changePage(pageCount);
      pagination.appendChild(lastButton);
    }
    const nextButton = document.createElement("button");
    nextButton.className = this.currentPage === pageCount ? disabledBtnClass : inactiveBtnClass;
    nextButton.textContent = "»";
    nextButton.disabled = this.currentPage === pageCount;
    nextButton.onclick = () => this.changePage(this.currentPage + 1);
    pagination.appendChild(nextButton);
  }

  createEllipsis() {
    const span = document.createElement("span");
    span.className = "text-secondary px-1";
    span.textContent = "...";
    return span;
  }

  changePage(page) {
    this.currentPage = page;
    this.updateTable();
  }

  handleAction(type, event, item) {
    if (!this.options[type]) return;
    const callback =
      typeof this.options[type] === "function"
        ? this.options[type]
        : typeof window !== "undefined"
        ? window[this.options[type]]
        : null;
    if (typeof callback === "function") callback(event, item.id || item);
  }

  setupSearch() {
    const searchInput = this.container.querySelector(".datatable-search-input");
    if (!searchInput) return;
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      this.filteredData = this.options.data.filter((item) =>
        this.options.columns.some((column) =>
          String(item[column.key] || "")
            .toLowerCase()
            .includes(term)
        )
      );
      this.currentPage = 1;
      this.updateTable();
    });
  }

  updateTable() {
    this.renderTable();
    if (this.options.pagination) this.renderPagination();
  }

  updateData(newData) {
    this.options.data = newData;
    this.filteredData = [...newData];
    this.currentPage = 1;
    this.updateTable();
  }

  updateColumns(newColumns) {
    this.options.columns = newColumns;
    this.updateTable();
  }
}

/**
 * React Component version of DataTable styled with Bluebird CSS
 */
export function DataTable({
  data = [],
  columns = [],
  rowsPerPage = 10,
  search = true,
  pagination = true,
  headerTitles = {},
  summaryFields = ["id"],
  onEdit,
  onDelete,
  breakpoint = 768,
  className = "",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const isEs = getLang();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase().trim();
    return data.filter((item) =>
      columns.some((col) =>
        String(item[col.key] || "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [data, columns, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  return (
    <section className={`w-full ${className}`}>
      {search && (
        <div className="mb-4 flex items-center justify-between">
          <input
            type="search"
            className="w-full max-w-xs"
            placeholder={isEs ? "Buscar..." : "Search..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-surface">
        {isMobile ? (
          <div className="datatable-mobile p-2">
            {paginatedData.map((item, idx) => (
              <article key={item.id || idx} className="card mb-4 p-4 rounded-2xl border flex flex-col gap-3">
                <h3 className="text-base font-black border-b pb-2 mb-1 flex items-center justify-between">
                  {summaryFields.map((fKey) => (
                    <span key={fKey}>{item[fKey] || "-"}</span>
                  ))}
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs pb-2 border-b mb-1">
                  {columns.map((col) => {
                    if (summaryFields.includes(col.key)) return null;
                    const cellVal = item[col.key];
                    return (
                      <React.Fragment key={col.key}>
                        <dt className="font-bold text-secondary uppercase tracking-wider">
                          {headerTitles[col.key] || col.title || col.key}
                        </dt>
                        <dd className="font-semibold text-left break-all">
                          {cellVal !== undefined && cellVal !== null ? String(cellVal) : "-"}
                        </dd>
                      </React.Fragment>
                    );
                  })}
                </dl>
                {(onEdit || onDelete) && (
                  <div className="flex items-center gap-2 justify-end">
                    {onEdit && (
                      <button className="btn-sm outline" onClick={(e) => onEdit(e, item)}>
                        {isEs ? "Editar" : "Edit"}
                      </button>
                    )}
                    {onDelete && (
                      <button className="btn-sm destructive" onClick={(e) => onDelete(e, item)}>
                        {isEs ? "Eliminar" : "Delete"}
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <table className="min-w-full divide-y text-sm">
            <thead>
              <tr className="bg-surface">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-b">
                    {headerTitles[col.key] || col.title || col.key}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-b">
                    {isEs ? "Acciones" : "Actions"}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedData.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-surface transition-colors">
                  {columns.map((col) => {
                    const val = item[col.key];
                    return (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap align-middle font-medium">
                        {val !== undefined && val !== null ? String(val) : "-"}
                      </td>
                    );
                  })}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <button className="btn-sm outline" onClick={(e) => onEdit(e, item)}>
                            {isEs ? "Editar" : "Edit"}
                          </button>
                        )}
                        {onDelete && (
                          <button className="btn-sm destructive" onClick={(e) => onDelete(e, item)}>
                            {isEs ? "Eliminar" : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-1.5" aria-label="Pagination">
          <button
            className={`btn-sm outline ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            «
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                className={`btn-sm ${pageNum === currentPage ? "primary" : "outline"}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className={`btn-sm outline ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            »
          </button>
        </nav>
      )}
    </section>
  );
}
