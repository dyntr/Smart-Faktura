import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const invoiceFormSchema = z.object({
  invoiceType: z.string(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  reference: z.string().optional(),
  issuedBy: z.string().min(1, "Issuer is required"),
  supplierIco: z.string().optional(),
  supplierDic: z.string().optional(),
  supplierAddress: z.string().optional(),
  supplierCity: z.string().optional(),
  supplierZip: z.any().optional(), // Odstraněna validace, přijímá libovolnou hodnotu
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
  status: z.string().optional(),
  logo: z.any().optional(),
  stamp: z.any().optional(),
  notes: z.string().optional(),
  client: z.object({
    name: z.string().min(1, "Client name is required"),
    ico: z.string().optional(),
    dic: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    zip: z.any().optional(), // Odstraněna validace, přijímá libovolnou hodnotu
  }),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z
          .union([z.string().transform((val) => parseFloat(val)), z.number()])
          .refine(
            (val) => !isNaN(val) && val > 0,
            "Quantity must be positive"
          ),
        unitPrice: z
          .union([z.string().transform((val) => parseFloat(val)), z.number()])
          .refine(
            (val) => !isNaN(val) && val >= 0,
            "Unit price cannot be negative"
          ),
        taxRate: z
          .union([z.string().transform((val) => parseFloat(val)), z.number()])
          .refine(
            (val) => !isNaN(val) && val >= 0,
            "Tax rate cannot be negative"
          ),
        total: z.number().min(0, "Total cannot be negative"),
      })
    )
    .min(1, "At least one item is required"),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Safety: Parse dates from string to Date objects if they're strings
    if (typeof body.issueDate === "string") {
      body.issueDate = new Date(body.issueDate);
    }
    if (typeof body.dueDate === "string") {
      body.dueDate = new Date(body.dueDate);
    }

    // Validate the data
    const validatedData = invoiceFormSchema.parse(body);

    // Begin a transaction to ensure all database operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Find or create the client company
      let client = await tx.company.findFirst({
        where: {
          name: validatedData.client.name,
          userId: user.id,
        },
      });

      if (!client) {
        client = await tx.company.create({
          data: {
            name: validatedData.client.name,
            ico: validatedData.client.ico || null,
            vatId: validatedData.client.dic || null,
            address: validatedData.client.address || null,
            city: validatedData.client.city || null,
            zip: validatedData.client.zip || null,
            userId: user.id,
          },
        });
      }

      // Create the invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: validatedData.invoiceNumber,
          userId: user.id,
          clientId: client.id,
          issueDate: validatedData.issueDate,
          dueDate: validatedData.dueDate,
          totalAmount: validatedData.totalAmount,
          currency: validatedData.currency,
          status: validatedData.status || "pending",
          notes: validatedData.notes,
          items: {
            create: validatedData.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              total: item.total,
            })),
          },
          // Create invoice settings
          settings: {
            create: {
              paymentMethod: validatedData.paymentMethod,
              bankAccount: validatedData.bankAccount || null,
              routingNumber: validatedData.routingNumber || null,
              constantSymbol: validatedData.constantSymbol || null,
              specificSymbol: validatedData.specificSymbol || null,
              showIBAN: validatedData.showIBAN,
              language: validatedData.language,
              color: validatedData.color,
              style: validatedData.style,
              reference: validatedData.reference || null,
              tradeRegisterInfo: validatedData.tradeRegisterInfo || null,
            },
          },
          // Add supplier details to the invoice
          supplierIco: validatedData.supplierIco || null,
          supplierDic: validatedData.supplierDic || null,
          supplierAddress: validatedData.supplierAddress || null,
          supplierCity: validatedData.supplierCity || null,
          supplierZip: validatedData.supplierZip || null,
        },
      });

      return invoice;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully",
        invoiceId: result.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);

    // Handle validation errors separately
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle database-specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create invoice: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create invoice",
      },
      { status: 500 }
    );
  }
}
