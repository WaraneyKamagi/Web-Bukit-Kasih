import heroBg from '../assets/hero_bukit_kasih.png';
import ibadahImg from '../assets/ibadah.png';
import salibImg from '../assets/salib.png';
import reliefImg from '../assets/relief.png';

export default function Sejarah() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Pemandangan tempat ibadah di Puncak Bukit Kasih"
            className="w-full h-full object-cover object-center"
            src={heroBg}
          />
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent"></div>
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 text-left">
          <div className="max-w-2xl text-white">
            <span className="font-label-caps text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-accent-gold mb-4 block drop-shadow-md">
              Simbol Toleransi & Perdamaian
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
              Sejarah & Nilai Bukit Kasih
            </h1>
            <p className="font-body-lg text-base sm:text-lg md:text-xl font-medium text-slate-100 mb-10 max-w-xl leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
              Didirikan pada tahun 2002 sebagai pusat spiritual dan perdamaian, Bukit Kasih Kanonang berdiri sebagai pengingat nyata akan indahnya kerukunan dan kebersamaan umat beragama di Sulawesi Utara.
            </p>
            <a
              href="https://id.wikipedia.org/wiki/Bukit_Kasih"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent-gold hover:bg-amber-400 text-slate-950 font-body-md font-bold text-sm md:text-base px-8 py-4 rounded-full transition-all duration-300 shadow-[0_12px_30px_rgba(254,187,2,0.35)] hover:shadow-[0_16px_36px_rgba(254,187,2,0.5)] hover:-translate-y-0.5 inline-flex items-center space-x-2.5"
            >
              <span>Baca Artikel Lengkap</span>
              <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      {/* Sejarah Bento Grid */}
      <section className="py-24 bg-surface px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Nilai Sejarah & Budaya</h2>
            <p className="font-body-lg text-base md:text-lg font-medium text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">Mengenal lebih dekat asal-usul, filosofi nama, dan warisan budaya yang terpatri di Bukit Kasih.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

            {/* Large Card (Monumen Kerukunan) */}
            <div className="md:col-span-2 group relative rounded-2xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(15,76,129,0.12)] bg-surface-container-lowest h-[400px]">
              <img
                alt="Tempat ibadah berdampingan di Bukit Kasih"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={ibadahImg}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full glass-panel-light rounded-t-xl text-left">
                <h3 className="font-headline-md text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mb-2">Monumen Kerukunan Beragama</h3>
                <p className="font-body-md text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed">Diinisiasi oleh Gubernur Sulawesi Utara A.J. Sondakh pada tahun 2002. Bukit Kasih menghadirkan tempat ibadah untuk lima agama besar (Kristen, Katolik, Islam, Buddha, dan Hindu) yang berdiri berdampingan secara harmonis di puncak bukit.</p>
              </div>
            </div>

            {/* Medium Card 1 (Filosofi Bukit Kasih) */}
            <div className="group relative rounded-2xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(15,76,129,0.12)] bg-surface-container-lowest h-[400px]">
              <img
                alt="Monumen salib putih di Bukit Kasih"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={salibImg}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full text-white text-left">
                <h3 className="font-headline-md text-lg md:text-xl font-extrabold text-white mb-2 drop-shadow-md">Filosofi Kasih</h3>
                <p className="font-body-md text-sm md:text-base text-slate-100 leading-relaxed drop-shadow">Nama Bukit Kasih atau "Hill of Love" dipilih untuk menyebarkan pesan perdamaian universal bagi umat manusia.</p>
              </div>
            </div>

            {/* Medium Card 2 (Legenda Toar Lumimuut) */}
            <div className="group relative rounded-2xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(15,76,129,0.12)] bg-surface-container-lowest h-[400px]">
              <img
                alt="Ukiran relief leluhur Minahasa"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={reliefImg}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full text-white text-left">
                <h3 className="font-headline-md text-lg md:text-xl font-extrabold text-white mb-2 drop-shadow-md">Legenda Minahasa</h3>
                <p className="font-body-md text-sm md:text-base text-slate-100 leading-relaxed drop-shadow">Lereng berbukit belerang ini diyakini sebagai tempat bermukim leluhur pertama Minahasa, Toar dan Lumimuut.</p>
              </div>
            </div>

            {/* Medium Card 3 (Pesan Perdamaian) */}
            <div className="md:col-span-2 group relative rounded-2xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(15,76,129,0.12)] bg-[#0F4C81] dark:bg-primary-container h-[400px] flex items-center p-8 md:p-12 text-left">
              <div className="relative z-10 w-full md:w-3/4 text-white">
                <span className="material-symbols-outlined text-[48px] text-accent-gold mb-4 block">diversity_3</span>
                <h3 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-white mb-4">Pesan Harmoni Bagi Dunia</h3>
                <p className="font-body-lg text-sm md:text-base text-slate-100 leading-relaxed mb-8">
                  Bukit Kasih bukan sekadar tujuan wisata alam, melainkan sarana edukasi bagi dunia bahwa keberagaman keyakinan adalah jembatan persaudaraan yang indah, dirajut dalam balutan kasih dan rasa hormat yang mendalam.
                </p>
                <a
                  href="https://id.wikipedia.org/wiki/Bukit_Kasih"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-slate-950 hover:bg-accent-gold font-body-md font-bold text-sm px-6 py-3 rounded-full transition-all duration-300 shadow-md inline-block"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-950/40 to-transparent"></div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
