import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

// Schema for validation
const statusUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "canceled"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = statusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status value",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    // Check if the invoice exists and belongs to the user
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
      },
      select: {
        userId: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice not found",
        },
        { status: 404 }
      );
    }

    // Ensure the invoice belongs to the user
    if (invoice.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access to this invoice",
        },
        { status: 403 }
      );
    }

    // Update the invoice status
    await prisma.invoice.update({
      where: {
        id: id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice status updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating invoice status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update invoice status",
      },
      { status: 500 }
    );
  }
}
