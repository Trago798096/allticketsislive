
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
import { Loader2, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingValue {
  id?: string;
  [key: string]: any;
}

export default function AdminPaymentSettings() {
  const [upiId, setUpiId] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [activeTab, setActiveTab] = useState('upi');

  // Fetch existing settings with improved error handling
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      try {
        console.log("Fetching payment settings");
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .in('setting_key', ['upi_id', 'merchant_id']);

        if (error) {
          console.error("Error fetching payment settings:", error);
          logSupabaseError(error, "fetchPaymentSettings");
          throw error;
        }
        
        console.log("Payment settings data fetched:", data);
        return data || [];
      } catch (err) {
        console.error("Failed to fetch payment settings:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });

  // Update settings when data is loaded with improved type checking
  useEffect(() => {
    if (settings?.length) {
      // Parse UPI ID with type safety
      const upiSetting = settings.find(s => s.setting_key === 'upi_id');
      if (upiSetting) {
        // Handle setting_value regardless of whether it's an object or string
        try {
          let upiValue: SettingValue | string | null = null;
          
          // If it's a string that looks like JSON, parse it
          if (typeof upiSetting.setting_value === 'string' && 
              upiSetting.setting_value.trim().startsWith('{')) {
            upiValue = JSON.parse(upiSetting.setting_value);
          } 
          // If it's already an object, use it directly
          else if (typeof upiSetting.setting_value === 'object' && 
                  upiSetting.setting_value !== null) {
            upiValue = upiSetting.setting_value as SettingValue;
          }
          // If it's a string but not JSON, use it directly
          else if (typeof upiSetting.setting_value === 'string') {
            upiValue = upiSetting.setting_value;
          }
          
          // Extract the ID value safely
          if (typeof upiValue === 'object' && upiValue !== null && 'id' in upiValue) {
            setUpiId(upiValue.id?.toString() || '');
          } else if (typeof upiValue === 'string') {
            setUpiId(upiValue);
          }
        } catch (err) {
          console.error("Error parsing UPI setting value:", err);
          // If parsing fails, try to use the raw value as a fallback
          if (typeof upiSetting.setting_value === 'string') {
            setUpiId(upiSetting.setting_value);
          }
        }
      }

      // Parse merchant ID with similar type safety
      const merchantSetting = settings.find(s => s.setting_key === 'merchant_id');
      if (merchantSetting) {
        try {
          let merchantValue: SettingValue | string | null = null;
          
          if (typeof merchantSetting.setting_value === 'string' && 
              merchantSetting.setting_value.trim().startsWith('{')) {
            merchantValue = JSON.parse(merchantSetting.setting_value);
          } else if (typeof merchantSetting.setting_value === 'object' && 
                    merchantSetting.setting_value !== null) {
            merchantValue = merchantSetting.setting_value as SettingValue;
          } else if (typeof merchantSetting.setting_value === 'string') {
            merchantValue = merchantSetting.setting_value;
          }
          
          if (typeof merchantValue === 'object' && merchantValue !== null && 'id' in merchantValue) {
            setMerchantId(merchantValue.id?.toString() || '');
          } else if (typeof merchantValue === 'string') {
            setMerchantId(merchantValue);
          }
        } catch (err) {
          console.error("Error parsing merchant setting value:", err);
          if (typeof merchantSetting.setting_value === 'string') {
            setMerchantId(merchantSetting.setting_value);
          }
        }
      }
    }
  }, [settings]);

  // Update setting mutation
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
      toast.success("Payment settings updated successfully");
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
    
    // Store as a JSON object to ensure consistent data format
    updateSetting.mutate({ 
      key: 'upi_id', 
      value: { id: upiId } 
    });
  };

  const handleUpdateMerchantId = () => {
    if (!merchantId.trim()) {
      toast.error("Merchant ID cannot be empty");
      return;
    }
    
    // Store as a JSON object to ensure consistent data format
    updateSetting.mutate({ 
      key: 'merchant_id', 
      value: { id: merchantId } 
    });
  };

  return (
    <AdminLayout pageTitle="Payment Settings">
      <div className="p-4 md:p-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Payment Settings</h1>
            <p className="text-muted-foreground mt-2">
              Configure payment methods and credentials for your ticket booking system
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-6 md:p-10">
                <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-ipl-blue" />
                <span className="ml-3 text-base md:text-lg">Loading payment settings...</span>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full overflow-x-auto md:w-auto">
                <TabsTrigger value="upi">UPI Payments</TabsTrigger>
                <TabsTrigger value="merchant">Merchant Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upi">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <CreditCard className="h-5 w-5 mr-2" />
                      UPI Payment Settings
                    </CardTitle>
                    <CardDescription>
                      Configure the UPI ID used for payment transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="upi-id">Default UPI ID</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            id="upi-id"
                            name="upi-id"
                            placeholder="example@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            autoComplete="off"
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleUpdateUpiId}
                            disabled={updateSetting.isPending}
                            type="button" 
                            aria-label="Save UPI ID"
                            className="whitespace-nowrap"
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
              </TabsContent>
              
              <TabsContent value="merchant">
                <Card>
                  <CardHeader>
                    <CardTitle>Merchant Settings</CardTitle>
                    <CardDescription>
                      Configure merchant credentials for payment gateways
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="merchant-id">Merchant ID</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            id="merchant-id"
                            name="merchant-id"
                            placeholder="Your merchant ID"
                            value={merchantId}
                            onChange={(e) => setMerchantId(e.target.value)}
                            autoComplete="off"
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleUpdateMerchantId}
                            disabled={updateSetting.isPending}
                            type="button" 
                            aria-label="Save Merchant ID"
                            className="whitespace-nowrap"
                          >
                            {updateSetting.isPending ? 'Updating...' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
