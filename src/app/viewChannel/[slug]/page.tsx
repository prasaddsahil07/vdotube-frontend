"use client";
import { Button } from "@/components/ui/button";
import { InfoIcon, ListVideo, Youtube, Users, Calendar, Play } from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, use } from "react";
import {
  GetUserPlaylists,
  ToggleSubscription,
  checkIfSubscribed,
  formatTimeDifference,
  getChannelStats,
  getUserByID,
  getUserVideos,
} from "@/functions";
import Video from "@/components/video";
import { redirect } from "next/navigation";
import PlaylistCard from "@/components/PlaylistCard";

export default function ViewChannel({ params }: { params: Promise<{ slug: string }> }) {
  const userData = useSelector((state: any) => state.user);
  const user = userData.user[0];
  const resolvedParams = use(params);
  const id = resolvedParams.slug;

  if (!user) {
    redirect("/");
  }

  const [userVideos, setUserVideos] = useState<any>();
  const [userPlaylistData, setUserPlaylistData] = useState<any>();
  const [channelOwner, setChannelOwner] = useState<any>();
  const [channelStats, setChannelStats] = useState<any>();
  const [subscribe, setSubscribe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  //getting user video
  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        const userVideos = await getUserVideos({
          userId: id,
          accessToken: user.accessToken,
        });
        setUserVideos(userVideos);
      } catch (error) {
        console.error("Error fetching user videos:", error);
      }
    };

    fetchUserVideos();
  }, [id, user.accessToken]);

  //getting user by id
  useEffect(() => {
    const fetchVideoOwner = async () => {
      const response = await getUserByID({
        userId: id,
        accessToken: user.accessToken,
      });
      if (response.status === true) {
        setChannelOwner(response.data.data);
        setIsLoading(false);
        // console.log("owner: ", response.data.data);
      } else {
        console.log(response.data.data);
        setIsLoading(false);
      }
    };
    if (user) {
      fetchVideoOwner();
    }
  }, [id, user]);

  //checking if user already subscribed?
  useEffect(() => {
    const checkSubscribed = async () => {
      const response = await checkIfSubscribed({
        accessToken: user.accessToken,
        channelId: channelOwner?._id,
      });

      if (response?.subscribe === true) {
        const data = response.data;
        setSubscribe(data.subscribed);
      } else {
        setSubscribe(false);
      }
    };
    if (channelOwner) {
      checkSubscribed();
    }
  }, [user, channelOwner]);

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
    if (user) {
      getUserPlaylist();
    }
  }, [user]);

  const handleSubscribeButton = () => {
    ToggleSubscription;
    setSubscribe(!subscribe);
    ToggleSubscription({
      channelId: channelOwner?._id,
      accessToken: user.accessToken,
    });
  };

  useEffect(() => {
    const getUserChannel = async () => {
      const stats = await getChannelStats({
        accessToken: user.accessToken,
        channelId: user.id,
      });
      setChannelStats(stats);
    };

    getUserChannel();
  }, [user]);

  // Convert CreatedAt to IST (India Standard Time)
  const createdAtUTC = new Date(channelOwner?.createdAt);
  const createdAtIST = createdAtUTC.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="pt-6 pb-8">
          {/* Cover Image */}
          <div className="relative mb-8 overflow-hidden rounded-2xl shadow-2xl">
            {channelOwner && (
              <div className="relative">
                <Image
                  width={1200}
                  height={300}
                  className="w-full h-48 md:h-64 lg:h-80 object-cover transition-transform duration-300 hover:scale-105"
                  alt="channel banner"
                  src={channelOwner?.coverImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>
            )}
          </div>

          {/* Channel Info Section */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
            {/* Avatar */}
            <div className="flex justify-center lg:justify-start">
              {channelOwner && (
                <div className="relative group">
                  <Image
                    width={160}
                    height={160}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 shadow-xl transition-transform duration-300 group-hover:scale-105"
                    alt="channel avatar"
                    src={channelOwner?.avatar}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
            </div>

            {/* Channel Details */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                  {channelOwner?.fullName}
                </h1>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 text-slate-700">
                  <span className="text-lg font-medium">@{channelOwner?.username}</span>
                  <div className="hidden sm:block w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <Users size={18} className="text-slate-700" />
                    <span className="font-semibold text-white">
                      {channelStats?.totalSubscribers} Subscribers
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscribe Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubscribeButton}
                  className={`
                    px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg
                    ${subscribe 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-500/25' 
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/25'
                    }
                  `}
                >
                  {subscribe ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="border-t border-gray-700"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent h-px"></div>
        </div>

        {/* Tabs Section */}
        <div className="pb-8">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="w-full bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-1 mb-8">
              <TabsTrigger 
                value="videos"
                className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <ListVideo size={20} />
                <span className="font-medium text-gray-200">Videos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="playlist"
                className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Youtube size={20} />
                <span className="font-medium text-gray-200">Playlists</span>
              </TabsTrigger>
              <TabsTrigger 
                value="info"
                className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <InfoIcon size={20} />
                <span className="font-medium text-gray-200">About</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-6">
              {userVideos && userVideos.some((video: any = {}) => video.isPublished) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userVideos.map(
                    (video: any = {}) =>
                      video.isPublished && (
                        <div 
                          key={video._id}
                          className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        >
                          <Video
                            key={video._id}
                            videoId={video._id}
                            title={video.title}
                            videoUrl={video.videoFile}
                            thumbnailUrl={video.thumbnail}
                            owner={id}
                            views={video.view}
                            createdAt={video.createdAt}
                            duration={video.duration}
                            description={video.description}
                            isPublished={video.isPublished}
                            edit={false}
                          />
                        </div>
                      )
                  )}
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Play size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">No videos yet</h3>
                  <p className="text-gray-400">This channel hasn't published any videos.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="playlist" className="space-y-6">
              {userPlaylistData && userPlaylistData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userPlaylistData.map((playlist: any) => {
                    const updatedAt = formatTimeDifference(playlist.updatedAt);
                    const videoCount = playlist.videos ? playlist.videos.length : 0;
                    const thumbnail =
                      playlist &&
                      playlist.videos &&
                      playlist.videos[0] &&
                      playlist.videos[0].thumbnail
                        ? playlist.videos[0].thumbnail
                        : "https://res.cloudinary.com/dlahahicg/image/upload/v1713085405/imgEmpty_n2fiyp.jpg";

                    return (
                      <div 
                        key={playlist._id}
                        className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        <PlaylistCard
                          playlistId={playlist._id}
                          description={playlist.description}
                          owner={user!.fullName}
                          name={playlist.name}
                          thumbnail={thumbnail}
                          videoCount={videoCount}
                          ownerId={playlist.owner}
                          userId={user.id}
                          accessToken={user.accessToken}
                          updatedAt={updatedAt}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Youtube size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">No playlists yet</h3>
                  <p className="text-gray-400">This channel hasn't created any playlists.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-6">
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <InfoIcon size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">About this channel</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-800 font-medium w-24">Channel:</span>
                        <span className="text-white font-semibold">{channelOwner?.fullName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-800 font-medium w-24">Username:</span>
                        <span className="text-white">@{channelOwner?.username}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar size={18} className="text-slate-800" />
                        <span className="text-slate-800 font-medium">Joined:</span>
                        <span className="text-white">{createdAtIST} IST</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Users size={18} className="text-slate-800" />
                        <span className="text-slate-800 font-medium">Subscribers:</span>
                        <span className="text-white font-semibold">{channelStats?.totalSubscribers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}