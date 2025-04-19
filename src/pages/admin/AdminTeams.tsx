
import AdminLayout from "@/components/admin/AdminLayout";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { TeamTable } from "@/components/admin/teams/TeamTable";
import { CreateTeamDialog } from "@/components/admin/teams/CreateTeamDialog";
import { EditTeamDialog } from "@/components/admin/teams/EditTeamDialog";
import { DeleteTeamDialog } from "@/components/admin/teams/DeleteTeamDialog";
import { EmptyTeamsState } from "@/components/admin/teams/EmptyTeamsState";
import { TeamLoading } from "@/components/admin/teams/TeamLoading";
import { Team } from "@/types/database";

const AdminTeams = () => {
  const {
    teams,
    isLoading,
    selectedTeam,
    isSubmitting,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleCreateTeam,
    handleEditTeam,
    handleDeleteTeam,
    openEditDialog,
    openDeleteDialog
  } = useTeamManagement();

  return (
    <AdminLayout pageTitle="Manage Teams">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-gray-500">Manage IPL team information</p>
        </div>
        
        <CreateTeamDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateTeam}
          isSubmitting={isSubmitting}
        />
      </div>
      
      {isLoading ? (
        <TeamLoading />
      ) : !teams || (Array.isArray(teams) && teams.length === 0) ? (
        <EmptyTeamsState onAddTeam={() => setIsCreateDialogOpen(true)} />
      ) : (
        <TeamTable
          teams={teams as Team[]}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      )}
      
      <EditTeamDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedTeam={selectedTeam}
        onSubmit={handleEditTeam}
        isSubmitting={isSubmitting}
      />
      
      <DeleteTeamDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedTeam={selectedTeam}
        onDelete={handleDeleteTeam}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
};

export default AdminTeams;
