import React from 'react';
import { Volume2, Leaf } from 'lucide-react';
import { speechNarrator } from '../../utils/speech';
export const CompanionBanner: React.FC = () => (
  <section className="qy-welcome">
    <span className="qy-welcome-mark" aria-hidden="true"><Leaf /></span>
    <div className="qy-welcome-copy">
      <h1>今天，按你的节奏来</h1>
      <p>可以探索，也可以歇一会儿。</p>
    </div>
    <button type="button" className="qy-icon-button"
      onClick={() => speechNarrator.speak('今天，按你的节奏来。可以探索，也可以歇一会儿。')}
      aria-label="听一听今天的问候"><Volume2 aria-hidden="true" /></button>
  </section>
);
