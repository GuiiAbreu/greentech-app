import { useRouter } from 'expo-router';
import { ProfileView } from '../../components/screens/ProfileView';

export default function FarmerProfile() {
  const router = useRouter();
  return (
    <ProfileView
      onEditProfile={() => router.push('/(farmer)/edit-profile')}
      onChangePassword={() => router.push('/(farmer)/change-password')}
    />
  );
}
