/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  CreditCard,
  FileText,
  Settings2,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ClientSection } from "./client-section";
import { InvoiceItems } from "./invoice-items";
import { colors } from "./colors";
import { generatePDF } from "@/lib/pdf-generator";
import dynamic from "next/dynamic";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { SupplierSection } from "./supplier-section";
import { invoiceFormSchema, InvoiceFormValues } from "../types/invoice-schema";

// Dynamically import heavy components
const InvoicePreview = dynamic(
  () => import("./invoice-preview").then((mod) => mod.InvoicePreview),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse h-96 bg-muted rounded-md"></div>
    ),
  }
);

export function InvoiceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("billing");

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceType: "invoice-with-tax",
      invoiceNumber: "",
      reference: "",
      issuedBy: "",
      tradeRegisterInfo: "",
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      paymentMethod: "bank",
      bankAccount: "",
      routingNumber: "",
      constantSymbol: "",
      specificSymbol: "",
      showIBAN: false,
      currency: "CZK",
      rounding: "none",
      language: "cs",
      color: colors[0].value,
      style: "modern",
      logo: undefined,
      stamp: undefined,
      notes: "",
      client: {
        name: "",
        ico: "",
        dic: "",
        address: "",
        city: "",
        zip: "",
      },
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 21,
          total: 0,
        },
      ],
      totalAmount: 0,
    },
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", data); // Log form data for debugging

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        console.error("Server Error:", result); // Log server error for debugging
        if (response.status === 400 && result.errors) {
          toast.error("Please fix the errors in the form");
          result.errors.forEach((error: any) => {
            form.setError(error.path.join(".") as any, {
              message: error.message,
            });
          });
          return;
        }
        throw new Error(result.message || "Failed to create invoice");
      }

      const result = await response.json();
      console.log("Server Response:", result); // Log server response for debugging

      if (result.success) {
        toast.success("Invoice created successfully");
        await generatePDF(
          "invoice-preview",
          `${data.invoiceNumber || "invoice"}.pdf`
        );
      } else {
        toast.error(result.message || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error submitting form:", error); // Log error for debugging
      toast.error(
        error instanceof Error ? error.message : "Failed to create invoice"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = async (newTab: string) => {
    if (activeTab === "billing" && newTab === "items") {
      // Validate billing fields
      const billingFields = [
        "invoiceNumber",
        "issuedBy",
        "issueDate",
        "dueDate",
      ];
      const isValid = await form.trigger(billingFields as any);
      if (!isValid) {
        toast.error(
          "Please complete all required fields in the Invoice Details tab"
        );
        return;
      }
    } else if (activeTab === "items" && newTab === "settings") {
      // Validate items
      const isValid = await form.trigger("items");
      if (!isValid) {
        toast.error("Please add at least one valid item");
        return;
      }
    }

    setActiveTab(newTab);
  };

  return (
    <FormProvider {...form}>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                  <h3 className="font-semibold text-red-600 mb-2">
                    Please fix the following errors:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.entries(form.formState.errors).map(
                      ([key, error]: [string, any]) => (
                        <li key={key}>
                          {key.includes(".")
                            ? `${key
                                .split(".")
                                .map(
                                  (k) => k.charAt(0).toUpperCase() + k.slice(1)
                                )
                                .join(" > ")}: ${error.message}`
                            : `${key.charAt(0).toUpperCase() + key.slice(1)}: ${
                                error.message
                              }`}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
              <Tabs
                defaultValue="billing"
                value={activeTab}
                onValueChange={handleTabChange}
              >
                <TabsList className="grid grid-cols-3 h-full w-full mb-6">
                  <TabsTrigger
                    value="billing"
                    className="text-sm font-medium p-2"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Invoice Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="items"
                    className="text-sm font-medium p-2"
                    onClick={() => handleTabChange("items")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Items & Pricing
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="text-sm font-medium p-2"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Settings & Design
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="billing" className="space-y-6">
                  {/* Supplier Section - New */}
                  <SupplierSection />

                  {/* Invoice Basic Info */}
                  <div className="bg-white rounded-xl border shadow-sm">
                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-[#1e293b]">
                          Invoice Information
                        </h2>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField
                          control={form.control}
                          name="invoiceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Invoice Type
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select invoice type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="invoice-with-tax">
                                    Invoice with VAT
                                  </SelectItem>
                                  <SelectItem value="invoice-without-tax">
                                    Invoice without VAT
                                  </SelectItem>
                                  <SelectItem value="proforma">
                                    <div>
                                      <div>Proforma Invoice</div>
                                      <div className="text-xs text-muted-foreground">
                                        Request for payment before
                                        goods/services are provided
                                      </div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="advance">
                                    <div>
                                      <div>Advance Invoice</div>
                                      <div className="text-xs text-muted-foreground">
                                        For recording advance payments already
                                        received
                                      </div>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="invoiceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Invoice Number *
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
                          name="issuedBy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Issued By *
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
                          name="reference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Reference (Optional)
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
                          name="issueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-[#475569] font-medium">
                                Issue Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-11 w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-[#475569] font-medium">
                                Due Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-11 w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <ClientSection />

                  {/* Payment Information */}
                  <div className="bg-white rounded-xl border shadow-sm">
                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-[#1e293b]">
                          Payment Information
                        </h2>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Payment Method
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bank">
                                    Bank Transfer
                                  </SelectItem>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="card">
                                    Credit Card
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Bank Account
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
                          name="constantSymbol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Constant Symbol (Optional)
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
                          name="specificSymbol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Specific Symbol (Optional)
                              </FormLabel>
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

                  {/* Additional Notes */}
                  <div className="bg-white rounded-xl border shadow-sm">
                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-lg font-semibold text-[#1e293b]">
                          Additional Notes
                        </h2>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Add any additional notes or payment instructions..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTabChange("items")}
                    >
                      Next: Items & Pricing
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="items" className="space-y-6">
                  <InvoiceItems />

                  <div className="flex gap-1 justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTabChange("billing")}
                    >
                      Back: Invoice Details
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTabChange("settings")}
                    >
                      Next: Settings & Design
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <div className="bg-white rounded-xl border shadow-sm">
                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Settings2 className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-[#1e293b]">
                          Invoice Settings
                        </h2>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Currency
                              </FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);

                                  // Force update the form context value
                                  form.setValue("currency", value);

                                  // Force rerender the preview component directly
                                  document.dispatchEvent(
                                    new CustomEvent("form-update", {
                                      detail: { field: "currency", value },
                                    })
                                  );
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="CZK">
                                    CZK - Czech Koruna
                                  </SelectItem>
                                  <SelectItem value="EUR">
                                    EUR - Euro
                                  </SelectItem>
                                  <SelectItem value="USD">
                                    USD - US Dollar
                                  </SelectItem>
                                  <SelectItem value="GBP">
                                    GBP - British Pound
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Invoice language
                              </FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);

                                  // Force update the form context value
                                  form.setValue("language", value);

                                  // Force rerender the preview component directly
                                  document.dispatchEvent(
                                    new CustomEvent("form-update", {
                                      detail: { field: "language", value },
                                    })
                                  );
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="en">
                                    <div className="flex items-center">
                                      <span className="mr-2">🇬🇧</span>
                                      English
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cs">
                                    <div className="flex items-center">
                                      <span className="mr-2">🇨🇿</span>
                                      Czech
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Invoice color
                              </FormLabel>
                              <div className="grid grid-cols-5 gap-2">
                                {colors.map((color) => (
                                  <div
                                    key={color.value}
                                    className={`h-8 rounded-md cursor-pointer border-2 ${
                                      field.value === color.value
                                        ? "border-black"
                                        : "border-transparent"
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => field.onChange(color.value)}
                                  />
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="logo"
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Logo (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    onChange(file);
                                  }}
                                  {...fieldProps}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stamp"
                          render={({ field: { onChange, ...fieldProps } }) => (
                            <FormItem>
                              <FormLabel className="text-[#475569] font-medium">
                                Stamp (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    onChange(file);
                                  }}
                                  {...fieldProps}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value === "paid"}
                                  onCheckedChange={(checked) => {
                                    field.onChange(
                                      checked ? "paid" : "pending"
                                    );
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Mark as Paid</FormLabel>
                                <FormDescription>
                                  Check this box if the invoice has been paid by
                                  the client.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTabChange("items")}
                    >
                      Back: Items & Pricing
                    </Button>
                    <Button
                      type="submit"
                      className="px-8"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>

          {/* Mobile download button */}
          <div className="mt-4 lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                generatePDF(
                  "invoice-preview",
                  `${form.getValues().invoiceNumber || "invoice"}.pdf`
                );
              }}
            >
              <Download className="h-4 w-4" />
              {form.watch("language") === "cs"
                ? "Stáhnout fakturu jako PDF"
                : "Download Invoice as PDF"}
            </Button>
          </div>
        </div>

        <div className="hidden lg:block sticky top-8 self-start w-1/3">
          <div className="border rounded-xl p-4 mb-4 bg-muted/30">
            <h3 className="font-medium mb-2">Invoice Preview</h3>
            <p className="text-sm text-muted-foreground">
              This is how your invoice will look. The preview updates as you
              edit the form.
            </p>
          </div>
          <InvoicePreview />
        </div>
      </div>
    </FormProvider>
  );
}
