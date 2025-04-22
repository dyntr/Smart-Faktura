"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import {
  columns,
  useInvoiceDeleteListener,
  useInvoiceTableUpdates,
} from "./columns";
import { InvoiceFilters } from "./invoice-filters";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Invoice = {
  id: string;
  invoiceId: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
  currency: string;
};

interface FilteredInvoiceTableProps {
  initialInvoices: Invoice[];
}

export function FilteredInvoiceTable({
  initialInvoices,
}: FilteredInvoiceTableProps) {
  const [filteredInvoices, setFilteredInvoices] =
    useState<Invoice[]>(initialInvoices);

  useInvoiceDeleteListener(setFilteredInvoices);
  useInvoiceTableUpdates(setFilteredInvoices);

  //update data when initialData changes
  useEffect(() => {
    setFilteredInvoices(initialInvoices);
  }, [initialInvoices]);

  const handleFilterChange = (filters: {
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    status: string;
    minAmount: string;
    maxAmount: string;
  }) => {
    const filtered = initialInvoices.filter((invoice) => {
      // Date filtering
      if (filters.dateFrom && new Date(invoice.date) < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && new Date(invoice.date) > filters.dateTo) {
        return false;
      }

      // Status filtering - only apply if status is not "all"
      if (
        filters.status &&
        filters.status !== "all" &&
        invoice.status !== filters.status
      ) {
        return false;
      }

      // Amount filtering
      const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : 0;
      const maxAmount = filters.maxAmount
        ? parseFloat(filters.maxAmount)
        : Infinity;
      if (invoice.amount < minAmount || invoice.amount > maxAmount) {
        return false;
      }

      return true;
    });

    setFilteredInvoices(filtered);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredInvoices.length} of {initialInvoices.length} invoices
        </div>
        <InvoiceFilters onFilterChange={handleFilterChange} />
      </div>

      {filteredInvoices.length > 0 ? (
        <DataTable columns={columns} data={filteredInvoices} />
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching invoices</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters to find what you&apos;re looking for.
          </p>
          <Button
            variant="outline"
            onClick={() =>
              handleFilterChange({
                dateFrom: undefined,
                dateTo: undefined,
                status: "",
                minAmount: "",
                maxAmount: "",
              })
            }
          >
            Clear Filters
          </Button>
        </div>
      )}
    </>
  );
}
