export type User = {
  id: string;
  email: string | null;
};
// DB
export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
};
