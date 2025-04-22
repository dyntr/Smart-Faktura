import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        client: true,
        items: true,
      },
    });
    
    if (!invoice) {
      return new NextResponse("Invoice not found", { status: 404 });
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[INVOICE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the current session to identify the user
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

    // Get the invoice ID from the params
    const { id } = await params;

    // Check if the invoice exists and belongs to the user
    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
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

    // Delete the invoice (cascade will handle related records)
    await prisma.invoice.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting invoice:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete invoice",
      },
      { status: 500 }
    );
  }
}
