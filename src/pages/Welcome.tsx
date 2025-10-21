import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="p-6 rounded-full border-4 border-accent bg-primary">
            <Building2 className="h-16 w-16 text-accent" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground">Institution Portal</h1>
        <p className="text-2xl text-foreground mb-12">Welcome</p>
        
        <div className="space-y-4">
          <Button
            onClick={() => navigate("/teacher/login")}
            variant="outline"
            className="w-full h-14 text-lg glass-panel hover:bg-secondary"
          >
            Individual Login
          </Button>
          
          <Button
            onClick={() => navigate("/institution/login")}
            className="w-full h-14 text-lg bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            Institution Login
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              New institution?
            </p>
            <Button
              onClick={() => navigate("/institution/register")}
              variant="link"
              className="text-accent hover:text-accent/80"
            >
              Register Here →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
