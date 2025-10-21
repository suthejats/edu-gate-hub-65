import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
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
            Teacher Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => toast({ title: "Contact admin for password reset" })}
              >
                Forgot Password?
              </button>
              
              <div className="text-sm text-muted-foreground">
                New institution?{" "}
                <button
                  type="button"
                  className="text-accent hover:underline"
                  onClick={() => navigate("/institution/register")}
                >
                  Register here
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
