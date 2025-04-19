
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

const AdminNews = () => {
  return (
    <AdminLayout pageTitle="Manage News">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">News & Announcements</h1>
          <p className="text-gray-500">Publish updates and news articles</p>
        </div>
        
        <Button className="bg-ipl-blue hover:bg-ipl-blue/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Article
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium mb-2">News management coming soon</h3>
        <p className="text-gray-500 mb-4">This feature is under development</p>
      </div>
    </AdminLayout>
  );
};

export default AdminNews;
