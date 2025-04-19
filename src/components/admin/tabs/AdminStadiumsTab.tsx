import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Edit, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StadiumFormData {
  id?: string;
  stadium_id?: number;
  name: string;
  city: string;
  location?: string;
  address?: string; 
  capacity?: number;
  image_url?: string;
}

const initialFormData: StadiumFormData = {
  name: "",
  city: "",
  location: "",
  address: "",
  capacity: 0,
  image_url: ""
};

const AdminStadiumsTab = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StadiumFormData>(initialFormData);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: stadiums, isLoading } = useQuery({
    queryKey: ["admin-stadiums-detailed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stadiums")
        .select("*")
        .order("name");
      
      if (error) {
        toast.error("Failed to load stadiums", { description: error.message });
        throw error;
      }
      
      return data || [];
    }
  });

  const createStadium = useMutation({
    mutationFn: async (data: StadiumFormData) => {
      const stadiumData = {
        name: data.name,
        city: data.city || data.location || "",
        location: data.location || data.city || "",
        address: data.address || "",
        capacity: data.capacity || 0,
        image_url: data.image_url || ""
      };

      const { data: result, error } = await supabase
        .from("stadiums")
        .insert(stadiumData)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Stadium created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-stadiums"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stadiums-detailed"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to create stadium", { description: error.message });
    }
  });

  const updateStadium = useMutation({
    mutationFn: async (data: StadiumFormData) => {
      const { id, ...updateData } = data;
      const stadiumData = {
        name: updateData.name,
        city: updateData.city || updateData.location || "",
        location: updateData.location || updateData.city || "",
        address: updateData.address || "",
        capacity: updateData.capacity || 0,
        image_url: updateData.image_url || ""
      };
      
      const { data: result, error } = await supabase
        .from("stadiums")
        .update(stadiumData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Stadium updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-stadiums"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stadiums-detailed"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to update stadium", { description: error.message });
    }
  });

  const deleteStadium = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("stadiums")
        .delete()
        .eq("id", String(id));
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stadium deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-stadiums"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stadiums-detailed"] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete stadium", { description: error.message });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    if (name === "capacity") {
      finalValue = value === "" ? "0" : value;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "capacity" ? parseInt(finalValue, 10) : finalValue 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      updateStadium.mutate(formData);
    } else {
      createStadium.mutate(formData);
    }
  };

  const editStadium = (stadium: any) => {
    const stadiumId = stadium.id || stadium.stadium_id;
    
    setFormData({
      id: stadiumId,
      stadium_id: stadium.stadium_id,
      name: stadium.name || "",
      city: stadium.city || stadium.location || "",
      location: stadium.location || stadium.city || "",
      address: stadium.address || "",
      capacity: stadium.capacity || 0,
      image_url: stadium.image_url || "",
    });

    setIsEditing(true);
    setIsCreating(false);
    setIsOpen(true);
  };

  const handleDelete = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this stadium?")) {
      deleteStadium.mutate(String(id));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setIsCreating(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsCreating(true);
    setIsOpen(true);
  };

  const getAddress = (stadium: any): string => {
    if (stadium.address) return stadium.address;
    if (stadium.location) return stadium.location;
    return "No address available";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Stadiums</CardTitle>
          <CardDescription>
            Manage stadiums and seating configurations
          </CardDescription>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button onClick={openCreateForm} className="bg-ipl-blue hover:bg-ipl-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Stadium
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{isEditing ? 'Edit Stadium' : 'Create New Stadium'}</SheetTitle>
              <SheetDescription>
                {isEditing ? 'Update stadium details' : 'Add a new stadium to the system'}
              </SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="name">Stadium Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter stadium name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="city">City/Location</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City or location"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="capacity">Seating Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Enter capacity"
                  min="0"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url || ""}
                  onChange={handleInputChange}
                  placeholder="URL to stadium image"
                />
              </div>
              
              <SheetFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={createStadium.isPending || updateStadium.isPending}
                  className="w-full"
                >
                  {(createStadium.isPending || updateStadium.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? 'Update Stadium' : 'Create Stadium'}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stadiums && stadiums.length > 0 ? (
                stadiums.map((stadium) => (
                  <TableRow key={stadium.id || stadium.stadium_id}>
                    <TableCell>
                      <div className="font-medium">{stadium.name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                        {getAddress(stadium)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => editStadium(stadium)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(stadium.id || stadium.stadium_id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <p className="text-gray-500">No stadiums found</p>
                    <Button 
                      variant="outline" 
                      onClick={openCreateForm} 
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first stadium
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStadiumsTab;
