/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function InvoiceFilters({ onFilterChange }: { onFilterChange: (filters: {
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  status: string;
  minAmount: string;
  maxAmount: string;
}) => void }) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    status: "all",
    minAmount: "",
    maxAmount: ""
  })
  
  // Use client-side only rendering for the badge to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  
  // Only run on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    
    // Count active filters
    let count = 0
    if (newFilters.dateFrom) count++
    if (newFilters.dateTo) count++
    if (newFilters.status && newFilters.status !== "all") count++
    if (newFilters.minAmount) count++
    if (newFilters.maxAmount) count++
    
    setActiveFilterCount(count)
  }

  const applyFilters = () => {
    onFilterChange(filters)
    setOpen(false)
  }

  const clearFilters = () => {
    const resetFilters = {
      dateFrom: undefined,
      dateTo: undefined,
      status: "all",
      minAmount: "",
      maxAmount: ""
    }
    setFilters(resetFilters)
    setActiveFilterCount(0)
    onFilterChange(resetFilters)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {isMounted && activeFilterCount > 0 && (
            <Badge className="ml-2 bg-primary h-5 w-5 p-0 flex items-center justify-center" variant="default">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="font-medium">Filter Invoices</div>
          
          <div className="space-y-2">
            <div className="font-medium text-sm">Date Range</div>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "PPP") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => handleFilterChange("dateFrom", date)}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "PPP") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => handleFilterChange("dateTo", date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-sm">Status</div>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium text-sm">Amount Range</div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min amount"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max amount"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
            <Button size="sm" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 