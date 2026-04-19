import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <div className="brand__mark">F</div>
            <div>
              <h1 className="brand__name">Finance Superapp</h1>
              <p className="brand__tagline">
                Utility-first workflows for small businesses, built to scale.
              </p>
            </div>
          </div>

          <nav className="header-nav" aria-label="Primary">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `header-pill ${isActive ? "header-pill--active" : ""}`.trim()
              }
            >
              Utilities
            </NavLink>
            <span className="header-pill">JWT-ready backend structure</span>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
