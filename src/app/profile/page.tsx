'use client'

import Image from "next/image"
import Link from "next/link"
import { useSelector } from "react-redux"
import Video from "@/components/video"
import { useEffect, useState } from "react"
import PlaylistCard from '@/components/PlaylistCard'
import { FolderLock, History, ListVideo, Pencil, ExternalLink, ChevronRight } from "lucide-react"
import { redirect } from "next/navigation"
import { GetUserPlaylists, deleteVideo, formatTimeDifference } from "@/functions"

interface HistoryData {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    duration: number;
    isPublished: boolean;
    owner: any;
    thumbnail: string;
    videoFile: string;
    view: number;
    __v: number;
}

interface Video {
    _id: string;
    createdAt: string;
    description: string;
    name: string;
    owner: any;
    updatedAt: string;
    videos: any[];
    __v: number;
}

type Playlist = {
    _id: string;
    createdAt: string;
    description: string;
    name: string;
    owner: any;
    updatedAt: string;
    videos: Video[];
    __v: number;
};

export default function UserProfile() {
    const [userHistoryData, setUserHistoryData] = useState<HistoryData[]>([]);
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const data = useSelector((state: any) => state.user)
    const user = data.user[0]

    if (!user) {
        redirect('/')
    }

    // Fetching user watch history 
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await fetch(process.env.url + '/users/history', {
                    method: 'Get',
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`
                    }
                })

                if (response.ok) {
                    const res_data = await response.json()
                    const watchHistory = res_data.data
                    setUserHistoryData(watchHistory)
                } else {
                    const error = await response.json()
                    console.log(error)
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchVideo()
    }, [user]);

    // Fetching user playlists
    useEffect(() => {
        const getUserPlaylist = async () => {
            const response = await GetUserPlaylists({ accessToken: user.accessToken, userId: user.id })
            if (response.status === true) {
                setUserPlaylists(response.data.data)
            } else {
                console.log('Error fetching user playlist')
            }
        }
        if (user) {
            getUserPlaylist()
        }
    }, [user])

    const publicVideos = userHistoryData.filter(video => video.isPublished);
    const privateVideos = userHistoryData.filter(video => !video.isPublished);

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
                {user && (
                    <div className="space-y-16">
                        {/* Enhanced Profile Header */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 shadow-sm border border-slate-200">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                                    <Link 
                                        href={`/viewChannel/${user.id}`} 
                                        className="group flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-all duration-300 hover:opacity-90"
                                    >
                                        <div className="relative">
                                            <Image 
                                                width={120} 
                                                height={120} 
                                                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300" 
                                                src={user.avatar} 
                                                alt="user image" 
                                            />
                                            <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="text-center sm:text-left space-y-2">
                                            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-slate-800 group-hover:text-slate-600 transition-colors duration-300">
                                                {user.fullName}
                                            </h1>
                                            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500">
                                                <span className="font-medium">@{user.username}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-600 transition-colors duration-300 flex items-center gap-1">
                                                    Explore Your Channel <ExternalLink size={14} />
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center sm:justify-start gap-6 text-sm text-slate-400 pt-2">
                                                <span className="flex items-center gap-1">
                                                    <ListVideo size={16} />
                                                    {userPlaylists.length} Playlists
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <History size={16} />
                                                    {publicVideos.length} Public Videos
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    <div className="flex-shrink-0">
                                        <Link 
                                            href='/editProfile'
                                            className="group inline-flex items-center gap-3 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-xl font-medium shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300"
                                        >
                                            <span>Edit Profile</span>
                                            <Pencil size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced History Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <History size={24} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Watch History</h2>
                                        <p className="text-sm text-slate-500">Recently watched videos</p>
                                    </div>
                                </div>
                                {publicVideos.length > 8 && (
                                    <button className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200">
                                        View All <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                {publicVideos.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {publicVideos.slice(0, 8).map((video) => (
                                            <div key={video._id} className="group">
                                                <Video
                                                    videoId={video._id}
                                                    title={video.title}
                                                    videoUrl={video.videoFile}
                                                    thumbnailUrl={video.thumbnail}
                                                    owner={video.owner._id}
                                                    views={video.view}
                                                    createdAt={video.createdAt}
                                                    duration={video.duration}
                                                    description={video.description}
                                                    isPublished={video.isPublished}
                                                    edit={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <History size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p className="font-medium">No watch history yet</p>
                                        <p className="text-sm">Start watching videos to see your history here</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Enhanced Private Videos Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <FolderLock size={24} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Private Videos</h2>
                                        <p className="text-sm text-slate-500">Videos visible only to you</p>
                                    </div>
                                </div>
                                <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
                                    {privateVideos.length} Private
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                {privateVideos.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {privateVideos.map((video) => (
                                            <div key={video._id} className="group">
                                                <Video
                                                    videoId={video._id}
                                                    title={video.title}
                                                    videoUrl={video.videoFile}
                                                    thumbnailUrl={video.thumbnail}
                                                    owner={video.owner._id}
                                                    views={video.view}
                                                    createdAt={video.createdAt}
                                                    duration={video.duration}
                                                    description={video.description}
                                                    isPublished={video.isPublished}
                                                    edit={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <FolderLock size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p className="font-medium">No private videos</p>
                                        <p className="text-sm">Upload videos and keep them private for personal use</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Enhanced Playlists Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <ListVideo size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Playlists</h2>
                                        <p className="text-sm text-slate-500">Your curated video collections</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                                    {userPlaylists.length} Collections
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                {userPlaylists.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {userPlaylists.map((playlist: any) => {
                                            const updatedAt = formatTimeDifference(playlist.updatedAt)
                                            const videoCount = playlist.videos ? playlist.videos.length : 0;
                                            const thumbnail = playlist && playlist.videos && playlist.videos[0] && playlist.videos[0].thumbnail ? 
                                                playlist.videos[0].thumbnail : 
                                                'https://res.cloudinary.com/dlahahicg/image/upload/v1713085405/imgEmpty_n2fiyp.jpg';

                                            return (
                                                <div key={playlist._id} className="group">
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
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <ListVideo size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p className="font-medium">No playlists created yet</p>
                                        <p className="text-sm">Create playlists to organize your favorite videos</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    )
}