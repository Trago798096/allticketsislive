
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { logSupabaseError } from '@/utils/errorLogger';

export default function AdminSettings() {
  const [upiId, setUpiId] = useState('');
  const [siteName, setSiteName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Fetch existing settings with improved error handling
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        console.log("Fetching site settings");
        const { data, error } = await supabase
          .from('site_settings')
          .select('*');

        if (error) {
          console.error("Error fetching settings:", error);
          logSupabaseError(error, "fetchSiteSettings");
          throw error;
        }
        
        console.log("Settings data fetched:", data);
        return data || [];
      } catch (err) {
        console.error("Failed to fetch site settings:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (settings?.length) {
      // Parse UPI ID
      const upiSetting = settings.find(s => s.setting_key === 'upi_id');
      if (upiSetting) {
        console.log("Found UPI setting:", upiSetting);
        // Fix: Safely extract the UPI ID from the setting_value
        if (typeof upiSetting.setting_value === 'object' && upiSetting.setting_value !== null) {
          // Check if setting_value has an id property
          const settingValue = upiSetting.setting_value as { [key: string]: any };
          setUpiId(settingValue.id || '');
        } else if (typeof upiSetting.setting_value === 'string') {
          setUpiId(upiSetting.setting_value);
        }
      }

      // Parse site name
      const siteNameSetting = settings.find(s => s.setting_key === 'site_name');
      if (siteNameSetting) {
        console.log("Found site name setting:", siteNameSetting);
        if (typeof siteNameSetting.setting_value === 'string') {
          setSiteName(siteNameSetting.setting_value);
        } else if (siteNameSetting.site_name) {
          setSiteName(siteNameSetting.site_name);
        }
      }

      // Parse logo URL
      const logoSetting = settings.find(s => s.setting_key === 'logo_url');
      if (logoSetting) {
        console.log("Found logo URL setting:", logoSetting);
        if (typeof logoSetting.setting_value === 'string') {
          setLogoUrl(logoSetting.setting_value);
        } else if (logoSetting.logo_url) {
          setLogoUrl(logoSetting.logo_url);
        }
      }
    }
  }, [settings]);

  // Update setting mutation with improved logging
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      console.log(`Updating setting: ${key} with value:`, value);
      
      try {
        // Check if setting exists
        const { data: existingSetting, error: fetchError } = await supabase
          .from('site_settings')
          .select('id')
          .eq('setting_key', key)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "no rows returned" error
          console.error("Error fetching existing setting:", fetchError);
          logSupabaseError(fetchError, "updateSetting", { key, action: "fetch" });
          throw fetchError;
        }

        if (existingSetting) {
          console.log(`Updating existing setting: ${key}`);
          // Update existing setting
          const { data, error } = await supabase
            .from('site_settings')
            .update({ 
              setting_value: value,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', key)
            .select()
            .single();

          if (error) {
            console.error("Error updating setting:", error);
            logSupabaseError(error, "updateSetting", { key, action: "update", value });
            throw error;
          }
          return data;
        } else {
          console.log(`Creating new setting: ${key}`);
          // Create new setting
          const { data, error } = await supabase
            .from('site_settings')
            .insert({ 
              setting_key: key,
              setting_value: value 
            })
            .select()
            .single();

          if (error) {
            console.error("Error creating setting:", error);
            logSupabaseError(error, "updateSetting", { key, action: "insert", value });
            throw error;
          }
          return data;
        }
      } catch (error) {
        console.error("Failed to update setting:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to update settings: " + (error.message || "Unknown error"));
      console.error("Error updating settings:", error);
    }
  });

  const handleUpdateUpiId = () => {
    if (!upiId.trim()) {
      toast.error("UPI ID cannot be empty");
      return;
    }
    
    updateSetting.mutate({ 
      key: 'upi_id', 
      value: { id: upiId } 
    });
  };

  const handleUpdateSiteName = () => {
    if (!siteName.trim()) {
      toast.error("Site name cannot be empty");
      return;
    }
    
    updateSetting.mutate({ 
      key: 'site_name', 
      value: siteName 
    });
  };

  const handleUpdateLogoUrl = () => {
    if (!logoUrl.trim()) {
      toast.error("Logo URL cannot be empty");
      return;
    }
    
    updateSetting.mutate({ 
      key: 'logo_url', 
      value: logoUrl 
    });
  };

  return (
    <AdminLayout pageTitle="Settings">
      <div className="p-8">
        <div className="grid gap-8">
          {/* UPI ID Setting */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure the UPI ID used for payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="upi-id">Default UPI ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="upi-id"
                      name="upi-id"
                      placeholder="example@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      autoComplete="off"
                    />
                    <Button 
                      onClick={handleUpdateUpiId}
                      disabled={updateSetting.isPending}
                      type="button" 
                      aria-label="Save UPI ID"
                    >
                      {updateSetting.isPending ? 'Updating...' : 'Save'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    This UPI ID will be used for all payment QR codes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Site Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Update general site settings and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="site-name"
                      name="site-name"
                      placeholder="IPL Ticket Booking"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      autoComplete="off"
                    />
                    <Button 
                      onClick={handleUpdateSiteName}
                      disabled={updateSetting.isPending}
                      type="button"
                      aria-label="Save site name"
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo-url"
                      name="logo-url"
                      placeholder="https://example.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      autoComplete="off"
                    />
                    <Button 
                      onClick={handleUpdateLogoUrl}
                      disabled={updateSetting.isPending}
                      type="button"
                      aria-label="Save logo URL"
                    >
                      Save
                    </Button>
                  </div>
                  {logoUrl && (
                    <div className="mt-2">
                      <p className="text-sm mb-1">Logo Preview:</p>
                      <img 
                        src={logoUrl} 
                        alt="Logo Preview" 
                        className="h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/default-logo.png";
                          console.warn("Failed to load logo preview");
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
