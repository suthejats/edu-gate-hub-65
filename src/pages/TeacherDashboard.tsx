import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileUp, LogOut, BarChart3 } from "lucide-react";

interface Exam {
  id: string;
  exam_title: string;
  subject_class: string;
  exam_date_time: string;
  duration: string;
  status: string;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [institutionCode, setInstitutionCode] = useState<string>("");
  const [formData, setFormData] = useState({
    examTitle: "",
    subjectClass: "",
    examDateTime: "",
    duration: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchProfile();
    fetchExams();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("institution_code")
        .eq("user_id", user.id)
        .single();
      
      if (profile) {
        setInstitutionCode(profile.institution_code);
      }
    }
  };

  const fetchExams = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (data) setExams(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let fileUrl = "";
      
      // Upload file if provided
      if (formData.file) {
        const fileName = `${Date.now()}_${formData.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("exam-papers")
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("exam-papers")
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;
      }

      // Insert exam
      const { error } = await supabase
        .from("exams")
        .insert({
          exam_title: formData.examTitle,
          subject_class: formData.subjectClass,
          exam_date_time: new Date(formData.examDateTime).toISOString(),
          duration: formData.duration,
          file_url: fileUrl,
          institution_code: institutionCode,
          created_by: user.id,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exam submitted for approval",
      });

      setFormData({
        examTitle: "",
        subjectClass: "",
        examDateTime: "",
        duration: "",
        file: null,
      });
      
      fetchExams();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit exam",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              TEACHER DASHBOARD
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your exams efficiently
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/teacher/analytics")}
              variant="outline"
              className="glass-panel hover:bg-secondary"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="glass-panel hover:bg-destructive/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileUp className="h-6 w-6 text-accent" />
              <h2 className="text-2xl font-bold text-foreground">
                Upload Question Paper
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Submit exam papers for institutional approval
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examTitle">Exam Title *</Label>
                <Input
                  id="examTitle"
                  placeholder="Enter exam title"
                  className="glass-input h-11"
                  value={formData.examTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, examTitle: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectClass">Subject / Class / Section *</Label>
                <Input
                  id="subjectClass"
                  placeholder="e.g., Mathematics - Class 10A"
                  className="glass-input h-11"
                  value={formData.subjectClass}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectClass: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="examDateTime">Exam Date & Time *</Label>
                  <Input
                    id="examDateTime"
                    type="datetime-local"
                    className="glass-input h-11"
                    value={formData.examDateTime}
                    onChange={(e) =>
                      setFormData({ ...formData, examDateTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 120 minutes or 2 hours"
                    className="glass-input h-11"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload Question Paper (PDF or DOC) *</Label>
                <div className="relative">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="glass-input h-11 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-accent-foreground file:font-semibold hover:file:bg-accent/90"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                {loading ? "Submitting..." : "Submit for Approval"}
              </Button>
            </form>
          </div>

          {/* Exams List */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Upcoming Exams
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Exams created and awaiting approval
            </p>

            {exams.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>📋 No exams yet — create your first one using the form on the left.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="glass-input p-4 rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {exam.exam_title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {exam.subject_class}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          exam.status === "approved"
                            ? "bg-success/20 text-success"
                            : exam.status === "rejected"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-accent/20 text-accent"
                        }`}
                      >
                        {exam.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(exam.exam_date_time).toLocaleString()}
                      </span>
                      <span>{exam.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
