/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CompanySearch } from "./company-search"
import { useFormContext } from "react-hook-form"
import { Building, Search, ArrowDown, UserPlus } from "lucide-react"

export function ClientSection() {
  const [clientSearchVisible, setClientSearchVisible] = useState(false)
  const form = useFormContext()
  
  const handleClientSelect = (company: any) => {
    // Update form values with selected company data
    form.setValue("client.name", company.name, { shouldValidate: true })
    form.setValue("client.ico", company.ico)
    form.setValue("client.address", company.address)
    form.setValue("client.city", company.city)
    form.setValue("client.zip", company.zip)
    
    // If VAT ID is available, set it too
    if (company.dic) {
      form.setValue("client.dic", company.dic)
    }
    
    // Hide the search after selection
    setClientSearchVisible(false)
  }
  
  const clientData = form.watch("client")
  const hasClientData = clientData?.name || clientData?.ico
  
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-[#1e293b]">Client Information</h2>
          <Button 
            variant="outline" 
            size="sm"
            className="ml-auto"
            onClick={() => setClientSearchVisible(!clientSearchVisible)}
          >
            {clientSearchVisible ? (
              <>
                <ArrowDown className="w-4 h-4 mr-2" />
                Hide Search
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Company
              </>
            )}
          </Button>
          {hasClientData && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                form.setValue("client", {
                  name: "",
                  ico: "",
                  address: "",
                  city: "",
                  zip: "",
                  dic: "",
                })
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              New Client
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        {clientSearchVisible && (
          <div className="mb-6 border p-4 rounded-md bg-muted/30">
            <CompanySearch onSelect={handleClientSelect} />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <FormField
            control={form.control}
            name="client.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#475569] font-medium">Company Name *</FormLabel>
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
              name="client.ico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#475569] font-medium">IČO</FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client.dic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#475569] font-medium">DIČ</FormLabel>
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
            name="client.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#475569] font-medium">Address</FormLabel>
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
              name="client.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#475569] font-medium">City</FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client.zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#475569] font-medium">ZIP</FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 