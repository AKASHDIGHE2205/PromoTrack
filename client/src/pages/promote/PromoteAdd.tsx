import { ListPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveShops } from "../../services/global/shopServices";
import toast from "react-hot-toast";
import { getActiveItems } from "../../services/global/itemServices";
import { addPromote } from "../../services/global/promoteServices";
import { emptyEntryRow, emptyPromoteForm, type PromoteEntryRow, type PromoteFormData, type Products, type Shops } from "./types";
import moment from "moment";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  onSuccess?: () => void;
}

const today = moment().format("YYYY-MM-DD")

const PromoteAdd: React.FC<Props> = ({ show, setShow, onSuccess }) => {
  const [form, setForm] = useState<PromoteFormData>({ ...emptyPromoteForm, promote_date: today });
  const [shops, setShops] = useState<Shops[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [entries, setEntries] = useState<PromoteEntryRow[]>([emptyEntryRow(1)]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchShops = async () => {
    try {
      const response = await getActiveShops()
      if (response.success) {
        setShops(response.shops);
      }
    } catch {
      toast.error("Error while fetching active shops.")
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await getActiveItems();
      if (response.success) {
        setProducts(response.items);
      }
    } catch {
      toast.error("Error while fetching active products.")
    }
  }

  useEffect(() => {
    fetchShops();
    fetchProducts();
  }, [])

  if (!show) return null;

  const handleClose = () => {
    setForm({ ...emptyPromoteForm, promote_date: today });
    setEntries([emptyEntryRow(1)]);
    setError("");
    setShow(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEntryChange = (id: number, field: keyof PromoteEntryRow, value: string) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addEntry = () => {
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;
    setEntries(prev => [...prev, emptyEntryRow(newId)]);
  };

  const removeEntry = (id: number) => {
    if (entries.length <= 1) return; // Prevent removing last row
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await addPromote({
        ...form,
        entries: entries.map(({ item_id, qty, total_kg }) => ({ item_id, qty, total_kg })),
      });
      if (response.success) {
        toast.success(response.message || "Promotion created successfully.");
        handleClose();
        onSuccess?.();
      }
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to create promotion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-md px-2 sm:px-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Promote Item to Customer</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Basic Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Basic Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Promote Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="promote_date"
                  value={form.promote_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Shop <span className="text-rose-500">*</span>
                </label>
                <select
                  name="shop_id"
                  value={form.shop_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                >
                  <option value="" disabled>Select Shop</option>
                  {shops.map((shop) => (
                    <option key={shop.shop_id} value={shop.shop_id}>
                      {shop.shop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="cust_mob"
                  placeholder="Enter Customer Mobile"
                  value={form.cust_mob}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Items Details
              </h3>
              <button
                type="button"
                onClick={addEntry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <ListPlus size={20} />
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Select Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total KG
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={entry.item_id}
                          onChange={(e) => handleEntryChange(entry.id, 'item_id', e.target.value)}
                          required
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white min-w-40"
                        >
                          <option value="" disabled>Select Item</option>
                          {products.map((product) => (
                            <option key={product.item_id} value={product.item_id}>
                              {product.item_name} ({product.brand_name})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={entry.qty}
                          onChange={(e) => handleEntryChange(entry.id, 'qty', e.target.value)}
                          required
                          min="1"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all min-w-20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="any"
                          placeholder="KG"
                          value={entry.total_kg}
                          onChange={(e) => handleEntryChange(entry.id, 'total_kg', e.target.value)}
                          required
                          min="0.01"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all min-w-20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          disabled={entries.length <= 1}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Remove Entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteAdd;
