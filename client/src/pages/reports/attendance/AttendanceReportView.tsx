import { MapPin, Search, User as UserIcon, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Pagination } from "../../../components/Pagination";
import { getAttendanceReport, getSelfieUrl } from "../../../services/global/attendanceServices";
import { getUsers } from "../../../services/global/userServices";
import type { AttendanceReportRow } from "../../attendance/types";
import type { User } from "../../global/member/types";

const monthStart = moment().startOf("month").format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");

const AttendanceReportView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [rows, setRows] = useState<AttendanceReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userId, setUserId] = useState("");
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers({ limit: 1000 });
        setUsers(data.users);
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [userId, pageSize, fromDate, toDate]);

  const fetchReport = useCallback(async (targetPage: number = page) => {
    setLoading(true); setError("");
    try {
      const data = await getAttendanceReport({
        page: targetPage,
        limit: pageSize,
        user_id: userId || undefined,
        from_date: fromDate,
        to_date: toDate,
      });
      if (data.success) {
        setRows(data.attendance);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setShowData(true);
      }
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to load attendance report.");
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, userId, fromDate, toDate]);

  const handleGenerate = () => {
    setHasGenerated(true);
    setPage(1);
    fetchReport(1);
  };

  const handleReset = () => {
    setError("");
    setLoading(false);
    setShowData(false);
    setRows([]);
    setTotal(0);
    setFromDate(monthStart);
    setToDate(today);
    setUserId("");
  }

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchReport(p);
  };

  const AttendanceCard = ({ row }: { row: AttendanceReportRow }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 m-2 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewImage(getSelfieUrl(row.selfie))}
            className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0"
          >
            <img src={getSelfieUrl(row.selfie)} alt="Selfie" className="w-full h-full object-cover" />
          </button>
          <div>
            <span className="font-medium text-gray-900 text-sm block">
              {row.f_name} {row.l_name}
            </span>
            <span className="text-xs text-gray-500">{moment(row.attendance_date).format("DD MMM YYYY")}</span>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.status === "A" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-600"}`}>
          {row.status === "A" ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div>
          <span className="text-xs text-gray-600 font-medium">Check-in Time</span>
          <span className="text-gray-600 text-sm block">{moment(row.check_in).format("hh:mm A")}</span>
        </div>
        <div>
          <span className="text-xs text-gray-600 font-medium flex items-center gap-1"><MapPin size={12} />Location</span>
          <span className="text-gray-600 text-sm block">
            {row.location || "-"}
            {row.district ? `, ${row.district}` : ""}
            {row.state ? `, ${row.state}` : ""}
            {row.pincode ? ` - ${row.pincode}` : ""}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-2 px-4 sm:px-0">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-slate-800 bg-clip-text text-transparent">Attendance Report</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">View check-in history for a user across a date range.</p>
        </div>
        <div className="flex flex-wrap justify-between sm:justify-end items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm">Rows:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-[60px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.f_name} {u.l_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full sm:w-auto min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <span className="text-sm text-gray-400 text-center sm:text-left">to</span>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full sm:w-auto min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Generating..." : "Generate"}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
          <p className="text-sm text-gray-400 shrink-0 text-center sm:text-right">
            {total} record{total === 1 ? "" : "s"}
          </p>
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">
            {error}
          </div>
        )}
        {showData && (
          <>
            {/* Body - Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Selfie</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Check-in Time</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">
                        Loading attendance report...
                      </td>
                    </tr>
                  ) : !hasGenerated ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">
                        Select filters and click "Generate Report" to view data.
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.attendance_id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(getSelfieUrl(row.selfie))}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200"
                            title="View selfie"
                          >
                            <img src={getSelfieUrl(row.selfie)} alt="Selfie" className="w-full h-full object-cover" />
                          </button>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900">{row.f_name} {row.l_name}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{moment(row.attendance_date).format("DD MMM YYYY")}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{moment(row.check_in).format("hh:mm A")}</td>
                        <td className="px-5 py-4 text-sm text-gray-500 max-w-xs">
                          <div className="flex items-start gap-1">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                            <span>
                              {row.location || "-"}
                              {row.district ? `, ${row.district}` : ""}
                              {row.state ? `, ${row.state}` : ""}
                              {row.pincode ? ` - ${row.pincode}` : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.status === "A" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-600"}`}>
                            {row.status === "A" ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Body - Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {loading ? (
                <p className="text-center text-sm text-gray-400 py-8">Loading attendance report...</p>
              ) : !hasGenerated ? (
                <p className="text-center text-sm text-gray-400 py-8">Select filters and click "Generate Report" to view data.</p>
              ) : rows.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">No attendance records found.</p>
              ) : (
                rows.map((row) => <AttendanceCard key={row.attendance_id} row={row} />)
              )}
            </div>

            {/* Pagination footer */}
            <div className="px-4 py-3 sm:px-5">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={handlePageChange}
                PAGE_SIZE={pageSize}
              />
            </div>
          </>
        )}

      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-white/100 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>
          <img
            src={previewImage}
            alt="Selfie preview"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default AttendanceReportView;
