import * as z from "zod";

export const invoiceFormSchema = z.object({
  invoiceType: z.string(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  reference: z.string().optional(),
  issuedBy: z.string().min(1, "Issuer is required"),
  supplierIco: z.string().optional(),
  supplierDic: z.string().optional(),
  supplierAddress: z.string().optional(),
  supplierCity: z.string().optional(),
  supplierZip: z.string().optional(),
  tradeRegisterInfo: z.string().optional(),
  issueDate: z.date(),
  dueDate: z.date(),
  paymentMethod: z.string(),
  bankAccount: z.string().optional(),
  routingNumber: z.string().optional(),
  constantSymbol: z.string().optional(),
  specificSymbol: z.string().optional(),
  showIBAN: z.boolean(),
  currency: z.string(),
  rounding: z.string(),
  language: z.string(),
  color: z.string(),
  style: z.string(),
  logo: z.any().optional(),
  stamp: z.any().optional(),
  notes: z.string().optional(),
  client: z.object({
    name: z.string().min(1, "Client name is required"),
    ico: z.string().optional(),
    dic: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z
          .string()
          .or(z.number())
          .pipe(z.coerce.number().positive("Quantity must be positive")),
        unitPrice: z
          .string()
          .or(z.number())
          .pipe(z.coerce.number().min(0, "Unit price cannot be negative")),
        taxRate: z
          .string()
          .or(z.number())
          .pipe(z.coerce.number().min(0, "Tax rate cannot be negative")),
        total: z
          .string()
          .or(z.number())
          .pipe(z.coerce.number().min(0, "Total cannot be negative")),
      })
    )
    .min(1, "At least one item is required"),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
  status: z.string().default("pending"),
});

// Export the type derived from the schema
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// You might also want to export item type for reuse
export type InvoiceItemValues = z.infer<typeof invoiceFormSchema>["items"][number]; 