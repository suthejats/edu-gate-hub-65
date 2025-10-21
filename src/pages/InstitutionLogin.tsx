import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const InstitutionLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    institutionCode: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.institutionCode) {
      newErrors.institutionCode = "Please fill out this field.";
    }
    if (!formData.email) {
      newErrors.email = "Please fill out this field.";
    }
    if (!formData.password) {
      newErrors.password = "Please fill out this field.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Check if institution exists and is approved
      const { data: institution, error: instError } = await supabase
        .from("institutions")
        .select("*")
        .eq("institution_code", formData.institutionCode)
        .eq("email", formData.email)
        .single();

      if (instError || !institution) {
        toast({
          title: "Error",
          description: "Invalid institution code or email",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (institution.status !== "approved") {
        toast({
          title: "Account Pending",
          description: "Your institution is awaiting approval",
          variant: "destructive",
        });
        navigate("/approval-status", { 
          state: { 
            institutionCode: formData.institutionCode,
            status: institution.status 
          } 
        });
        setLoading(false);
        return;
      }

      // Sign in with Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      navigate("/teacher/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center text-foreground">
            Institution Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institutionCode" className="text-foreground">
                Institution Code
              </Label>
              <Input
                id="institutionCode"
                type="text"
                placeholder="Enter institution code"
                className="glass-input h-12"
                value={formData.institutionCode}
                onChange={(e) => {
                  setFormData({ ...formData, institutionCode: e.target.value });
                  setErrors({ ...errors, institutionCode: "" });
                }}
              />
              {errors.institutionCode && (
                <p className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                  {errors.institutionCode}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="glass-input h-12"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && (
                <p className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                className="glass-input h-12"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({ ...errors, password: "" });
                }}
              />
              {errors.password && (
                <p className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => toast({ title: "Contact admin for password reset" })}
            >
              Forgot Password?
            </button>
          </form>

          <div className="pt-4 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Don't have an institution code yet?
            </p>
            <Button
              onClick={() => navigate("/institution/register")}
              variant="outline"
              className="w-full h-12 glass-panel hover:bg-secondary"
            >
              Register New Institution
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionLogin;
