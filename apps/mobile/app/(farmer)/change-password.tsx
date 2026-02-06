import { useRouter } from 'expo-router';
import { ChangePasswordView } from '../../components/screens/ChangePasswordView';

export default function FarmerChangePassword() {
  const router = useRouter();
  return <ChangePasswordView onBack={() => router.back()} />;
}
