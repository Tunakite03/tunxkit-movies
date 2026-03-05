import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const VALID_SIZES = [192, 512] as const;
type IconSize = (typeof VALID_SIZES)[number];

function isValidSize(value: number): value is IconSize {
   return (VALID_SIZES as readonly number[]).includes(value);
}

export async function GET(request: NextRequest) {
   const sizeParam = Number(request.nextUrl.searchParams.get('size'));

   if (!isValidSize(sizeParam)) {
      return NextResponse.json({ error: 'Invalid size. Use 192 or 512.' }, { status: 400 });
   }

   const iconSize = sizeParam;
   const fontSize = Math.round(iconSize * 0.4);
   const borderRadius = Math.round(iconSize * 0.15);

   return new ImageResponse(
      (
         <div
            style={{
               width: '100%',
               height: '100%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
               borderRadius,
               color: 'white',
               fontSize,
               fontWeight: 700,
               letterSpacing: -1,
            }}
         >
            TK
         </div>
      ),
      { width: iconSize, height: iconSize },
   );
}
