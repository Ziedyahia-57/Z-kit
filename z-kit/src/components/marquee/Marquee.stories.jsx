import { useEffect } from 'react';
import { Marquee, MarqueeTitle, MarqueeBrands, MarqueeBrand } from './Marquee';

// Decorator that responds to a darkMode arg
const withDarkModeControl = (Story, context) => {
    const { darkmode = false } = context.args;

    useEffect(() => {
        const main = document.querySelector(".sb-show-main");

        if (darkmode) {
            document.body.setAttribute("data-dark", "true");
            main?.style.setProperty("background", "var(--gray-950)", "important");
        } else {
            document.body.removeAttribute("data-dark");
            main?.style.setProperty("background", "var(--gray-25)", "important");
        }

        return () => {
            document.body.removeAttribute("data-dark");
            main?.style.removeProperty("background");
        };
    }, [darkmode]);

    return <Story />;
};

const withRTLControl = (Story, context) => {
    const { rtl = false } = context.args;

    return (
        <div className={rtl ? "rtl" : ""}>
            <Story />
        </div>
    );
};

const meta = {
    title: "Z-kit/Marquee",
    component: Marquee,
    tags: ["autodocs"],
    decorators: [withDarkModeControl, withRTLControl],
    parameters: {
        docs: {
            description: {
                story: "Marquee UI Component — compound API: <Marquee><MarqueeTitle/><MarqueeBrands><MarqueeBrand/></MarqueeBrands></Marquee>",
            },
        }
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        speed: {
            control: { type: "number" },
            name: "Speed",
            description: "Scroll speed of the logos, in pixels per second",
        },
        title: {
            control: { type: "text" },
            name: "Title",
            description: "Title of the marquee",
        },
        brandCount: {
            control: { type: "range", min: 1, max: 50, step: 1 },
            name: "Brand Count",
            description: "Number of brand logos to display",
        },
    }
}

export default meta;

export const marquee = {
    args: {
        darkmode: false,
        showName: true,
        title: "Our Partners",
        speed: 40,
        brandCount: 7,
    },
    render: (args) => {
        const allBrands = [
            <MarqueeBrand key="github" showName={args.showName}>
                <svg fill="CurrentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                </svg>
                <p>GitHub</p>
            </MarqueeBrand>,
            <MarqueeBrand key="slack" showName={args.showName}>
                <svg fill="CurrentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.362 10.11c0 .926-.756 1.681-1.681 1.681S0 11.036 0 10.111.756 8.43 1.68 8.43h1.682zm.846 0c0-.924.756-1.68 1.681-1.68s1.681.756 1.681 1.68v4.21c0 .924-.756 1.68-1.68 1.68a1.685 1.685 0 0 1-1.682-1.68zM5.89 3.362c-.926 0-1.682-.756-1.682-1.681S4.964 0 5.89 0s1.68.756 1.68 1.68v1.682zm0 .846c.924 0 1.68.756 1.68 1.681S6.814 7.57 5.89 7.57H1.68C.757 7.57 0 6.814 0 5.89c0-.926.756-1.682 1.68-1.682zm6.749 1.682c0-.926.755-1.682 1.68-1.682S16 4.964 16 5.889s-.756 1.681-1.68 1.681h-1.681zm-.848 0c0 .924-.755 1.68-1.68 1.68A1.685 1.685 0 0 1 8.43 5.89V1.68C8.43.757 9.186 0 10.11 0c.926 0 1.681.756 1.681 1.68zm-1.681 6.748c.926 0 1.682.756 1.682 1.681S11.036 16 10.11 16s-1.681-.756-1.681-1.68v-1.682h1.68zm0-.847c-.924 0-1.68-.755-1.68-1.68s.756-1.681 1.68-1.681h4.21c.924 0 1.68.756 1.68 1.68 0 .926-.756 1.681-1.68 1.681z" />
                </svg>
                <p>Slack</p>
            </MarqueeBrand>,
            <MarqueeBrand key="spotify" showName={args.showName}>
                <svg fill="CurrentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288" />
                </svg>
                <p>Spotify</p>
            </MarqueeBrand>,
            <MarqueeBrand key="google" showName={args.showName}>
                <svg fill="CurrentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                </svg>
                <p>Google</p>
            </MarqueeBrand>,
            <MarqueeBrand key="apple" showName={args.showName}>
                <svg fill="CurrentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
                </svg>
                <p>Apple</p>
            </MarqueeBrand>,
            <MarqueeBrand key="dropbox" showName={args.showName}>
                <svg fill="CurrentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.01 4.555 4.005 7.11 8.01 9.665 4.005 12.22 0 9.651l4.005-2.555L0 4.555 4.005 2zm-4.026 8.487 4.006-2.555 4.005 2.555-4.005 2.555zm4.026-3.39 4.005-2.556L8.01 4.555 11.995 2 16 4.555 11.995 7.11 16 9.665l-4.005 2.555z" />
                </svg>
                <p>Dropbox</p>
            </MarqueeBrand>,
            <MarqueeBrand key="microsoft" showName={args.showName}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="CurrentColor" width="800px" height="800px" viewBox="0 0 512 512" id="icons"><path d="M31.87,30.58H244.7V243.39H31.87Z" /><path d="M266.89,30.58H479.7V243.39H266.89Z" /><path d="M31.87,265.61H244.7v212.8H31.87Z" /><path d="M266.89,265.61H479.7v212.8H266.89Z" /></svg>
                <p>Microsoft</p>
            </MarqueeBrand>,
        ];

        const activeBrands = allBrands.slice(0, args.brandCount);

        return (
            <Marquee speed={args.speed}>
                <MarqueeTitle>{args.title}</MarqueeTitle>
                <MarqueeBrands>
                    {activeBrands}
                </MarqueeBrands>
            </Marquee>
        );
    }
}

export const marqueeRTL = {
    args: {
        darkmode: false,
        title: "شركاؤنا",
        speed: 40,
        brandCount: 24,
        rtl: true,
    },
    render: (args) => {
        const allBrands = [
            <MarqueeBrand key="scc" showName={false}>
                <img className="monochrome" src="/logos/scc.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="pif" showName={false}>
                <img className="monochrome" src="/logos/pif.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="mbsc" showName={false}>
                <img className="monochrome" src="/logos/mbsc.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="sda" showName={false}>
                <img className="monochrome" src="/logos/sda.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="almajdouie" showName={false}>
                <img className="monochrome" src="/logos/almajdouie.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="tamer" showName={false}>
                <img className="monochrome" src="/logos/tamer.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="srmg" showName={false}>
                <img className="monochrome" src="/logos/srmg.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="tasnee" showName={false}>
                <img className="monochrome" src="/logos/tasnee.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="srm" showName={false}>
                <img className="monochrome" src="/logos/srm.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="jadwa" showName={false}>
                <img className="monochrome" src="/logos/jadwa.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="sunbulah" showName={false}>
                <img className="monochrome" src="/logos/sunbulah.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="kaust" showName={false}>
                <img className="monochrome" src="/logos/kaust.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="saudisoft" showName={false}>
                <img className="monochrome" src="/logos/saudisoft.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="uptown" showName={false}>
                <img className="monochrome" src="/logos/uptown.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="smsa" showName={false}>
                <img className="monochrome" src="/logos/smsa.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="idom" showName={false}>
                <img className="monochrome" src="/logos/idom.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="dubai-expo" showName={false}>
                <img className="monochrome" src="/logos/dubai-expo.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="bae" showName={false}>
                <img className="monochrome" src="/logos/bae.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="misk" showName={false}>
                <img className="monochrome" src="/logos/misk.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="savola" showName={false}>
                <img className="monochrome" src="/logos/savola.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="tazaj" showName={false}>
                <img className="monochrome" src="/logos/tazaj.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="al-musbah" showName={false}>
                <img className="monochrome" src="/logos/al-musbah.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="aramco" showName={false}>
                <img className="monochrome" src="/logos/aramco.webp" />
            </MarqueeBrand>,
            <MarqueeBrand key="aman" showName={false}>
                <img className="monochrome" src="/logos/aman.webp" />
            </MarqueeBrand>,
        ];

        const activeBrands = allBrands.slice(0, args.brandCount);

        return (
            <Marquee speed={args.speed}>
                <MarqueeTitle>{args.title}</MarqueeTitle>
                <MarqueeBrands>
                    {activeBrands}
                </MarqueeBrands>
            </Marquee>
        );
    }
}