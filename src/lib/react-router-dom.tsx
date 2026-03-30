"use client";

import React, { AnchorHTMLAttributes, ReactNode, forwardRef, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAVIGATION_STATE_PREFIX = "__next_router_state__:";

const isBrowser = () => typeof window !== "undefined";

const getPathname = (to: string) => {
  if (!to) return "/";
  if (isBrowser()) {
    return new URL(to, window.location.origin).pathname;
  }
  return to.split("?")[0]?.split("#")[0] || "/";
};

const saveNavigationState = (to: string, state: unknown) => {
  if (!isBrowser()) return;
  const pathname = getPathname(to);
  const key = `${NAVIGATION_STATE_PREFIX}${pathname}`;

  if (state === undefined) {
    sessionStorage.removeItem(key);
    return;
  }

  sessionStorage.setItem(key, JSON.stringify(state));
};

const loadNavigationState = (pathname: string) => {
  if (!isBrowser()) return null;

  const raw = sessionStorage.getItem(`${NAVIGATION_STATE_PREFIX}${pathname}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

export type Location<S = unknown> = {
  pathname: string;
  search: string;
  hash: string;
  state: S | null;
  key: string;
};

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  replace?: boolean;
  state?: unknown;
};

export type NavLinkRenderProps = {
  isActive: boolean;
  isPending: boolean;
};

export type NavLinkProps = Omit<LinkProps, "className" | "children"> & {
  className?: string | ((props: NavLinkRenderProps) => string);
  children?: ReactNode | ((props: NavLinkRenderProps) => ReactNode);
  end?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, state, onClick, ...props }, ref) => {
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (!event.defaultPrevented && state !== undefined) {
        saveNavigationState(to, state);
      }
      onClick?.(event);
    };

    return <NextLink ref={ref} href={to} replace={replace} onClick={handleClick} {...props} />;
  },
);
Link.displayName = "Link";

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, end = false, className, children, ...props }, ref) => {
    const pathname = usePathname() || "/";
    const targetPath = getPathname(to);
    const isActive =
      pathname === targetPath || (!end && targetPath !== "/" && pathname.startsWith(`${targetPath}/`));
    const renderProps = { isActive, isPending: false };
    const resolvedClassName =
      typeof className === "function" ? className(renderProps) : className;
    const content = typeof children === "function" ? children(renderProps) : children;

    return (
      <Link
        ref={ref}
        to={to}
        className={resolvedClassName}
        aria-current={isActive ? "page" : undefined}
        {...props}
      >
        {content}
      </Link>
    );
  },
);
NavLink.displayName = "NavLink";

export const useNavigate = () => {
  const router = useRouter();

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (isBrowser()) {
        window.history.go(to);
      }
      return;
    }

    if (options?.state !== undefined) {
      saveNavigationState(to, options.state);
    }

    if (options?.replace) {
      router.replace(to);
      return;
    }

    router.push(to);
  };
};

export const useLocation = <S = unknown,>(): Location<S> => {
  const pathname = usePathname() || "/";
  const [search, setSearch] = useState("");
  const [hash, setHash] = useState("");
  const [state, setState] = useState<S | null>(() => loadNavigationState(pathname));

  useEffect(() => {
    setState(loadNavigationState(pathname));
    if (isBrowser()) {
      setSearch(window.location.search);
      setHash(window.location.hash);
    }
  }, [pathname]);

  return {
    pathname,
    search,
    hash,
    state,
    key: pathname,
  };
};

export const Navigate = ({
  to,
  replace = false,
  state,
}: {
  to: string;
  replace?: boolean;
  state?: unknown;
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace, state });
  }, [navigate, replace, state, to]);

  return null;
};

export const BrowserRouter = ({ children }: { children: ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children: ReactNode }) => <>{children}</>;
export const Route = ({
  element,
  children,
}: {
  element?: ReactNode;
  children?: ReactNode;
  path?: string;
  index?: boolean;
}) => <>{element || children || null}</>;
export const Outlet = () => null;
