import AddFriendButton from '@/components/AddFriendButton'
import { FC } from 'react'

const page: FC = ({ }) => {
  return (
    <main className='pt-8 px-8 flex justify-center items-center flex-col text-center h-full'>
      <h1 className='font-bold text-3xl mb-8'>Add Friend</h1>
      <AddFriendButton />
    </main>
  )
}

export default page