import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from '@/Components/ui/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function Index({ tiers, filters }) {
    const { delete: destroy, processing } = useForm();
    const items = tiers?.data ?? [];
    const [search, setSearch] = useState(filters?.q ?? '');
    const [aktif, setAktif] = useState(filters?.aktif ?? 'all');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { flash } = usePage().props;

    useEffect(() => {
        setSearch(filters?.q ?? '');
        setAktif(filters?.aktif ?? 'all');
    }, [filters?.q, filters?.aktif]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const params = {};
            if (search) params.q = search;
            if (aktif && aktif !== 'all') params.aktif = aktif;
            router.get(route('loyalty-tier.index'), params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 400);

        return () => clearTimeout(handler);
    }, [search, aktif]);

    const handleDelete = (id, label) => {
        if (processing) return;
        setDeleteTarget({ id, label });
    };

    const paginationLinks = useMemo(() => {
        const links = tiers?.links ?? [];
        return links.filter(
            (link) =>
                link.label !== '&laquo; Previous' &&
                link.label !== 'Next &raquo;',
        );
    }, [tiers]);

    const prevLink = tiers?.links?.[0];
    const nextLink = tiers?.links?.[tiers?.links?.length - 1];

    const buildPageData = (url) => {
        if (!url) return null;
        const parsed = new URL(url, window.location.origin);
        const page = parsed.searchParams.get('page');
        const data = {};
        if (page && Number(page) > 1) data.page = Number(page);
        if (search) data.q = search;
        if (aktif && aktif !== 'all') data.aktif = aktif;
        return data;
    };

    return (
        <AuthenticatedLayout header="Diskon Loyalti">
            <Head title="Diskon Loyalti" />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Diskon Loyalti</CardTitle>
                            <Button asChild>
                                <Link href={route('loyalty-tier.create')}>
                                    Tambah Diskon
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="search">Cari</Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Kode atau nama"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={aktif} onValueChange={setAktif}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {flash?.message && (
                            <div className="mb-4 rounded-md border border-muted bg-muted/40 px-4 py-3 text-sm text-foreground">
                                {flash.message}
                            </div>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Min. Transaksi</TableHead>
                                    <TableHead>Diskon</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-sm text-muted-foreground"
                                        >
                                            Belum ada diskon loyalti.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((tier) => (
                                        <TableRow key={tier.id}>
                                            <TableCell className="font-medium">
                                                {tier.kode}
                                            </TableCell>
                                            <TableCell>{tier.nama}</TableCell>
                                            <TableCell>{tier.min_transaksi}</TableCell>
                                            <TableCell>{tier.diskon_persen}%</TableCell>
                                            <TableCell>
                                                {tier.aktif ? 'Aktif' : 'Nonaktif'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'loyalty-tier.edit',
                                                                tier.id,
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                tier.id,
                                                                tier.nama,
                                                            )
                                                        }
                                                    >
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        {tiers?.links?.length > 3 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        {prevLink?.url ? (
                                            <PaginationItem>
                                                <PaginationLink asChild size="default">
                                                    <Link
                                                        href={route('loyalty-tier.index')}
                                                        data={buildPageData(prevLink.url)}
                                                        preserveState
                                                        preserveScroll
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Prev
                                                        </span>
                                                    </Link>
                                                </PaginationLink>
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem>
                                                <PaginationLink
                                                    href="#"
                                                    size="default"
                                                    className="pointer-events-none opacity-50"
                                                >
                                                    <span className="inline-flex items-center gap-1">
                                                        <ChevronLeft className="h-4 w-4" />
                                                        Prev
                                                    </span>
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}

                                        {paginationLinks.map((link, index) => (
                                            <PaginationItem key={`${link.label}-${index}`}>
                                                {link.url ? (
                                                    <PaginationLink
                                                        asChild
                                                        isActive={link.active}
                                                    >
                                                        <Link
                                                            href={route('loyalty-tier.index')}
                                                            data={buildPageData(link.url)}
                                                            preserveState
                                                            preserveScroll
                                                        >
                                                            {link.label
                                                                .replace('&laquo; ', '')
                                                                .replace(' &raquo;', '')}
                                                        </Link>
                                                    </PaginationLink>
                                                ) : (
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={link.active}
                                                        className="pointer-events-none opacity-50"
                                                    >
                                                        {link.label
                                                            .replace('&laquo; ', '')
                                                            .replace(' &raquo;', '')}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                        {nextLink?.url ? (
                                            <PaginationItem>
                                                <PaginationLink asChild size="default">
                                                    <Link
                                                        href={route('loyalty-tier.index')}
                                                        data={buildPageData(nextLink.url)}
                                                        preserveState
                                                        preserveScroll
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            Next
                                                            <ChevronRight className="h-4 w-4" />
                                                        </span>
                                                    </Link>
                                                </PaginationLink>
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem>
                                                <PaginationLink
                                                    href="#"
                                                    size="default"
                                                    className="pointer-events-none opacity-50"
                                                >
                                                    <span className="inline-flex items-center gap-1">
                                                        Next
                                                        <ChevronRight className="h-4 w-4" />
                                                    </span>
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={() => setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus diskon?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget
                                ? `Diskon "${deleteTarget.label}" akan dihapus permanen.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (!deleteTarget) return;
                                destroy(route('loyalty-tier.destroy', deleteTarget.id));
                                setDeleteTarget(null);
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
