import "./navbar.css"

export const Navbar = () => {
    return <>
        <nav className="navbar">
            <div className="navlogo">
                <a href="#" className="logo"><img src="../src/assets/logo.png" alt="Z-Kit logo" /></a>
            </div>

            <ul className="navlinks">
                <li><a href="#" className="navlink">Components</a></li>
                <li><a href="#" className="navlink">Blocks</a></li>
                <li><a href="#" className="navlink">Figma</a></li>
                <li><a href="#" className="navlink">Docs</a></li>
            </ul>

            <div className="search-bar">
                <input type="text" name="search" id="search" placeholder="Search..." autoComplete="off" />
                <svg className="search-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5001 10.5L8.33008 8.33" stroke="#A1A1A1" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M5.5 9.5C7.70914 9.5 9.5 7.70914 9.5 5.5C9.5 3.29086 7.70914 1.5 5.5 1.5C3.29086 1.5 1.5 3.29086 1.5 5.5C1.5 7.70914 3.29086 9.5 5.5 9.5Z" stroke="#A1A1A1" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

            </div>

            <ul className="nav-actions">
                <li><button className="github"><svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.4999 11V9C7.56946 8.37365 7.38986 7.74506 6.9999 7.25C8.4999 7.25 9.9999 6.25 9.9999 4.5C10.0399 3.875 9.8649 3.26 9.4999 2.75C9.6399 2.175 9.6399 1.575 9.4999 1C9.4999 1 8.9999 1 7.9999 1.75C6.6799 1.5 5.3199 1.5 3.9999 1.75C2.9999 1 2.4999 1 2.4999 1C2.3499 1.575 2.3499 2.175 2.4999 2.75C2.13583 3.25794 1.95913 3.87639 1.9999 4.5C1.9999 6.25 3.4999 7.25 4.9999 7.25C4.8049 7.495 4.6599 7.775 4.5749 8.075C4.4899 8.375 4.4649 8.69 4.4999 9V11" stroke="#EDEDED" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M4.5 9C2.245 10 2 8 1 8" stroke="#EDEDED" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                    26.4K</button></li>
                <li><button><svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_451_417)">
                        <path d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z" stroke="#EDEDED" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M6 1V11" stroke="#EDEDED" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M9.2793 3.08958L6.00078 5.74744" stroke="#EDEDED" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M7.94727 2L6.00086 3.62114" stroke="#EDEDED" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M10.0498 4.61629L6.00078 7.87362" stroke="#EDEDED" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M10.9512 6.04163L6.00145 9.99992" stroke="#EDEDED" stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                    <defs>
                        <clipPath id="clip0_451_417">
                            <rect width="12" height="12" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
                </button></li>
                <li><button className="primary"><svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1V7.5" stroke="#1A1A1A" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M8 3L6 1L4 3" stroke="#1A1A1A" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M2 6V10C2 10.2652 2.10536 10.5196 2.29289 10.7071C2.48043 10.8946 2.73478 11 3 11H9C9.26522 11 9.51957 10.8946 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V6" stroke="#1A1A1A" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                    Share</button></li>
            </ul>
        </nav>
    </>
}