import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getProvinces } from "@/src/services/listing/getProvince";
import { District, Province, Ward } from "@/src/types/location";
import { getDistrictsByProvince } from "@/src/services/listing/getDistrict";
import { getWardsByDistrict } from "@/src/services/listing/getWard";

export interface AddressValue {
  address_detail: string;
  province_code: string;
  district_code: string;
  ward_code: string;
}

export interface AddressSelectProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}

export default function AddressSelect({ value, onChange }: AddressSelectProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  useEffect(() => {
    if (!value.province_code) return setDistricts([]);
    getDistrictsByProvince(value.province_code)
      .then(setDistricts)
      .catch(console.error);
  }, [value.province_code]);

  useEffect(() => {
    if (!value.district_code) return setWards([]);
    getWardsByDistrict(value.district_code)
      .then(setWards)
      .catch(console.error);
  }, [value.district_code]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Street */}
      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium">Street address</label>
        <Input
          placeholder="123 Nguyen Van Cu"
          value={value.address_detail}
          onChange={(e) =>
            onChange({ ...value, address_detail: e.target.value })
          }
        />
      </div>
      {/* Province */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Province / City</label>
        <Select
          value={value.province_code}
          onValueChange={(province_code) =>
            onChange({ ...value, province_code, district_code: "", ward_code: "" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select province / city" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* District */}
      <div className="space-y-2">
        <label className="text-sm font-medium">District</label>
        <Select
          value={value.district_code}
          disabled={!value.province_code}
          onValueChange={(district_code) =>
            onChange({ ...value, district_code, ward_code: "" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.code} value={d.code}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Ward */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Ward</label>
        <Select
          value={value.ward_code}
          disabled={!value.district_code}
          onValueChange={(ward_code) => onChange({ ...value, ward_code })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select ward" />
          </SelectTrigger>
          <SelectContent>
            {wards.map((w) => (
              <SelectItem key={w.code} value={w.code}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
