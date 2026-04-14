import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

interface Story {
  id: string;
  name: string;
  photoURL?: string;
  isTrending?: boolean;
}

interface StoriesProps {
  stories: Story[];
}

export function Stories({ stories }: StoriesProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {stories.map((story, i) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
        >
          <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 group-hover:scale-105 transition-transform">
            <div className="p-[2px] bg-slate-950 rounded-full">
              <Avatar className="h-16 w-16 border-2 border-transparent">
                <AvatarImage src={story.photoURL} className="object-cover" />
                <AvatarFallback className="bg-blue-600 text-white font-bold">
                  {story.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            {story.isTrending && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full border border-slate-950">
                HOT
              </div>
            )}
          </div>
          <span className="text-[10px] text-blue-100/70 font-medium max-w-[64px] truncate">
            {story.name.split(' ')[0]}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
