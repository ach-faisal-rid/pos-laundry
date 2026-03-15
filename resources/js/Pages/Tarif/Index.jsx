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

export default function Index({ tarifs, filters }) {
    const { delete: destroy, processing } = useForm();
    const items = tarifs?.data ?? [];
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
            router.get(route('tarif.index'), params, {
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
        const links = tarifs?.links ?? [];
        return links.filter(
            (link) =>
                link.label !== '&laquo; Previous' &&
                link.label !== 'Next &raquo;',
        );
    }, [tarifs]);

    const prevLink = tarifs?.links?.[0];
    const nextLink = tarifs?.links?.[tarifs?.links?.length - 1];

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

    const formatCurrency = (value) => {
        const number = Number(value ?? 0);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(number);
    };

    return (
        <AuthenticatedLayout header="Tarif Laundry">
            <Head title="Tarif Laundry" />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Tarif</CardTitle>
                            <Button asChild>
                                <Link href={route('tarif.create')}>
                                    Tambah Tarif
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
                                    placeholder="Nama layanan"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={aktif} onValueChange={setAktif}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua status</SelectItem>
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
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Harga / Kilo</TableHead>
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
                                            colSpan={4}
                                            className="text-center text-sm text-muted-foreground"
                                        >
                                            Belum ada tarif.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((tarif) => (
                                        <TableRow key={tarif.id}>
                                            <TableCell className="font-medium">
                                                {tarif.nama}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(tarif.harga_per_kilo)}
                                            </TableCell>
                                            <TableCell>
                                                {tarif.aktif ? 'Aktif' : 'Nonaktif'}
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
                                                                'tarif.edit',
                                                                tarif.id,
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
                                                                tarif.id,
                                                                tarif.nama,
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
                        {tarifs?.links?.length > 3 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        {prevLink?.url ? (
                                            <PaginationItem>
                                                <PaginationLink asChild size="default">
                                                    <Link
                                                        href={route('tarif.index')}
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
                                                            href={route('tarif.index')}
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
                                                        href={route('tarif.index')}
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
                        <AlertDialogTitle>Hapus tarif?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget
                                ? `Tarif "${deleteTarget.label}" akan dihapus permanen.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (!deleteTarget) return;
                                destroy(route('tarif.destroy', deleteTarget.id));
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
