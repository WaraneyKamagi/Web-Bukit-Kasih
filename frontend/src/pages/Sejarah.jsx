import heroBg from '../assets/hero_bukit_kasih.png';
import ibadahImg from '../assets/ibadah.png';
import salibImg from '../assets/salib.png';
import reliefImg from '../assets/relief.png';

export default function Sejarah() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img
            alt="Pemandangan tempat ibadah di Puncak Bukit Kasih"
            className="w-full h-full object-cover object-center"
            src={heroBg}
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 text-left">
          <div className="max-w-2xl text-on-primary">
            <span className="font-label-caps text-label-caps tracking-widest uppercase text-accent-gold mb-6 block">Simbol Toleransi & Perdamaian</span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-on-primary mb-6 leading-tight">Sejarah & Nilai Bukit Kasih</h1>
            <p className="font-body-lg text-body-lg text-on-primary/90 mb-10 max-w-xl">
              Didirikan pada tahun 2002 sebagai pusat spiritual dan perdamaian, Bukit Kasih Kanonang berdiri sebagai pengingat nyata akan indahnya kerukunan dan kebersamaan umat beragama di Sulawesi Utara.
            </p>
            <a
              href="https://id.wikipedia.org/wiki/Bukit_Kasih"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-glass text-primary hover:bg-surface-container-lowest font-body-md text-body-md px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-md shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] inline-flex items-center space-x-2"
            >
              <span>Baca Artikel Lengkap</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      {/* Sejarah Bento Grid */}
      <section className="py-24 bg-surface px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Nilai Sejarah & Budaya</h2>
            <p className="font-body-lg text-body-lg text-subtext max-w-2xl mx-auto">Mengenal lebih dekat asal-usul, filosofi nama, dan warisan budaya yang terpatri di Bukit Kasih.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

            {/* Large Card (Monumen Kerukunan) */}
            <div className="md:col-span-2 group relative rounded-xl overflow-hidden shadow-[0_40px_40px_-10px_rgba(15,76,129,0.08)] bg-surface-container-lowest h-[400px]">
              <img
                alt="Tempat ibadah berdampingan di Bukit Kasih"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={ibadahImg}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full glass-panel-light rounded-t-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-left">
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Monumen Kerukunan Beragama</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">Diinisiasi oleh Gubernur Sulawesi Utara A.J. Sondakh pada tahun 2002. Bukit Kasih menghadirkan tempat ibadah untuk lima agama besar (Kristen, Katolik, Islam, Buddha, dan Hindu) yang berdiri berdampingan secara harmonis di puncak bukit.</p>
              </div>
            </div>

            {/* Medium Card 1 (Filosofi Bukit Kasih) */}
            <div className="group relative rounded-xl overflow-hidden shadow-[0_40px_40px_-10px_rgba(15,76,129,0.08)] bg-surface-container-lowest h-[400px]">
              <img
                alt="Monumen salib putih di Bukit Kasih"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={salibImg}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full text-on-primary text-left">
                <h3 className="font-headline-md text-headline-md mb-2">Filosofi Kasih</h3>
                <p className="font-body-md text-body-md text-on-primary/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Nama Bukit Kasih atau "Hill of Love" dipilih untuk menyebarkan pesan perdamaian universal bagi umat manusia.</p>
              </div>
            </div>

            {/* Medium Card 2 (Legenda Toar Lumimuut) */}
            <div className="group relative rounded-xl overflow-hidden shadow-[0_40px_40px_-10px_rgba(15,76,129,0.08)] bg-surface-container-lowest h-[400px]">
              <img
                alt="Ukiran relief leluhur Minahasa"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={reliefImg}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full text-on-primary text-left">
                <h3 className="font-headline-md text-headline-md mb-2">Legenda Minahasa</h3>
                <p className="font-body-md text-body-md text-on-primary/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Lereng berbukit belerang ini diyakini sebagai tempat bermukim leluhur pertama Minahasa, Toar dan Lumimuut.</p>
              </div>
            </div>

            {/* Medium Card 3 (Pesan Perdamaian) */}
            <div className="md:col-span-2 group relative rounded-xl overflow-hidden shadow-[0_40px_40px_-10px_rgba(15,76,129,0.08)] bg-primary-container h-[400px] flex items-center p-12 text-left">
              <div className="relative z-10 w-full md:w-2/3 text-on-primary">
                <span className="material-symbols-outlined text-[48px] text-accent-gold mb-6 block">diversity_3</span>
                <h3 className="font-headline-lg text-headline-lg text-on-primary mb-4">Pesan Harmoni Bagi Dunia</h3>
                <p className="font-body-lg text-body-lg text-on-primary/80 mb-8">
                  Bukit Kasih bukan sekadar tujuan wisata alam, melainkan sarana edukasi bagi dunia bahwa keberagaman keyakinan adalah jembatan persaudaraan yang indah, dirajut dalam balutan kasih dan rasa hormat yang mendalam.
                </p>
                <a
                  href="https://id.wikipedia.org/wiki/Bukit_Kasih"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-on-primary/30 text-on-primary hover:bg-on-primary hover:text-primary font-body-md text-body-md px-6 py-2 rounded-full transition-all duration-300 inline-block"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/50 to-transparent"></div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
