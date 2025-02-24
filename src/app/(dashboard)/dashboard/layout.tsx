import { Icon, Icons } from '@/components/Icons'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FC, ReactNode } from 'react'
import SignOutButton from '@/components/SignOutButton';
import FriendRequestSidebarOptions from '@/components/FriendRequestSidebarOptions';
import { fetchRedis } from '@/helpers/redis'
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id'
import SidebarChatList from '@/components/SidebarChatList'
import Logo from '/public/logo.png'
import MobileChatLayout from '@/components/MobileChatLayout'
import { SideBarOptions } from '@/types/typings'

interface LayoutProps {
    children: ReactNode
}

const sidebarOptions: SideBarOptions[] = [
    {
        id: 1,
        name: 'Add Friend',
        href: '/dashboard/add',
        Icon: 'UserPlus'
    }
]

const Layout = async ({ children }: LayoutProps) => {

    const session = await getServerSession(authOptions)
    if (!session) notFound() // If not authenicated then it shows 404 Error Page

    const friends = await getFriendsByUserId(session.user.id)

    const unseenRequestCount = (
        await fetchRedis(
            'smembers',
            `user:${session.user.id}:incoming_friend_requests`
        ) as User[]
    ).length

    return (
        <div className="w-full flex h-screen ">
            <div className="md:hidden">
                <MobileChatLayout
                    friends={friends}
                    session={session}
                    sidebarOptions={sidebarOptions}
                    unseenRequestCount={unseenRequestCount}
                />
            </div>
            <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6">
                <Link href='/dashboard' className='mt-6 flex h-16 shrink-0 items-center'>
                    {/* <Icons.Logo className='w-auto h-8 text-indigo-600' /> */}
                    <Image
                        width={100}
                        src={Logo}
                        alt='Logo'
                    />
                </Link>
                {friends.length > 0 ? (<div className="text-s font-semibold leading-6 text-indigo-200">
                    Your Chats
                </div>) : null}
                <nav className='flex flex-1 flex-col'>
                    <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                        <li>
                            <SidebarChatList sessionId={session.user.id} friends={friends} />
                            {/* User's history cats */}
                        </li>
                        <li>
                            <div className="text-s font-semibold leading-6 text-indigo-200">
                                Overview
                            </div>
                            <ul role='list' className='-mx-2 mt-2 space-y-1'>
                                {sidebarOptions.map((option) => {
                                    const Icon = Icons[option.Icon]
                                    return (
                                        <li key={option.id}>
                                            <Link
                                                href={option.href}
                                                className='text-white hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-medium'>
                                                <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex shrink-0 items-center justify-center h-6 w-6 rounded-lg text-[0.625rem] font-medium">
                                                    <Icon className='h-4 w-4' />
                                                </span>
                                                <span className="truncate">{option.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                                <li>
                                    <FriendRequestSidebarOptions sessionId={session.user.id} initialUnseenRequestCount={unseenRequestCount} />
                                </li>
                            </ul>
                        </li>



                        {/* Profile Section */}
                        <li className='-mx-6 mt-auto flex items-center'>
                            <div className="flex flex-1 items-center gap-x-4 px-5 py-3 text-sm font-semibold leading-6">
                                <div className="relative h-8 w-8">
                                    <Image
                                        fill
                                        referrerPolicy='no-referrer'
                                        className='rounded-full'
                                        src={session.user.image || ''}
                                        alt='Profile Picture'
                                    />
                                </div>

                                <span className="sr-only">Your Profile</span>
                                <div className="flex flex-col">
                                    <span aria-hidden='true'>{session.user.name}</span>
                                    <span className="text-xs text-zinc-400 " aria-hidden='true'>{session.user.email}</span>
                                </div>
                            </div>
                            <SignOutButton className='aspect-square h-full' />
                        </li>
                    </ul>
                </nav>
            </div>
            <aside className='max-h-screen container max-w-full md:mt-10'>{children}</aside>
        </div>
    )
}

export default Layout