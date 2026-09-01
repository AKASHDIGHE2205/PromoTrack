export interface Shop {
  shop_id: number;
  shop_name: string;
  owner_name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  mobile: string;
  status: "A" | "I";
  c_at?: string;
}

export interface ShopFormData {
  shop_name: string;
  owner_name: string;
  address: string;
  mobile: string;
  status: "A" | "I" | "";
}

export const emptyShopForm: ShopFormData = {
  shop_name: "",
  owner_name: "",
  address: "",
  mobile: "",
  status: "",
};
