import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Star, Film, Tv } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { fetchPersonDetail, fetchPersonCredits } from '@/services';
import { getProfileUrl, getPosterUrl, formatDate, formatRating, getYear } from '@/lib/image-utils';
import { JsonLd, buildPersonSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/constants';
import type { PersonMovieCredit, PersonTVCredit } from '@/types';

interface PageProps {
   readonly params: Promise<{ id: string }>;
}

function isMovieCredit(credit: PersonMovieCredit | PersonTVCredit): credit is PersonMovieCredit {
   return 'title' in credit;
}

function getTitle(credit: PersonMovieCredit | PersonTVCredit): string {
   return isMovieCredit(credit) ? credit.title : credit.name;
}

function getReleaseDate(credit: PersonMovieCredit | PersonTVCredit): string {
   return isMovieCredit(credit) ? credit.release_date : credit.first_air_date;
}

function getHref(credit: PersonMovieCredit | PersonTVCredit): string {
   return isMovieCredit(credit) ? `/movies/${credit.id}` : `/tv/${credit.id}`;
}

function getAge(birthday: string, deathday: string | null): number {
   const endDate = deathday ? new Date(deathday) : new Date();
   const birthDate = new Date(birthday);
   let age = endDate.getFullYear() - birthDate.getFullYear();
   const monthDiff = endDate.getMonth() - birthDate.getMonth();
   if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
   }
   return age;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
   const { id } = await params;
   const personId = Number(id);
   if (Number.isNaN(personId)) return { title: `Không tìm thấy` };

   try {
      const person = await fetchPersonDetail(personId);
      const description = person.biography?.slice(0, 160) || `Thông tin về ${person.name}`;
      const profileImage = person.profile_path ? getProfileUrl(person.profile_path, 'original') : undefined;

      return {
         title: person.name,
         description,
         alternates: { canonical: `${SITE_URL}/people/${person.id}` },
         openGraph: {
            title: person.name,
            description,
            url: `${SITE_URL}/people/${person.id}`,
            type: 'profile',
            images: profileImage ? [{ url: profileImage, alt: person.name }] : [],
         },
         twitter: {
            card: 'summary',
            title: person.name,
            description,
            images: profileImage ? [profileImage] : [],
         },
      };
   } catch {
      return { title: `Không tìm thấy` };
   }
}

export default async function PersonDetailPage({ params }: PageProps) {
   const { id } = await params;
   const personId = Number(id);
   if (Number.isNaN(personId)) notFound();

   let person;
   let credits;
   try {
      [person, credits] = await Promise.all([fetchPersonDetail(personId), fetchPersonCredits(personId)]);
   } catch {
      notFound();
   }

   const profileUrl = getProfileUrl(person.profile_path, 'original');

   // Sort credits by date (newest first), deduplicate
   const sortedCredits = [...credits.cast].sort((a, b) => {
      const dateA = getReleaseDate(a) || '';
      const dateB = getReleaseDate(b) || '';
      return dateB.localeCompare(dateA);
   });

   // Split into movies and TV
   const movieCredits = sortedCredits.filter(isMovieCredit);
   const tvCredits = sortedCredits.filter((c): c is PersonTVCredit => !isMovieCredit(c));

   return (
      <div className='container mx-auto px-4 py-8 md:px-6'>
         <JsonLd data={buildPersonSchema(person)} />
         <JsonLd
            data={buildBreadcrumbSchema([
               { name: 'Trang chủ', url: SITE_URL },
               { name: person.name, url: `${SITE_URL}/people/${person.id}` },
            ])}
         />

         {/* Profile Header */}
         <div className='flex flex-col gap-8 md:flex-row'>
            {/* Profile Image */}
            <div className='shrink-0'>
               <div className='relative mx-auto aspect-2/3 w-64 overflow-hidden rounded-lg bg-muted md:w-72'>
                  <Image
                     src={profileUrl}
                     alt={person.name}
                     fill
                     sizes='288px'
                     className='object-cover'
                     priority
                  />
               </div>
            </div>

            {/* Info */}
            <div className='flex-1 space-y-4'>
               <h1 className='text-3xl font-bold md:text-4xl'>{person.name}</h1>

               <div className='flex flex-wrap items-center gap-3'>
                  <Badge variant='secondary'>{person.known_for_department}</Badge>
                  {person.birthday && (
                     <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <Calendar className='size-4' />
                        <span>
                           {formatDate(person.birthday)} ({getAge(person.birthday, person.deathday)} tuổi)
                        </span>
                     </div>
                  )}
                  {person.deathday && (
                     <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <span>† {formatDate(person.deathday)}</span>
                     </div>
                  )}
                  {person.place_of_birth && (
                     <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <MapPin className='size-4' />
                        <span>{person.place_of_birth}</span>
                     </div>
                  )}
               </div>

               {/* Biography */}
               {person.biography && (
                  <div className='space-y-2'>
                     <h2 className='text-xl font-semibold'>Tiểu sử</h2>
                     <p className='whitespace-pre-line text-sm leading-relaxed text-muted-foreground'>
                        {person.biography}
                     </p>
                  </div>
               )}

               {/* Also Known As */}
               {person.also_known_as.length > 0 && (
                  <div className='space-y-2'>
                     <h3 className='text-sm font-semibold'>Tên khác</h3>
                     <div className='flex flex-wrap gap-2'>
                        {person.also_known_as.map((name) => (
                           <Badge
                              key={name}
                              variant='outline'
                              className='text-xs'
                           >
                              {name}
                           </Badge>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>

         <Separator className='my-8' />

         {/* Filmography */}
         <div className='space-y-8'>
            {/* Movies */}
            {movieCredits.length > 0 && (
               <section>
                  <h2 className='mb-4 flex items-center gap-2 text-xl font-bold'>
                     <Film className='size-5' />
                     Phim lẻ ({movieCredits.length})
                  </h2>
                  <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
                     {movieCredits.map((credit) => (
                        <CreditCard
                           key={`movie-${credit.id}`}
                           credit={credit}
                        />
                     ))}
                  </div>
               </section>
            )}

            {/* TV Shows */}
            {tvCredits.length > 0 && (
               <section>
                  <h2 className='mb-4 flex items-center gap-2 text-xl font-bold'>
                     <Tv className='size-5' />
                     Phim bộ ({tvCredits.length})
                  </h2>
                  <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
                     {tvCredits.map((credit) => (
                        <CreditCard
                           key={`tv-${credit.id}`}
                           credit={credit}
                        />
                     ))}
                  </div>
               </section>
            )}
         </div>
      </div>
   );
}

/** Credit card for person filmography */
function CreditCard({ credit }: { readonly credit: PersonMovieCredit | PersonTVCredit }) {
   const title = getTitle(credit);
   const year = getYear(getReleaseDate(credit));
   const posterUrl = getPosterUrl(credit.poster_path, 'medium');
   const href = getHref(credit);
   const rating = formatRating(credit.vote_average);

   return (
      <Link
         href={href}
         className='group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30'
      >
         <div className='relative aspect-2/3 w-full overflow-hidden bg-muted'>
            <Image
               src={posterUrl}
               alt={title}
               fill
               sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw'
               className='object-cover transition-transform duration-300 group-hover:scale-105'
            />
            {credit.vote_average > 0 && (
               <Badge
                  variant='secondary'
                  className='absolute right-2 top-2 gap-1 bg-background/80 backdrop-blur-sm'
               >
                  <Star className='size-3 fill-primary text-primary' />
                  <span className='text-xs font-semibold'>{rating}</span>
               </Badge>
            )}
         </div>
         <div className='flex flex-1 flex-col gap-1 p-3'>
            <h3 className='line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary transition-colors'>
               {title}
            </h3>
            {credit.character && <p className='line-clamp-1 text-xs text-muted-foreground'>vai {credit.character}</p>}
            {year !== 'N/A' && <p className='text-xs text-muted-foreground'>{year}</p>}
         </div>
      </Link>
   );
}
