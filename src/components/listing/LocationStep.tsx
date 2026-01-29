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
import { Button } from "@/components/ui/button";
import type { CreateListingForm } from "@/app/hosting/listing/create/page";
import { getProvinces } from "@/src/services/listing/getProvince";
import { District, Province, Ward } from "@/src/types/location";
import { getDistrictsByProvince } from "@/src/services/listing/getDistrict";
import { getWardsByDistrict } from "@/src/services/listing/getWard";

/* =======================
   PROPS
======================= */

type Props = {
  data: CreateListingForm;
  onChange: (data: CreateListingForm) => void;
  onNext: () => void;
  onBack: () => void;
};

/* =======================
   COMPONENT
======================= */

export default function LocationStep({
  data,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  /* Load provinces */
  useEffect(() => {
    getProvinces().then(setProvinces).catch(console.error);
  }, []);

  /* Load districts when province changes */
  useEffect(() => {
    if (!data.province_code) return;
    getDistrictsByProvince(data.province_code)
      .then(setDistricts)
      .catch(console.error);
  }, [data.province_code]);

  /* Load wards when district changes */
  useEffect(() => {
    if (!data.district_code) return;
    getWardsByDistrict(data.district_code).then(setWards).catch(console.error);
  }, [data.district_code]);

  const canNext =
    !!data.address_detail &&
    !!data.province_code &&
    !!data.district_code &&
    !!data.ward_code;

  return (
    <div className="space-y-8 rounded-2xl border bg-white p-8 shadow-sm max-w-2xl">
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Location</h2>
        <p className="text-sm text-muted-foreground">
          Where is your place located?
        </p>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Street */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium">Street address</label>
          <Input
            placeholder="123 Nguyen Van Cu"
            value={data.address_detail}
            onChange={(e) =>
              onChange({ ...data, address_detail: e.target.value })
            }
          />
        </div>

        {/* Province */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Province / City</label>
          <Select
            value={data.province_code}
            onValueChange={(value) =>
              onChange({
                ...data,
                province_code: value,
                district_code: "",
                ward_code: "",
              })
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
            value={data.district_code}
            disabled={!data.province_code}
            onValueChange={(value) =>
              onChange({
                ...data,
                district_code: value,
                ward_code: "",
              })
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
            value={data.ward_code}
            disabled={!data.district_code}
            onValueChange={(value) => onChange({ ...data, ward_code: value })}
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

      {/* ACTIONS */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
