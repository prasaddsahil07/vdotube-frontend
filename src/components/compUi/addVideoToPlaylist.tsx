"use client";

import {
  AddVideoToPlaylist,
  CreatePlaylist,
  GetUserPlaylists,
} from "@/functions";
import { userActions } from "@/store/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EllipsisVertical, Plus, PlaySquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export default function AddVideoToPlaylistComp({
  videoId,
  isWatchingPage,
}: {
  videoId: string;
  isWatchingPage: boolean;
}) {
  const data = useSelector((state: any) => state.user);
  const user = data.user[0];
  const dispatch = useDispatch();
  const [userPlaylistData, setUserPlaylistData] = useState<any>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //creating new playlists

  const handleButtonClick = async (playlistId: string) => {
    const response = await AddVideoToPlaylist({
      accessToken: user.accessToken,
      videoId,
      playlistId,
    });
    if (response.status === true) {
      dispatch(userActions.isChanged({}));
      toast("Video Added", {
        description: "Video added to playlist successfully",
        action: {
          label: "Okay",
          onClick: () => {},
        },
      });
    } else {
      toast("Failed", {
        description: "failed to add video to playlist",
        action: {
          label: "Okay",
          onClick: () => {},
        },
      });
    }
  };

  //getting user Playlists
  useEffect(() => {
    const getUserPlaylist = async () => {
      const response = await GetUserPlaylists({
        accessToken: user.accessToken,
        userId: user.id,
      });
      if (response.status === true) {
        setUserPlaylistData(response.data.data);
      } else {
        console.log("Error fetching user playlist");
      }
    };
    if (user && isWatchingPage) {
      getUserPlaylist();
    }
  }, [user, isWatchingPage]);

  //new Playlist

  const handleFormSubmittion = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsPosting(true);
    const selectElement: any = document.getElementById("category");
    const category = selectElement?.value;
    const fd = new FormData(event.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const name = data.name;
    const description = data.description;

    const response = await CreatePlaylist({
      accessToken: user.accessToken,
      category,
      description,
      name,
    });
    if (response.status === true) {
      setIsPosting(false);
      setIsDialogOpen(false);
      dispatch(userActions.isChanged({}));
      toast("Playlist Created", {
        description: "Playlist has been created successfully",
        action: {
          label: "Okay",
          onClick: () => {},
        },
      });
    } else {
      setIsPosting(false);
      toast("Failed", {
        description: "Error while creating playlist",
        action: {
          label: "Okay",
          onClick: () => {},
        },
      });
    }
  };

  return (
    <div className="h-5">
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <EllipsisVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
          {isWatchingPage && (
            <>
              <DropdownMenuLabel className="text-gray-900 dark:text-gray-100 font-semibold px-2 py-2">
                Add To Playlist
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              {userPlaylistData && userPlaylistData.length > 0 ? (
                userPlaylistData.map((playlist: any) => (
                  <DropdownMenuItem 
                    key={playlist._id}
                    className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
                  >
                    <button 
                      onClick={() => handleButtonClick(playlist._id)}
                      className="w-full text-left flex items-center space-x-2 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      <PlaySquare className="w-4 h-4" />
                      <span className="truncate">{playlist.name}</span>
                    </button>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    No playlists found
                  </span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            </>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div 
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                <DropdownMenuItem 
                  className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                    <Plus className="w-4 h-4" />
                    <span>Create New Playlist</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100 text-center text-xl font-semibold">
                  Create New Playlist
                </DialogTitle>
              </DialogHeader>

              <form
                className="flex pt-6 flex-col space-y-6"
                onSubmit={handleFormSubmittion}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                      Playlist Name
                    </Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Enter playlist name"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400" 
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-medium">
                      Category
                    </Label>
                    <select
                      className="w-full h-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      id="category"
                      defaultValue="general"
                    >
                      <option value="general">General</option>
                      <option value="gaming">Gaming</option>
                      <option value="tech">Tech</option>
                      <option value="comedy">Comedy</option>
                      <option value="music">Music</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700 dark:text-gray-300 font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Add a description for your playlist (optional)"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isPosting}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      isPosting
                        ? "bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                    }`}
                  >
                    {isPosting ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </span>
                    ) : (
                      "Create Playlist"
                    )}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}