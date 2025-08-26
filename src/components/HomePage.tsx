'use client'

import { getAllPublishedVideos } from "@/functions"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useSelector } from "react-redux"
import { Search, X } from "lucide-react"
import Video from "./video"

export default function HomePage() {
    const [videosData, setVideosData] = useState<any[]>([])
    const [loading, setLoading] = useState(true) // Start with loading true
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    
    const userData = useSelector((state: any) => state.user)
    const user = userData?.user?.[0]

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

    // Fetch videos function
    const fetchVideos = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
        if (!user?.accessToken) return
        
        // Only set loading for additional pages, not initial load
        if (!reset) setLoading(true)
        
        try {
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
                
                setHasMore(newVideos.length === 12)
            }
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.accessToken])

    // Single useEffect to handle video fetching
    useEffect(() => {
        if (user?.accessToken) {
            fetchVideos(1, true)
        } else {
            setLoading(false)
        }
    }, [user?.accessToken, fetchVideos])

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (loading || !hasMore || !user?.accessToken) return

        const scrollTop = document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight

        if (scrollTop + clientHeight >= scrollHeight - 200) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchVideos(nextPage, false)
        }
    }, [loading, hasMore, page, fetchVideos, user?.accessToken])

    // Add scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    // Show loading screen only when initially loading and no videos yet
    if (loading && videosData.length === 0) {
        return (
            <div className="min-h-screen w-full flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading videos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header with Search */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Latest Videos</h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            Discover amazing content from our community
                        </p>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search videos..."
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
                    <div className="mb-6 text-sm text-gray-600">
                        {filteredVideos.length > 0 ? (
                            <p>Found {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} matching "{searchQuery}"</p>
                        ) : (
                            <p>No videos found matching "{searchQuery}"</p>
                        )}
                    </div>
                )}
                
                {/* Videos Grid - Properly centered */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                    {filteredVideos.map((video: any) => (
                        <div key={video._id} className="w-full max-w-sm">
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

                {/* Loading More Indicator */}
                {loading && videosData.length > 0 && (
                    <div className="w-full flex justify-center items-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <span className="mt-2 text-gray-600 text-sm">Loading more videos...</span>
                        </div>
                    </div>
                )}

                {/* No More Videos */}
                {!searchQuery && !hasMore && videosData.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                        You've reached the end! No more videos to load.
                    </div>
                )}

                {/* Empty States */}
                {!loading && filteredVideos.length === 0 && (
                    <div className="text-center py-16">
                        {searchQuery ? (
                            <>
                                <h3 className="text-xl font-medium text-gray-700 mb-2">No videos match your search</h3>
                                <p className="text-gray-500 mb-4">Try searching with different keywords</p>
                                <button 
                                    onClick={clearSearch}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Clear Search
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-medium text-gray-700 mb-2">No videos found</h3>
                                <p className="text-gray-500">Be the first to upload a video!</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}