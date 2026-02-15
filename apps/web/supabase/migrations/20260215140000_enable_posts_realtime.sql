-- Enable realtime for the posts table so clients can subscribe to new posts
alter publication supabase_realtime add table public.posts;
