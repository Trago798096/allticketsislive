
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminStadiumsTab from "@/components/admin/tabs/AdminStadiumsTab";

const AdminStadiums = () => {
  return (
    <AdminLayout pageTitle="Manage Stadiums">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Stadiums</h1>
        <p className="text-gray-500">Configure stadiums and seating layouts</p>
      </div>

      <AdminStadiumsTab />
    </AdminLayout>
  );
};

export default AdminStadiums;
