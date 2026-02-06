import { useRouter } from 'expo-router';
import { ChangePasswordView } from '../../components/screens/ChangePasswordView';

export default function ConsumerChangePassword() {
  const router = useRouter();
  return <ChangePasswordView onBack={() => router.back()} />;
}
