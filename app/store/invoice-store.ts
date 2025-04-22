"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
};

export type InvoiceState = {
  invoiceType: string;
  invoiceNumber: string;
  reference?: string;
  issuedBy: string;
  issueDate: Date;
  dueDate: Date;
  paymentMethod: string;
  bankAccount?: string;
  routingNumber?: string;
  showIBAN: boolean;
  currency: string;
  rounding: string;
  language: string;
  color: string;
  style: string;
  logo?: File | null;
  stamp?: File | null;
  notes?: string;
  client: {
    name: string;
    ico?: string;
    dic?: string;
    address?: string;
    city?: string;
    zip?: string;
  };
  items: InvoiceItem[];
  totalAmount: number;
  status: string;
};

interface InvoiceStore {
  invoice: InvoiceState;
  updateInvoice: (data: Partial<InvoiceState>) => void;
  updateItem: (id: string, item: Partial<InvoiceItem>) => void;
  addItem: (item: InvoiceItem) => void;
  removeItem: (id: string) => void;
  resetInvoice: () => void;
}

// Initial state
const initialState: InvoiceState = {
  invoiceType: "invoice",
  invoiceNumber: "",
  reference: "",
  issuedBy: "",
  issueDate: new Date(),
  dueDate: new Date(),
  paymentMethod: "bank",
  bankAccount: "",
  routingNumber: "",
  showIBAN: false,
  currency: "USD",
  rounding: "none",
  language: "en",
  color: "#4f46e5",
  style: "modern",
  logo: null,
  stamp: null,
  notes: "",
  client: {
    name: "",
    ico: "",
    dic: "",
    address: "",
    city: "",
    zip: "",
  },
  items: [],
  totalAmount: 0,
  status: "pending"
};

export const useInvoiceStore = create<InvoiceStore>()(
  devtools(
    persist(
      (set) => ({
        invoice: { ...initialState },
        
        updateInvoice: (data) => 
          set((state) => ({ 
            invoice: { ...state.invoice, ...data } 
          })),
        
        updateItem: (id, itemData) => 
          set((state) => ({
            invoice: {
              ...state.invoice,
              items: state.invoice.items.map(item => 
                item.id === id ? { ...item, ...itemData } : item
              )
            }
          })),
        
        addItem: (item) => 
          set((state) => ({
            invoice: {
              ...state.invoice,
              items: [...state.invoice.items, item]
            }
          })),
        
        removeItem: (id) => 
          set((state) => ({
            invoice: {
              ...state.invoice,
              items: state.invoice.items.filter(item => item.id !== id)
            }
          })),
        
        resetInvoice: () => 
          set({ invoice: { ...initialState } })
      }),
      {
        name: "invoice-storage",
        // Only persist specific fields to avoid issues with File objects
        partialize: (state) => ({
          invoice: {
            ...state.invoice,
            logo: null, // Don't persist the logo file
            stamp: null // Don't persist the stamp file
          }
        })
      }
    )
  )
); 