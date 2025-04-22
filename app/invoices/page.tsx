import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"
import { auth } from "@/auth"
import { FilteredInvoiceTable } from "./filtered-invoice-table"

async function getInvoices(userId: string) {
  // Fetch invoices from database for the current user
  const invoices = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    include: {
      client: true, // Include client information
    },
    orderBy: {
      issueDate: 'desc', // Most recent first
    },
  })

  // Transform data for the table
  return invoices.map(invoice => ({
    id: invoice.invoiceNumber,
    invoiceId: invoice.id,
    customer: invoice.client.name,
    date: invoice.issueDate.toISOString().split('T')[0],
    amount: invoice.totalAmount,
    status: invoice.status,
    currency: invoice.currency,
  }))
}

export default async function InvoicesPage() {
  // Get the current session
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Get user ID from database using email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch invoices for this user
  const invoices = await getInvoices(user.id)

  // Calculate summary statistics
  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Smart Faktura</h1>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Invoice
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <div className="bg-green-100 text-green-700 p-1 rounded-full">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPaid.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(inv => inv.status === 'paid').length} faktur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="bg-yellow-100 text-yellow-700 p-1 rounded-full">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPending.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(inv => inv.status === 'pending').length} faktur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <div className="bg-red-100 text-red-700 p-1 rounded-full">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOverdue.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter(inv => inv.status === 'overdue').length} faktur
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices</CardTitle>
          </div>
          <CardDescription>
            Manage and track all your invoice documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <FilteredInvoiceTable initialInvoices={invoices} />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any invoices yet. Get started by creating your first invoice.
              </p>
              <Button asChild>
                <Link href="/invoices/new">
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Invoice
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

