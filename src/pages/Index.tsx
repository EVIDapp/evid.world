import { EventMap } from '@/components/EventMap';

const Index = () => {
  return (
    <main className="w-full h-screen overflow-hidden" role="main" aria-label="Interactive global map of historical events">
      <h1 className="sr-only">EVID.WORLD - Global Event Map: Explore Wars, Disasters, Earthquakes, and Archaeological Discoveries</h1>
      <EventMap />
    </main>
  );
};

export default Index;
