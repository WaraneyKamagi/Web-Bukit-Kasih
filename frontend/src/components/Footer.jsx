
export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-24">
      <div className="flex flex-col md:flex-row justify-between items-center py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto gap-6">
        <div className="font-headline-md text-headline-md text-primary font-semibold">
          BUKIT KASIH KANONANG
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="font-body-md text-body-md text-subtext hover:text-primary transition-colors" href="#">Tentang Kami</a>
          <a className="font-body-md text-body-md text-subtext hover:text-primary transition-colors" href="#">Panduan Wisata</a>
          <a className="font-body-md text-body-md text-subtext hover:text-primary transition-colors" href="#">Kebijakan</a>
          <a className="font-body-md text-body-md text-subtext hover:text-primary transition-colors" href="#">Kontak</a>
        </div>
        <div className="font-body-md text-body-md text-subtext">
          © 2026 Bukit Kasih Kanonang. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
