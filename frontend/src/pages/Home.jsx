import HeroSection from '../components/HeroSection';
import DestinationPanel from '../components/DestinationPanel';
import TrailMap from '../components/TrailMap';
import AnnouncementBanner from '../components/AnnouncementBanner';

export default function Home() {
  return (
    <main>
      <AnnouncementBanner />
      <HeroSection />
      <DestinationPanel />
      <TrailMap />
    </main>
  );
}
