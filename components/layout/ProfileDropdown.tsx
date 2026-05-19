"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Settings,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import type { AppRole } from "@/lib/auth/profile-role";
import { getHomePathForRole } from "@/lib/auth/role-routing";

type ProfileDropdownUser = {
    email: string | null;
    fullName?: string | null;
    role: AppRole;
};

type ProfileDropdownProps = {
    user: ProfileDropdownUser | null;
    isLoading?: boolean;
    onSignOut?: () => Promise<void> | void;
};

export function ProfileDropdown({
    user,
    isLoading = false,
    onSignOut,
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const menuId = useId();

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: PointerEvent) {
            const target = event.target as Node;
            if (buttonRef.current?.contains(target)) return;
            if (menuRef.current?.contains(target)) return;
            setIsOpen(false);
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    if (isLoading) {
        return (
            <div className="flex h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-500">
                <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-200" />
                <span>Loading auth state...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
            >
                Sign in
            </Link>
        );
    }

    const displayName = user.fullName || user.email || "Account";
    const initials = getInitials(displayName);
    const homePath = getHomePathForRole(user.role);

    return (
        <div className="relative isolate">
            <button
                ref={buttonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={() => setIsOpen((value) => !value)}
                className="flex h-10 max-w-64 items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 text-left text-sm text-zinc-900 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
            >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                    {initials}
                </span>
                <span className="hidden min-w-0 sm:block">
                    <span className="block truncate font-medium">{displayName}</span>
                    <span className="block truncate text-xs capitalize text-zinc-500">
                        {user.role}
                    </span>
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition ${isOpen ? "rotate-180" : ""
                        }`}
                    aria-hidden="true"
                />
            </button>

            {isOpen ? (
                <div
                    ref={menuRef}
                    id={menuId}
                    role="menu"
                    className="absolute right-0 top-12 z-[100] w-72 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl outline-none"
                >
                    <div className="border-b border-zinc-100 px-4 py-3">
                        <div className="truncate text-sm font-semibold text-zinc-950">
                            {displayName}
                        </div>
                        {user.email ? (
                            <div className="mt-0.5 truncate text-xs text-zinc-500">
                                {user.email}
                            </div>
                        ) : null}
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-700">
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            {user.role}
                        </div>
                    </div>

                    <div className="p-1.5">
                        <DropdownLink href={homePath} icon={<LayoutDashboard />}>
                            Dashboard
                        </DropdownLink>
                        <DropdownLink href="/account/profile" icon={<UserRound />}>
                            Profile
                        </DropdownLink>
                        <DropdownLink href="/account/settings" icon={<Settings />}>
                            Settings
                        </DropdownLink>
                    </div>

                    <div className="border-t border-zinc-100 p-1.5">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={async () => {
                                setIsOpen(false);
                                await onSignOut?.();
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                        >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            Sign out
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function DropdownLink({
    href,
    icon,
    children,
}: {
    href: string;
    icon: React.ReactElement;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            role="menuitem"
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none"
        >
            {iconWithClass(icon)}
            {children}
        </Link>
    );
}

function iconWithClass(icon: React.ReactElement) {
    return {
        ...icon,
        props: {
            ...icon.props,
            className: "h-4 w-4",
            "aria-hidden": true,
        },
    };
}

function getInitials(value: string) {
    const parts = value
        .split(/[\s@._-]+/)
        .map((part) => part.trim())
        .filter(Boolean);

    const first = parts[0]?.[0] ?? "U";
    const second = parts[1]?.[0] ?? "";

    return `${first}${second}`.toUpperCase();
}