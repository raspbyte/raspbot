const REDDIT_URL = 'https://www.reddit.com/r/cats/search.json?q=NOT+flair%3AMourning%2FLoss&restrict_sr=on&sort=hot&t=all&limit=10';
const IMAGE_EXTENSIONS = ['.gif', '.jpeg', '.jpg', '.png', '.webp'];

export async function getHottestImage() {
  const res = await fetch(REDDIT_URL, {
    headers: { 'User-Agent': 'discord-raspbot/1.0' },
  });

  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);

  const json = await res.json();
  const posts = json.data.children;

  const imagePost = posts.find(({ data }) => {
    if (data.is_video || data.stickied) return false;
    const url = data.url ?? '';
    return IMAGE_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext));
  });

  if (!imagePost) return null;

  const { title, url, permalink } = imagePost.data;
  return {
    title,
    imageUrl: url,
    postUrl: `https://www.reddit.com${permalink}`,
  };
}
