import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, GraduationCap, IdCard, Camera, Sparkles, Upload, Loader2, Save, ArrowLeft, Heart, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { compressImage } from "@/lib/utils";
import { generateProfileAvatar } from "@/services/gemini";
import { GlassCard } from "./GlassCard";

interface ProfilePageProps {
  profile: any;
  onUpdate: (data: any) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onResetApp: () => Promise<void>;
  onBack: () => void;
  userPosts: any[];
  streaks: any[];
  isAdmin: boolean;
}

export function ProfilePage({ profile, onUpdate, onDeleteAccount, onResetApp, onBack, userPosts, streaks, isAdmin }: ProfilePageProps) {
  const [formData, setFormData] = useState({
    fullname: "",
    yearOfStudy: "",
    studentId: "",
    photoURL: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullname: profile.fullname || "",
        yearOfStudy: profile.yearOfStudy || "",
        studentId: profile.studentId || "",
        photoURL: profile.photoURL || "",
      });
    }
  }, [profile]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mmustIdRegex = /^[A-Z]{3,4}\/[A-Z]\/\d{2}-\d{5}\/\d{4}$/;
  const isIdValid = mmustIdRegex.test(formData.studentId);

  const totalLikes = userPosts.reduce((acc, post) => acc + (post.likesCount || 0), 0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string);
          setFormData({ ...formData, photoURL: compressed });
          toast.success("Photo updated!");
        } catch (error) {
          toast.error("Failed to process image.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const avatarUrl = await generateProfileAvatar(formData.fullname);
      const compressed = await compressImage(avatarUrl);
      setFormData({ ...formData, photoURL: compressed });
      toast.success("AI Avatar generated!");
    } catch (error) {
      toast.error("Failed to generate AI avatar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIdValid) {
      toast.error("Invalid Student ID format. Use: COM/B/01-00147/2023");
      return;
    }
    setIsUpdating(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch (error) {
      toast.error("Failed to delete account.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("CRITICAL: This will delete ALL posts, likes, comments, follows, and streaks. Users will be cleared (except you). This cannot be undone. Proceed?")) return;
    
    setIsResetting(true);
    try {
      await onResetApp();
    } catch (error) {
      toast.error("Failed to reset app.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto py-8 px-4 space-y-8"
    >
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-lg font-bold text-foreground">Profile</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 px-4">
          <div className="relative group">
            <div className="p-[3px] rounded-full bg-gradient-to-tr from-blue-600 to-blue-400">
              <div className="p-[2px] bg-background dark:bg-slate-950 rounded-full">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-none">
                  <AvatarImage src={formData.photoURL} className="object-cover" />
                  <AvatarFallback className="bg-blue-600 text-4xl font-bold text-white">
                    {formData.fullname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            {isGenerating && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">{formData.fullname}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-muted hover:bg-accent text-foreground border-none rounded-lg h-8 px-4 text-xs font-bold"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg h-8 px-4 text-xs font-bold"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete Account
                </Button>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleReset}
                    disabled={isResetting}
                    className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded-lg h-8 px-4 text-xs font-bold"
                  >
                    {isResetting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <AlertTriangle className="w-3 h-3 mr-2" />}
                    Reset App
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8">
              <div className="text-center md:text-left">
                <span className="block text-lg font-bold text-foreground">{userPosts.length}</span>
                <span className="text-xs text-muted-foreground">posts</span>
              </div>
              <div className="text-center md:text-left">
                <span className="block text-lg font-bold text-foreground">{profile.followersCount || 0}</span>
                <span className="text-xs text-muted-foreground">followers</span>
              </div>
              <div className="text-center md:text-left">
                <span className="block text-lg font-bold text-foreground">{profile.followingCount || 0}</span>
                <span className="text-xs text-muted-foreground">following</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">{formData.studentId}</p>
              <p className="text-xs text-muted-foreground">MMUST Student • {formData.yearOfStudy} Year</p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-popover border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-lg font-bold text-foreground">Delete Account?</h3>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This action is permanent. All your posts, likes, and profile data will be deleted forever.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    className="flex-1 text-foreground hover:bg-accent"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streaks Section */}
        <div className="px-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Active Streaks</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {streaks.map((streak) => (
              <GlassCard key={streak.id} className="p-4 flex items-center justify-between border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">SP</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-[8px] px-1 rounded-full text-white font-bold">
                      PARTNER
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Partner Streak</p>
                    <p className="text-[10px] text-muted-foreground">Keep posting to grow!</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-blue-500/10 px-3 py-1 rounded-full">
                  <span className="text-lg font-black text-blue-400">🔥 {streak.count}</span>
                </div>
              </GlassCard>
            ))}
            {streaks.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No active streaks. Follow friends to start one!</p>
            )}
          </div>
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-border bg-muted text-foreground text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    Upload Photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-border bg-muted text-foreground text-xs"
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                  >
                    <Sparkles className="w-3 h-3 mr-2 text-blue-400" />
                    AI Avatar
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <Input
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      className="bg-muted border-border text-foreground focus:border-blue-500 h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Year of Study</Label>
                    <Input
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                      className="bg-muted border-border text-foreground focus:border-blue-500 h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Student ID</Label>
                    <Input
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                      className={`bg-muted border-border text-foreground focus:border-blue-500 h-10 ${!isIdValid ? 'border-red-500/50' : ''}`}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Posts Grid */}
        <div className="border-t border-border pt-8">
          <div className="flex items-center justify-center gap-12 mb-8">
            <div className="flex items-center gap-2 text-foreground border-t-2 border-foreground pt-2 -mt-[34px]">
              <IdCard className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Posts</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {userPosts.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 0.98 }}
                className="relative aspect-square bg-muted rounded-sm overflow-hidden group cursor-pointer"
              >
                {post.videoURL ? (
                  <video 
                    src={post.videoURL} 
                    className="w-full h-full object-cover" 
                    muted 
                    loop 
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                ) : (
                  <img 
                    src={post.imageURL} 
                    alt={post.mealCombo}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">{post.likesCount || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {userPosts.length === 0 && (
            <div className="text-center py-20">
              <Camera className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground">No Posts Yet</h3>
              <p className="text-sm text-muted-foreground">When you share meals, they'll appear here.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


