import { HomePage } from '@/components/home/home-page';
import { LocationProvider } from '@/components/providers/location-provider';

export default function Page() {
  return (
    <LocationProvider>
      <HomePage />
    </LocationProvider>
  );
}
