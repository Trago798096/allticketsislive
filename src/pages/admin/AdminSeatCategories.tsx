
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchSeatCategories, 
  createSeatCategory, 
  updateSeatCategory, 
  deleteSeatCategory 
} from "@/services/seatService";
import { fetchStadiums, fetchSectionsByStadium } from "@/services/stadiumService";
import { fetchMatches } from "@/services/matchService";
import { useIsMobile, useScreenSize } from "@/hooks/use-mobile";

export default function AdminSeatCategories() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedStadium, setSelectedStadium] = useState<string>("");
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const screenSize = useScreenSize();

  // Fetch seat categories with better error handling
  const { 
    data: categories, 
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ["admin-seat-categories"],
    queryFn: fetchSeatCategories,
    refetchOnWindowFocus: false,
    staleTime: 5000, // 5 seconds - reduced stale time for more frequent refreshes
  });

  // Fetch stadiums for dropdown
  const { 
    data: stadiums,
    isLoading: isLoadingStadiums 
  } = useQuery({
    queryKey: ["admin-stadiums"],
    queryFn: fetchStadiums,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
  });

  // Fetch matches for dropdown
  const { 
    data: matches,
    isLoading: isLoadingMatches 
  } = useQuery({
    queryKey: ["admin-matches"],
    queryFn: fetchMatches,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
  });

  // Fetch sections based on selected stadium with proper error handling
  const { 
    data: sections, 
    refetch: refetchSections,
    isLoading: isLoadingSections
  } = useQuery({
    queryKey: ["admin-stadium-sections", selectedStadium],
    queryFn: () => fetchSectionsByStadium(selectedStadium),
    enabled: !!selectedStadium,
    staleTime: 10000, // 10 seconds
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error("Error fetching sections:", error);
        toast.error("Failed to load stadium sections");
      }
    }
  });

  // Effect to reset section when stadium changes
  useEffect(() => {
    setSelectedSection("");
    if (selectedStadium) {
      refetchSections();
    }
  }, [selectedStadium, refetchSections]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
      setSelectedStadium("");
      setSelectedSection("");
      setSelectedMatch("");
    }
  }, [isCreateDialogOpen]);

  // Create seat category mutation with improved error handling
  const createCategory = useMutation({
    mutationFn: async (categoryData: any) => {
      return createSeatCategory(categoryData);
    },
    onSuccess: () => {
      toast.success("Seat category created successfully");
      setIsCreateDialogOpen(false);
      // Invalidate and refetch to update the UI
      queryClient.invalidateQueries({ queryKey: ["admin-seat-categories"] });
      queryClient.invalidateQueries({ queryKey: ["seat-categories"] });
      // Explicitly refetch categories
      setTimeout(() => refetchCategories(), 300);
    },
    onError: (error: any) => {
      console.error("Create category error:", error);
      toast.error("Failed to create category", { 
        description: error.message || "Please try again or check your inputs" 
      });
    }
  });

  // Update seat category mutation with improved error handling
  const updateCategory = useMutation({
    mutationFn: async (categoryData: any) => {
      const { id, ...updateData } = categoryData;
      return updateSeatCategory(id, updateData);
    },
    onSuccess: () => {
      toast.success("Seat category updated successfully");
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      // Invalidate and refetch to update the UI
      queryClient.invalidateQueries({ queryKey: ["admin-seat-categories"] });
      queryClient.invalidateQueries({ queryKey: ["seat-categories"] });
      // Explicitly refetch categories
      setTimeout(() => refetchCategories(), 300);
    },
    onError: (error: any) => {
      console.error("Update category error:", error);
      toast.error("Failed to update category", { 
        description: error.message || "Please try again or check your inputs" 
      });
    },
    onSettled: () => {
      // Always run this code whether successful or failed
      setIsEditDialogOpen(false);
    }
  });

  // Delete seat category mutation with improved error handling
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      return deleteSeatCategory(id);
    },
    onSuccess: () => {
      toast.success("Seat category deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      // Invalidate and refetch to update the UI
      queryClient.invalidateQueries({ queryKey: ["admin-seat-categories"] });
      queryClient.invalidateQueries({ queryKey: ["seat-categories"] });
      // Explicitly refetch categories
      setTimeout(() => refetchCategories(), 300);
    },
    onError: (error: any) => {
      console.error("Delete category error:", error);
      toast.error("Failed to delete category", { 
        description: error.message || "Please try again" 
      });
    },
    onSettled: () => {
      // Always run this code whether successful or failed
      setIsDeleteDialogOpen(false);
    }
  });

  // Handle form submission for create with validation
  const handleCreateSubmit = () => {
    const name = (document.getElementById('name') as HTMLInputElement)?.value;
    const price = (document.getElementById('price') as HTMLInputElement)?.value;
    const color = (document.getElementById('color') as HTMLInputElement)?.value;
    const availability = (document.getElementById('availability') as HTMLInputElement)?.value;
    
    if (!name || !price || !selectedSection || !selectedMatch) {
      toast.error("All fields are required", {
        description: "Please complete all required fields before submitting"
      });
      return;
    }
    
    createCategory.mutate({
      name,
      price: Number(price),
      color_code: color,
      availability: Number(availability) || 100,
      match_id: selectedMatch,
      stadium_section_id: selectedSection
    });
  };

  // Handle form submission for edit with validation
  const handleEditSubmit = () => {
    if (!selectedCategory) return;
    
    const name = (document.getElementById('edit-name') as HTMLInputElement)?.value;
    const price = (document.getElementById('edit-price') as HTMLInputElement)?.value;
    const color = (document.getElementById('edit-color') as HTMLInputElement)?.value;
    const availability = (document.getElementById('edit-availability') as HTMLInputElement)?.value;
    
    if (!name || !price) {
      toast.error("Required fields missing", {
        description: "Name and price are required fields"
      });
      return;
    }
    
    updateCategory.mutate({
      id: selectedCategory.id,
      name,
      price: Number(price),
      color_code: color,
      availability: Number(availability) || selectedCategory.availability,
      match_id: selectedCategory.match_id,
      stadium_section_id: selectedCategory.stadium_section_id || selectedCategory.section_id
    });
  };

  // Render loading state
  if (isLoadingCategories) {
    return (
      <AdminLayout pageTitle="Seat Categories">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading seat categories...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Render error state
  if (isCategoriesError) {
    return (
      <AdminLayout pageTitle="Seat Categories">
        <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Failed to load seat categories</h2>
            <p className="text-muted-foreground">There was an error loading the seat categories data.</p>
            <Button onClick={() => refetchCategories()}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Function to safely get team names from match
  const getTeamNames = (match: any) => {
    if (!match) return { team1: 'Team 1', team2: 'Team 2' };
    
    // Handle different match data structures
    let team1Name = 'Team 1';
    let team2Name = 'Team 2';
    
    if (match.team1_id && typeof match.team1_id === 'object') {
      team1Name = match.team1_id.team_name || match.team1_id.name || 'Team 1';
    }
    
    if (match.team2_id && typeof match.team2_id === 'object') {
      team2Name = match.team2_id.team_name || match.team2_id.name || 'Team 2';
    }
    
    return { team1: team1Name, team2: team2Name };
  };

  // Render the UI
  return (
    <AdminLayout pageTitle="Seat Categories">
      <div className="p-2 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Seat Categories</h1>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size={isMobile ? "sm" : "default"}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Seat Category
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Name</TableHead>
                  <TableHead className="w-[80px]">Price</TableHead>
                  {!isMobile && (
                    <>
                      <TableHead className="w-[120px]">Section</TableHead>
                      <TableHead className="w-[120px]">Match</TableHead>
                      <TableHead className="w-[80px]">Availability</TableHead>
                      <TableHead className="w-[50px]">Color</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>₹{category.price}</TableCell>
                      {!isMobile && (
                        <>
                          <TableCell>{category.section_name || "Not assigned"}</TableCell>
                          <TableCell>
                            {matches && category.match_id ? 
                              (() => {
                                const matchInfo = matches.find(m => m.id === category.match_id);
                                if (matchInfo) {
                                  const { team1, team2 } = getTeamNames(matchInfo);
                                  return `${team1} vs ${team2}`;
                                }
                                return matchInfo?.match_number || "Match #";
                              })() : "Unknown"
                            }
                          </TableCell>
                          <TableCell>{category.availability}</TableCell>
                          <TableCell>
                            <div 
                              className="w-6 h-6 rounded" 
                              style={{ backgroundColor: category.color_code || '#cccccc' }}
                            />
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size={isMobile ? "sm" : "default"}
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          {!isMobile && <span className="ml-1">Edit</span>}
                        </Button>
                        <Button 
                          variant="outline" 
                          size={isMobile ? "sm" : "default"}
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          {!isMobile && <span className="ml-1">Delete</span>}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 7} className="text-center py-8">
                      <p className="text-gray-500">No categories found</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(true)} 
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add your first seat category
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Dialog for creating a new category */}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          if (!createCategory.isPending) {
            setIsCreateDialogOpen(open);
          }
        }}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Seat Category</DialogTitle>
              <DialogDescription>
                Add a new seat category for a match. This will be shown to users when booking tickets.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="sm:text-right mobile-form-label">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-1 sm:col-span-3 mobile-full-width"
                  placeholder="Category name (e.g. Premium)"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="match" className="sm:text-right mobile-form-label">
                  Match
                </Label>
                <div className="col-span-1 sm:col-span-3 w-full relative">
                  {isLoadingMatches && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  <Select 
                    value={selectedMatch} 
                    onValueChange={setSelectedMatch}
                    disabled={isLoadingMatches}
                  >
                    <SelectTrigger id="match" className="w-full">
                      <SelectValue placeholder="Select match" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches?.map(match => {
                        const { team1, team2 } = getTeamNames(match);
                        return (
                          <SelectItem key={match.id} value={match.id}>
                            Match #{match.match_number} - {team1} vs {team2}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="stadium" className="sm:text-right mobile-form-label">
                  Stadium
                </Label>
                <div className="col-span-1 sm:col-span-3 w-full relative">
                  {isLoadingStadiums && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  <Select 
                    value={selectedStadium} 
                    onValueChange={setSelectedStadium}
                    disabled={isLoadingStadiums}
                  >
                    <SelectTrigger id="stadium" className="w-full">
                      <SelectValue placeholder="Select stadium" />
                    </SelectTrigger>
                    <SelectContent>
                      {stadiums?.map(stadium => (
                        <SelectItem key={stadium.id} value={stadium.id}>
                          {stadium.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="section" className="sm:text-right mobile-form-label">
                  Section
                </Label>
                <div className="col-span-1 sm:col-span-3 w-full relative">
                  {isLoadingSections && selectedStadium && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  <Select 
                    value={selectedSection} 
                    onValueChange={setSelectedSection}
                    disabled={!selectedStadium || !sections || sections.length === 0 || isLoadingSections}
                  >
                    <SelectTrigger id="section" className="w-full">
                      <SelectValue placeholder={!selectedStadium ? "Select stadium first" : "Select section"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sections?.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name || section.section_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="sm:text-right mobile-form-label">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  className="col-span-1 sm:col-span-3"
                  placeholder="Price in ₹"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="availability" className="sm:text-right mobile-form-label">
                  Availability
                </Label>
                <Input
                  id="availability"
                  type="number"
                  min="0"
                  className="col-span-1 sm:col-span-3"
                  placeholder="Number of seats available"
                  defaultValue="100"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="sm:text-right mobile-form-label">
                  Color
                </Label>
                <Input
                  id="color"
                  type="color"
                  className="col-span-1 sm:col-span-3 p-1 h-10"
                  defaultValue="#3b82f6"
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!createCategory.isPending) {
                    setIsCreateDialogOpen(false);
                  }
                }}
                disabled={createCategory.isPending}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSubmit}
                disabled={createCategory.isPending}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {createCategory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog for editing a category */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          if (!updateCategory.isPending) {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedCategory(null);
            }
          }
        }}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Seat Category</DialogTitle>
              <DialogDescription>
                Update the details for this seat category.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="sm:text-right mobile-form-label">
                      Name
                    </Label>
                    <Input
                      id="edit-name"
                      className="col-span-1 sm:col-span-3"
                      defaultValue={selectedCategory.name}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-price" className="sm:text-right mobile-form-label">
                      Price
                    </Label>
                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      className="col-span-1 sm:col-span-3"
                      defaultValue={selectedCategory.price}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-availability" className="sm:text-right mobile-form-label">
                      Availability
                    </Label>
                    <Input
                      id="edit-availability"
                      type="number"
                      min="0"
                      className="col-span-1 sm:col-span-3"
                      defaultValue={selectedCategory.availability}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-color" className="sm:text-right mobile-form-label">
                      Color
                    </Label>
                    <Input
                      id="edit-color"
                      type="color"
                      className="col-span-1 sm:col-span-3 p-1 h-10"
                      defaultValue={selectedCategory.color_code || "#3b82f6"}
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (!updateCategory.isPending) {
                        setIsEditDialogOpen(false);
                        setSelectedCategory(null);
                      }
                    }}
                    disabled={updateCategory.isPending}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEditSubmit}
                    disabled={updateCategory.isPending}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {updateCategory.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog for deleting a category */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
          if (!deleteCategory.isPending) {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setSelectedCategory(null);
            }
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Seat Category</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the category.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <>
                <div className="py-4">
                  <p>Are you sure you want to delete the category "{selectedCategory.name}"?</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This will permanently delete the category
                    and remove it from all associated matches.
                  </p>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (!deleteCategory.isPending) {
                        setIsDeleteDialogOpen(false);
                        setSelectedCategory(null);
                      }
                    }}
                    disabled={deleteCategory.isPending}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteCategory.mutate(selectedCategory.id)}
                    disabled={deleteCategory.isPending}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {deleteCategory.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
