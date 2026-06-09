import { useState } from 'react';

export default function HotelCard({ 
  title, 
  location, 
  image, 
  badge, 
  rating, 
  price, 
  amenities = [], 
  colSpanClass, 
  pPadding = 'p-6' 
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`${colSpanClass} group relative rounded-xl overflow-hidden cursor-pointer h-[500px]`}>
      
      {/* Skeleton Pulse */}
      {!loaded && (
        <div className="absolute inset-0 bg-surface-variant animate-pulse" />
      )}

      {/* Image */}
      <img 
        alt={title} 
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        src={image}
      />
      
      {/* Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
      
      {/* Top Badge */}
      {badge && (
        <div className="absolute top-6 left-6">
          <span className="bg-surface-glass backdrop-blur-md px-3 py-1 rounded-full font-label-caps text-label-caps text-primary uppercase">
            {badge}
          </span>
        </div>
      )}

      {/* Details Footer */}
      <div className={`absolute bottom-0 left-0 w-full ${pPadding} flex flex-col md:flex-row justify-between items-start md:items-end gap-4 z-10 text-white`}>
        <div>
          <h3 className="font-headline-md text-headline-md text-white mb-1">{title}</h3>
          
          <div className="flex items-center text-white/90 font-body-md text-body-md mb-3 space-x-4">
            <span className="flex items-center">
              <span className="material-symbols-outlined text-[18px] mr-1 text-accent-gold" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span> 
              {rating}
            </span>
            {location && <span>{location}</span>}
          </div>

          {amenities.length > 0 && (
            <div className="flex space-x-3">
              {amenities.map((item, idx) => (
                <span 
                  key={idx} 
                  className="material-symbols-outlined text-white/80" 
                  title={item}
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-left md:text-right mt-2 md:mt-0">
          <span className="block font-body-md text-body-md text-white/80">From</span>
          <span className="font-headline-md text-headline-md text-white">
            {price} <span className="text-sm font-normal">/night</span>
          </span>
        </div>
      </div>

    </div>
  );
}
