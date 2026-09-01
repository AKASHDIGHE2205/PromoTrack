import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Pencil, ShieldCheck, UserRound, Mail, Phone, User, CalendarDays, CheckCircle } from "lucide-react";
import { getApiError } from "../../services/api";
import { getMyProfile, updateProfile, changePassword, type Profile as ProfileType } from "../../services/auth/authServices";
import { useAppDispatch } from "../../hook/store";
// import { setUser } from "../../feature/auth/authSlice";
import moment from "moment";
import Loading from "../../components/Loading";
import Spinner from "../../components/Spinner";
import { logout } from "../../feature/auth/authSlice";

interface ProfileForm {
  f_name: string;
  m_name: string;
  l_name: string;
  mobile: string;
}

const EMPTY_FORM: ProfileForm = { f_name: "", m_name: "", l_name: "", mobile: "" };

const inputClasses = "w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200";
const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

const Profile = () => {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);
  const [view, setView] = useState<"Info" | "Password">('Info');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await getMyProfile();
      const data: ProfileType = response?.data;
      setProfile(data);
      setForm({
        f_name: data?.f_name || "",
        m_name: data?.m_name || "",
        l_name: data?.l_name || "",
        mobile: data?.mobile || "",
      });
    } catch (err) {
      setFetchError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const pwd = passwordForm.newPassword;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  }, [passwordForm.newPassword]);

  const updateForm = (key: keyof ProfileForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSaveProfile = async () => {
    if (!form.f_name.trim()) return toast.error("First name is required");
    if (!form.l_name.trim()) return toast.error("Last name is required");

    try {
      setSavingProfile(true);
      const response = await updateProfile({
        f_name: form.f_name,
        m_name: form.m_name,
        l_name: form.l_name,
        mobile: form.mobile,
      });
      setProfile(response?.data);
      // dispatch(setUser(response?.data));
      toast.success(response?.message || "Profile updated successfully");
      setEditing(false);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      f_name: profile?.f_name || "",
      m_name: profile?.m_name || "",
      l_name: profile?.l_name || "",
      mobile: profile?.mobile || "",
    });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) return toast.error("Current password is required");
    if (passwordForm.newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error("Passwords do not match");

    try {
      setChangingPassword(true);
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (response.success) {
        toast.success(response?.message || "Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setPasswordStrength(0);
        dispatch(logout());
      }
    } catch (err: any) {
      toast.error(err || "Something went wrong.");
    } finally {
      setChangingPassword(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { label: 'Weak', color: 'bg-red-400' };
    if (passwordStrength === 1) return { label: 'Fair', color: 'bg-orange-400' };
    if (passwordStrength === 2) return { label: 'Good', color: 'bg-yellow-400' };
    if (passwordStrength === 3) return { label: 'Strong', color: 'bg-green-500' };
    return { label: 'Very Strong', color: 'bg-emerald-500' };
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-0 flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">{fetchError}</p>
        <button onClick={() => void fetchProfile()} className="text-sm text-blue-600 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const fullName = [profile?.f_name, profile?.m_name, profile?.l_name].filter(Boolean).join(" ");
  const initials = `${profile?.f_name?.[0] ?? ""}${profile?.l_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-blue-600 rounded-full" />
            <h1 className="text-3xl font-bold bg-slate-800 text-transparent bg-clip-text">
              My Profile
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-4">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* Profile Card */}
        <div className="relative mb-8 overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="relative p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                  {initials || <UserRound className="w-8 h-8" />}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  {fullName || "User"}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                    <ShieldCheck className="w-3 h-3" />
                    {profile?.role ? profile?.role : "—"}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <span className="p-1 rounded-md bg-purple-100">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </span>
                    <span className="truncate">{profile?.email}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
                    <span className="p-1 rounded-md bg-purple-100">
                      <CalendarDays className="w-4 h-4 text-purple-600" />
                    </span>
                    <span>Joined {profile?.created_at ? moment(profile.created_at).format('LL') : "—"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-lg bg-white p-1 border border-gray-200 shadow-sm">
          <nav className="flex items-center gap-1" aria-label="Profile tabs">
            <button
              type="button"
              onClick={() => setView("Info")}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${view === "Info"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              aria-selected={view === "Info"}
            >

              <User className="w-4 h-4" />
              Personal Info
            </button>
            <button
              type="button"
              onClick={() => setView("Password")}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${view === "Password"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              aria-selected={view === "Password"}
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </nav>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {view === "Info" ? (
            <>
              {/* Personal Information Card */}
              <div className="rounded-lg bg-white border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        Personal Information
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">Update your personal details</p>
                    </div>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClasses}>
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.f_name}
                            onChange={(e) => updateForm("f_name", e.target.value)}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Middle Name</label>
                          <input
                            type="text"
                            value={form.m_name}
                            onChange={(e) => updateForm("m_name", e.target.value)}
                            className={inputClasses}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.l_name}
                            onChange={(e) => updateForm("l_name", e.target.value)}
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClasses}>Phone Number</label>
                          <input
                            type="text"
                            value={form.mobile}
                            onChange={(e) => updateForm("mobile", e.target.value)}
                            placeholder="1122334455"
                            readOnly
                            className={inputClasses}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingProfile}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50"
                        >
                          {savingProfile && <Loading />}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { icon: User, label: "Full Name", value: fullName },
                        { icon: Mail, label: "Email Address", value: profile?.email },
                        { icon: Phone, label: "Phone Number", value: profile?.mobile || "—" },
                        { icon: CalendarDays, label: "Member Since", value: profile?.created_at ? moment(profile.created_at).format('lll') : "—" },
                        { icon: ShieldCheck, label: "Role", value: profile?.role || "User", capitalize: true },
                      ].map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between py-2.5 ${idx < 4 ? 'border-b border-gray-50' : ''}`}>
                          <div className="flex items-center gap-2.5 text-sm text-gray-500">
                            <item.icon className="w-4 h-4 text-gray-400" />
                            {item.label}
                          </div>
                          <span className={`text-sm  text-gray-900 ${item.capitalize ? 'capitalize' : ''}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Change Password Card */}
              <div className="rounded-lg bg-white border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-600" />
                      Change Password
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Keep your account secure</p>
                  </div>

                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div>
                      <label className={labelClasses}>Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                          className={`${inputClasses} pr-10`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => ({ ...s, current: !s.current }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.next ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                          className={`${inputClasses} pr-10`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => ({ ...s, next: !s.next }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordForm.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Password Strength</span>
                            <span className="text-xs font-medium text-gray-700">
                              {getPasswordStrengthLabel().label}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthLabel().color}`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={labelClasses}>Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                          className={`${inputClasses} pr-10`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => ({ ...s, confirm: !s.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                      )}
                      {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length >= 8 && (<p className="text-xs text-green-500 mt-1.5">✓ Passwords match</p>)}
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword && <Spinner />}
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;