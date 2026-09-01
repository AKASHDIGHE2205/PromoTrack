import { ChevronDown, FileSpreadsheet, FileText, Package, RotateCcw, Search, Tag, User as UserIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getMonthlySalesReport } from "../../../services/global/reportServices";
import { getUsers } from "../../../services/global/userServices";
import { getActiveItems } from "../../../services/global/itemServices";
import type { MonthlySalesRow, MonthlySalesTotal } from "../../promote/types";
import type { User } from "../../global/member/types";
import type { Item } from "../../global/item/types";

const yearStart = moment().startOf("year").format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");

const brandTypeOptions = [
  { value: "", label: "All Brands" },
  { value: "P", label: "Premium Brands" },
  { value: "O", label: "Other Brands" },
];

const fmt = (n: number) => (Number(n) || 0).toFixed(2);

const MonthlySalesReportView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Item[]>([]);

  const [months, setMonths] = useState<MonthlySalesRow[]>([]);
  const [grandTotal, setGrandTotal] = useState<MonthlySalesTotal>({ premium_kg: 0, other_kg: 0, total_kg: 0 });

  const [userId, setUserId] = useState("");
  const [brandType, setBrandType] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState(yearStart);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [usersData, itemsData] = await Promise.all([
          getUsers({ limit: 1000 }),
          getActiveItems(),
        ]);
        setUsers(usersData.users);
        setProducts(itemsData.items ?? []);
      } catch {
        setUsers([]);
        setProducts([]);
      }
    };
    loadFilters();
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMonthlySalesReport({
        from_date: fromDate,
        to_date: toDate,
        user_id: userId || undefined,
        brand_type: brandType || undefined,
        item_ids: selectedItemIds.length > 0 ? selectedItemIds.join(",") : undefined,
      });
      if (data.success) {
        setMonths(data.months);
        setGrandTotal(data.grand_total);
        setShowData(true);
      }

    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to load monthly sales report.");
      setMonths([]);
      setGrandTotal({ premium_kg: 0, other_kg: 0, total_kg: 0 });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, userId, brandType, selectedItemIds]);

  const handleGenerate = () => {
    setHasGenerated(true);
    fetchReport();
  };

  const handleReset = () => {
    setUserId("");
    setBrandType("");
    setSelectedItemIds([]);
    setFromDate(yearStart);
    setToDate(today);
    setMonths([]);
    setGrandTotal({ premium_kg: 0, other_kg: 0, total_kg: 0 });
    setShowData(false);
    setHasGenerated(false);
    setError("");
    setProductsOpen(false);
  };

  const selectedUserLabel = useMemo(() => {
    if (!userId) return "All Users";
    const u = users.find((x) => String(x.user_id) === userId);
    return u ? `${u.f_name} ${u.l_name}` : "All Users";
  }, [userId, users]);

  const selectedProductsLabel = useMemo(() => {
    if (selectedItemIds.length === 0) return "All Products";
    if (selectedItemIds.length === products.length) return "All Products";
    return `${selectedItemIds.length} Product${selectedItemIds.length === 1 ? "" : "s"} Selected`;
  }, [selectedItemIds, products.length]);

  const handleProductToggle = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const reportTitle = "Monthly Sales Report (in Kgs)";

  const buildMeta = () => [
    `Period: ${moment(fromDate).format("DD MMM YYYY")} to ${moment(toDate).format("DD MMM YYYY")}`,
    `User: ${selectedUserLabel}`,
    `Brand Type: ${brandTypeOptions.find((b) => b.value === brandType)?.label ?? "All Brands"}`,
    `Products: ${selectedProductsLabel}`,
  ];

  const handleExportPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(reportTitle, 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100);
    buildMeta().forEach((line, i) => doc.text(line, 14, 22 + i * 5));

    const head = [["Month", "Premium Brands (Kg)", "Other Brands (Kg)", "Total (Kg)"]];
    const body = months.map((m) => [
      m.month_label,
      fmt(m.premium_kg),
      fmt(m.other_kg),
      fmt(m.total_kg),
    ]);
    body.push(["Grand Total", fmt(grandTotal.premium_kg), fmt(grandTotal.other_kg), fmt(grandTotal.total_kg)]);

    autoTable(doc, {
      head,
      body,
      startY: 22 + buildMeta().length * 5 + 3,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      didParseCell: (data) => {
        if (data.row.index === body.length - 1 && data.section === "body") {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save(`Monthly_Sales_Report_${fromDate}_to_${toDate}.pdf`);
  };

  const handleExportExcel = () => {
    const aoa: (string | number)[][] = [
      [reportTitle],
      ...buildMeta().map((line) => [line]),
      [],
      ["Month", "Premium Brands (Kg)", "Other Brands (Kg)", "Total (Kg)"],
      ...months.map((m) => [m.month_label, Number(fmt(m.premium_kg)), Number(fmt(m.other_kg)), Number(fmt(m.total_kg))]),
      ["Grand Total", Number(fmt(grandTotal.premium_kg)), Number(fmt(grandTotal.other_kg)), Number(fmt(grandTotal.total_kg))],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet["!cols"] = [{ wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 14 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Sales");

    XLSX.writeFile(workbook, `Monthly_Sales_Report_${fromDate}_to_${toDate}.xlsx`);
  };

  return (
    <div className="space-y-2 px-4 sm:px-0">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-slate-800 bg-clip-text text-transparent">Monthly Sales Report</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Sales in Kgs by month, split by Premium and Other brands.</p>
        </div>
        <div className="flex flex-wrap justify-between sm:justify-end items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={months.length === 0}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-sm shrink-0 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={months.length === 0}
            className="flex items-center gap-2 rounded-lg bg-green-50 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors shadow-sm shrink-0 border border-green-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <span className="text-sm text-gray-400 text-center sm:text-left">to</span>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-[70%] pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.f_name} {u.l_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={brandType}
                onChange={(e) => setBrandType(e.target.value)}
                className="w-[70%] pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
              >
                {brandTypeOptions.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="relative" ref={productsRef}>
              <button
                type="button"
                onClick={() => setProductsOpen((o) => !o)}
                className="w-full sm:w-[70%] flex items-center justify-between gap-2 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white relative"
              >
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <span className="truncate text-left">{selectedProductsLabel}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
              </button>

              {productsOpen && (
                <div className="absolute z-20 mt-1 w-full sm:w-[70%] max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                  <button
                    type="button"
                    onClick={() => setSelectedItemIds([])}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${selectedItemIds.length === 0 ? "text-blue-700 font-medium" : "text-gray-700"}`}
                  >
                    All Products
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  {products.length === 0 ? (
                    <span className="block text-xs text-gray-400 px-3 py-1.5">No active products available.</span>
                  ) : (
                    products.map((p) => (
                      <label key={p.item_id} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(String(p.item_id))}
                          onChange={() => handleProductToggle(String(p.item_id))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{p.item_name} ({p.brand_name})</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:col-span-2 md:justify-end">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Generating..." : "Generate"}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                title="Reset filters"
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Table */}
        {showData && (
          <div className="overflow-x-auto rounded-b-2xl">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Month</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Premium Brands (Kg)</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Other Brands (Kg)</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total (Kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                      Loading report...
                    </td>
                  </tr>
                ) : !hasGenerated ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                      Select filters and click "Generate Report" to view data.
                    </td>
                  </tr>
                ) : months.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                      No sales found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  <>
                    {months.map((m) => (
                      <tr key={m.month_key} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4 text-sm text-gray-900">{m.month_label}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 text-right">{fmt(m.premium_kg)}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 text-right">{fmt(m.other_kg)}</td>
                        <td className="px-5 py-4 text-sm text-gray-900 font-medium text-right">{fmt(m.total_kg)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-5 py-4 text-sm text-gray-900">Grand Total</td>
                      <td className="px-5 py-4 text-sm text-gray-900 text-right">{fmt(grandTotal.premium_kg)}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 text-right">{fmt(grandTotal.other_kg)}</td>
                      <td className="px-5 py-4 text-sm text-gray-900 text-right">{fmt(grandTotal.total_kg)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default MonthlySalesReportView;
