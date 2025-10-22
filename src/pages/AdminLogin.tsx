import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
const AdminLogin = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for default admin credentials
    if (formData.email === "suthejats27@gmail.com" && formData.password === "23456") {
      localStorage.setItem('admin', 'true');
      toast({
        title: "Success",
        description: "Logged in as admin"
      });
      navigate("/admin/approvals");
      return;
    }

    // Check if email is the admin email for Supabase auth
    if (formData.email === "suthejats@gmail.com") {
      setLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) {
          toast({
            title: "Error",
            description: "Invalid credentials",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Create or update admin profile
        if (data.user) {
          const {
            data: existingProfile
          } = await supabase.from("profiles").select("*").eq("user_id", data.user.id).single();
          if (!existingProfile) {
            await supabase.from("profiles").insert({
              user_id: data.user.id,
              email: formData.email,
              full_name: "Admin",
              role: "admin"
            });
          }
        }
        toast({
          title: "Success",
          description: "Logged in as admin"
        });
        navigate("/admin/approvals");
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred during login",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "Access Denied",
        description: "Only admin can access this page",
        variant: "destructive"
      });
    }
  };
  return <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            
            <h1 className="text-3xl font-bold text-center text-foreground">Admin</h1>
            <p className="text-sm text-muted-foreground text-center">
              Restricted to authorized personnel only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Admin Email
              </Label>
              <Input id="email" type="email" placeholder="suthejats27@gmail.com" className="glass-input h-12" value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input id="password" type="password" placeholder="Enter admin password" className="glass-input h-12" value={formData.password} onChange={e => setFormData({
              ...formData,
              password: e.target.value
            })} required />
            </div>

            <Button type="submit" className="w-full h-12 text-lg bg-yellow-500 text-black hover:bg-yellow-600 font-semibold" disabled={loading}>
              {loading ? "Logging in..." : "Access Admin Panel"}
            </Button>

            <Button type="button" onClick={() => navigate("/")} variant="outline" className="w-full glass-panel hover:bg-secondary">
              Back to Home
            </Button>
          </form>
        </div>
      </div>
    </div>;
};
export default AdminLogin;