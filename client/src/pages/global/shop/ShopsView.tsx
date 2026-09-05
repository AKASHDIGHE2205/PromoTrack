import { CalendarClock, Info, MapPinned, Phone, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AddShop from "./AddShops";
import UpdateShop from "./updateShops";
import { Pagination } from "../../../components/Pagination";
import { getShops, toggleShopStatus } from "../../../services/global/shopServices";
import type { Shop } from "./types";
import moment from "moment";
import toast from "react-hot-toast";

const ShopView = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getShops({ page, limit: pageSize, search });
      setShops(data.shops);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to load shops.");
      setShops([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleEdit = (shop: Shop) => {
    setSelectedShop(shop);
    setShowUpdate(true);
  };

  const handleView = (user: Shop) => {
    setSelectedShop(user);
    setShowView(true);
  };

  const handleToggle = async (shop: Shop) => {
    const activating = shop.status !== "A";
    const confirmed = window.confirm(
      `Are you sure you want to ${activating ? "activate" : "deactivate"} ${shop.shop_name}?`
    );
    if (!confirmed) return;

    try {
      const response = await toggleShopStatus(shop.shop_id);
      if (response.success) {
        toast.success(response.message || "Shop status updated successfully.");
        fetchShops();
      }
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to update shop status.");
    }
  };

  const ShopCard = ({ shop }: { shop: Shop }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 m-2 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">
            {shop.shop_id} {shop.shop_name}
          </span>
        </div>
        <div className="flex items-center justify-start gap-1">
          <button
            title="Edit"
            onClick={() => handleEdit(shop)}
            className="p-1.5 rounded-lg hover:bg-green-100 hover:text-green-800 bg-green-50 text-green-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            title="View"
            onClick={() => handleView(shop)}
            className="p-1.5 rounded-lg hover:bg-blue-100 hover:text-blue-800 bg-blue-50 text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
          <button
            title="Toggle Status"
            onClick={() => handleToggle(shop)}
            className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-800 bg-red-50 text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban-icon lucide-ban">
              <circle cx="12" cy="12" r="10" />
              <path d="M4.929 4.929 19.07 19.071" />
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div>
          <span className="text-xs text-gray-600 font-medium flex justify-start items-center gap-1"><User size={12} />Owner</span>
          <span className="text-gray-600 text-sm ml-4">{shop.owner_name}</span>
        </div>
        <div>
          <span className="text-xs text-gray-600 font-medium flex justify-start items-center gap-1"><Phone size={12} />Mobile</span>
          <span className="text-gray-600 text-sm ml-4">
            <a href={`tel:${shop.mobile}`} className="text-blue-600 hover:underline text-sm cursor-pointer">
              {shop.mobile}
            </a>
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-600 font-medium flex justify-start items-center gap-1"><MapPinned size={12} />Address</span>
          <span className="text-gray-600 text-sm ml-4">
            {shop.address || "-"}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-600 font-medium flex justify-start items-center gap-1"><Info size={12} />Status</span>
          <span className="ml-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${shop.status === "A" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-600"}`}>
              {shop.status === "A" ? "Active" : "Inactive"}
            </span>
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-600 font-medium flex justify-start items-center gap-1"><CalendarClock size={12} />Created At</span>
          <span className="text-gray-600 text-sm ml-4">{moment(shop.c_at).format("lll")}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-2 px-4 sm:px-0">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-slate-800 bg-clip-text text-transparent">Shops Master</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage shop details.</p>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2">
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
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors shadow-sm shrink-0 border border-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="inline xs:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search shops..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <p className="text-sm text-gray-400 shrink-0 text-center sm:text-right">
            {total} shop{total === 1 ? "" : "s"}
          </p>
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Body - Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">Id</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Shop Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                    Loading shops...
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                    No shops found.
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.shop_id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400">{shop.shop_id}</td>
                    <td className="px-5 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{shop.shop_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{shop.owner_name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      <a href={`tel:${shop.mobile}`} className="text-blue-600 hover:underline text-sm cursor-pointer">
                        {shop.mobile}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-sm">{shop.address || "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${shop.status === "A" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-600"}`}>
                        {shop.status === "A" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      <div className="flex items-center justify-start gap-1">
                        <button
                          title="Edit"
                          onClick={() => handleEdit(shop)}
                          className="p-1.5 rounded-lg hover:bg-green-100 hover:text-green-800 bg-green-50 text-green-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          title="View"
                          onClick={() => handleView(shop)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 hover:text-blue-800 bg-blue-50 text-blue-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        <button
                          title="Toggle Status"
                          onClick={() => handleToggle(shop)}
                          className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-800 bg-red-50 text-red-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ban-icon lucide-ban">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M4.929 4.929 19.07 19.071" />
                          </svg>
                        </button>
                      </div>
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
            <p className="text-center text-sm text-gray-400 py-8">Loading shops...</p>
          ) : shops.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No shops found.</p>
          ) : (
            shops.map((shop) => <ShopCard key={shop.shop_id} shop={shop} />)
          )}
        </div>

        {/* Pagination footer */}
        <div className="px-4 py-3 sm:px-5">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            PAGE_SIZE={pageSize}
          />
        </div>
      </div>

      {showAdd && (
        <AddShop show={showAdd} setShow={setShowAdd} onSuccess={fetchShops} />
      )}
      {showUpdate && (
        <UpdateShop
          show={showUpdate}
          setShow={setShowUpdate}
          shop={selectedShop}
          onSuccess={fetchShops}
          isEdit={true}
        />
      )}
      {showView && (
        <UpdateShop
          show={showView}
          setShow={setShowView}
          shop={selectedShop}
          onSuccess={fetchShops}
          isEdit={false}
        />
      )}
    </div>
  );
};

export default ShopView;
