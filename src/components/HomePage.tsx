'use client'

import { getAllPublishedVideos } from "@/functions"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import { Search, X } from "lucide-react"
import Video from "./video"

export default function HomePage() {
    const [videosData, setVideosData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)
    const [initialLoad, setInitialLoad] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    
    const userData = useSelector((state: any) => state.user)
    const user = userData.user[0]

    // Filter videos based on search query
    const filteredVideos = useMemo(() => {
        if (!searchQuery.trim()) return videosData
        
        return videosData.filter(video => 
            video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [videosData, searchQuery])

    // Clear search
    const clearSearch = () => {
        setSearchQuery("")
    }
    // Initial load of videos
    const fetchVideos = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
        if (loading) return
        
        setLoading(true)
        
        try {
            // Modify this based on your API - assuming it supports pagination
            const response = await getAllPublishedVideos({ 
                accessToken: user.accessToken
            })
            
            if (response.data && response.data.data) {
                const newVideos = response.data.data
                
                if (reset) {
                    setVideosData(newVideos)
                } else {
                    setVideosData(prev => [...prev, ...newVideos])
                }
                
                // Check if there are more videos to load
                setHasMore(newVideos.length === 12) // If we got less than 12, no more videos
            }
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setLoading(false)
            setInitialLoad(false)
        }
    }, [user?.accessToken, loading])

    // Initial load
    useEffect(() => {
        if (user && initialLoad) {
            fetchVideos(1, true)
        }
    }, [user, fetchVideos, initialLoad])

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (loading || !hasMore) return

        const scrollTop = document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight

        // Load more when user is 200px from bottom
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchVideos(nextPage, false)
        }
    }, [loading, hasMore, page, fetchVideos])

    // Add scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    if (initialLoad && loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* Header with Search */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="md:text-4xl sm:text-3xl font-bold">Latest Videos</h2>
                        <p className="md:text-sm sm:text-[12px] text-gray-600 mt-1">
                            Discover amazing content from our community
                        </p>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search videos by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Results Info */}
                {searchQuery && (
                    <div className="mb-4 text-sm text-gray-600">
                        {filteredVideos.length > 0 ? (
                            <p>Found {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} matching "{searchQuery}"</p>
                        ) : (
                            <p>No videos found matching "{searchQuery}"</p>
                        )}
                    </div>
                )}
                
                {/* Videos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredVideos.map((video: any) => (
                        <Video
                            key={video._id}
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
                    ))}
                </div>

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Loading more videos...</span>
                    </div>
                )}

                {/* No More Videos Message - Only show when not searching */}
                {!searchQuery && !hasMore && videosData.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                        You've reached the end! No more videos to load.
                    </div>
                )}

                {/* No Videos Found */}
                {!loading && filteredVideos.length === 0 && !searchQuery && (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No videos found</h3>
                        <p className="text-gray-500">Be the first to upload a video!</p>
                    </div>
                )}

                {/* No Search Results */}
                {searchQuery && filteredVideos.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-medium text-gray-700 mb-2">No videos match your search</h3>
                        <p className="text-gray-500">Try searching with different keywords</p>
                        <button 
                            onClick={clearSearch}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}