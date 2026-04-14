import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Utensils, MapPin, DollarSign, Info, Loader2, Sparkles } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isGeneratingImage: boolean;
}

export function CreatePostModal({ isOpen, onClose, onSubmit, isGeneratingImage }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    mealCombo: "",
    location: "",
    price: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
      });
      setFormData({ mealCombo: "", location: "", price: "", description: "" });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/10 backdrop-blur-2xl border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Share Your Meal
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="mealCombo">Meal Combo</Label>
            <div className="relative">
              <Utensils className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <Input
                id="mealCombo"
                placeholder="e.g. Ugali, Sukuma & Beef"
                className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-blue-100/30"
                value={formData.mealCombo}
                onChange={(e) => setFormData({ ...formData, mealCombo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                <Input
                  id="location"
                  placeholder="e.g. Mess, Kibandaski"
                  className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-blue-100/30"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (Ksh)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                <Input
                  id="price"
                  type="number"
                  placeholder="150"
                  className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 text-white placeholder:text-blue-100/30"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <div className="relative">
              <Info className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <Textarea
                id="description"
                placeholder="Tell us more about the taste..."
                className="pl-10 bg-white/5 border-white/10 focus:border-blue-500 min-h-[100px] text-white placeholder:text-blue-100/30"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
            <p className="text-xs text-blue-100/70">
              Ulikula? AI will automatically generate a delicious image for your meal combo!
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading || isGeneratingImage}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl shadow-lg shadow-blue-500/20 mt-4"
          >
            {loading || isGeneratingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isGeneratingImage ? "Generating AI Image..." : "Posting..."}
              </>
            ) : (
              "Post Combo"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
