'use client'

import { Label } from '@/components/ui/label';
import { ArrowRightFromLine, BadgeCheck, HardDriveUpload, ImageUp, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { toast } from "sonner"

type Owner = {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatar: string;
    // Add more properties if necessary
}

type VideoData = {
    createdAt: string; // Should be a valid ISO 8601 date string
    description: string;
    duration: number;
    isPublished: boolean;
    owner: Owner;
    thumbnail: string;
    title: string;
    updatedAt: string; // Should be a valid ISO 8601 date string
    videoFile: string;
    view: number;
    __v: number;
    _id: string;
}

export default function VideoUpload() {
    const userData = useSelector((state: any) => state.user)
    const user = userData.user[0]

    if (!user) {
        redirect('/')
    }

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [errorMsg, setErrorMessage] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [videoData, setVideoData] = useState<VideoData>()

    const thumbnailFileInputRef = useRef<HTMLInputElement>(null)
    const videoFileInputRef = useRef<HTMLInputElement>(null)
    const titleRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const handleThumbnailFileSelect = () => {
        thumbnailFileInputRef.current!.click();
    }

    const handleThumbnailFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target!.files![0];
        if (file) {
            // Read the selected file and create a data URL representing the image
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setThumbnailPreview(result); // Set the data URL as the image preview
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoFileSelect = () => {
        videoFileInputRef.current!.click();
    }

    const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target!.files![0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setVideoPreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handelFormSubmittion = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsProcessing(true)

        if (!videoPreview || !thumbnailPreview) {
            setErrorMessage('Either video or thumbnail file is missing.');
            setIsProcessing(false);
            return;
        }

        const selectElement: any = document.getElementById('category');
        const category = selectElement?.value;

        const formData = new FormData();
        formData.append('title', titleRef.current!.value);
        formData.append('description', descriptionRef.current!.value);
        formData.append('thumbnail', thumbnailFileInputRef.current!.files![0]);
        formData.append('video', videoFileInputRef.current!.files![0]);
        formData.append('category', category);

        // Get token from localStorage as fallback
        const token = user?.accessToken || localStorage.getItem("accessToken");
        console.log("Access Token: ", token);

        try {
            const response = await fetch(process.env.url + '/videos', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: formData,
                credentials: 'include',
            })

            console.log("printing response: ", response);

            if (response.ok) {
                const res_data = await response.json()
                setIsProcessing(false)
                setVideoData(res_data.data)
                
                // Reset form values
                if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = '';
                if (videoFileInputRef.current) videoFileInputRef.current.value = '';
                if (titleRef.current) titleRef.current.value = '';
                if (descriptionRef.current) descriptionRef.current.value = '';
                setThumbnailPreview(null)
                setVideoPreview(null)
                setErrorMessage('')

                toast("Video Uploaded", {
                    description: 'Video has been uploaded successfully',
                    action: {
                        label: "Okay",
                        onClick: () => { },
                    },
                })
            } else {
                const error = await response.json()
                setErrorMessage(error.msg)
                setIsProcessing(false)
            }
        } catch (error) {
            toast("Video upload failed", {
                description: "Please try again or after some time",
                action: {
                    label: "Okay",
                    onClick: () => { },
                }
            })
            setIsProcessing(false)
        }
    }

    return (
        <div className='flex flex-col w-screen justify-center items-center px-4'>
            <h2 className='text-4xl font-semibold md:py-12 sm:py-6 underline text-center'>Upload Your Video</h2>
            
            <div className='border p-6 rounded-lg border-input max-w-4xl w-full'>
                {errorMsg && (
                    <div className='bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-6'>
                        {errorMsg}
                    </div>
                )}
                
                <form className='flex flex-col justify-center items-start space-y-8' onSubmit={handelFormSubmittion}>
                    {/* File Upload Section */}
                    <div className='w-full grid md:grid-cols-2 gap-6'>
                        {/* Video Upload */}
                        <div 
                            onClick={handleVideoFileSelect} 
                            className='border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition-colors h-48 flex flex-col justify-center items-center'
                        >
                            <input 
                                type='file' 
                                ref={videoFileInputRef} 
                                accept="video/*" 
                                onChange={handleVideoFileChange} 
                                hidden 
                                name='video' 
                                id='video' 
                            />
                            
                            {videoPreview ? (
                                <div className='text-center'>
                                    <video 
                                        src={videoPreview} 
                                        className='w-32 h-20 object-cover rounded-lg mb-2 mx-auto'
                                        muted
                                    />
                                    <div className='flex items-center justify-center space-x-2 text-green-600'>
                                        <BadgeCheck size={20} />
                                        <span className='text-sm font-medium'>Video Selected</span>
                                    </div>
                                </div>
                            ) : (
                                <div className='text-center'>
                                    <HardDriveUpload size={48} className="text-gray-400 mb-4" />
                                    <h4 className='text-gray-600 font-medium mb-2'>Upload your Video</h4>
                                    <p className='text-sm text-gray-400'>Click to select a video file</p>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Upload */}
                        <div 
                            onClick={handleThumbnailFileSelect} 
                            className='border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition-colors h-48 flex flex-col justify-center items-center'
                        >
                            <input 
                                ref={thumbnailFileInputRef} 
                                accept='image/jpeg, image/png, image/jpg' 
                                onChange={handleThumbnailFileChange} 
                                type='file' 
                                hidden 
                                name='thumbnail' 
                                id='thumbnail' 
                            />
                            
                            {thumbnailPreview ? (
                                <div className='text-center'>
                                    <Image 
                                        src={thumbnailPreview} 
                                        alt="Thumbnail preview"
                                        width={128}
                                        height={80}
                                        className='w-32 h-20 object-cover rounded-lg mb-2 mx-auto'
                                    />
                                    <div className='flex items-center justify-center space-x-2 text-green-600'>
                                        <BadgeCheck size={20} />
                                        <span className='text-sm font-medium'>Thumbnail Selected</span>
                                    </div>
                                </div>
                            ) : (
                                <div className='text-center'>
                                    <ImageUp size={48} className="text-gray-400 mb-4" />
                                    <h4 className='text-gray-600 font-medium mb-2'>Upload Thumbnail</h4>
                                    <p className='text-sm text-gray-400'>Click to select an image</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Details Section */}
                    <div className='w-full space-y-6'>
                        <div className='grid md:grid-cols-2 gap-6'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='title' className='text-sm font-medium text-gray-700'>Video Title</Label>
                                <input 
                                    required 
                                    maxLength={100} 
                                    ref={titleRef} 
                                    type="text" 
                                    name="title" 
                                    id='title' 
                                    placeholder='Enter an engaging title for your video' 
                                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all' 
                                />
                            </div>

                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor="category" className='text-sm font-medium text-gray-700'>Select Video Category</Label>
                                <select 
                                    id="category" 
                                    className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white'
                                >
                                    <option value="general">General</option>
                                    <option value="gaming">Gaming</option>
                                    <option value="tech">Tech</option>
                                    <option value="comedy">Comedy</option>
                                    <option value="music">Music</option>
                                </select>
                            </div>
                        </div>

                        <div className='flex flex-col space-y-2'>
                            <Label htmlFor='description' className='text-sm font-medium text-gray-700'>Video Description</Label>
                            <textarea 
                                required 
                                ref={descriptionRef} 
                                placeholder='Describe your video content...' 
                                id='description' 
                                rows={4}
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-vertical' 
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className='w-full flex justify-center'>
                        <button 
                            type="submit"
                            disabled={isProcessing}
                            className='px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 min-w-[200px] justify-center'
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <HardDriveUpload className="w-5 h-5" />
                                    <span>Upload Video</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Message with Watch Video Button */}
            {videoData?._id && (
                <div className='mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center'>
                    <h3 className='text-lg font-semibold text-green-800 mb-2'>Upload Successful! 🎉</h3>
                    <p className='text-green-600 mb-4'>Your video has been uploaded and is ready to watch</p>
                    
                    <Link 
                        href={`/watchVideo/${videoData._id}`}
                        className='inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-95 active:scale-90'
                    >
                        <Play className="w-5 h-5" />
                        <span>Watch Your Video</span>
                        <ArrowRightFromLine className="w-5 h-5" />
                    </Link>
                </div>
            )}
        </div>
    )
}