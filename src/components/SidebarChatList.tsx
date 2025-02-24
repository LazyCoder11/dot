'use client'

import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import Image from 'next/image'
import { pusherClient } from '@/lib/pusher'
import toast from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'

interface SidebarChatListProps {
    friends: User[]
    sessionId: string
}

interface ExtendedMessage extends Message {
    senderImg: string,
    senderName: string,
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
    const router = useRouter()
    const pathname = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const newFriendHandler = () => {
            router.refresh()
        }

        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

            if (!shouldNotify) return

            // should be notified
            toast.custom((t) => (
                //custom component
                <UnseenChatToast
                    t={t}
                    sessionId={sessionId}
                    senderId={message.senderId}
                    senderImg={message.senderImg}
                    senderMessage={message.text}
                    senderName={message.senderName}
                />
            ))

            setUnseenMessages((prev) => [...prev, message])
        }

        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', newFriendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pusherClient.unbind('new_message', chatHandler)

        }
    }, [pathname, sessionId, router])

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])


    return (
        <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
            {friends.sort().map((friend) => {
                const unseeMessagesCount = unseenMessages.filter((unseenMsg) => {
                    return unseenMsg.senderId === friend.id
                }).length

                return (
                    <li key={friend.id}>
                        <a href={`/dashboard/chat/${chatHrefConstructor(
                            sessionId,
                            friend.id
                        )}`}
                        >
                            <div className="flex flex-1 items-center gap-x-4 px-2 py-2 text-sm font-semibold leading-6 group hover:bg-white rounded-md hover:text-indigo-600 transition-all">
                                <div className="relative h-8 w-8">
                                    <Image
                                        fill
                                        referrerPolicy='no-referrer'
                                        className='rounded-full'
                                        src={friend.image || ''}
                                        alt='Profile Picture'
                                    />
                                </div>
                                {friend.name}
                                {unseeMessagesCount > 0 ? (
                                    <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                                        {unseeMessagesCount}
                                    </div>
                                ) : null}
                            </div>
                        </a>
                    </li>
                )
            })}
        </ul>
    )
}

export default SidebarChatList