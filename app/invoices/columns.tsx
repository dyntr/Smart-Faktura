/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Download,
  MoreHorizontal,
  Loader2,
  Trash,
  Eye,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { InvoicePreview } from "./new/invoice-preview";
import { useInvoiceStore } from "../store/invoice-store";
import { generatePDF } from "@/lib/pdf-generator";

type Invoice = {
  id: string;
  invoiceId: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
  currency: string;
};

// custom event for invoice deletion
const INVOICE_DELETED_EVENT = "invoice-deleted";

// Create a custom event for invoice status change
const INVOICE_STATUS_CHANGED_EVENT = "invoice-status-changed";

export function dispatchInvoiceDeleted(invoiceId: string) {
  document.dispatchEvent(
    new CustomEvent(INVOICE_DELETED_EVENT, {
      detail: { invoiceId },
    })
  );
}

export function dispatchInvoiceStatusChanged(
  invoiceId: string,
  status: string
) {
  document.dispatchEvent(
    new CustomEvent(INVOICE_STATUS_CHANGED_EVENT, {
      detail: { invoiceId, status },
    })
  );
}

function InvoiceActions({ row }: { row: any }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const invoice = row.original;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/invoices/${invoice.invoiceId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          dispatchInvoiceDeleted(invoice.invoiceId);

          toast.success("Invoice deleted successfully");

          router.refresh();
        } else {
          throw new Error("Failed to delete invoice");
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        toast.error("Failed to delete invoice");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Preparing Invoice PDF");
      setIsPdfLoading(true);

      const response = await fetch(`/api/invoices/${invoice.invoiceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoice details");
      }

      const fullInvoice = await response.json();

      if (fullInvoice) {
        useInvoiceStore.setState({
          invoice: fullInvoice,
        });

        setShowPreview(true);

        await new Promise((resolve) => setTimeout(resolve, 500));

        await generatePDF(
          "invoice-preview",
          `Invoice-${invoice.invoiceId}.pdf`
        );

        setTimeout(() => {
          setShowPreview(false);
        }, 500);

        toast.success("PDF Downloaded");
      }
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleViewPDFDetails = async () => {
    try {
      setShowPreview(true);
      setIsPdfLoading(true);

      const response = await fetch(`/api/invoices/${invoice.invoiceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoice details");
      }

      const fullInvoice = await response.json();

      if (fullInvoice) {
        useInvoiceStore.setState({
          invoice: fullInvoice,
        });
      }
    } catch (error) {
      console.error("Error viewing PDF details:", error);
      toast.error("Could not view PDF details. Please try again.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.invoiceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "paid" }),
      });

      if (res.ok) {
        // Dispatch the custom event for immediate UI update
        dispatchInvoiceStatusChanged(invoice.invoiceId, "paid");

        toast.success("Invoice marked as paid");

        router.refresh();
      } else {
        throw new Error("Failed to update invoice status");
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Failed to update invoice status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleViewPDFDetails}
            className="cursor-pointer"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleExportPDF}
            className="flex items-center cursor-pointer"
            disabled={isPdfLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            <span>{isPdfLoading ? "Generating PDF..." : "Download PDF"}</span>
          </DropdownMenuItem>
          {invoice.status !== "paid" && (
            <DropdownMenuItem
              onClick={handleMarkAsPaid}
              className="cursor-pointer text-green-600 focus:text-green-600"
              disabled={isUpdatingStatus}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isUpdatingStatus ? "Updating..." : "Mark as Paid"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600 cursor-pointer"
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Invoice"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice {invoice.id}</DialogTitle>
          </DialogHeader>
          {isPdfLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <InvoicePreview />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: "Number",
    cell: ({ row }) => <div className="w-[120px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("customer")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "Issue Date",
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const currency = row.original.currency || "GBP";

      return (
        <div className="w-[100px]">
          {new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: currency,
          }).format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div className="w-[80px] capitalize">
          <div className={`status-${row.getValue("status")}`}>
            {row.getValue("status")}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <InvoiceActions row={row} />,
  },
];

export function useInvoiceDeleteListener(
  setData: React.Dispatch<React.SetStateAction<any[]>>
) {
  useEffect(() => {
    const handleInvoiceDeleted = (event: CustomEvent) => {
      const { invoiceId } = event.detail;
      setData((currentData) =>
        currentData.filter((invoice) => invoice.invoiceId !== invoiceId)
      );
    };

    document.addEventListener(
      INVOICE_DELETED_EVENT,
      handleInvoiceDeleted as EventListener
    );

    return () => {
      document.removeEventListener(
        INVOICE_DELETED_EVENT,
        handleInvoiceDeleted as EventListener
      );
    };
  }, [setData]);
}

export function useInvoiceTableUpdates(
  setData: React.Dispatch<React.SetStateAction<any[]>>
) {
  useEffect(() => {
    const handleInvoiceDeleted = (event: CustomEvent) => {
      const { invoiceId } = event.detail;
      setData((currentData) =>
        currentData.filter((invoice) => invoice.invoiceId !== invoiceId)
      );
    };

    const handleInvoiceStatusChanged = (event: CustomEvent) => {
      const { invoiceId, status } = event.detail;
      setData((currentData) =>
        currentData.map((invoice) =>
          invoice.invoiceId === invoiceId ? { ...invoice, status } : invoice
        )
      );
    };

    // Add event listeners
    document.addEventListener(
      INVOICE_DELETED_EVENT,
      handleInvoiceDeleted as EventListener
    );

    document.addEventListener(
      INVOICE_STATUS_CHANGED_EVENT,
      handleInvoiceStatusChanged as EventListener
    );

    // Clean up
    return () => {
      document.removeEventListener(
        INVOICE_DELETED_EVENT,
        handleInvoiceDeleted as EventListener
      );

      document.removeEventListener(
        INVOICE_STATUS_CHANGED_EVENT,
        handleInvoiceStatusChanged as EventListener
      );
    };
  }, [setData]);
}
