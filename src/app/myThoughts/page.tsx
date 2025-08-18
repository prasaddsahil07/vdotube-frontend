"use client";

import { Plus } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllTweets, getUserLikedTweets, getUserTweets } from "@/functions";
import { useDispatch, useSelector } from "react-redux";
import { redirect } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import Tweets from "@/components/Thought";
import { userActions } from "@/store/userSlice";

export default function MyThoughts() {
    const [allTweets, setAllTweets] = useState<any>([]);
    const [userTweets, setUserTweets] = useState<any>([]);
    const [userLikedTweets, setUserLikedTweets] = useState<any>([]);
    const [isPosting, setIsPosting] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const data = useSelector((state: any) => state.user);
    const user = data.user[0];
    const dispatch = useDispatch();

    if (!user) {
        redirect("/");
    }
    //getting all tweets
    const getTweets = useCallback(async () => {
        const response = await getAllTweets({ accessToken: user.accessToken });
        if (response.status === true) {
            const res_data = response.data;
            setAllTweets(res_data.data);
        } else {
            console.log(response.data);
        }
    }, [user.accessToken]);

    useEffect(() => {
        getTweets();
    }, [user, getTweets]);

    //getting logged in User tweets

    useEffect(() => {
        const fetchUserTweet = async () => {
            const response = await getUserTweets({
                accessToken: user.accessToken,
                userId: user.id,
            });

            if (response.status === true) {
                const data = response.data.data;
                setUserTweets(data);
            } else {
                console.log(response.data);
            }
        };
        if (user) {
            fetchUserTweet();
        }
    }, [user]);

    //getting logged in user liked tweets
    useEffect(() => {
        const likedTweets = async () => {
            const response = await getUserLikedTweets({
                accessToken: user.accessToken,
            });

            if (response.status === true) {
                setUserLikedTweets(response.data.data);
            } else {
                console.log("error" + response.data);
            }
        };
        if (user) {
            likedTweets();
        }
    }, [user]);

    //  posting new tweet
    const handleFormSubmittion = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setIsPosting(true);
        const fd = new FormData(event.currentTarget);
        const data = Object.fromEntries(fd.entries());
        const tweet = {
            tweet: data.tweet,
        };

        const response = await fetch(process.env.url + "/tweets", {
            method: "POST",

            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tweet),
        });

        if (response.ok) {
            const res_data = await response.json();
            dispatch(userActions.isChanged({}));
            buttonRef.current?.click();
            // After posting successfully, refetch tweets
            getTweets();
        } else {
            const error = await response.json();
            console.log(error);
        }
        setIsPosting(false);
    };

    return (
        <div className="min-h-screen pt-20 pb-12">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    {/* Header with Create Button */}
                    <div className="flex justify-center items-center mb-8">
                        <div className="flex-1 max-w-4xl">
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                                The conversation starts here
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Join the platform for Web enthusiasts and access the latest
                                discussions, news, and insights.
                            </p>
                        </div>
                        
                        {/* Floating Create Button */}
                        <div className="ml-8 flex-shrink-0">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="group relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                                        <div className="relative bg-accent hover:bg-accent/80 p-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300">
                                            <Plus size={24} className="text-accent-foreground" />
                                        </div>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader className="space-y-4">
                                        <DialogTitle className="text-xl font-semibold text-center">
                                            What&apos;s on your mind?
                                        </DialogTitle>
                                        <DialogDescription className="text-center text-muted-foreground">
                                            Share your thoughts with the community
                                        </DialogDescription>
                                    </DialogHeader>
                                    
                                    <form
                                        className="space-y-6 pt-4"
                                        onSubmit={handleFormSubmittion}
                                    >
                                        <Textarea 
                                            name="tweet" 
                                            placeholder="Type your thoughts here..."
                                            className="min-h-[120px] resize-none"
                                            required
                                        />

                                        <div className="flex justify-end">
                                            {isPosting ? (
                                                <button
                                                    disabled
                                                    className="px-6 py-2.5 bg-gray-400 text-white rounded-lg font-medium animate-pulse cursor-not-allowed"
                                                >
                                                    Posting...
                                                </button>
                                            ) : (
                                                <button 
                                                    type="submit"
                                                    className="px-6 py-2.5 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                                                >
                                                    Post Thought
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                    
                                    <DialogClose asChild>
                                        <button ref={buttonRef} className="hidden">
                                            close
                                        </button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-6xl mx-auto">
                    <Tabs defaultValue="AllTweets" className="w-full">
                        {/* Enhanced Tabs Header */}
                        <div className="flex justify-center mb-12">
                            <TabsList className="bg-gray-900 p-1 rounded-xl shadow-lg border border-gray-700">
                                <TabsTrigger 
                                    value="AllTweets" 
                                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md"
                                >
                                    Home
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="YourTweets"
                                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md"
                                >
                                    Your Thoughts
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="LikedTweets"
                                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md"
                                >
                                    Liked Thoughts
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tabs Content */}
                        <div className="space-y-8">
                            <TabsContent value="AllTweets" className="mt-0">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold text-white mb-2">Latest Thoughts</h2>
                                    <p className="text-muted-foreground">Discover what the community is thinking about</p>
                                </div>
                                {allTweets && allTweets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {allTweets
                                            .slice()
                                            .reverse()
                                            .map((tweet: any) => (
                                                <Tweets
                                                    key={tweet._id}
                                                    id={tweet._id}
                                                    tweet={tweet.content}
                                                    createdAt={tweet.createdAt}
                                                    userId={tweet.owner}
                                                    accessToken={user.accessToken}
                                                />
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="text-muted-foreground">
                                            <p className="text-lg mb-2">No thoughts yet</p>
                                            <p className="text-sm">Be the first to share your thoughts!</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="YourTweets" className="mt-0">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold text-white mb-2">Your Thoughts</h2>
                                    <p className="text-muted-foreground">All the thoughts you&apos;ve shared</p>
                                </div>
                                {userTweets && userTweets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {userTweets
                                            .slice()
                                            .reverse()
                                            .map((tweet: any) => (
                                                <Tweets
                                                    key={tweet._id}
                                                    id={tweet._id}
                                                    tweet={tweet.content}
                                                    createdAt={tweet.createdAt}
                                                    userId={tweet.owner}
                                                    accessToken={user.accessToken}
                                                />
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="text-muted-foreground">
                                            <p className="text-lg mb-2">You haven&apos;t shared any thoughts yet</p>
                                            <p className="text-sm">Click the + button to share your first thought!</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="LikedTweets" className="mt-0">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold text-white mb-2">Liked Thoughts</h2>
                                    <p className="text-muted-foreground">Thoughts that caught your attention</p>
                                </div>
                                {userLikedTweets && userLikedTweets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {userLikedTweets.map((item: any, index: number) => {
                                            return item
                                                .slice()
                                                .reverse()
                                                .map((tweet: any) => (
                                                    <Tweets
                                                        key={`${tweet._id}-${index}`}
                                                        id={tweet._id}
                                                        tweet={tweet.content}
                                                        createdAt={tweet.createdAt}
                                                        userId={tweet.owner}
                                                        accessToken={user.accessToken}
                                                    />
                                                ));
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="text-muted-foreground">
                                            <p className="text-lg mb-2">No liked thoughts yet</p>
                                            <p className="text-sm">Like thoughts you find interesting!</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}