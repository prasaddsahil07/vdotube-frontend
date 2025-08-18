'use client'

import PlaylistVideo from "@/components/PlaylistVideo"
import { GetPlaylistById, formatTimeDifference, getUserByID } from "@/functions"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function PlaylistInfo({params}:{params: {slug:string}}) {
    const playlistId = params.slug 
    const data =  useSelector((state:any) => state.user)
    const user = data.user[0]  
    const [playlistData, setPlaylistData] = useState<any>({})
    const[ownerDetails, setOwnerDetails] = useState<any>({})

    if(!user){
        redirect('/')
    }

    //getting playlist
    useEffect(()=>{
        const getPlaylistData = async() => {
            const response = await GetPlaylistById({playlistId, accessToken:user.accessToken})

            if(response.status===true){
                setPlaylistData(response.data.data)
            } else{
                console.log('error fetching data')
            }
        }
        if(user){
            getPlaylistData()
        } 
    }, [playlistId,user])

    //getting playlist owner details
    useEffect(()=> { 
        const fetchPlaylistOwner = async() => { 
         const response = await getUserByID({userId:playlistData?.owner, accessToken:user.accessToken})
         if(response.status === true){
          setOwnerDetails(response.data)
    
         }
         else{
          console.log(response.data)
         } 
         
         
        }
        if(playlistData.owner) {
          fetchPlaylistOwner()
     
        }
      }, [user, playlistData])

      let updatedAt;
      let videoCount;

      if(playlistData){
        updatedAt = formatTimeDifference(playlistData.updatedAt)
        videoCount = playlistData.videos ? playlistData.videos.length : 0;
      }

      
  return (
    <div className="min-h-screen">
      {playlistData?
      <div>
        {/* Header Section with improved contrast and layout */}
        <div className="relative w-full">
          <div className="bg-gradient-to-t from-gray-700 via-gray-800 to-black px-6 sm:px-12 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                
                {/* Playlist Info Section */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                      {playlistData.name}
                    </h1>
                    
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-blue-300 font-semibold text-sm uppercase tracking-wide">
                          Description:
                        </span>
                        <p className="text-gray-200 text-base leading-relaxed">
                          {playlistData.description || "No description available"}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-green-300 font-semibold text-sm uppercase tracking-wide">
                            Total Videos:
                          </span>
                          <span className="text-white font-bold text-lg">
                            {videoCount}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wide">
                            Category:
                          </span>
                          <span className="text-gray-200 font-medium">
                            {playlistData.category || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owner Details Section */}
                <div className="lg:w-80">
                  {ownerDetails && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {ownerDetails.fullName?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="text-white font-bold text-lg">
                            {ownerDetails.fullName}
                          </h3>
                          <p className="text-gray-300 text-sm">Playlist Owner</p>
                        </div>
                        
                        <div className="pt-2 border-t border-white/20">
                          <p className="text-gray-300 text-sm">
                            Last updated: <span className="text-blue-300 font-medium">{updatedAt}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8">
          {videoCount > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Videos ({videoCount})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {playlistData.videos.map((video:any) => (
                  <PlaylistVideo
                    key={video._id}
                    videoId={video.video}
                    playlistId={playlistId}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-800/50 rounded-lg p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-100 font-semibold text-lg mb-2">No Videos Yet</h3>
                <p className="text-gray-200 text-sm">This playlist is empty. Videos will appear here once they're added.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      :
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.069M6.343 6.343A8 8 0 1018.343 18.343 8 8 0 006.343 6.343z" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-2xl mb-2">Playlist Not Found</h2>
          <p className="text-gray-400">The playlist you're looking for doesn't exist or may have been removed.</p>
        </div>
      </div>}
    </div>
  )
}