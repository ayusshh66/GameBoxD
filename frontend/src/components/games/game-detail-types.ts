export type RatingDistribution = { stars: number; count: number };

export type PageExtra = {
  localId: string | null;
  localSlug: string | null;
  rawgId: number | null;
  screenshots: string[];
  videos: Array<{ name: string | null; videoUrl: string; thumbnailUrl: string | null }>;
  community: {
    averageRating: number | null;
    ratingsCount: number;
    reviewsCount: number;
    distribution: RatingDistribution[];
  };
};

export type GameDetailModel = {
  name: string;
  slug: string;
  rawgId: number | null;
  localId: string | null;
  coverUrl: string | null;
  backgroundUrl: string | null;
  description: string | null;
  releaseDate: string | null;
  genres: string[];
  platforms: string[];
  rawgRating: number | null;
  extra: PageExtra;
};

export type GameReview = {
  id: string;
  content: string;
  isSpoiler: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
};

export const EMPTY_EXTRA: PageExtra = {
  localId: null,
  localSlug: null,
  rawgId: null,
  screenshots: [],
  videos: [],
  community: {
    averageRating: null,
    ratingsCount: 0,
    reviewsCount: 0,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
  },
};
