import { NextResponse } from "next/server";

const randomId = Math.random().toString(36).substring(2, 15);

// GET all suppliers
export async function GET() {
  try {
    // In a real app, this would fetch from a database
    // For now we'll use a mock response
    return NextResponse.json({ 
      suppliers: [
        {
          id: "1",
          name: "My Company s.r.o.",
          ico: "12345678",
          dic: "CZ12345678",
          address: "Business Street 123",
          city: "Prague",
          zip: "12000",
          email: "info@mycompany.cz",
          bankAccount: "123456789/0800",
          isDefault: true
        }
      ]
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

// POST - create new supplier
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the supplier data
    if (!data.name) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
    }
    
    // Generate ID for the new supplier
    const newSupplier = {
      ...data,
      id: randomId
    };
    
    // In a real app, this would save to a database
    return NextResponse.json({ 
      success: true, 
      supplier: newSupplier 
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
} 