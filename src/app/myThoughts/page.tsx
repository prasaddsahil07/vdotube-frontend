"use client";

import { Plus, MessageSquare, Heart, User, Home } from "lucide-react";
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
            getTweets();
        } else {
            const error = await response.json();
            console.log(error);
        }
        setIsPosting(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
                
                {/* Clean Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">My Thoughts</h1>
                            <p className="text-muted-foreground">Share and explore ideas with the community</p>
                        </div>
                        
                        {/* Simple Create Button */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm">
                                    <Plus size={20} />
                                    New Thought
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold">Share Your Thoughts</DialogTitle>
                                    <DialogDescription>
                                        What's on your mind today?
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <form className="space-y-4 mt-4" onSubmit={handleFormSubmittion}>
                                    <Textarea 
                                        name="tweet" 
                                        placeholder="Share what you're thinking about..."
                                        className="min-h-[100px] resize-none border-input"
                                        required
                                    />

                                    <div className="flex justify-end gap-3">
                                        <DialogClose asChild>
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </DialogClose>
                                        {isPosting ? (
                                            <button
                                                disabled
                                                className="px-6 py-2 bg-accent/50 text-accent-foreground rounded-lg font-medium cursor-not-allowed"
                                            >
                                                Posting...
                                            </button>
                                        ) : (
                                            <button 
                                                type="submit"
                                                className="px-6 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium transition-colors duration-200"
                                            >
                                                Post
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

                {/* Clean Tabs Section */}
                <Tabs defaultValue="AllTweets" className="w-full">
                    <div className="mb-8">
                        <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
                            <TabsTrigger 
                                value="AllTweets" 
                                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                <Home size={16} />
                                All Thoughts
                            </TabsTrigger>
                            <TabsTrigger 
                                value="YourTweets"
                                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                <User size={16} />
                                Your Thoughts
                            </TabsTrigger>
                            <TabsTrigger 
                                value="LikedTweets"
                                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                <Heart size={16} />
                                Liked
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-6">
                        <TabsContent value="AllTweets" className="mt-0 space-y-6">
                            <div className="border-b border-border pb-4">
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <MessageSquare size={20} className="text-muted-foreground" />
                                    Community Thoughts
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {allTweets?.length || 0} thoughts shared by the community
                                </p>
                            </div>
                            
                            {allTweets && allTweets.length > 0 ? (
                                <div className="space-y-4">
                                    {allTweets
                                        .slice()
                                        .reverse()
                                        .map((tweet: any) => (
                                            <div key={tweet._id} className="bg-card border border-border rounded-lg p-1 hover:shadow-sm transition-shadow duration-200">
                                                <Tweets
                                                    id={tweet._id}
                                                    tweet={tweet.content}
                                                    createdAt={tweet.createdAt}
                                                    userId={tweet.owner}
                                                    accessToken={user.accessToken}
                                                />
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-card border border-border rounded-lg">
                                    <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No thoughts yet</h3>
                                    <p className="text-muted-foreground">Be the first to share your thoughts with the community!</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="YourTweets" className="mt-0 space-y-6">
                            <div className="border-b border-border pb-4">
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <User size={20} className="text-muted-foreground" />
                                    Your Thoughts
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {userTweets?.length || 0} thoughts you've shared
                                </p>
                            </div>
                            
                            {userTweets && userTweets.length > 0 ? (
                                <div className="space-y-4">
                                    {userTweets
                                        .slice()
                                        .reverse()
                                        .map((tweet: any) => (
                                            <div key={tweet._id} className="bg-card border border-border rounded-lg p-1 hover:shadow-sm transition-shadow duration-200">
                                                <Tweets
                                                    id={tweet._id}
                                                    tweet={tweet.content}
                                                    createdAt={tweet.createdAt}
                                                    userId={tweet.owner}
                                                    accessToken={user.accessToken}
                                                />
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-card border border-border rounded-lg">
                                    <User size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No thoughts shared yet</h3>
                                    <p className="text-muted-foreground mb-4">Start sharing your ideas with the community</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                                                <Plus size={16} />
                                                Share Your First Thought
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle>Share Your First Thought</DialogTitle>
                                                <DialogDescription>
                                                    What would you like to share with the community?
                                                </DialogDescription>
                                            </DialogHeader>
                                            
                                            <form className="space-y-4 mt-4" onSubmit={handleFormSubmittion}>
                                                <Textarea 
                                                    name="tweet" 
                                                    placeholder="Share what you're thinking about..."
                                                    className="min-h-[100px] resize-none"
                                                    required
                                                />
                                                <div className="flex justify-end gap-3">
                                                    <DialogClose asChild>
                                                        <button
                                                            type="button"
                                                            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </DialogClose>
                                                    <button 
                                                        type="submit"
                                                        className="px-6 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium transition-colors duration-200"
                                                        disabled={isPosting}
                                                    >
                                                        {isPosting ? "Posting..." : "Post"}
                                                    </button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="LikedTweets" className="mt-0 space-y-6">
                            <div className="border-b border-border pb-4">
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <Heart size={20} className="text-muted-foreground" />
                                    Liked Thoughts
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Thoughts that resonated with you
                                </p>
                            </div>
                            
                            {userLikedTweets && userLikedTweets.length > 0 ? (
                                <div className="space-y-4">
                                    {userLikedTweets.map((item: any, index: number) => {
                                        return item
                                            .slice()
                                            .reverse()
                                            .map((tweet: any) => (
                                                <div key={`${tweet._id}-${index}`} className="bg-card border border-border rounded-lg p-1 hover:shadow-sm transition-shadow duration-200">
                                                    <Tweets
                                                        id={tweet._id}
                                                        tweet={tweet.content}
                                                        createdAt={tweet.createdAt}
                                                        userId={tweet.owner}
                                                        accessToken={user.accessToken}
                                                    />
                                                </div>
                                            ));
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-card border border-border rounded-lg">
                                    <Heart size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No liked thoughts yet</h3>
                                    <p className="text-muted-foreground">Like thoughts that inspire or interest you!</p>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}