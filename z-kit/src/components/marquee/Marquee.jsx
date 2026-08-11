import React, { createContext, useContext, useMemo, Children } from 'react';
import './Marquee.scss';

const MarqueeContext = createContext({ speed: 40 });

export const Marquee = ({ children, speed = 40 }) => {
    const ctx = useMemo(() => ({ speed }), [speed]);

    return (
        <MarqueeContext.Provider value={ctx}>
            <div className="marquee">{children}</div>
        </MarqueeContext.Provider>
    );
};

export const MarqueeTitle = ({ children }) => (
    <div className="marquee-title"><p>{children}</p></div>
);

export const MarqueeBrands = ({ children }) => {
    const { speed } = useContext(MarqueeContext);

    const items = useMemo(() => Children.toArray(children).filter(Boolean), [children]);
    const count = items.length || 1;

    const duration = useMemo(
        () => Math.max((count * 240) / speed, 8),
        [count, speed]
    );

    const cssVars = {
        '--brand-count': count,
        '--duration': `${duration}s`,
    };

    return (
        <div className="marquee-brands" style={cssVars}>
            <div className="marquee-track">
                {items.map((child, i) =>
                    React.cloneElement(child, { key: `a-${i}` })
                )}
                {items.map((child, i) =>
                    React.cloneElement(child, { key: `b-${i}`, ariaHidden: true })
                )}
            </div>
        </div>
    );
};

export const MarqueeBrand = ({ children, ariaHidden }) => (
    <div
        className='marquee-brand'
        aria-hidden={ariaHidden || undefined}
    >
        {children}
    </div>
);