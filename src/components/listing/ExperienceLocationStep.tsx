"use client";
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

type Locationvalue = {
  address_detail: string;
  province_code: string;
  district_code: string;
  ward_code: string;
};

type Props = {
  value: Locationvalue;
  onChange: (value: Locationvalue) => void;
};

export default function ExperienceLocationStep({ value, onChange }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  /* Load provinces */
  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  /* Load districts when province changes */
  useEffect(() => {
    if (!value.province_code) return;
    getDistrictsByProvince(value.province_code)
      .then(setDistricts)
      .catch(console.error);
  }, [value.province_code]);

  /* Load wards when district changes */
  useEffect(() => {
    if (!value.district_code) return;
    getWardsByDistrict(value.district_code).then(setWards).catch(console.error);
  }, [value.district_code]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Where is your experience located?
        </h2>
        <p className="text-sm text-muted-foreground">
          Provide the meeting point or the main location where the experience
          will take place.
        </p>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
        {/* Street */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-base font-semibold text-slate-700">
            Street address
          </label>
          <Input
            placeholder="e.g. 123 Nguyen Van Cu"
            value={value.address_detail}
            onChange={(e) =>
              onChange({ ...value, address_detail: e.target.value })
            }
            className="h-12 text-base px-4 bg-slate-50 border-slate-200 focus-visible:ring-slate-400 focus-visible:border-slate-400 transition-all shadow-sm rounded-xl"
          />
        </div>

        {/* Province */}
        <div className="space-y-3">
          <label className="text-base font-semibold text-slate-700">
            Province / City
          </label>
          <Select
            value={value.province_code}
            onValueChange={(e) =>
              onChange({
                ...value,
                province_code: e,
                district_code: "",
                ward_code: "",
              })
            }
          >
            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:ring-slate-400 rounded-xl shadow-sm">
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
        <div className="space-y-3">
          <label className="text-base font-semibold text-slate-700">
            District
          </label>
          <Select
            value={value.district_code}
            disabled={!value.province_code}
            onValueChange={(e) =>
              onChange({
                ...value,
                district_code: e,
                ward_code: "",
              })
            }
          >
            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:ring-slate-400 rounded-xl shadow-sm disabled:opacity-50">
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
        <div className="md:col-span-2 space-y-3">
          <label className="text-base font-semibold text-slate-700">Ward</label>
          <Select
            value={value.ward_code}
            disabled={!value.district_code}
            onValueChange={(e) => onChange({ ...value, ward_code: e })}
          >
            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:ring-slate-400 rounded-xl shadow-sm disabled:opacity-50 w-1/2">
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
    </div>
  );
}
