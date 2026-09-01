import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  TagPlus,
  Camera,
  ArrowRight,
  Flame,
  CalendarCheck,
  Store,
  Package,
  LoaderCircle,
  AlertTriangle,
  CheckCircle2,
  User,
} from "lucide-react";
import { getUser } from "../constants/getUser";
import { getDashboardSummary, type DashboardSummary } from "../services/global/dashboardServices";

const quickLinks = [
  {
    id: "sales",
    name: "Sale Products",
    description: "Create and manage in-store sales for your assigned shops.",
    to: "/sales",
    icon: TagPlus,
    glow: "bg-[#EB0000]/20",
  },
  {
    id: "attendance",
    name: "Attendance",
    description: "Check in with a selfie and live location for today's visit.",
    to: "/attendance",
    icon: Camera,
    glow: "bg-[#3300FC]/20",
  },
  {
    id: "profile",
    name: "My Profile",
    description: "View and update your personal profile information.",
    to: "/profile",
    icon: User,
    glow: "bg-[#3300FC]/20",
  },
];

const getGreeting = () => {
  const hour = moment().hour();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const toNum = (v: number | string | undefined | null) => Number(v) || 0;

const Dashboard = () => {
  const user = getUser();
  const firstName = user?.firstName || "Akash";
  const lastName = user?.lastName || "";
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredTrend, setHoveredTrend] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getDashboardSummary();
        if (!cancelled) setSummary(response);
      } catch (err: any) {
        if (!cancelled) setError(typeof err === "string" ? err : "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxTrend = useMemo(() => {
    if (!summary) return 1;
    return Math.max(1, ...summary.promotions.daily_trend.map((d) => d.count));
  }, [summary]);

  const maxProductKg = useMemo(() => {
    if (!summary || summary.products.top.length === 0) return 1;
    return Math.max(...summary.products.top.map((p) => toNum(p.total_kg)));
  }, [summary]);

  return (
    <div className="space-y-8 px-4 sm:px-0">
      {/* Hero */}
      <div className="relative overflow-hidden ">
        <div className="relative flex justify-between gap-5 text-center ">
          <div>
            <h1 className="mt-3 text-2xl text-gray-900 font-bold">
              {getGreeting()},
              <span className="text-xl font-bold bg-gradient-to-r from-[#EB0000] via-[#95008A] to-[#3300FC] bg-clip-text text-transparent"> {firstName} {lastName}!</span>
            </h1>
          </div>

          {!loading && summary && (
            <div
              className={`shrink-0 inline-flex items-center gap-2.5 rounded-xl border px-4 py-2.5 mx-auto md:mx-0 ${summary.today.marked
                ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
            >
              {summary.today.marked ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <div className="text-left">
                <p className="text-sm font-semibold leading-tight">
                  {summary.today.marked ? "Attendance marked" : "Attendance pending"}
                </p>
                <p className="text-xs opacity-80 leading-tight">
                  {summary.today.marked
                    ? `Checked in at ${moment(summary.today.check_in).format("hh:mm A")}`
                    : "Mark today's attendance"}
                </p>
              </div>
              {!summary.today.marked && (
                <Link
                  to="/attendance"
                  className="ml-1 text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900"
                >
                  Check in
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.id}
                to={link.to}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-6 flex flex-col"
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full ${link.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="relative flex items-start justify-between">
                  <div className={`inline-flex p-3 rounded-xl bg-blue-600 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <h3 className="relative mt-5 text-lg font-semibold text-gray-900">{link.name}</h3>

                <p className="relative mt-1.5 text-sm text-gray-500 leading-relaxed hidden sm:block">
                  {link.description}
                </p>

                <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors underline">
                  Go to {link.name}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
          <LoaderCircle className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-sm">Loading your dashboard&hellip;</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 py-10 flex flex-col items-center justify-center gap-2 text-center">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              icon={CalendarCheck}
              iconClass="text-emerald-600 bg-emerald-50"
              label="Attendance This Month"
              value={`${summary.attendance.days_present}/${summary.attendance.days_elapsed}`}
              sub="days present"
            />
            <StatTile
              icon={Flame}
              iconClass="text-orange-600 bg-orange-50"
              label="Current Streak"
              value={`${summary.attendance.streak}`}
              sub={summary.attendance.streak === 1 ? "day in a row" : "days in a row"}
            />
            <StatTile
              icon={TagPlus}
              iconClass="text-[#95008A] bg-[#95008A]/10"
              label="sales This Month"
              value={`${summary.promotions.total}`}
              sub={`Total ${summary.promotions.total_kg.toFixed(1)} kg saled`}
            />
            <StatTile
              icon={Package}
              iconClass="text-[#3300FC] bg-[#3300FC]/10"
              label="Products saled"
              value={`${summary.products.total_distinct}`}
              sub={`across ${summary.promotions.shops_covered} shops`}
            />
          </div>

          {/* Trend + Attendance strip */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Sales trend */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Sales Activity</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Sales logged in the last 7 days</p>
                </div>
                <TagPlus className="w-4 h-4 text-gray-300" />
              </div>

              <div className="flex items-end justify-between gap-3 h-36">
                {summary.promotions.daily_trend.map((point, idx) => {
                  const heightPct = Math.max(4, (point.count / maxTrend) * 100);
                  const isToday = idx === summary.promotions.daily_trend.length - 1;

                  return (
                    <div
                      key={point.date}
                      className="relative flex-1 flex flex-col items-center h-full justify-end group/bar"
                      onMouseEnter={() => setHoveredTrend(idx)}
                      onMouseLeave={() => setHoveredTrend(null)}
                    >
                      {hoveredTrend === idx && (
                        <div className="absolute -top-8 z-10 rounded-md bg-gray-900 text-white text-xs font-medium px-2 py-1 whitespace-nowrap shadow-lg">
                          {point.count} {point.count === 1 ? "sale" : "sales"}
                        </div>
                      )}

                      <div
                        className={`w-full max-w-[28px] rounded-t-[4px] transition-all duration-200 ${isToday ? "bg-blue-600" : "bg-blue-200 group-hover/bar:bg-blue-300"
                          }`}
                        style={{ height: `${heightPct}%` }}
                      />

                      <span className="mt-2 text-[11px] text-gray-400 font-medium">
                        {point.day_label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance strip */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Attendance</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
                </div>
                <CalendarCheck className="w-4 h-4 text-gray-300" />
              </div>

              <div className="flex-1 flex items-center justify-between gap-2">
                {summary.attendance.last_7_days.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${day.present
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-300"
                        }`}
                    >
                      {day.present ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">{day.day_label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {summary.attendance.streak > 0
                  ? `${summary.attendance.streak} day streak — keep it going!`
                  : "Check in today to start a streak."}
              </div>
            </div>
          </div>

          {/* Top products + Recent promotions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top products */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Top Products Saled</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Ranked by kg this month</p>
                </div>
                <Package className="w-4 h-4 text-gray-300" />
              </div>

              {summary.products.top.length === 0 ? (
                <EmptyState message="No products saled yet this month." />
              ) : (
                <div className="space-y-4">
                  {summary.products.top.map((product, idx) => {
                    const kg = toNum(product.total_kg);
                    const widthPct = Math.max(6, (kg / maxProductKg) * 100);

                    return (
                      <div key={product.item_id}>
                        <div className="flex items-baseline justify-between mb-1.5 gap-2">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            <span className="text-gray-400 font-normal mr-1.5">{idx + 1}.</span>
                            {product.item_name}
                            <span className="text-gray-400 font-normal ml-1.5">
                              ({product.brand_name})
                            </span>
                          </p>
                          <p className="text-xs font-semibold text-gray-600 shrink-0">
                            {kg.toFixed(1)} kg
                          </p>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent promotions */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Recent Sales</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Your latest entries</p>
                </div>
                <Link
                  to="/sales"
                  className="text-xs font-medium text-blue-600 transition-colors inline-flex items-center gap-1 underline"
                >
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {summary.promotions.recent.length === 0 ? (
                <EmptyState message="No sales recorded yet." />
              ) : (
                <div className="space-y-3">
                  {summary.promotions.recent.map((promote) => (
                    <div
                      key={promote.promote_id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-white border border-gray-200 shrink-0">
                          <Store className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {promote.shop_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {moment(promote.promote_date).format("DD MMM YYYY")} · {promote.item_count} item
                            {Number(promote.item_count) === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-700">
                          {toNum(promote.total_kg).toFixed(1)} kg
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${promote.status === "A"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {promote.status === "A" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatTile = ({ icon: Icon, iconClass, label, value, sub, }: {
  icon: typeof CalendarCheck;
  iconClass: string;
  label: string;
  value: string;
  sub: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
    <div className={`inline-flex p-2.5 rounded-xl ${iconClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="mt-3 text-2xl font-bold text-gray-900 leading-tight">{value}</p>
    <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
    <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="py-10 flex flex-col items-center justify-center text-center gap-1">
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

export default Dashboard;
