import { cssBundleHref } from "@remix-run/css-bundle";
import { type LinksFunction, type MetaFunction } from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";
import appStylesHref from "./styles/app.css";
import logo from "./images/logo.png";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const meta: MetaFunction = () => {
  return [
    { name: "Title", description: "Todo App" },
    { name: "description", content: "簡単管理" },
  ];
};

export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const links = [
    { name: "トップページ", to: "/" },
    { name: "タスク一覧", to: "/task" },
  ];
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav id="appbar">
          <Link to="/">
            <img src={logo} width={1300 / 6} height={300 / 6} alt="logo" />
          </Link>
        </nav>
        <div className="flex">
          <aside id="sidebar">
            <ul>
              {links.map((link) => (
                <li key={link.to} className="my-4 mx-2">
                  <NavLink
                    id="link"
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                    to={link.to}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>
          <main className={isLoading ? "loading" : ""}>
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
