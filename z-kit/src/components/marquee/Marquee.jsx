import React, { createContext, useContext, useMemo, useState, useEffect, useRef, Children } from 'react';
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
    <div className="marquee-title"><h5>{children}</h5></div>
);

export const MarqueeBrands = ({ children }) => {
    const { speed } = useContext(MarqueeContext);

    const items = useMemo(() => Children.toArray(children).filter(Boolean), [children]);

    const containerRef = useRef(null);
    const singleSetRef = useRef(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [singleWidth, setSingleWidth] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        const singleSet = singleSetRef.current;
        if (!container || !singleSet) return;

        const checkLayout = () => {
            const containerWidth = container.offsetWidth;
            const singleSetWidth = singleSet.offsetWidth;

            setSingleWidth(singleSetWidth);
            setShouldAnimate(singleSetWidth > containerWidth);
        };

        checkLayout();

        const resizeObserver = new ResizeObserver(() => {
            checkLayout();
        });

        resizeObserver.observe(container);
        resizeObserver.observe(singleSet);

        return () => {
            resizeObserver.disconnect();
        };
    }, [children]);

    const duration = useMemo(() => {
        const s = speed || 40;
        return singleWidth > 0 ? singleWidth / s : 8;
    }, [singleWidth, speed]);

    const cssVars = {
        '--duration': `${duration}s`,
    };

    return (
        <div
            className="marquee-brands"
            ref={containerRef}
            style={cssVars}
        >
            <div className={`marquee-track ${shouldAnimate ? 'animate' : ''}`}>
                <div className="marquee-group" ref={singleSetRef}>
                    {items.map((child, i) =>
                        React.cloneElement(child, { key: `a-${i}` })
                    )}
                </div>
                {shouldAnimate && (
                    <div className="marquee-group" aria-hidden="true">
                        {items.map((child, i) =>
                            React.cloneElement(child, { key: `b-${i}`, ariaHidden: true })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const MarqueeBrand = ({ children, ariaHidden, showName = true }) => (
    <div
        className={`marquee-brand ${showName ? '' : 'marquee-brand--icon-only'}`}
        aria-hidden={ariaHidden || undefined}
    >
        {children}
    </div>
);