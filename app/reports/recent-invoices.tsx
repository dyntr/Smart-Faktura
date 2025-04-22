import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentInvoices() {
  return (
    <div className="space-y-8">
      {recentInvoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{invoice.customer.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{invoice.customer}</p>
            <p className="text-sm text-muted-foreground">{invoice.email}</p>
          </div>
          <div className="ml-auto font-medium">+${invoice.amount.toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

const recentInvoices = [
  {
    id: "1",
    customer: "Acme Corp",
    email: "acme@example.com",
    amount: 1999,
  },
  {
    id: "2",
    customer: "Tech Solutions",
    email: "tech@example.com",
    amount: 2499,
  },
  {
    id: "3",
    customer: "Global Services",
    email: "global@example.com",
    amount: 1749,
  },
  {
    id: "4",
    customer: "Local Business",
    email: "local@example.com",
    amount: 999,
  },
]

