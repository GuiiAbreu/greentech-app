import { useRouter } from 'expo-router';
import { ProfileView } from '../../components/screens/ProfileView';

export default function ConsumerProfile() {
  const router = useRouter();
  return (
    <ProfileView
      onEditProfile={() => router.push('/(consumer)/edit-profile')}
      onChangePassword={() => router.push('/(consumer)/change-password')}
    />
  );
}
