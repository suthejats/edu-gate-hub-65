import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ApprovalStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("pending");
  const [institutionCode, setInstitutionCode] = useState<string>("");

  useEffect(() => {
    const stateData = location.state as { institutionCode?: string; status?: string };
    if (stateData?.institutionCode) {
      setInstitutionCode(stateData.institutionCode);
      setStatus(stateData.status || "pending");
      
      // Set up realtime subscription
      const channel = supabase
        .channel('approval-status')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'institutions',
            filter: `institution_code=eq.${stateData.institutionCode}`
          },
          (payload: any) => {
            setStatus(payload.new.status);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [location.state]);

  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-24 w-24 text-success" />;
      case "rejected":
        return <XCircle className="h-24 w-24 text-destructive" />;
      default:
        return <Clock className="h-24 w-24 text-accent" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "approved":
        return {
          title: "Approved!",
          message: "Your institution has been approved. You can now login to access the dashboard.",
        };
      case "rejected":
        return {
          title: "Rejected",
          message: "Your institution registration was rejected. Please contact the administrator for more information.",
        };
      default:
        return {
          title: "Pending Approval",
          message: "Your institution registration is currently pending admin approval. You will receive an email once approved.",
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="glass-panel rounded-2xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {statusInfo.title}
            </h1>
            <p className="text-muted-foreground">
              {statusInfo.message}
            </p>
          </div>

          {institutionCode && (
            <div className="glass-input p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Your Institution Code
              </p>
              <p className="text-2xl font-bold text-accent">
                {institutionCode}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {status === "approved" && (
              <Button
                onClick={() => navigate("/institution/login")}
                className="w-full h-12 text-lg bg-yellow-500 text-black hover:bg-yellow-600 font-semibold"
              >
                Go to Login
              </Button>
            )}
            
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full h-12 glass-panel hover:bg-secondary"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalStatus;
