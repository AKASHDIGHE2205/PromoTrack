export interface Item {
  item_id: number;
  brand_name: string;
  brand_type: string;
  item_name: string;
  pack_size: number | string;
  uom: string;
  rate: number | string;
  status: "A" | "I";
  c_at?: string;
}

export interface ItemFormData {
  brand_name: string;
  brand_type: string;
  item_name: string;
  pack_size: string;
  uom: string;
  rate: string;
  status: "A" | "I" | "";
}

export const emptyItemForm: ItemFormData = {
  brand_name: "",
  brand_type: "",
  item_name: "",
  pack_size: "",
  uom: "",
  rate: "",
  status: "",
};

export const uomOptions = ["KG", "GM", "LTR", "ML", "PCS", "BOX", "DOZEN", "PACK"];
