import Image from 'next/image';
import Link from 'next/link';

import type { CastMember } from '@/types';
import { getProfileUrl } from '@/lib/image-utils';

interface CastCardProps {
   readonly member: CastMember;
}

export function CastCard({ member }: CastCardProps) {
   const profileUrl = getProfileUrl(member.profile_path, 'small');

   return (
      <Link
         href={`/people/${member.id}`}
         className='group flex flex-col items-center gap-2 text-center'
      >
         <div className='relative size-20 overflow-hidden rounded-full bg-muted ring-2 ring-transparent transition-all group-hover:ring-primary md:size-24'>
            <Image
               src={profileUrl}
               alt={member.name}
               fill
               sizes='96px'
               className='object-cover'
            />
         </div>
         <div className='w-full max-w-[120px]'>
            <p className='truncate text-sm font-medium group-hover:text-primary transition-colors'>{member.name}</p>
            <p className='truncate text-xs text-muted-foreground'>{member.character}</p>
         </div>
      </Link>
   );
}
