import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  FileSpreadsheet,
  Palette,
  Calendar,
  ArrowRight,
  Check,
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16 container mx-auto px-4">
      {/* Hero Section */}
      <section className="md:py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Create professional invoices in{" "}
            <span className="text-primary">seconds</span>, not hours.
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg">
            Streamline your billing process with our intuitive invoicing
            platform designed for freelancers, small businesses, and
            entrepreneurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/invoices/new">
                Create Your First Invoice
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {/* <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View Pricing</Link>
            </Button> */}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 pt-4">
            {["No credit card required", "Free forever", "No hidden fees"].map(
              (text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-primary" />
                  <span>{text}</span>
                </div>
              )
            )}
          </div>
        </div>
        <div className="flex-1 relative h-[400px] w-full rounded-lg overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg shadow-lg border w-[80%] h-[80%] flex flex-col">
              <div className="h-8 w-full bg-primary/10 rounded mb-4"></div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-6 w-24 bg-primary/20 rounded"></div>
                  <div className="h-10 w-full bg-primary/10 rounded"></div>
                  <div className="h-6 w-32 bg-primary/20 rounded"></div>
                  <div className="h-10 w-full bg-primary/10 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-28 bg-primary/20 rounded"></div>
                  <div className="h-10 w-full bg-primary/10 rounded"></div>
                  <div className="h-6 w-20 bg-primary/20 rounded"></div>
                  <div className="h-10 w-full bg-primary/10 rounded"></div>
                </div>
              </div>
              <div className="h-12 w-32 bg-primary/50 rounded mt-4 self-end"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="md:py-12 space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold">
            Everything you need for professional invoicing
          </h2>
          <p className="text-muted-foreground text-lg">
            Our platform simplifies the invoicing process with intuitive
            features designed for busy professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Efficiency at its best</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Generate, send, and track professional invoices directly from
                the app with just a few clicks.
              </p>
              <ul className="space-y-2">
                {[
                  "One-click invoice generation",
                  "Email delivery",
                  "Payment tracking",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Custom branding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Personalize your invoices with your brand colors, logo, and
                customized templates.
              </p>
              <ul className="space-y-2">
                {[
                  "Color customization",
                  "Logo integration",
                  "Template library",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Automation tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Set up recurring invoices and automatic reminders to keep your
                cash flow consistent.
              </p>
              <ul className="space-y-2">
                {[
                  "Recurring billing",
                  "Payment reminders",
                  "Revenue forecasting",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-2xl p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">
          Ready to simplify your invoicing?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of businesses that have streamlined their invoicing
          process and get paid faster.
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/invoices/new">Create Your First Invoice</Link>
        </Button>
      </section>
    </div>
  );
}
