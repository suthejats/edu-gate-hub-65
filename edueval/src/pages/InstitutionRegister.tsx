import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const InstitutionRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: "",
    email: "",
    contactNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
    confirmPassword: "",
    logo: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.institutionName) newErrors.institutionName = "This field is required";
    if (!formData.email) newErrors.email = "This field is required";
    if (!formData.contactNumber) newErrors.contactNumber = "This field is required";
    if (!formData.address) newErrors.address = "This field is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.city) newErrors.city = "This field is required";
    if (!formData.state) newErrors.state = "This field is required";
    if (!formData.pincode) newErrors.pincode = "This field is required";
    if (!formData.password) newErrors.password = "This field is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "This field is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);
    
    try {
      // Generate institution code
      const { data: codeData } = await supabase.rpc('generate_institution_code');
      const institutionCode = codeData as string;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            institution_code: institutionCode,
            institution_name: formData.institutionName,
          }
        }
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let logoUrl = null;

      // Upload logo if provided
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${institutionCode}-logo.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('institution-logos')
          .upload(fileName, formData.logo);

        if (uploadError) {
          toast({
            title: "Warning",
            description: "Logo upload failed, but registration will continue",
            variant: "default",
          });
        } else {
          logoUrl = supabase.storage.from('institution-logos').getPublicUrl(fileName).data.publicUrl;
        }
      }

      // Insert into institutions table
      const { error: instError } = await supabase
        .from("institutions")
        .insert({
          institution_name: formData.institutionName,
          email: formData.email,
          institution_code: institutionCode,
          contact_number: formData.contactNumber,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          password_hash: "hashed", // Password is handled by Supabase Auth
          status: "pending",
          logo_url: logoUrl,
        });

      if (instError) {
        toast({
          title: "Error",
          description: instError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create profile
      if (authData.user) {
        await supabase.from("profiles").insert({
          user_id: authData.user.id,
          email: formData.email,
          full_name: formData.institutionName,
          role: "institution",
          institution_code: institutionCode,
        });
      }

      toast({
        title: "Success",
        description: "Registration submitted for approval",
      });

      navigate("/approval-status", { 
        state: { 
          institutionCode,
          status: "pending" 
        } 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="glass-panel rounded-2xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center text-foreground">
            Institution Registration
          </h1>

          {/* Step Indicator */}
          <div className="flex justify-center gap-4 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
            }`}>
              1
            </div>
            <div className={`w-20 h-1 self-center ${
              step >= 2 ? "bg-accent" : "bg-muted"
            }`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? "bg-yellow-500 text-black" : "bg-muted text-muted-foreground"
            }`}>
              2
            </div>
            <div className={`w-20 h-1 self-center ${
              step >= 3 ? "bg-muted" : "bg-muted"
            }`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? "bg-muted" : "bg-muted text-muted-foreground"
            }`}>
              3
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    id="institutionName"
                    placeholder="Enter institution name"
                    className="glass-input h-12"
                    value={formData.institutionName}
                    onChange={(e) => {
                      setFormData({ ...formData, institutionName: e.target.value });
                      setErrors({ ...errors, institutionName: "" });
                    }}
                  />
                  {errors.institutionName && (
                    <p className="text-xs text-destructive">{errors.institutionName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="Enter contact number"
                  className="glass-input h-12"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, contactNumber: e.target.value });
                    setErrors({ ...errors, contactNumber: "" });
                  }}
                />
                {errors.contactNumber && (
                  <p className="text-xs text-destructive">{errors.contactNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address"
                  className="glass-input h-12"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    setErrors({ ...errors, address: "" });
                  }}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Institution Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="glass-input h-12 bg-green-900 border-green-700 text-green-100 file:bg-green-800 file:text-green-100 file:border-green-600 file:rounded file:px-3 file:py-1 file:mr-3 file:font-medium hover:file:bg-green-700"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, logo: file });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Upload your institution's logo (PNG, JPG, JPEG)
                </p>
              </div>

              <Button
                onClick={handleNext}
                className="w-full h-12 text-lg bg-yellow-500 text-black hover:bg-yellow-600 font-semibold"
              >
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Location & Login Setup
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="tumkur"
                    className="glass-input h-12"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      setErrors({ ...errors, city: "" });
                    }}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="karnataka"
                    className="glass-input h-12"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      setErrors({ ...errors, state: "" });
                    }}
                  />
                  {errors.state && (
                    <p className="text-xs text-destructive">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="560057"
                  className="glass-input h-12"
                  value={formData.pincode}
                  onChange={(e) => {
                    setFormData({ ...formData, pincode: e.target.value });
                    setErrors({ ...errors, pincode: "" });
                  }}
                />
                {errors.pincode && (
                  <p className="text-xs text-destructive">{errors.pincode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a Password"
                  className="glass-input h-12"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: "" });
                  }}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  className="glass-input h-12"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: "" });
                  }}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="glass-panel hover:bg-secondary"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 h-12 text-lg bg-yellow-500 text-black hover:bg-yellow-600 font-semibold"
                >
                  {loading ? "Registering..." : "Register Institution"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionRegister;
