
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  User, 
  Pencil, 
  Trash2,
  Search
} from "lucide-react";
import { UserProfile } from "@/types/database";

interface UserProfileWithEmail extends UserProfile {
  email?: string;
}

interface UserEmailRecord {
  id: string;
  email: string;
}

const AdminUsers = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileWithEmail | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState<{ email: string; firstName: string; lastName: string; phone?: string; address?: string; }>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          throw new Error("You must be logged in to access this page");
        }
        
        const { data: adminCheck, error: adminCheckError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();
        
        if (adminCheckError || !adminCheck) {
          throw new Error("You do not have admin privileges to access user management");
        }
        
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        
        if (profilesError) {
          console.error("Error fetching user profiles:", profilesError);
          throw profilesError;
        }

        // Use type assertion to tell TypeScript that this function exists
        const { data: userEmailsData, error: authEmailError } = await supabase
          .rpc('get_user_emails') as { data: any, error: any };
        
        if (authEmailError) {
          console.error("Error fetching user emails:", authEmailError);
          throw authEmailError;
        }
        
        const emailMap: Record<string, string> = {};
        
        if (userEmailsData) {
          const userEmails = typeof userEmailsData === 'string' 
            ? JSON.parse(userEmailsData) 
            : Array.isArray(userEmailsData) ? userEmailsData : [];
            
          if (Array.isArray(userEmails)) {
            userEmails.forEach((item: UserEmailRecord) => {
              if (item && item.id && item.email) {
                emailMap[item.id] = item.email;
              }
            });
          }
        }

        const combinedData: UserProfileWithEmail[] = profiles.map((profile) => {
          return {
            ...profile,
            email: emailMap[profile.id] || `Unknown (${profile.id.substring(0, 8)})`
          };
        });

        return combinedData || [];
      } catch (error: any) {
        console.error("Error in fetchAdminUsers:", error.message || error);
        throw error;
      }
    },
  });

  const filteredUsers = users?.filter(user => {
    if (!searchTerm) return true;
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (user.phone?.includes(searchTerm));
  });

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      if (!newUser.email || !newUser.firstName || !newUser.lastName) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('createUser', {
        body: {
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          address: newUser.address
        }
      });

      if (error) {
        toast.error(`Failed to create user: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      toast.success("User created successfully");
      setIsCreateDialogOpen(false);
      refetch();
      
      setNewUser({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
      });
    } catch (err: any) {
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("profiles").update({
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        phone: selectedUser.phone,
        address: selectedUser.address,
      }).eq("id", selectedUser.id);

      if (error) {
        toast.error(`Failed to update user: ${error.message}`);
        return;
      }

      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('deleteUser', {
        body: { userId: selectedUser.id }
      });

      if (error) {
        toast.error(`Failed to delete user: ${error.message}`);
        return;
      }

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    console.error("Error fetching users:", error);
    return (
      <AdminLayout pageTitle="User Management">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-lg font-medium text-red-800">Error loading users</h2>
          <p className="text-red-600 mt-2">
            There was an error loading the users. This could be because:
          </p>
          <ul className="list-disc pl-5 mt-2 text-red-600">
            <li>You don't have admin privileges</li>
            <li>The Supabase connection is not working correctly</li>
            <li>Missing or invalid service role key</li>
            <li>The profiles table or admin_users table has incorrect RLS policies</li>
          </ul>
          <p className="mt-4 text-red-700">
            Error details: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="User Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500">Manage users and permissions</p>
        </div>
        
        <Button 
          className="bg-ipl-blue hover:bg-ipl-blue/90"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search users by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            aria-label="Search users"
            id="user-search"
            name="user-search"
          />
        </div>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-ipl-blue" />
            <span className="ml-3 text-lg">Loading users...</span>
          </CardContent>
        </Card>
      ) : !filteredUsers || filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-gray-500 mb-6">Start by adding your first user</p>
            <Button 
              className="bg-ipl-blue hover:bg-ipl-blue/90"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First User
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableCaption>List of registered users</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>{user.address || "-"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                        aria-label={`Edit ${user.first_name} ${user.last_name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                        aria-label={`Delete ${user.first_name} ${user.last_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They'll receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <form id="create-user-form" aria-label="Create user form">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  name="new-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  autoComplete="email"
                  required
                  aria-required="true"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-first-name">First Name</Label>
                  <Input
                    id="new-first-name"
                    name="new-first-name"
                    type="text"
                    placeholder="John"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    autoComplete="given-name"
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-last-name">Last Name</Label>
                  <Input
                    id="new-last-name"
                    name="new-last-name"
                    type="text"
                    placeholder="Doe"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    autoComplete="family-name"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-phone">Phone</Label>
                <Input
                  id="new-phone"
                  name="new-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-address">Address</Label>
                <Input
                  id="new-address"
                  name="new-address"
                  type="text"
                  placeholder="123 Main St, City"
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  autoComplete="street-address"
                />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleCreateUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form id="edit-user-form" aria-label="Edit user form">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-first-name">First Name</Label>
                    <Input
                      id="edit-first-name"
                      name="edit-first-name"
                      type="text"
                      value={selectedUser.first_name || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, first_name: e.target.value})}
                      autoComplete="given-name"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-last-name">Last Name</Label>
                    <Input
                      id="edit-last-name"
                      name="edit-last-name"
                      type="text"
                      value={selectedUser.last_name || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, last_name: e.target.value})}
                      autoComplete="family-name"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    name="edit-phone"
                    type="tel"
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    name="edit-address"
                    type="text"
                    value={selectedUser.address || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, address: e.target.value})}
                    autoComplete="street-address"
                  />
                </div>
              </div>
            </form>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleUpdateUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p className="font-semibold">{selectedUser.first_name} {selectedUser.last_name}</p>
              <p className="text-gray-500">{selectedUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
