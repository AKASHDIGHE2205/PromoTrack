export interface User {
  user_id: number;
  username?: string | null;
  f_name: string;
  m_name?: string | null;
  l_name: string;
  phone: string;
  email: string;
  address?: string | null;
  town?: string | null;
  district?: string | null;
  pin_code?: string | null;
  distributor?: string | null;
  asm?: string | null;
  rsm?: string | null;
  fwd: string;
  role: string;
  status: "A" | "I";
  account_no?: string | null;
  bank_name?: string | null;
  branch?: string | null;
  ifsc_code?: string | null;
  wef?: string | null;
  basic_salary?: number | string | null;
  incentive?: number | string | null;
  allowance?: number | string | null;
  gratuity?: number | string | null;
  variable?: number | string | null;
  c_at?: string;
}

export interface UserFormData {
  f_name: string;
  m_name: string;
  l_name: string;
  phone: string;
  email: string;
  address: string;
  town: string;
  district: string;
  pin_code: string;
  distributor: string;
  status: "A" | "I" | "";
  asm: string;
  rsm: string;
  fwd: string;
  role: string;
  accNo: string;
  bankName: string;
  branch: string;
  ifsc: string;
  wef: string;
  basic_salary: string;
  incentive: string;
  allowance: string;
  gratuity: string;
  variable: string;
}

export const emptyUserForm: UserFormData = {
  f_name: "",
  m_name: "",
  l_name: "",
  phone: "",
  email: "",
  address: "",
  town: "",
  district: "",
  pin_code: "",
  distributor: "",
  status: "",
  asm: "",
  rsm: "",
  fwd: "",
  role: "",
  accNo: "",
  bankName: "",
  branch: "",
  ifsc: "",
  wef: "",
  basic_salary: "",
  incentive: "",
  allowance: "",
  gratuity: "",
  variable: "",
};
