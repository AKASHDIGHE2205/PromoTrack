import { useState } from "react";
import { addItem } from "../../../services/global/itemServices";
import { emptyItemForm, uomOptions, type ItemFormData } from "./types";
import toast from "react-hot-toast";

const AddItem = ({ show, setShow, onSuccess }: any) => {
  const [form, setForm] = useState<ItemFormData>(emptyItemForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!show) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm(emptyItemForm);
    setError("");
    setShow(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await addItem(form);
      if (response.success) {
        toast.success(response.message || "Item Created Successfully.")
        setForm(emptyItemForm);
        setShow(false);
        onSuccess?.();
      }
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to create item.");
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
          <h2 className="text-lg font-semibold text-gray-900">Add Item</h2>
          <button
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

          {/* Item Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Item Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand_name"
                  placeholder="Brand Name"
                  value={form.brand_name}
                  onChange={handleChange}

                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="item_name"
                  placeholder="Item Name"
                  value={form.item_name}
                  onChange={handleChange}

                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Brand Type <span className="text-rose-600 font-medium">*</span>
                </label>
                <select
                  name="brand_type"
                  value={form.brand_type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                >
                  <option value="" selected disabled>Select Type</option>
                  <option value="P">Premium Brands</option>
                  <option value="O">Other Brands</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Pricing Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pack Size <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="pack_size"
                  placeholder="Pack Size"
                  value={form.pack_size}
                  onChange={handleChange}

                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  UOM <span className="text-rose-500">*</span>
                </label>
                <select
                  name="uom"
                  value={form.uom}
                  onChange={handleChange}

                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                >
                  <option value="">Select UOM</option>
                  {uomOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Rate <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="rate"
                  placeholder="Rate"
                  value={form.rate}
                  onChange={handleChange}

                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
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
              {submitting ? "Creating..." : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
