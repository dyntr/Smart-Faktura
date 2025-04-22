"use client";

import { useState } from "react";
import { Supplier, useSupplierStore } from "@/app/store/supplier-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Edit, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export default function SupplierClient() {
  const suppliers = useSupplierStore((state) => state.suppliers);
  const addSupplier = useSupplierStore((state) => state.addSupplier);
  const updateSupplier = useSupplierStore((state) => state.updateSupplier);
  const removeSupplier = useSupplierStore((state) => state.removeSupplier);
  const setDefaultSupplier = useSupplierStore((state) => state.setDefaultSupplier);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    ico: "",
    dic: "",
    address: "",
    city: "",
    zip: "",
    email: "",
    phone: "",
    bankAccount: "",
  });

  const handleCreateSupplier = () => {
    if (!newSupplier.name) {
      toast.error("Supplier name is required");
      return;
    }

    const randomId = Math.random().toString(36).substring(2, 15);

    const supplier: Supplier = {
      id: randomId,
      name: newSupplier.name,
      ico: newSupplier.ico,
      dic: newSupplier.dic,
      address: newSupplier.address,
      city: newSupplier.city,
      zip: newSupplier.zip,
      email: newSupplier.email,
      phone: newSupplier.phone,
      bankAccount: newSupplier.bankAccount,
      isDefault: suppliers.length === 0, // Make default if it's the first one
    };

    addSupplier(supplier);
    setNewSupplier({
      name: "",
      ico: "",
      dic: "",
      address: "",
      city: "",
      zip: "",
      email: "",
      phone: "",
      bankAccount: "",
    });
    setIsCreateDialogOpen(false);
    toast.success("Supplier created successfully");
  };

  const handleEditSupplier = () => {
    if (!editingSupplier || !editingSupplier.name) {
      toast.error("Supplier name is required");
      return;
    }

    updateSupplier(editingSupplier.id, editingSupplier);
    setEditingSupplier(null);
    setIsEditDialogOpen(false);
    toast.success("Supplier updated successfully");
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      removeSupplier(id);
      toast.success("Supplier deleted successfully");
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultSupplier(id);
    toast.success("Default supplier updated");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-muted-foreground">
            Create and manage your suppliers for use in invoices
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Enter the details of your new supplier
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="Company name"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ico">IČO</Label>
                  <Input
                    id="ico"
                    placeholder="Company ID"
                    value={newSupplier.ico}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, ico: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dic">DIČ</Label>
                  <Input
                    id="dic"
                    placeholder="Tax ID"
                    value={newSupplier.dic}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, dic: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={newSupplier.city}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, city: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="ZIP code"
                    value={newSupplier.zip}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, zip: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Input
                  id="bankAccount"
                  placeholder="Bank account number"
                  value={newSupplier.bankAccount}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      bankAccount: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSupplier}>Create Supplier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-muted/30">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No suppliers yet</h2>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            You haven&apos;t added any suppliers yet. Add your first supplier to use in your invoices.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Supplier
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="overflow-hidden">
              <CardHeader className="relative">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {supplier.name}
                      {supplier.isDefault && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {supplier.ico && `IČO: ${supplier.ico}`}
                      {supplier.dic && ` · DIČ: ${supplier.dic}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {supplier.address && (
                    <div>
                      <span className="text-muted-foreground">Address: </span>
                      {supplier.address}
                      {(supplier.city || supplier.zip) && (
                        <span>
                          , {supplier.city} {supplier.zip}
                        </span>
                      )}
                    </div>
                  )}
                  {supplier.bankAccount && (
                    <div>
                      <span className="text-muted-foreground">Bank account: </span>
                      {supplier.bankAccount}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 bg-muted/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!supplier.isDefault) {
                      handleSetDefault(supplier.id);
                    }
                  }}
                  disabled={supplier.isDefault}
                >
                  {supplier.isDefault ? "Default" : "Set as Default"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingSupplier({ ...supplier });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the details of your supplier
            </DialogDescription>
          </DialogHeader>
          {editingSupplier && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Company Name *</Label>
                <Input
                  id="edit-name"
                  value={editingSupplier.name}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              {/* Add the same fields as in the create form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-ico">IČO</Label>
                  <Input
                    id="edit-ico"
                    value={editingSupplier.ico || ""}
                    onChange={(e) =>
                      setEditingSupplier({
                        ...editingSupplier,
                        ico: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dic">DIČ</Label>
                  <Input
                    id="edit-dic"
                    value={editingSupplier.dic || ""}
                    onChange={(e) =>
                      setEditingSupplier({
                        ...editingSupplier,
                        dic: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingSupplier.address || ""}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={editingSupplier.city || ""}
                    onChange={(e) =>
                      setEditingSupplier({
                        ...editingSupplier,
                        city: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-zip">ZIP Code</Label>
                  <Input
                    id="edit-zip"
                    value={editingSupplier.zip || ""}
                    onChange={(e) =>
                      setEditingSupplier({
                        ...editingSupplier,
                        zip: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-bankAccount">Bank Account</Label>
                <Input
                  id="edit-bankAccount"
                  value={editingSupplier.bankAccount || ""}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      bankAccount: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSupplier}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}