"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Package } from "lucide-react"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function InvoiceItems() {
  const form = useFormContext()
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })
  
  const calculateItemTotal = (index: number) => {
    const quantity = parseFloat(form.watch(`items.${index}.quantity`) || "0")
    const unitPrice = parseFloat(form.watch(`items.${index}.unitPrice`) || "0")
    const taxRate = parseFloat(form.watch(`items.${index}.taxRate`) || "0")
    
    const subtotal = quantity * unitPrice
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax
    
    // Update the form value
    form?.setValue(`items.${index}.total`, total)
    
    return total.toFixed(2)
  }
  
  const calculateInvoiceTotal = () => {
    let total = 0
    
    fields.forEach((_, index) => {
      total += parseFloat(calculateItemTotal(index))
    })
    
    // Also update the total amount in the form
    form.setValue("totalAmount", total)
    
    return total.toFixed(2)
  }
  
  const currency = form.watch("currency") || "CZK"
  
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('cs-CZ', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2
    }).format(numAmount)
  }
  
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-[#1e293b]">Invoice Items</h2>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Tax Rate (%)</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input {...field} placeholder="Item description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            step="1"
                            onChange={(e) => {
                              field.onChange(e)
                              calculateItemTotal(index)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            step="0.01"
                            onChange={(e) => {
                              field.onChange(e)
                              calculateItemTotal(index)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <FormField
                    control={form.control}
                    name={`items.${index}.taxRate`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Select 
                            value={field.value.toString()} 
                            onValueChange={(value) => {
                              field.onChange(value)
                              calculateItemTotal(index)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tax rate" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="10">10%</SelectItem>
                              <SelectItem value="15">15%</SelectItem>
                              <SelectItem value="21">21%</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(calculateItemTotal(index))}
                  <FormField
                    control={form.control}
                    name={`items.${index}.total`}
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => 
              append({
                description: "",
                quantity: "1",
                unitPrice: "0",
                taxRate: "21",
                total: "0"
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div className="mt-8 border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(fields.reduce((sum, _, index) => {
                  const quantity = parseFloat(form.watch(`items.${index}.quantity`) || "0")
                  const unitPrice = parseFloat(form.watch(`items.${index}.unitPrice`) || "0")
                  return sum + (quantity * unitPrice)
                }, 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>{formatCurrency(fields.reduce((sum, _, index) => {
                  const quantity = parseFloat(form.watch(`items.${index}.quantity`) || "0")
                  const unitPrice = parseFloat(form.watch(`items.${index}.unitPrice`) || "0")
                  const taxRate = parseFloat(form.watch(`items.${index}.taxRate`) || "0")
                  const subtotal = quantity * unitPrice
                  return sum + (subtotal * (taxRate / 100))
                }, 0))}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t text-base">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(calculateInvoiceTotal())}</span>
              </div>
              
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 