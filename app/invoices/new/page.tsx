import { InvoiceForm } from "./invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="container mx-auto py-6">
      <nav className="flex items-center text-sm mb-4">
        <a href="/invoices" className="text-primary hover:underline">
          Issued invoices
        </a>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-muted-foreground">Issue new invoice</span>
      </nav>

      <h1 className="text-2xl font-semibold text-[#1e293b] mb-6">
        Issuing a new invoice
      </h1>
      <InvoiceForm />
    </div>
  );
}
