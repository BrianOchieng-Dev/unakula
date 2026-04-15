import { Utensils, User as UserIcon, LogOut, MessageSquare, Moon, Sun, Settings, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onMyPostsClick: () => void;
  onAddClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function Navbar({ user, onLogin, onLogout, onProfileClick, onMyPostsClick, onAddClick, isDarkMode, toggleDarkMode }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl px-6 py-2 shadow-lg">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-1.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Utensils className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
            Ulikula?
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Button
              onClick={onAddClick}
              className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 h-9 text-xs font-bold shadow-lg shadow-blue-500/20 items-center gap-2 mr-2"
            >
              <PlusSquare className="w-4 h-4" />
              Post Meal
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-xl text-foreground/70 hover:bg-accent h-9 w-9"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full p-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-blue-600 to-blue-400">
                  <div className="p-[1px] bg-background dark:bg-slate-950 rounded-full">
                    <Avatar className="h-7 w-7 border-none">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback className="bg-blue-600 text-white text-[10px]">
                        {user.displayName?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-border text-popover-foreground rounded-2xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{user.displayName}</p>
                      <p className="text-[10px] leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={onProfileClick} className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg m-1">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-xs">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMyPostsClick} className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg m-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs">My Posts</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="flex items-center gap-2 text-red-400 focus:text-red-400 cursor-pointer hover:bg-red-400/10 rounded-lg m-1" onClick={onLogout}>
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={onLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 h-9 text-xs font-bold shadow-lg shadow-blue-500/20"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

