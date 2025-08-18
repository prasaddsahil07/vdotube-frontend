"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AddComment,
  GetVideoComment,
  LikeVideo,
  ToggleSubscription,
  checkIfSubscribed,
  checkLiked,
  fetchVideoByid,
  formatTimeDifference,
  getAllPublishedVideos,
  getChannelStats,
  getUserByID,
} from "@/functions";
import { ThumbsDown, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import CommentComponent from "@/components/ui/Comment";
import { userActions } from "@/store/userSlice";
import AddVideoToPlaylistComp from "@/components/compUi/addVideoToPlaylist";
import { ScrollArea } from "@/components/ui/scroll-area";
import Video from "@/components/video";

interface VideoData {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  isPublished: boolean;
  owner: string;
  category: string;
  thumbnail: string;
  videoFile: string;
  view: number;
  __v: number;
}

type Video = {
  _id: string;
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  // Add any other properties if needed
};

type MyData = {
  allVideos: Video[];
  channelId: string;
  totalSubscribers: number;
  totalViews: number;
  // Add any other properties if needed
};

export default function ViewVideo({ params }: { params: { slug: any } }) {
  const videoId = params.slug;

  const [videoData, setVideoData] = useState<VideoData>();
  const [liked, setLiked] = useState(false);
  const [videosData, setVideosData] = useState<any>();
  const [videoComments, setVideoComments] = useState<any[]>([]);
  const [subscribe, setSubscribe] = useState(false);
  const [channelStats, setChannelStats] = useState<MyData>();
  const [ownerDetails, setOwnerDetails] = useState<any>();
  const [showRecommended, setShowRecommended] = useState(false);
  const data = useSelector((state: any) => state.user);
  const user = data.user[0];
  const dispatch = useDispatch();

  //comment ref
  const commentRef = useRef<HTMLTextAreaElement>(null);

  if (!user) {
    redirect("/");
  }

  //   //fetching video by id
  useEffect(() => {
    const fetchVideo = async () => {
      const response = await fetchVideoByid({
        videoId,
        accessToken: user.accessToken,
      });

      if (response.status === true) {
        setVideoData(response.data.video);
      } else {
        console.log(response.status);
      }
    };
    if (user) {
      fetchVideo();
    }
  }, [videoId, user]);
  let ownerId: any;

  if (videoData) {
    ownerId = videoData.owner;
  }
  //   //getting video owner details
  useEffect(() => {
    const fetchVideoOwner = async () => {
      const response = await getUserByID({
        userId: ownerId,
        accessToken: user.accessToken,
      });
      if (response.status === true) {
        setOwnerDetails(response.data.data);
      }
    };
    if (ownerId) {
      fetchVideoOwner();
    }
  }, [user, ownerId]);

  //checking if user already liked the video or not
  useEffect(() => {
    const checkLike = async () => {
      const response = await checkLiked({
        accessToken: user.accessToken,
        id: videoId,
      });

      if (response?.liked === true) {
        const data = response.data;
        setLiked(data.liked);
      } else {
        setLiked(false);
      }
    };

    checkLike();
  }, [videoId, user]);

  //checking if user already subscribed?
  useEffect(() => {
    const checkSubscribed = async () => {
      const response = await checkIfSubscribed({
        accessToken: user.accessToken,
        channelId: ownerId,
      });

      if (response?.subscribe === true) {
        const data = response.data;
        setSubscribe(data.subscribed);
      } else {
        setSubscribe(false);
      }
    };
    if (ownerId) {
      checkSubscribed();
    }
  }, [ownerId, user]);

  // fetching channel stats

  useEffect(() => {
    const getUserChannel = async () => {
      const stats = await getChannelStats({
        accessToken: user.accessToken,
        channelId: ownerId,
      });
      setChannelStats(stats);
    };
    if (ownerId) {
      getUserChannel();
    }
  }, [user, ownerId]);

  //adding comment

  const handleAddCommentForm = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const comment = commentRef.current!.value;
    const response = await AddComment({
      accessToken: user.accessToken,
      videoId,
      comment,
    });
    if (response.status === true) {
      dispatch(userActions.isChanged({}));
      commentRef.current!.value = "";
      toast("Comment Added", {
        description: "Comment added successfully",
        action: {
          label: "Okay",
          onClick: () => { },
        },
      });
    } else {
      toast("Failed", {
        description: "failed to add your tweet",
        action: {
          label: "Okay",
          onClick: () => { },
        },
      });
    }
  };

  //getting video Comments

  useEffect(() => {
    const getVideoComments = async () => {
      const response = await GetVideoComment({
        accessToken: user.accessToken,
        videoId,
      });
      if (response.status === true) {
        setVideoComments(response.data.VideoComments);
      } else {
        console.log("Failed to get video comments");
      }
    };

    if (user) {
      getVideoComments();
    }
  }, [user, videoId]);

  const handleLikeButton = async () => {
    setLiked(!liked);
    await LikeVideo({ videoId: videoId, accessToken: user.accessToken });
  };

  const handleSubscribeButton = async () => {
    setSubscribe(!subscribe);
    await ToggleSubscription({
      channelId: ownerId,
      accessToken: user.accessToken,
    });
    const updatedStats = await getChannelStats({
      accessToken: user.accessToken,
      channelId: ownerId,
    });
    setChannelStats(updatedStats);
  };

  const channelSubscribers = channelStats?.totalSubscribers;
  let link;
  if (videoData) {
    link = videoData!.videoFile;
    link = link.replace("http://", "https://");
  }

  const handleCommentCancelButton = () => {
    commentRef.current!.value = "";
  };

  let createdAt;
  if (videoData) {
    createdAt = formatTimeDifference(videoData.createdAt);
  }

  //getting all published videos
  useEffect(() => {
    const fetchVideos = async () => {
      const response = await getAllPublishedVideos({
        accessToken: user.accessToken,
      });
      setVideosData(response.data);
    };

    if (user) {
      fetchVideos();
    }
  }, [user]);

  // Filter function to get recommended videos (excluding current video)
  const getRecommendedVideos = () => {
    if (!videosData || !videoData) return [];

    const allVideos = videosData.data
      .slice()
      .reverse()
      .filter((video: any) => video._id !== videoId); // Exclude current video

    // First, get videos from same category
    const sameCategoryVideos = allVideos
      .filter((video: any) => video.category === videoData.category)
      .slice(0, 7);

    // Then, fill remaining slots with other categories
    const remainingSlots = Math.max(0, 15 - sameCategoryVideos.length);
    const otherVideos = allVideos
      .filter((video: any) =>
        video.category !== videoData.category &&
        !sameCategoryVideos.some((cv: any) => cv._id === video._id)
      )
      .slice(0, remainingSlots);

    return [...sameCategoryVideos, ...otherVideos];
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-col lg:flex-row lg:mx-8 xl:mx-12 gap-6 p-4">
        {/* Main video section */}
        {videoData && (
          <div className="flex-1 lg:max-w-4xl">
            <div className="space-y-6">
              <video
                className="rounded-2xl shadow-lg w-full max-h-[70vh]"
                controls
                poster={videoData.thumbnail}
              >
                <source src={link} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                {videoData.title}
              </h1>

              {/* Views and time with better visibility */}
              <div className="flex items-center text-gray-600 text-sm md:text-base space-x-3">
                <p className="font-medium">{videoData.view.toLocaleString()} views</p>
                <span className="text-gray-400">•</span>
                <p className="font-medium">{createdAt}</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12 md:w-14 md:h-14">
                    <AvatarImage
                      src={ownerDetails?.avatar}
                      alt={ownerDetails?.fullName || "User Avatar"}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-800">
                      {ownerDetails?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg md:text-xl">
                      {ownerDetails?.fullName}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      {channelSubscribers?.toLocaleString()} subscribers
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {subscribe ? (
                    <button
                      onClick={handleSubscribeButton}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-full font-medium transition-colors"
                    >
                      Subscribed
                    </button>
                  ) : (
                    <button
                      onClick={handleSubscribeButton}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
                    >
                      Subscribe
                    </button>
                  )}
                </div>
              </div>

              {/* Like section with better visibility */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors overflow-hidden">
                    <button
                      onClick={handleLikeButton}
                      className="flex items-center space-x-2 px-4 py-2.5 hover:bg-gray-300 transition-colors"
                    >
                      <ThumbsUp
                        size={20}
                        color={liked ? "#ff4444" : "#374151"}
                        fill={liked ? "#ff4444" : "none"}
                      />
                      <span className="text-gray-800 font-medium">Like</span>
                    </button>

                    <div className="w-px h-6 bg-gray-300"></div>

                    <button
                      onClick={handleLikeButton}
                      className="flex items-center px-4 py-2.5 hover:bg-gray-300 transition-colors"
                    >
                      <ThumbsDown size={20} color="#374151" />
                    </button>
                  </div>
                </div>

                <AddVideoToPlaylistComp videoId={videoId} isWatchingPage={true} />
              </div>

              {/* Description section - Fixed for all screen sizes */}
              <div className="mt-6">
                <Accordion
                  className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden"
                  type="single"
                  collapsible
                >
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="text-gray-700 hover:text-gray-900 text-lg px-6 py-4 hover:no-underline font-semibold">
                      Description
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 text-gray-700 text-base leading-relaxed">
                      <div className="whitespace-pre-wrap">
                        {videoData.description}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Comment section with proper count visibility */}
              <div className="mt-8">
                <h2 className="text-xl md:text-2xl font-bold pb-6 text-gray-900">
                  {videoComments?.length || 0} Comments
                </h2>

                <form
                  className="flex flex-col space-y-4 w-full"
                  onSubmit={handleAddCommentForm}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12 md:w-14 md:h-14">
                      <AvatarImage
                        src={user?.avatar}
                        alt={user?.fullName || "User Avatar"}
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-800">
                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <textarea
                      ref={commentRef}
                      rows={1}
                      placeholder="Add a comment..."
                      className="px-0 py-2 w-full text-gray-900 placeholder-gray-500 text-base focus:outline-none bg-transparent border-b-2 border-gray-300 focus:border-blue-500 transition-colors resize-none"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  </div>

                  <div className="flex space-x-3 justify-end">
                    <button
                      className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                      type="button"
                      onClick={handleCommentCancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors font-medium"
                    >
                      Comment
                    </button>
                  </div>
                </form>

                <div className="mt-6 space-y-4">
                  {videoComments &&
                    videoComments
                      .slice()
                      .reverse()
                      .map((comment: any) => (
                        <CommentComponent
                          key={comment._id}
                          commentId={comment._id}
                          comment={comment.content}
                          createdAt={comment.createdAt}
                          ownerId={comment.owner}
                        />
                      ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommended videos section - Fixed for mobile */}
        {videoData && videosData && (
          <>
            {/* Mobile recommended videos - collapsible */}
            <div className="lg:hidden w-full">
              <button
                onClick={() => setShowRecommended(!showRecommended)}
                className="flex items-center justify-between w-full p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                <span>You might also like ({getRecommendedVideos().length})</span>
                {showRecommended ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>

              {showRecommended && (
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                  {getRecommendedVideos().map((video: any) => (
                    <div key={video._id} className="bg-gray-50 border border-gray-200 rounded-xl p-2">
                      <Video
                        videoId={video._id}
                        title={video.title}
                        videoUrl={video.videoFile}
                        thumbnailUrl={video.thumbnail}
                        owner={video.owner}
                        views={video.view}
                        createdAt={video.createdAt}
                        duration={video.duration}
                        description={video.description}
                        edit={false}
                        isPublished={video.isPublished}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop recommended videos */}
            <div className="hidden lg:block lg:w-96 xl:w-[420px]">
              <div className="sticky top-4 border border-gray-200 bg-gray-50 rounded-xl p-4">
                <h2 className="font-bold text-xl text-gray-900 mb-4">
                  You might also like
                </h2>

                <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                  <div className="space-y-3">
                    {getRecommendedVideos().map((video: any) => (
                      <div key={video._id} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Video
                          videoId={video._id}
                          title={video.title}
                          videoUrl={video.videoFile}
                          thumbnailUrl={video.thumbnail}
                          owner={video.owner}
                          views={video.view}
                          createdAt={video.createdAt}
                          duration={video.duration}
                          description={video.description}
                          edit={false}
                          isPublished={video.isPublished}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}