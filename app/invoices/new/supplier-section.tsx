"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building, Search } from "lucide-react";
import { Supplier } from "@/app/store/supplier-store";
import { SupplierSearch } from "./supplier-search";

export function SupplierSection() {
  const [supplierSearchVisible, setSupplierSearchVisible] = useState(false);
  const form = useFormContext();

  const handleSupplierSelect = (supplier: Supplier) => {
    form.setValue("issuedBy", supplier.name);
    form.setValue("supplierAddress", supplier.address);
    form.setValue("supplierCity", supplier.city);
    form.setValue("supplierZip", supplier.zip);
    form.setValue("supplierIco", supplier.ico);
    form.setValue("supplierDic", supplier.dic);

    // Additional fields that could be set
    if (supplier.bankAccount) {
      form.setValue("bankAccount", supplier.bankAccount);
    }

    // Hide search after selection
    setSupplierSearchVisible(false);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-[#1e293b]">
            Supplier Information
          </h2>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            This is your business information that will appear on the invoice.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setSupplierSearchVisible(!supplierSearchVisible);
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            {supplierSearchVisible ? "Close Search" : "Find supplier by IČO"}
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6">
        {supplierSearchVisible && (
          <div className="mb-6 border p-4 rounded-md bg-muted/30">
            <SupplierSearch onSelect={handleSupplierSelect} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <FormField
            control={form.control}
            name="issuedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#475569] font-medium">
                  Supplier Name *
                </FormLabel>
                <FormControl>
                  <Input className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="supplierIco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#475569] font-medium">
                    IČO
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierDic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#475569] font-medium">
                    DIČ
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="supplierAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#475569] font-medium">
                  Address
                </FormLabel>
                <FormControl>
                  <Input className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="supplierCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#475569] font-medium">
                    City
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierZip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#475569] font-medium">
                    ZIP
                  </FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tradeRegisterInfo"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-[#475569] font-medium">
                  Trade Register Information (Optional)
                </FormLabel>
                <FormControl>
                  <Input className="h-11" {...field} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  This information will be displayed in small text beneath your
                  company details (e.g., &quot;Registered in the Commercial
                  Register of the Municipal Court in Prague, Section C, File
                  123456&quot;)
                </p>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
