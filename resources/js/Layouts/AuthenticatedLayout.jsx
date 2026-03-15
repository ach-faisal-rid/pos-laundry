import ApplicationLogo from '@/Components/ApplicationLogo';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    LogOut,
    Menu,
    Receipt,
    Tag,
    Wrench,
    User2,
    UserPlus,
    Users,
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const initials =
        user?.name
            ?.split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase() || 'U';

    const navItems = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            active: route().current('dashboard'),
        },
        {
            label: 'Pelanggan',
            href: route('pelanggan.index'),
            icon: Users,
            active: route().current('pelanggan.index'),
        },
        {
            label: 'Transaksi',
            href: route('transaksi.index'),
            icon: Receipt,
            active: route().current('transaksi.index'),
        },
        {
            label: 'Tarif',
            href: route('tarif.index'),
            icon: Tag,
            active: route().current('tarif.index'),
        },
        {
            label: 'Dana Perawatan',
            href: route('dana-perawatan.index'),
            icon: Wrench,
            active: route().current('dana-perawatan.index'),
        },
    ];

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="flex min-h-screen">
                <aside className="flex-col hidden w-64 border-r bg-background lg:flex">
                    <div className="flex items-center h-16 gap-2 px-4 border-b">
                        <ApplicationLogo className="w-auto h-8 fill-current text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                            POS Laundry
                        </span>
                    </div>
                    <div className="flex-1 p-4">
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={
                                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
                                            (item.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground')
                                        }
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <div className="flex flex-col flex-1 min-w-0">
                    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-background/95 backdrop-blur lg:px-6">
                        <div className="flex items-center gap-3">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden"
                                    >
                                        <Menu className="w-5 h-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0">
                                    <div className="flex items-center h-16 gap-2 px-4 border-b">
                                        <ApplicationLogo className="w-auto h-8 fill-current text-primary" />
                                        <span className="text-sm font-semibold text-foreground">
                                            POS Laundry
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <nav className="space-y-1">
                                            {navItems.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.label}
                                                        href={item.href}
                                                        className={
                                                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
                                                            (item.active
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground')
                                                        }
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}
                                        </nav>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {header && (
                                <div className="text-lg font-semibold text-foreground">
                                    {header}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden text-sm text-right lg:block">
                                <div className="font-medium text-foreground">
                                    {user.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {user.email}
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="p-0 rounded-full h-9 w-9"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-48"
                                    align="end"
                                >
                                    <DropdownMenuLabel>
                                        Akun
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex items-center gap-2"
                                        >
                                            <User2 className="w-4 h-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <main className="flex-1 p-4 lg:p-6">{children}</main>
                </div>
            </div>
        </div>
    );
}
