"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    LikeTweet,
    checkTweetLiked,
    formatTimeDifference,
    getUserByID,
} from "@/functions";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TweetEditButton } from "./compUi/thoughtEditButton";
import { userActions } from "@/store/userSlice";

export default function Thought({
    userId,
    tweet,
    createdAt,
    accessToken,
    id,
}: {
    userId: string;
    tweet: string;
    createdAt: string;
    accessToken: string;
    id: string;
}) {
    const [ownerDetails, setOwnerDetails] = useState<any>();
    const [tweetOwner, setTweetOwner] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false); // Prevent multiple clicks
    const data = useSelector((state: any) => state.user);
    const user = data.user[0];
    const dispatch = useDispatch();

    //getting tweet owner details
    useEffect(() => {
        const fetchVideoOwner = async () => {
            const response = await getUserByID({ userId, accessToken });
            if (response.status === true) {
                setOwnerDetails(response.data.data);
            } else {
                console.log(response.data.data);
            }
        };
        if (accessToken) {
            fetchVideoOwner();
        }
    }, [accessToken, userId]);

    //liking user tweet
    const handleLikeButton = async () => {
        if (isLiking) return; // Prevent multiple requests
        
        setIsLiking(true);
        
        try {
            const response = await LikeTweet({ tweetId: id, accessToken });
            
            console.log('LikeTweet response:', response); // Debug log
            
            // Check if response exists and has the liked property
            if (response && typeof response.liked === 'boolean') {
                // Use the actual response from backend instead of optimistic update
                setIsLiked(response.liked);
                console.log(response.liked ? 'Tweet liked successfully' : 'Tweet unliked successfully');
            } else {
                console.error('Invalid response from like API:', response);
            }
            
            dispatch(userActions.isChanged({}));
        } catch (error) {
            console.error('Error liking tweet:', error);
        } finally {
            setIsLiking(false);
        }
    };

    //check if logged in user is owner of tweet
    useEffect(() => {
        if (user?.id === ownerDetails?._id) {
            setTweetOwner(true);
        } else {
            setTweetOwner(false);
        }
    }, [user, ownerDetails]);

    //checking if user already liked the tweet or not
    useEffect(() => {
        const checkLike = async () => {
            try {
                const response = await checkTweetLiked({
                    accessToken: user.accessToken,
                    id,
                });

                console.log('checkTweetLiked response:', response); // Debug log

                // Handle the response based on your backend format
                if (response && typeof response.liked === 'boolean') {
                    setIsLiked(response.liked);
                } else if (response && response.data && typeof response.data.liked === 'boolean') {
                    setIsLiked(response.data.liked);
                } else {
                    // If no valid response, assume not liked
                    setIsLiked(false);
                }
            } catch (error) {
                console.error('Error checking like status:', error);
                setIsLiked(false);
            }
        };
        
        if (id && user?.accessToken) {
            checkLike();
        }
    }, [id, user?.accessToken]);

    const formattedTimeDifference = formatTimeDifference(createdAt);
    const tweetContent = tweet;
    
    return (
        <div className="w-80 flex flex-col space-y-4 bg-card px-6 py-4 rounded-3xl shadow-inner shadow-gray-200 hover:scale-105 duration-500">
            <div className="flex space-x-4 items-center">
                <Avatar>
                    <AvatarImage src={ownerDetails?.avatar} />
                    <AvatarFallback>AC</AvatarFallback>
                </Avatar>

                <h3 className="underline">{ownerDetails?.fullName}</h3>
            </div>
            <div className="text-sm flex text-gray-900">
                <p className="w-60">{tweetContent}</p>
            </div>

            <div>
                <Separator className="my-2 sm:w-60 md:w-[160px] bg-white" />
                <div className="flex h-5 items-center space-x-4 text-sm">
                    <p className="text-sm text-gray-400">{formattedTimeDifference}</p>
                    <Separator className="bg-white" orientation="vertical" />
                    
                    <button 
                        onClick={handleLikeButton} 
                        className="flex items-end disabled:opacity-50"
                        disabled={isLiking}
                    >
                        <Star 
                            color={isLiked ? "#FF004D" : "#6c6a6a"} 
                            fill={isLiked ? "#FF004D" : "none"} // Add fill for better visual feedback
                        />
                    </button>

                    {tweetOwner && (
                        <>
                            <Separator className="bg-white" orientation="vertical" />
                            <TweetEditButton tweetId={id} tweet={tweetContent} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}