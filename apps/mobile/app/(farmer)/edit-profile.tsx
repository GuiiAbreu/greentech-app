import { useRouter } from 'expo-router';
import { EditProfileView } from '../../components/screens/EditProfileView';

export default function FarmerEditProfile() {
  const router = useRouter();
  return <EditProfileView onBack={() => router.back()} />;
}
