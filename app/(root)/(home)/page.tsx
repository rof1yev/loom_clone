import Header from "@/components/header";
import VideoCard from "@/components/video-card";
import { dummyCards } from "@/constants";

export default function HomePage() {
  return (
    <main className="wrapper page">
      <Header title="All Videos" subHeader="Public library" />

      <section className="video-grid">
        {dummyCards.map((item) => (
          <VideoCard key={item.id} {...item} />
        ))}
      </section>
    </main>
  );
}
