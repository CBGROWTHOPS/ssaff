import type { ReactNode } from "react";

export type Post = {
  slug: string;
  title: string;
  eyebrow: string;
  excerpt: string;
  published: string;
  reading: string;
  author: string;
  Body: () => ReactNode;
};

export const posts: Post[] = [
  {
    slug: "miami-is-the-cultures-new-headquarters",
    title: "Miami is the culture's new headquarters.",
    eyebrow: "Editorial",
    excerpt:
      "The center of gravity moved south. Miami isn't a stop on the tour anymore — it's the room where the deals get done.",
    published: "2026-07-02",
    reading: "3 min",
    author: "The SSAFF Desk",
    Body: () => (
      <>
        <p>
          For years, the culture had two capitals. New York wrote the story;
          Atlanta made the sound. LA got the money. Miami got the vacation.
        </p>
        <p>
          That map is old. Walk down Collins Ave any Thursday and you'll pass
          three label execs, two athletes-turned-founders, and a producer
          shooting a video on a phone. The industry is here — permanently.
        </p>
        <p>
          The pull is obvious once you list it out. No state income tax on the
          artist money, warm-weather content that shoots itself, a global
          crossover between Latin, hip-hop, and dance music that only exists
          in one city, and a business class that treats operators like
          neighbors instead of applicants.
        </p>
        <p>
          The signals stack: Kendrick's Super Bowl halftime rehearsals routed
          through South Florida. Bad Bunny's Miami-Puerto Rico ping-pong
          production model. Rick Ross and DJ Khaled functionally never left.
          Larry June, Sexyy Red, Latto — everybody comes here to work now, not
          to unwind.
        </p>
        <p>
          The last piece is the boring one, and it's the one people underrate.
          Founders who make money in the culture are keeping it in Miami. The
          agency owner. The clothing brand. The management shop. The publisher.
          The label. Miami is one of the few American cities where the money
          made from the culture stays in the culture.
        </p>
        <p>
          The takeaway isn't that Atlanta or LA lost. They didn't. It's that
          the third seat at the table is filled, and it's not moving.
        </p>
        <p>
          The center of gravity moved south. Adjust accordingly.
        </p>
      </>
    ),
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
