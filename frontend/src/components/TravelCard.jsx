import { useState } from 'react';

export default function TravelCard({ title, image, altText, onClick }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="group relative h-[400px] rounded-[24px] overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(15,76,129,0.2)] hover:-translate-y-2 transition-all duration-500"
    >
      {/* Skeleton Pulse */}
      {!loaded && (
        <div 
          className="absolute inset-0 bg-surface-variant animate-pulse" 
          aria-label={altText}
        />
      )}
      
      {/* Background Image */}
      <img 
        alt={title} 
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        src={image}
      />
      
      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end z-10">
        <h3 className="font-headline-md text-headline-md text-white transform group-hover:-translate-y-2 transition-transform duration-500">
          {title}
        </h3>
        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500 hover:bg-white hover:text-primary">
          <span className="material-symbols-outlined text-white hover:text-primary transition-colors">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
