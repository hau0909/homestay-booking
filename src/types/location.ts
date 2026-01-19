export interface Province {
  code: string;
  name: string;
  full_name: string | null;
}

export interface District {
  code: string;
  province_code: string;
  name: string;
  full_name: string | null;
}

export interface Ward {
  code: string;
  district_code: string;
  name: string;
  full_name: string | null;
}
