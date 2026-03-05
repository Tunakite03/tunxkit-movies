'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Loader2, Search, UserCircle } from 'lucide-react';
import Image from 'next/image';

import { searchAdminPeople } from '@/services/admin-dashboard-service';
import type { PersonSearchResult } from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import { useDebounce } from '@/hooks';
import { IMAGE_SIZES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';

interface AddCastDialogProps {
   readonly mediaTitle: string;
   readonly mediaType: 'movie' | 'tv';
   readonly onSubmit: (data: { personId: number; character: string }) => void;
   readonly isPending: boolean;
   readonly isSuccess: boolean;
}

/** Dialog for searching and adding a cast member to a movie or TV show */
export function AddCastDialog({
   mediaTitle,
   mediaType,
   onSubmit,
   isPending,
   isSuccess,
}: AddCastDialogProps) {
   const { token } = useAuthStore();
   const [open, setOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedPerson, setSelectedPerson] = useState<PersonSearchResult | null>(null);
   const [character, setCharacter] = useState('');

   const debouncedQuery = useDebounce(searchQuery, 300);

   const { data: searchResults, isLoading: isSearching } = useQuery({
      queryKey: ['admin-people-search', debouncedQuery],
      queryFn: () => searchAdminPeople(debouncedQuery, token as string),
      enabled: !!token && debouncedQuery.length >= 2,
   });

   const resetForm = useCallback(() => {
      setSearchQuery('');
      setSelectedPerson(null);
      setCharacter('');
   }, []);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (!selectedPerson) return;
         onSubmit({ personId: selectedPerson.id, character: character.trim() });
      },
      [selectedPerson, character, onSubmit],
   );

   const handleSelectPerson = useCallback((person: PersonSearchResult) => {
      setSelectedPerson(person);
      setSearchQuery('');
   }, []);

   // Reset form and close on success
   if (isSuccess && open) {
      setOpen(false);
      resetForm();
   }

   const mediaLabel = mediaType === 'movie' ? 'phim' : 'phim bộ';

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button size="sm" variant="outline">
               <Plus className="mr-1 h-3 w-3" /> Thêm diễn viên
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Thêm diễn viên</DialogTitle>
                  <DialogDescription>
                     Thêm diễn viên vào {mediaLabel} &quot;{mediaTitle}&quot;
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-4 space-y-4">
                  {/* Selected person display */}
                  {selectedPerson ? (
                     <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                        <PersonAvatar person={selectedPerson} />
                        <div className="flex-1">
                           <p className="text-sm font-medium">{selectedPerson.name}</p>
                           <p className="text-xs text-muted-foreground">ID: {selectedPerson.id}</p>
                        </div>
                        <Button
                           type="button"
                           variant="ghost"
                           size="sm"
                           onClick={() => setSelectedPerson(null)}
                        >
                           Đổi
                        </Button>
                     </div>
                  ) : (
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tìm diễn viên</label>
                        <div className="relative">
                           <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                           <Input
                              placeholder="Nhập tên diễn viên..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9"
                              autoFocus
                           />
                        </div>

                        {/* Search results */}
                        {debouncedQuery.length >= 2 && (
                           <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border">
                              {isSearching ? (
                                 <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                 </div>
                              ) : searchResults?.length ? (
                                 searchResults.map((person) => (
                                    <button
                                       key={person.id}
                                       type="button"
                                       className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
                                       onClick={() => handleSelectPerson(person)}
                                    >
                                       <PersonAvatar person={person} size="sm" />
                                       <div>
                                          <p className="text-sm font-medium">{person.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                             ID: {person.id}
                                          </p>
                                       </div>
                                    </button>
                                 ))
                              ) : (
                                 <p className="py-4 text-center text-sm text-muted-foreground">
                                    Không tìm thấy diễn viên
                                 </p>
                              )}
                           </div>
                        )}
                     </div>
                  )}

                  {/* Character input */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Vai diễn (tùy chọn)
                     </label>
                     <Input
                        placeholder="Ví dụ: Tony Stark / Iron Man"
                        value={character}
                        onChange={(e) => setCharacter(e.target.value)}
                     />
                  </div>
               </div>

               <DialogFooter className="mt-6">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => setOpen(false)}
                     disabled={isPending}
                  >
                     Hủy
                  </Button>
                  <Button type="submit" disabled={!selectedPerson || isPending}>
                     {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Plus className="mr-2 h-4 w-4" />
                     )}
                     Thêm
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}

// ─── Helper ─────────────────────────────────────────────────

interface PersonAvatarProps {
   readonly person: PersonSearchResult;
   readonly size?: 'sm' | 'md';
}

function PersonAvatar({ person, size = 'md' }: PersonAvatarProps) {
   const dimensions = size === 'sm' ? { w: 24, h: 36 } : { w: 32, h: 48 };

   if (person.profilePath) {
      return (
         <Image
            src={`${IMAGE_SIZES.profile.small}${person.profilePath}`}
            alt={person.name}
            width={dimensions.w}
            height={dimensions.h}
            className="rounded object-cover"
            style={{ height: 'auto' }}
         />
      );
   }

   return (
      <div
         className="flex items-center justify-center rounded bg-muted"
         style={{ width: dimensions.w, height: dimensions.h }}
      >
         <UserCircle className="h-4 w-4 text-muted-foreground" />
      </div>
   );
}
