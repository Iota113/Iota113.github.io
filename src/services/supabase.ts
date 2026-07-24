import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const ARCHIVE_URL = `${SUPABASE_URL}/storage/v1/object/public/archive-images/`;
export const TRAVEL_URL = `${SUPABASE_URL}/storage/v1/object/public/travel-images`;
export const ARCHIVE_HIGHLIGHTS_URL = `${SUPABASE_URL}/storage/v1/object/public/archive-highlights/`;

export interface ArchiveMedia {
    id: string;
    title: string;
    type: string;
    year: number;
    displayYear: string;
    image_filename: string;
    created_at: string;
}

// Define the specific structures for the JSONB blocks
export type RegionDetailBlock =
    | { 
        type: 'text'; 
        content: string; 
      }
    | { 
        type: 'image'; 
        url: string; 
        caption: string; 
        alt_text: string; 
      };
