import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Mail } from "lucide-react";

interface Institution {
  id: string;
  institution_name: string;
  email: string;
  institution_code: string;
  contact_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  created_at: string;
}

const AdminApprovals = () => {
  const { toast } = useToast();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingInstitutions();
  }, []);

  const fetchPendingInstitutions = async () => {
    const { data, error } = await supabase
      .from("institutions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data) setInstitutions(data);
  };

  const handleApproval = async (id: string, institutionCode: string, email: string, status: "approved" | "rejected") => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("institutions")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Institution ${status}`,
      });

      // In a real app, send email with institution code here
      console.log(`Email would be sent to ${email} with code ${institutionCode}`);

      fetchPendingInstitutions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-panel rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Approval Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review and approve pending institution registrations
          </p>
        </div>

        {institutions.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">
              No pending institutions for approval
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {institutions.map((institution) => (
              <div
                key={institution.id}
                className="glass-panel rounded-2xl p-6 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {institution.institution_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Registered on{" "}
                      {new Date(institution.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Institution Code</p>
                    <p className="text-lg font-bold text-accent">
                      {institution.institution_code}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="text-foreground">{institution.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="text-foreground">{institution.contact_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="text-foreground">{institution.address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="text-foreground">
                      {institution.city}, {institution.state} - {institution.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() =>
                      handleApproval(
                        institution.id,
                        institution.institution_code,
                        institution.email,
                        "approved"
                      )
                    }
                    disabled={loading}
                    className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() =>
                      handleApproval(
                        institution.id,
                        institution.institution_code,
                        institution.email,
                        "rejected"
                      )
                    }
                    disabled={loading}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="glass-panel hover:bg-secondary"
                    onClick={() => {
                      toast({
                        title: "Email Notification",
                        description: `Would send code ${institution.institution_code} to ${institution.email}`,
                      });
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovals;
