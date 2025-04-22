/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { cs, enUS } from "date-fns/locale";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { generatePDF } from "@/lib/pdf-generator";
import { debounce } from "lodash";
import { useInvoiceStore } from "@/app/store/invoice-store";
export function InvoicePreview() {
  const invoice = useInvoiceStore((state) => state.invoice);
  const formContext = useFormContext();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [localFormValues, setLocalFormValues] = useState<any>(invoice);

  console.log(invoice);

  // Check if we're inside a form context
  const hasFormContext = formContext !== null;

  // Use form methods only if they exist
  useEffect(() => {
    if (hasFormContext) {
      // Create a debounced function that only updates after user stops typing
      const debouncedUpdate = debounce((value) => {
        setLocalFormValues(value);
      }, 100);

      // Watch all form values including nested objects like items
      const subscription = formContext.watch((value) => {
        // Debounce the form updates to reduce render frequency
        debouncedUpdate(value);
      });

      return () => {
        subscription.unsubscribe();
        debouncedUpdate.cancel();
      };
    } else {
      // When not in form context, just use the invoice from store
      setLocalFormValues(invoice);
    }
  }, [hasFormContext, invoice, formContext?.watch, formContext]);

  // language and date locale and color
  const language = localFormValues.language || "en";
  const dateLocale = language === "cs" ? cs : enUS;
  const color = localFormValues.color || "#0ea5e9";

  console.log(localFormValues.language);

  const t =
    language === "cs"
      ? {
          invoice: "FAKTURA",
          invoiceNumber: "Číslo faktury",
          date: "Datum vystavení",
          dueDate: "Datum splatnosti",
          from: "DODAVATEL",
          to: "ODBĚRATEL",
          item: "Položka",
          quantity: "Množství",
          unitPrice: "Cena za jednotku",
          tax: "DPH",
          total: "Celkem",
          subtotal: "Mezisoučet",
          taxTotal: "DPH celkem",
          grandTotal: "Celková částka",
          paymentMethod: "Způsob platby",
          bankAccount: "Bankovní účet",
          notes: "Poznámky",
          thankYou: "Děkujeme za vaši obchodní spolupráci",
          downloadPdf: "Stáhnout PDF",
        }
      : {
          invoice: "INVOICE",
          invoiceNumber: "Invoice Number",
          date: "Date",
          dueDate: "Due Date",
          from: "FROM",
          to: "BILL TO",
          item: "Item",
          quantity: "Quantity",
          unitPrice: "Unit Price",
          tax: "Tax",
          total: "Total",
          subtotal: "Subtotal",
          taxTotal: "Tax",
          grandTotal: "Total Amount",
          paymentMethod: "Payment Method",
          bankAccount: "Bank Account",
          notes: "Notes",
          thankYou: "Thank you for your business",
          downloadPdf: "Download PDF",
        };

  const formatCurrency = (amount: number | string) => {
    if (!amount) return "0,00";

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(language === "cs" ? "cs-CZ" : "en-US", {
      style: "currency",
      currency: localFormValues?.currency || "CZK",
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // calculation of totals
  const items = localFormValues?.items || [];

  const subtotal = items.reduce((sum: number, item: any) => {
    const quantity = parseFloat(item?.quantity?.toString() || "0") || 0;
    const unitPrice = parseFloat(item?.unitPrice?.toString() || "0") || 0;
    return sum + quantity * unitPrice;
  }, 0);

  const taxTotal = items.reduce((sum: number, item: any) => {
    const quantity = parseFloat(item?.quantity?.toString() || "0") || 0;
    const unitPrice = parseFloat(item?.unitPrice?.toString() || "0") || 0;
    const taxRate = parseFloat(item?.taxRate?.toString() || "0") || 0;
    const itemSubtotal = quantity * unitPrice;
    return sum + itemSubtotal * (taxRate / 100);
  }, 0);

  const grandTotal = subtotal + taxTotal;

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return format(new Date(date), "PPP", { locale: dateLocale });
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const invoiceNumber = localFormValues?.invoiceNumber || "invoice";
      await generatePDF("invoice-preview", `${invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Only create object URL when needed and memoize it
  const logoUrl = useMemo(() => {
    if (localFormValues?.logo && typeof window !== "undefined") {
      try {
        return URL.createObjectURL(localFormValues.logo);
      } catch (e) {
        console.error("Error creating object URL:", e);
        return null;
      }
    }
    return null;
  }, [localFormValues?.logo]);

  const stampUrl = useMemo(() => {
    if (localFormValues?.stamp && typeof window !== "undefined") {
      try {
        return URL.createObjectURL(localFormValues.stamp);
      } catch (e) {
        console.error("Error creating object URL:", e);
        return null;
      }
    }
    return null;
  }, [localFormValues?.stamp]);

  useEffect(() => {
    const handleFormUpdate = (event: CustomEvent) => {
      const { field, value } = event.detail;
      setLocalFormValues((prev: any) => ({
        ...prev,
        [field]: value,
      }));
    };

    document.addEventListener("form-update", handleFormUpdate as EventListener);

    return () => {
      document.removeEventListener(
        "form-update",
        handleFormUpdate as EventListener
      );
    };
  }, []);

  return (
    <div className="relative shadow-md">
      <div className="my-4 flex justify-end">
        <Button
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {t.downloadPdf}
        </Button>
      </div>

      <div
        id="invoice-preview"
        className="border rounded-md overflow-hidden bg-white"
      >
        <div className="p-6" style={{ fontSize: "10px" }}>
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {logoUrl && (
                <div className="mb-2 h-16 w-40 relative">
                  <Image
                    src={logoUrl}
                    alt="Company Logo"
                    fill
                    style={{ objectFit: "contain", objectPosition: "left" }}
                  />
                </div>
              )}
              <div>
                <h1 className="font-bold text-xl" style={{ color }}>
                  {t.invoice}
                </h1>
                <div className="flex space-x-4 mt-1">
                  <div>
                    <p className="text-xs text-gray-500">{t.invoiceNumber}</p>
                    <p>{localFormValues?.invoiceNumber || "INV-001"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t.date}</p>
                    <p>{formatDate(localFormValues?.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t.dueDate}</p>
                    <p>{formatDate(localFormValues?.dueDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* If there's a stamp */}
            {stampUrl && (
              <div className="h-20 w-20 relative">
                <Image
                  src={stampUrl}
                  alt="Company Stamp"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
          </div>

          {/* From / To Section */}
          <div className="flex justify-between mb-8">
            <div className="max-w-[45%]">
              <h3
                className="font-bold text-xs mb-2 uppercase"
                style={{ color }}
              >
                {t.from}
              </h3>
              <p className="font-bold">
                {localFormValues?.issuedBy || "Your Company Name"}
              </p>
              <p>{localFormValues?.supplierAddress || ""}</p>
              <p>
                {localFormValues?.supplierCity || ""}
                {localFormValues?.supplierCity && localFormValues?.supplierZip
                  ? ", "
                  : ""}
                {localFormValues?.supplierZip || ""}
              </p>
              {localFormValues?.supplierIco && (
                <p>IČO: {localFormValues.supplierIco}</p>
              )}
              {localFormValues?.supplierDic && (
                <p>DIČ: {localFormValues.supplierDic}</p>
              )}
            </div>

            <div className="max-w-[45%]">
              <h3
                className="font-bold text-xs mb-2 uppercase"
                style={{ color }}
              >
                {t.to}
              </h3>
              <p className="font-bold">
                {localFormValues?.client?.name || "Client Name"}
              </p>
              <p>{localFormValues?.client?.address || ""}</p>
              <p>
                {localFormValues?.client?.city || ""}
                {localFormValues?.client?.city && localFormValues?.client?.zip
                  ? ", "
                  : ""}
                {localFormValues?.client?.zip || ""}
              </p>
              {localFormValues?.client?.ico && (
                <p>IČO: {localFormValues.client.ico}</p>
              )}
              {localFormValues?.client?.dic && (
                <p>DIČ: {localFormValues.client.dic}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table
              className="w-full text-left"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr className="border-b">
                  <th
                    className="py-2 px-4 font-bold text-xs text-left"
                    style={{ color }}
                  >
                    {t.item}
                  </th>
                  <th
                    className="py-2 px-4 font-bold text-xs text-right"
                    style={{ color }}
                  >
                    {t.quantity}
                  </th>
                  <th
                    className="py-2 px-4 font-bold text-xs text-right"
                    style={{ color }}
                  >
                    {t.unitPrice}
                  </th>
                  <th
                    className="py-2 px-4 font-bold text-xs text-right"
                    style={{ color }}
                  >
                    {t.tax}
                  </th>
                  <th
                    className="py-2 px-4 font-bold text-xs text-right"
                    style={{ color }}
                  >
                    {t.total}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, index: number) => {
                  const quantity =
                    parseFloat(item?.quantity?.toString() || "0") || 0;
                  const unitPrice =
                    parseFloat(item?.unitPrice?.toString() || "0") || 0;
                  const taxRate =
                    parseFloat(item?.taxRate?.toString() || "0") || 0;
                  const itemSubtotal = quantity * unitPrice;
                  const itemTax = itemSubtotal * (taxRate / 100);
                  const itemTotal = itemSubtotal + itemTax;

                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">
                        {item?.description || `Item ${index + 1}`}
                      </td>
                      <td className="py-2 px-4 text-right">{quantity}</td>
                      <td className="py-2 px-4 text-right">
                        {formatCurrency(unitPrice)}
                      </td>
                      <td className="py-2 px-4 text-right">{taxRate}%</td>
                      <td className="py-2 px-4 text-right">
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">{t.subtotal}:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-600">{t.taxTotal}:</span>
                <span>{formatCurrency(taxTotal)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold">
                <span>{t.grandTotal}:</span>
                <span style={{ color }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-6">
            <h3 className="font-bold text-xs mb-2 uppercase" style={{ color }}>
              {t.paymentMethod}
            </h3>

            {localFormValues?.paymentMethod === "cash" ? (
              <div>
                <p>
                  {localFormValues?.language === "cs"
                    ? "Hotovost"
                    : "Cash payment"}
                </p>
              </div>
            ) : localFormValues?.paymentMethod === "card" ? (
              <div>
                <p>
                  {localFormValues?.language === "cs"
                    ? "Platba kartou"
                    : "Card payment"}
                </p>
              </div>
            ) : (
              <div className="flex space-x-4">
                <div>
                  <p className="text-xs text-gray-500">{t.bankAccount}</p>
                  <p>
                    {localFormValues?.bankAccount || "Account #: 1234567890"}
                  </p>
                </div>
                {localFormValues?.showIBAN && (
                  <div>
                    <p className="text-xs text-gray-500">IBAN</p>
                    <p>CZ65 0800 0000 0123 4567 8901</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {localFormValues?.notes && (
            <div className="mb-6">
              <h3
                className="font-bold text-xs mb-2 uppercase"
                style={{ color }}
              >
                {t.notes}
              </h3>
              <p className="text-gray-700">{localFormValues?.notes}</p>
            </div>
          )}

          {/* Thank You & Issued By */}
          <div className="text-center text-gray-500 mt-12">
            <p>{t.thankYou}</p>
            <p className="mt-2 text-xs">
              {localFormValues?.language === "cs"
                ? "Vystavil(a): "
                : "Issued by: "}
              <span className="font-medium">
                {localFormValues?.issuedBy || "Your Company"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
