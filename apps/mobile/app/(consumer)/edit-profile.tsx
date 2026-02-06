import { useRouter } from 'expo-router';
import { EditProfileView } from '../../components/screens/EditProfileView';

export default function ConsumerEditProfile() {
  const router = useRouter();
  return <EditProfileView onBack={() => router.back()} />;
}
