import { useState, useEffect } from "react";
import { 
  db, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  handleFirestoreError,
  OperationType
} from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { Send, Smile, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Comment {
  id: string;
  userId: string;
  postId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  sticker?: string;
  createdAt: any;
}

interface CommentSectionProps {
  postId: string;
  user: any;
  profile: any;
}

const EMOJIS = ["😋", "🔥", "🙌", "💯", "🤤", "🥗", "🍗", "🍚", "🥤", "❤️"];
const STICKERS = [
  { label: "MMUST Vibes", emoji: "🎓" },
  { label: "Comrade Power", emoji: "✊" },
  { label: "Mess Special", emoji: "🍽️" },
  { label: "Pocket Friendly", emoji: "💰" },
  { label: "Solid Meal", emoji: "🧱" },
];

export function CommentSection({ postId, user, profile }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const path = "comments";
    const q = query(
      collection(db, path),
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, [postId]);

  const handleSubmit = async (e?: React.FormEvent, sticker?: string) => {
    e?.preventDefault();
    if (!user || !profile) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim() && !sticker) return;

    setIsSubmitting(true);
    try {
      const path = "comments";
      const commentData: any = {
        postId,
        userId: user.uid,
        authorName: profile.fullname,
        text: newComment.trim() || (sticker ? `Sent a ${sticker} sticker` : ""),
        createdAt: serverTimestamp(),
      };

      if (profile.photoURL) {
        commentData.authorPhoto = profile.photoURL;
      }
      
      if (sticker) {
        commentData.sticker = sticker;
      }

      await addDoc(collection(db, path), commentData);
      setNewComment("");
      setShowEmojiPicker(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "comments");
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "comments", commentId));
      toast.success("Comment deleted");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
      <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex gap-3 group"
            >
              <Avatar className="h-6 w-6 border border-white/10">
                <AvatarImage src={comment.authorPhoto} />
                <AvatarFallback className="bg-blue-600 text-[8px] text-white">
                  {comment.authorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{comment.authorName}</span>
                  <span className="text-[10px] text-blue-200/40">
                    {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : "just now"}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-sm text-blue-100/90 relative">
                  {comment.sticker && (
                    <div className="text-2xl mb-1">{comment.sticker}</div>
                  )}
                  <p>{comment.text}</p>
                  
                  {(user?.uid === comment.userId || profile?.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="absolute -right-2 -top-2 p-1 bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-center text-xs text-blue-200/40 py-4 italic">
            No comments yet. Be the first to say something!
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="bg-white/5 border-white/10 text-white rounded-xl pr-10 text-sm h-10"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-2.5 text-blue-200/60 hover:text-blue-400 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={isSubmitting || (!newComment.trim())}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-blue-200/60 uppercase tracking-wider">Quick Emojis</span>
                <button onClick={() => setShowEmojiPicker(false)} className="text-blue-200/40 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewComment(prev => prev + emoji)}
                    className="text-xl hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-200/60 uppercase tracking-wider">MMUST Stickers</span>
                <div className="grid grid-cols-2 gap-2">
                  {STICKERS.map(sticker => (
                    <button
                      key={sticker.label}
                      type="button"
                      onClick={() => handleSubmit(undefined, sticker.emoji)}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-2 rounded-lg text-xs text-blue-100 transition-colors border border-white/5"
                    >
                      <span className="text-lg">{sticker.emoji}</span>
                      <span>{sticker.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
