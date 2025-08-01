-- Add order columns to support reordering
ALTER TABLE public.groups 
ADD COLUMN display_order integer DEFAULT 0;

ALTER TABLE public.documents 
ADD COLUMN display_order integer DEFAULT 0;

-- Update existing records with incremental order based on creation time
UPDATE public.groups 
SET display_order = subquery.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_number 
  FROM public.groups
) AS subquery 
WHERE public.groups.id = subquery.id;

UPDATE public.documents 
SET display_order = subquery.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY created_at) as row_number 
  FROM public.documents
) AS subquery 
WHERE public.documents.id = subquery.id;