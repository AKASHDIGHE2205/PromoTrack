export interface Shops {
  shop_id: number,
  shop_name: string,
  owner_name: string,
  address: string,
}
export interface Products {
  item_id: number,
  brand_name: string,
  item_name: string,
  pack_size: string,
  uom: string,
  rate: string,
}

export interface PromoteItem {
  promote_dt_id?: number;
  item_id: number;
  item_name?: string;
  brand_name?: string;
  uom?: string;
  qty: number | string;
  total_kg: number | string;
}

export interface Promote {
  promote_id: number;
  shop_id: number;
  shop_name: string;
  promote_date: string;
  cust_mob: string;
  status: "A" | "I";
  c_at?: string;
  item_count?: number;
  total_kg?: number | string;
  items?: PromoteItem[];
}

export interface PromoteEntryRow {
  id: number;
  item_id: string;
  qty: string;
  total_kg: string;
}

export interface PromoteFormData {
  promote_date: string;
  shop_id: string;
  cust_mob: string;
  status: "A" | "I";
}

export const emptyPromoteForm: PromoteFormData = {
  promote_date: "",
  shop_id: "",
  cust_mob: "",
  status: "A",
};

export const emptyEntryRow = (id: number): PromoteEntryRow => ({
  id,
  item_id: "",
  qty: "",
  total_kg: "",
});

export interface MonthlySalesRow {
  month_key: string;
  month_label: string;
  premium_kg: number;
  other_kg: number;
  total_kg: number;
}

export interface MonthlySalesTotal {
  premium_kg: number;
  other_kg: number;
  total_kg: number;
}
