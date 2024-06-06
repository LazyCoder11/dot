import Button from '@/components/ui/Button'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Logo from '/public/logo.png'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis';
import { chatHrefConstructor } from '@/lib/utils'
import { ChevronRight, ChevronsRightLeft } from 'lucide-react'
import Link from 'next/link'

const page = async ({ }) => {

    const session = await getServerSession(authOptions)
    if (!session) notFound()

    const friends = await getFriendsByUserId(session.user.id)
    const friendsWithLastMessage = await Promise.all(
        friends.map(async (friend) => {
            const [lastMessageRaw] = (await fetchRedis(
                'zrange',
                `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
                -1,
                -1
            )) as string[]
            const lastMessage = JSON.parse(lastMessageRaw) as Message

            return {
                ...friend,
                lastMessage,
            }
        })
    )

    return (
        <main className='min-h-full dashboard'>
            <div className="flex justify-center flex-col items-center">
                <div className="relative">
                    <Image
                        width={250}
                        src={Logo}
                        alt='Logo'
                    />
                </div>
                <div className="my-3 text-xl font-medium">
                    <p>Say it simply.</p>
                </div>
            </div>
            <div className="flex flex-col justify-center h-full mt-5">
                <div className="mb-5">
                    <h3 className='text-2xl font-semibold'>Recent Chats</h3>
                </div>
                {friendsWithLastMessage.length === 0 ? (
                    <p className='text-sm'>Nothing to show here</p>
                ) : friendsWithLastMessage.map((friend) => (
                    <div key={friend.id} className='relative border mb-5 bg-black border-zinc-200 px-4 py-3 rounded-lg hover:bg-indigo-600 transition-all'>
                        <div className="absolute right-4 inset-y-0 flex items-center">
                            <ChevronRight className='h-7 w-7 text-zinc-50' />
                        </div>
                        <Link href={`/dashboard/chat/${chatHrefConstructor(
                            session.user.id,
                            friend.id
                        )}`} className='relative sm:flex'>
                            <div className="mb-4 flex shrink-0 sm:mb-0 sm:mr-4">
                                <div className="relative h-14 w-14">
                                    <Image
                                        referrerPolicy='no-referrer'
                                        className='rounded-full'
                                        alt={`${friend.name} Profile picture`}
                                        src={friend.image}
                                        fill
                                    />
                                </div>
                            </div>
                            <div className="">
                                <h4 className="text-lg font-semibold">{friend.name}</h4>
                                <p className="mt-1 max-w-md">
                                    <span className="text-zinc-400">
                                        {friend.lastMessage.senderId === session.user.id ? 'You: ' : ''}
                                    </span>
                                    {friend.lastMessage.text}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default page