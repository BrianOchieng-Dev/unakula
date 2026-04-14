import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  IdCard, 
  Sparkles, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  ChevronLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { generateProfileAvatar } from "@/services/gemini";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { compressImage } from "@/lib/utils";
import { 
  auth, 
  db,
  signInWithGoogle, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  doc,
  setDoc,
  serverTimestamp
} from "@/lib/firebase";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: AuthMode;
}

type AuthMode = "login" | "signup" | "register-details";

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [profileData, setProfileData] = useState({
    fullname: "",
    yearOfStudy: "",
    studentId: "",
    photoURL: "",
  });

  const mmustIdRegex = /^[A-Z]{3,4}\/[A-Z]\/\d{2}-\d{5}\/\d{4}$/;
  const isIdValid = mmustIdRegex.test(profileData.studentId);

  const passwordValidation = {
    length: authData.password.length >= 6,
    number: /\d/.test(authData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(authData.password),
    match: mode === "signup" ? authData.password === authData.confirmPassword : true
  };

  const isPasswordValid = passwordValidation.length && passwordValidation.number && passwordValidation.special && passwordValidation.match;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      onSuccess(result.user);
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error("Domain not authorized. Please add this URL to your Firebase Console under Authentication > Settings > Authorized Domains.");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Login popup blocked. Please allow popups for this site.");
      } else {
        toast.error(error.message || "Google login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "signup" && !isPasswordValid) {
      if (!passwordValidation.length) toast.error("Password must be at least 6 characters");
      else if (!passwordValidation.number) toast.error("Password must contain at least one number");
      else if (!passwordValidation.special) toast.error("Password must contain at least one special character");
      else if (!passwordValidation.match) toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        const result = await signInWithEmailAndPassword(auth, authData.email, authData.password);
        onSuccess(result.user);
      } else {
        // Sign up mode - first create account then show details form
        setMode("register-details");
      }
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error("Email/Password login is not enabled. Please enable it in the Firebase Console.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIdValid) {
      toast.error("Invalid MMUST ID format");
      return;
    }

    setIsLoading(true);
    try {
      let currentUser = auth.currentUser;
      
      // If no user is logged in, we need to create the account (Email/Password flow)
      if (!currentUser) {
        console.log("Creating new email account...");
        const result = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        currentUser = result.user;
      }
      
      console.log("Updating profile for UID:", currentUser.uid);
      
      await updateProfile(currentUser, {
        displayName: profileData.fullname,
        photoURL: profileData.photoURL
      });

      const profileToSave = {
        fullname: profileData.fullname,
        yearOfStudy: profileData.yearOfStudy,
        studentId: profileData.studentId,
        photoURL: profileData.photoURL || "",
        uid: currentUser.uid,
        email: currentUser.email || "",
        role: "student",
        createdAt: serverTimestamp(),
        followersCount: 0,
        followingCount: 0,
        streakCount: 0
      };

      await setDoc(doc(db, "users", currentUser.uid), profileToSave);
      onSuccess(profileToSave);
      toast.success("Welcome to Ulikula?!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string);
          setProfileData({ ...profileData, photoURL: compressed });
          toast.success("Photo uploaded!");
        } catch (error) {
          toast.error("Failed to process image.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!profileData.fullname) {
      toast.error("Enter your full name first.");
      return;
    }
    setIsGenerating(true);
    try {
      const avatarUrl = await generateProfileAvatar(profileData.fullname);
      const compressed = await compressImage(avatarUrl);
      setProfileData({ ...profileData, photoURL: compressed });
      toast.success("AI Avatar generated!");
    } catch (error) {
      toast.error("Failed to generate AI avatar.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-slate-950/90 backdrop-blur-2xl overflow-hidden border border-white/10 shadow-2xl rounded-3xl text-white">
        <div className="p-8 space-y-8">
          {/* Instagram-style Logo/Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif italic font-bold bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Ulikula?
            </h1>
            <p className="text-sm text-blue-100/50 font-medium">
              {mode === "login" ? "Log in to see what comrades are eating" : 
               mode === "signup" ? "Sign up to share your meal combos" : 
               "Complete your profile"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode !== "register-details" ? (
              <motion.div
                key="auth-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div className="space-y-1">
                    <Input
                      type="email"
                      placeholder="Email"
                      className="bg-white/5 border-white/10 h-11 focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-blue-100/30"
                      value={authData.email}
                      onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="bg-white/5 border-white/10 h-11 focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-blue-100/30 pr-10"
                        value={authData.password}
                        onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-100/30 hover:text-blue-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === "signup" && (
                    <>
                      <div className="space-y-1">
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="bg-white/5 border-white/10 h-11 focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-blue-100/30 pr-10"
                            value={authData.confirmPassword}
                            onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 px-1">
                        <div className={`flex items-center gap-1.5 text-[10px] ${passwordValidation.length ? "text-green-400" : "text-blue-100/30"}`}>
                          <CheckCircle2 className="w-3 h-3" /> 6+ Characters
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] ${passwordValidation.number ? "text-green-400" : "text-blue-100/30"}`}>
                          <CheckCircle2 className="w-3 h-3" /> One Number
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] ${passwordValidation.special ? "text-green-400" : "text-blue-100/30"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Special Char
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] ${passwordValidation.match && authData.confirmPassword ? "text-green-400" : "text-blue-100/30"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Match
                        </div>
                      </div>
                    </>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-bold text-white rounded-lg shadow-lg shadow-blue-500/20"
                    disabled={isLoading || (mode === "signup" && !isPasswordValid)}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === "login" ? "Log In" : "Next")}
                  </Button>
                </form>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-950 px-2 text-blue-100/30 font-bold">OR</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-blue-400 font-bold flex items-center justify-center gap-2 hover:bg-white/5"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  Log in with Google
                </Button>

                {mode === "login" && (
                  <p className="text-center text-xs text-blue-400 cursor-pointer hover:underline">
                    Forgot password?
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="details-fields"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button 
                  onClick={() => setMode("signup")}
                  className="flex items-center text-xs text-blue-100/50 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-white/10 ring-4 ring-white/5">
                      <AvatarImage src={profileData.photoURL} />
                      <AvatarFallback className="bg-white/5 text-blue-100/30">
                        <User className="w-10 h-10" />
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAiGenerate}
                      disabled={isGenerating}
                      className="text-[10px] h-7 border-white/10 bg-white/5 text-white"
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> AI Avatar
                    </Button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>

                <form onSubmit={handleFinalRegister} className="space-y-3">
                  <Input
                    placeholder="Full Name"
                    className="bg-white/5 border-white/10 h-11 text-white placeholder:text-blue-100/30"
                    value={profileData.fullname}
                    onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Year of Study (e.g. Year 2)"
                    className="bg-white/5 border-white/10 h-11 text-white placeholder:text-blue-100/30"
                    value={profileData.yearOfStudy}
                    onChange={(e) => setProfileData({ ...profileData, yearOfStudy: e.target.value })}
                    required
                  />
                  <div className="relative">
                    <Input
                      placeholder="Student ID (COM/B/01-00147/2023)"
                      className={`bg-white/5 border-white/10 h-11 pr-10 text-white placeholder:text-blue-100/30 ${profileData.studentId && !isIdValid ? "border-red-500/50" : ""}`}
                      value={profileData.studentId}
                      onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value.toUpperCase() })}
                      required
                    />
                    {profileData.studentId && (
                      <div className="absolute right-3 top-3.5">
                        {isIdValid ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                      </div>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-bold text-white rounded-lg mt-4 shadow-lg shadow-blue-500/20"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Sign Up"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Toggle */}
        <div className="bg-white/5 p-6 border-t border-white/10 text-center">
          <p className="text-sm text-blue-100/50">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-blue-400 font-bold hover:underline"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
