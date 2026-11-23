import ProfileView from "@/components/users/profile-view";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileView username={username} />;
}
