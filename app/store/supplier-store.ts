"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type Supplier = {
  id: string;
  name: string;
  ico?: string;
  dic?: string;
  address?: string;
  city?: string;
  zip?: string;
  email?: string;
  phone?: string;
  bankAccount?: string;
  isDefault?: boolean;
};

interface SupplierStore {
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  removeSupplier: (id: string) => void;
  setDefaultSupplier: (id: string) => void;
  getSupplierById: (id: string) => Supplier | undefined;
  getDefaultSupplier: () => Supplier | undefined;
}

export const useSupplierStore = create<SupplierStore>()(
  devtools(
    persist(
      (set, get) => ({
        suppliers: [],
        
        addSupplier: (supplier) => 
          set((state) => ({
            suppliers: [...state.suppliers, supplier]
          })),
        
        updateSupplier: (id, data) => 
          set((state) => ({
            suppliers: state.suppliers.map(supplier => 
              supplier.id === id ? { ...supplier, ...data } : supplier
            )
          })),
        
        removeSupplier: (id) => 
          set((state) => ({
            suppliers: state.suppliers.filter(supplier => supplier.id !== id)
          })),
        
        setDefaultSupplier: (id) => 
          set((state) => ({
            suppliers: state.suppliers.map(supplier => ({
              ...supplier,
              isDefault: supplier.id === id
            }))
          })),
        
        getSupplierById: (id) => {
          return get().suppliers.find(supplier => supplier.id === id);
        },
        
        getDefaultSupplier: () => {
          return get().suppliers.find(supplier => supplier.isDefault);
        }
      }),
      {
        name: "supplier-storage"
      }
    )
  )
); 