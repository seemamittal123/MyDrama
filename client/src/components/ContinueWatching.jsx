import { useState } from "react";
import { Play, Plus } from "lucide-react";

const ContinueWatching =({ items = [] }) =>{
  const [activeCard, setActiveCard] = useState(null);

  const handleCardTap = (id) => {
    setActiveCard((prev) => (prev === id ? null : id));
  };

  return (
    <section className="continue-watching">
      <h2 className="continue-watching__title">Continue-Watching</h2>

      <div className="continue-watching__grid">
        {items.map((item) => {
          const isActive = activeCard === item._id;

          return (
            <div
              key={item._id}
              className={`cw-card ${isActive ? "cw-card--active" : ""}`}
              onClick={() => handleCardTap(item._id)}
            >
              <div className="cw-card__image">
                <img src={item.thumbnail_url} alt={item.title} />
              </div>

              <div className="cw-card__overlay">
                <div className="cw-card__meta-row">
                  <span className="cw-card__match">{item.matchPercent || 96}% Match</span>
                  <span className="cw-card__tag">{item.hd ? "HD" : "SD"}</span>
                  <span className="cw-card__session">{item.session || 1} Session</span>
                </div>

                <div className="cw-card__controls">
                  <button className="cw-card__play" aria-label="Play">
                    <Play size={20} fill="black" />
                  </button>
                  <button className="cw-card__add" aria-label="Add to list">
                    <Plus size={18} />
                  </button>
                </div>

                <p className="cw-card__genres">{item.genre?.join(" · ")}</p>
              </div>

              <p className="cw-card__label">{item.title}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default ContinueWatching;