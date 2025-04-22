/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building } from "lucide-react";
import { Supplier, useSupplierStore } from "@/app/store/supplier-store";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type SupplierSearchProps = {
  onSelect: (supplier: Supplier) => void;
};

export function SupplierSearch({ onSelect }: SupplierSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);

  const suppliers = useSupplierStore(state => state.suppliers);
  const addSupplier = useSupplierStore(state => state.addSupplier);

  const randomId = Math.random().toString(36).substring(2, 15);

  // Filter existing suppliers pouze podle IČO
  const handleLocalSearch = () => {
    if (!query.trim()) return;

    const filtered = suppliers.filter(supplier => {
      return supplier.ico?.includes(query);
    });

    setResults(filtered);
    setNoResults(filtered.length === 0);
  };

  // Fetch from external API
  const handleExternalSearch = async () => {
    if (!query.trim() || !/^\d+$/.test(query)) { // Validate IČO (must be numeric)
      setError("Please enter a valid numeric IČO.");
      return;
    }

    setLoading(true);
    setError(null);
    setNoResults(false);
    setResults([]);

    try {
      console.log("Searching for IČO:", query); // Log the query for debugging
      const response = await fetch(`/api/company/search?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error:", errorData); // Log server error for debugging
        throw new Error(errorData.error || "Failed to fetch company data");
      }

      const data = await response.json();
      console.log("Server Response:", data); // Log server response for debugging

      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const supplierResults = data.results.map((company: any) => ({
          id: randomId,
          name: company.name,
          ico: company.ico,
          dic: company.dic,
          address: company.address,
          city: company.city,
          zip: company.zip,
        }));

        setResults(supplierResults);
        setNoResults(false);
      } else {
        setNoResults(true);
      }
    } catch (error) {
      console.error("Error during external search:", error); // Log error for debugging
      setError(error instanceof Error ? error.message : "Failed to search for companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // First search in local suppliers
    handleLocalSearch();

    // If no local results, search externally
    if (results.length === 0) {
      await handleExternalSearch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // zabrání scrollu/odeslání formuláře
      handleSearch();
    }
  };

  const handleSelectSupplier = (supplier: Supplier) => {
    onSelect(supplier);

    // If this supplier isn't in our store yet, add it
    if (!suppliers.some(s => s.ico === supplier.ico)) {
      addSupplier(supplier);
      toast.success("Supplier added to your list");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Search by IČO</label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter ICO number..."
              className="w-full"
            />
          </div>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
            <Search className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm p-2 border border-red-200 bg-red-50 rounded">
          {error}
        </div>
      )}

      {noResults && (
        <div className="text-amber-700 text-sm p-2 border border-amber-200 bg-amber-50 rounded">
          No suppliers found. Try a different search or create a new supplier.
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Results:</h3>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {results.map((supplier) => (
              <Card key={supplier.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-3" onClick={() => handleSelectSupplier(supplier)}>
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3">
                        <span>IČO: {supplier.ico}</span>
                        {supplier.dic && <span>DIČ: {supplier.dic}</span>}
                        <span>{[supplier.address, supplier.city, supplier.zip].filter(Boolean).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}