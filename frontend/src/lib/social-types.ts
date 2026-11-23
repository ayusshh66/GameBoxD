export type Player = { id: string; username: string; displayName: string | null; avatarUrl: string | null; bio?: string | null };
export type FoundGame = { id: string | number; name: string; slug: string; coverUrl: string | null; backgroundUrl?: string | null; averageRating?: string | number | null; href: string };
export type GameListItem = { gameId: string; slug: string; name: string; coverUrl: string | null; status: string; createdAt: string; updatedAt?: string; playtimeMinutes?: number | null; note?: string | null };
export type MyLibrary = { wishlist: GameListItem[]; favorites: GameListItem[]; logs: GameListItem[] };
export type CommunityReview = { id: string; content: string; isSpoiler: boolean; createdAt: string; likes: number; game: { id: string; slug: string; name: string; coverUrl: string | null }; user: Player };
export type Community = { latest: CommunityReview[]; popularRecent: CommunityReview[]; players: Player[] };
export type Notification = { eventKey: string; type: "follow" | "review_like"; createdAt: string; actor: Player; href: string; read: boolean };
export type NotificationFeed = { items: Notification[]; unreadCount: number };
