'use client'

import { Check, UserPlus, X } from 'lucide-react'
import { FC, useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'

interface FriendRequestsProps {
    incomingFriendRequests: IncomingRequest[]
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({
    incomingFriendRequests,
    sessionId
}) => {
    const router = useRouter()
    const [friendRequests, setFriendRequests] = useState<IncomingRequest[]>(
        incomingFriendRequests
    )

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        )

        const friendRequestHandler = ({
            senderId,
            senderEmail,
        }: IncomingRequest) => {
            setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler)

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`user:${sessionId}:incoming_friend_requests`)
            )
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)

        }
    }, [sessionId])

    const acceptFriend = async (senderId: string) => {
        try {
            console.log("Accepting friend request from:", senderId); // Add this line
            const response = await axios.post('/api/friends/accept', { id: senderId });
            if (response.status === 200) {
                setFriendRequests((prev) =>
                    prev.filter((request) => request.senderId !== senderId)
                );
                router.refresh();
            } else {
                console.error('Error accepting friend:', response.statusText);
            }
        } catch (error) {
            console.error('Error accepting friend:', error);
        }
    }



    const denyFriend = async (senderId: string) => {
        try {
            const response = await axios.post('/api/friends/deny', { id: senderId });
            if (response.status === 200) {
                setFriendRequests((prev) =>
                    prev.filter((request) => request.senderId !== senderId)
                );
                router.refresh();
            } else {
                console.error('Error denying friend:', response.statusText);
            }
        } catch (error) {
            console.error('Error denying friend:', error);
        }
    }

    return (
        <>
            {friendRequests.length === 0 ? (
                <p className='text-sm text-zinc-500'>nothing to show here...</p>
            ) : (
                friendRequests.map((request) => (
                    <div key={request.senderId} className='flex gap-4 items-center'>
                        <UserPlus className='text-white' />
                        <p className="font-medium text-lg">{request.senderEmail}</p>
                        <button
                            onClick={() => acceptFriend(request.senderId)}
                            aria-label='accept friend'
                            className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'>
                            <Check className='font-semibold text-white w-3/4 h-3/4' />
                        </button>
                        <button
                            onClick={() => denyFriend(request.senderId)}
                            aria-label='deny friend'
                            className='w-8 h-8 bg-red-700 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'>
                            <X className='font-semibold text-white w-3/4 h-3/4' />
                        </button>
                    </div>
                ))
            )}
        </>
    )
}

export default FriendRequests
