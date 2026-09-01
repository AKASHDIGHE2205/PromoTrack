import React, { useEffect, useState } from "react";
import { updateUser } from "../../../services/global/userServices";
import { emptyUserForm, type User, type UserFormData } from "./types";
import toast from "react-hot-toast";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
  isEdit: boolean;
}

const UpdateUser: React.FC<Props> = ({ show, setShow, user, onSuccess, isEdit }) => {
  const [form, setForm] = useState<UserFormData>(emptyUserForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      f_name: user.f_name || "",
      m_name: user.m_name || "",
      l_name: user.l_name || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
      town: user.town || "",
      district: user.district || "",
      pin_code: user.pin_code || "",
      distributor: user.distributor || "",
      status: user.status || "",
      asm: user.asm || "",
      rsm: user.rsm || "",
      fwd: user.fwd ? user.fwd.slice(0, 10) : "",
      role: user.role || "",
      accNo: user.account_no || "",
      bankName: user.bank_name || "",
      branch: user.branch || "",
      ifsc: user.ifsc_code || "",
      wef: user.wef ? user.wef.slice(0, 10) : "",
      basic_salary:
        user.basic_salary !== null && user.basic_salary !== undefined
          ? String(user.basic_salary)
          : "",
      incentive:
        user.incentive !== null && user.incentive !== undefined
          ? String(user.incentive)
          : "",
      allowance:
        user.allowance !== null && user.allowance !== undefined
          ? String(user.allowance)
          : "",
      gratuity:
        user.gratuity !== null && user.gratuity !== undefined
          ? String(user.gratuity)
          : "",
      variable:
        user.variable !== null && user.variable !== undefined
          ? String(user.variable)
          : "",
    });
    setError("");
  }, [user]);

  if (!show) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setError("");
    setShow(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        wef: form.wef === "" ? undefined : form.wef,
        basic_salary:
          form.basic_salary === "" ? undefined : Number(form.basic_salary),
        incentive: form.incentive === "" ? undefined : Number(form.incentive),
        allowance: form.allowance === "" ? undefined : Number(form.allowance),
        gratuity: form.gratuity === "" ? undefined : Number(form.gratuity),
        variable: form.variable === "" ? undefined : Number(form.variable),
      };
      const response = await updateUser(user.user_id, payload);
      if (response.success) {
        toast.success(response.message || "User updated successfully.");
        setShow(false);
        onSuccess?.();
      }
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-md px-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Update User" : "View User"}</h2>
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
          {/* Personal Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="f_name"
                  placeholder="First Name"
                  value={form.f_name}
                  onChange={handleChange}
                  required
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="m_name"
                  placeholder="Middle Name"
                  value={form.m_name}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="l_name"
                  placeholder="Last Name"
                  value={form.l_name}
                  onChange={handleChange}
                  required
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="test@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Town
                </label>
                <input
                  type="text"
                  name="town"
                  placeholder="Town/City"
                  value={form.town}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  value={form.district}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pin_code"
                  placeholder="PIN Code"
                  value={form.pin_code}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Assignment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Distributor
                </label>
                <input
                  type="text"
                  name="distributor"
                  placeholder="Distributor Name"
                  value={form.distributor}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ASM
                </label>
                <input
                  type="text"
                  name="asm"
                  placeholder="ASM Name"
                  value={form.asm}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  RSM
                </label>
                <input
                  type="text"
                  name="rsm"
                  placeholder="RSM Name"
                  value={form.rsm}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="fwd"
                  value={form.fwd}
                  onChange={handleChange}
                  required
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Role <span className="text-rose-600 font-medium">*</span>
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={!isEdit}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                >
                  <option value="">Select Role</option>
                  <option value="SP">Sales Promoter</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Master">Master</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status <span className="text-rose-600 font-medium">*</span>
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                >
                  <option value="">Select Status</option>
                  <option value="A">Active</option>
                  <option value="I">In-Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Bank Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Account No.
                </label>
                <input
                  type="text"
                  name="accNo"
                  placeholder="Account Number"
                  value={form.accNo}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="Bank Name"
                  value={form.bankName}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  placeholder="Branch"
                  value={form.branch}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  IFSC
                </label>
                <input
                  type="text"
                  name="ifsc"
                  placeholder="ifsc"
                  value={form.ifsc}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Salary Structure */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Salary Structure
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  WEF
                </label>
                <input
                  type="date"
                  name="wef"
                  value={form.wef}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Basic Salary
                </label>
                <input
                  type="number"
                  name="basic_salary"
                  placeholder="Basic Salary"
                  value={form.basic_salary}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Incentive
                </label>
                <input
                  type="number"
                  name="incentive"
                  placeholder="Incentive"
                  value={form.incentive}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Allowance
                </label>
                <input
                  type="number"
                  name="allowance"
                  placeholder="Allowance"
                  value={form.allowance}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gratuity
                </label>
                <input
                  type="number"
                  name="gratuity"
                  placeholder="Gratuity"
                  value={form.gratuity}
                  onChange={handleChange}
                  disabled={!isEdit}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Variable
                </label>
                <input
                  type="number"
                  name="variable"
                  placeholder="Variable"
                  value={form.variable}
                  onChange={handleChange}
                  disabled={!isEdit}
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
              disabled={submitting || !isEdit}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
