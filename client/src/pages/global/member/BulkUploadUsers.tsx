import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { Download, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { bulkAddUsers, type BulkUploadUsersResponse } from "../../../services/global/userServices";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  onSuccess?: () => void;
}

// Order here drives both the template columns and how uploaded rows are parsed.
const TEMPLATE_HEADERS = [
  "First Name*", "Middle Name", "Last Name*", "Phone*", "Email*",
  "Address", "Town", "District", "Pin Code",
  "Distributor", "ASM", "RSM",
  "Joining Date* (YYYY-MM-DD)", "Role* (SP/Admin/User/Manager/Master)",
  "Account No", "Bank Name", "Branch", "IFSC",
  "WEF (YYYY-MM-DD)", "Basic Salary", "Incentive", "Allowance", "Gratuity", "Variable",
];

const FIELD_KEYS = [
  "f_name", "m_name", "l_name", "phone", "email",
  "address", "town", "district", "pin_code",
  "distributor", "asm", "rsm",
  "fwd", "role",
  "accNo", "bankName", "branch", "ifsc",
  "wef", "basic_salary", "incentive", "allowance", "gratuity", "variable",
];

const SAMPLE_ROW = [
  "John", "Kumar", "Doe", "9876543210", "john.doe@example.com",
  "123 Main Street", "Pune", "Pune", "411001",
  "ABC Distributors", "Ravi Sharma", "Sunil Patil",
  "2026-01-15", "SP",
  "123456789012", "State Bank of India", "Pune Camp", "SBIN0001234",
  "2026-01-15", "15000", "2000", "1000", "500", "500",
];

const BulkUploadUsers = ({ show, setShow, onSuccess }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [parsedUsers, setParsedUsers] = useState<any[]>([]);
  const [parseError, setParseError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkUploadUsersResponse | null>(null);

  if (!show) return null;

  const resetState = () => {
    setFileName("");
    setParsedUsers([]);
    setParseError("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    setShow(false);
  };

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, SAMPLE_ROW]);
    worksheet["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));

    const instructions = [
      ["Bulk User Upload - Instructions"],
      [""],
      ["1. Do not change, remove or reorder the column headers."],
      ["2. Fields marked with * are mandatory."],
      ["3. Role must be one of: SP, Admin, User, Manager, Master."],
      ["4. Dates must be entered in YYYY-MM-DD format."],
      ["5. Bank fields (Account No, Bank Name, Branch, IFSC) are optional, but if any one is filled, all four are required."],
      ["6. Salary fields (WEF, Basic Salary) are optional, but if either is filled, both are required. Incentive/Allowance/Gratuity/Variable default to 0."],
      ["7. Delete the sample row before adding your real data, or it will be uploaded as-is."],
      ["8. New users are created with the default password: Malpani@1234"],
    ];
    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
    instructionSheet["!cols"] = [{ wch: 90 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "Instructions");

    XLSX.writeFile(workbook, "Bulk_User_Upload_Template.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setParseError("");
    setParsedUsers([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames.find((n) => n.toLowerCase() === "users") || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          dateNF: "yyyy-mm-dd",
          defval: "",
        });

        const dataRows = rows.slice(1);
        const parsed: any[] = [];

        dataRows.forEach((row, idx) => {
          const isEmpty = row.every((cell) => String(cell ?? "").trim() === "");
          if (isEmpty) return;

          const record: any = { row: idx + 2 };
          FIELD_KEYS.forEach((key, colIdx) => {
            record[key] = row[colIdx] !== undefined ? String(row[colIdx]).trim() : "";
          });
          parsed.push(record);
        });

        if (parsed.length === 0) {
          setParseError("No data rows found. Please use the template and add at least one user row below the header.");
          return;
        }

        setParsedUsers(parsed);
      } catch {
        setParseError("Failed to read this file. Please make sure it is a valid Excel/CSV file based on the downloaded template.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (parsedUsers.length === 0) return;

    setSubmitting(true);
    setResult(null);
    try {
      const response = await bulkAddUsers({ users: parsedUsers });
      setResult(response);

      if (response.errorCount === 0) {
        toast.success(response.message || "All users uploaded successfully.");
      } else if (response.successCount > 0) {
        toast(response.message || "Bulk upload completed with some errors.");
      } else {
        toast.error(response.message || "Bulk upload failed for all rows.");
      }

      if (response.successCount > 0) onSuccess?.();
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to upload users.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-md px-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Bulk Upload Users</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Step 1: Download template */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Step 1 · Download Template
            </h3>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-600">
                Download the sample Excel file, fill in user details in the same column order and save it.
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 shrink-0"
              >
                <Download className="w-4 h-4" />
                Template
              </button>
            </div>
          </div>

          {/* Step 2: Upload file */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Step 2 · Upload Filled File
            </h3>
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
              <FileSpreadsheet className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600">
                {fileName ? fileName : "Click to select the filled .xlsx / .xls / .csv file"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {parseError && (
              <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">
                {parseError}
              </div>
            )}

            {parsedUsers.length > 0 && !result && (
              <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2.5">
                {parsedUsers.length} user row{parsedUsers.length === 1 ? "" : "s"} detected and ready to upload.
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Result
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="rounded-lg border border-gray-200 px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold text-gray-900">{result.total}</p>
                  <p className="text-xs text-gray-500">Total Rows</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold text-green-700">{result.successCount}</p>
                  <p className="text-xs text-green-700">Success</p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold text-rose-700">{result.errorCount}</p>
                  <p className="text-xs text-rose-700">Failed</p>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                {result.results.map((r) => (
                  <div key={r.row} className="flex items-start gap-2.5 px-3 py-2.5">
                    {r.success ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        Row No. {r.row}{r.name ? ` · ${r.name}` : ""}{r.email ? ` · ${r.email}` : ""}
                      </p>
                      <p className={`text-xs ${r.success ? "text-green-700" : "text-rose-700"}`}>
                        {r.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          {result ? (
            <>
              <button
                type="button"
                onClick={resetState}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Upload Another File
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedUsers.length === 0 || submitting}
                onClick={handleUpload}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Uploading..." : `Upload ${parsedUsers.length || ""} User${parsedUsers.length === 1 ? "" : "s"}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadUsers;
