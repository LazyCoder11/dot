import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { FC } from 'react'

interface loadingProps {

}

const loading: FC<loadingProps> = ({ }) => {
    return <div className='w-full flex flex-col gap-5'>
        <Skeleton className='mb-4' height={50} width={500}/>
        <Skeleton height={20} width={150}/>
        <Skeleton height={50} width={400}/>
    </div>
}

export default loading