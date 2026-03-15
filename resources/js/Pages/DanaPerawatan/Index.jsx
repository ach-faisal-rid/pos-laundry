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

export default function Index({ danas, filters }) {
    const { delete: destroy, processing } = useForm();
    const items = danas?.data ?? [];
    const [search, setSearch] = useState(filters?.q ?? '');
    const [jenis, setJenis] = useState(filters?.jenis ?? 'all');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { flash } = usePage().props;

    useEffect(() => {
        setSearch(filters?.q ?? '');
        setJenis(filters?.jenis ?? 'all');
    }, [filters?.q, filters?.jenis]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const params = {};
            if (search) params.q = search;
            if (jenis && jenis !== 'all') params.jenis = jenis;
            router.get(route('dana-perawatan.index'), params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 400);

        return () => clearTimeout(handler);
    }, [search, jenis]);

    const handleDelete = (id, label) => {
        if (processing) return;
        setDeleteTarget({ id, label });
    };

    const paginationLinks = useMemo(() => {
        const links = danas?.links ?? [];
        return links.filter(
            (link) =>
                link.label !== '&laquo; Previous' &&
                link.label !== 'Next &raquo;',
        );
    }, [danas]);

    const prevLink = danas?.links?.[0];
    const nextLink = danas?.links?.[danas?.links?.length - 1];

    const buildPageData = (url) => {
        if (!url) return null;
        const parsed = new URL(url, window.location.origin);
        const page = parsed.searchParams.get('page');
        const data = {};
        if (page && Number(page) > 1) data.page = Number(page);
        if (search) data.q = search;
        if (jenis && jenis !== 'all') data.jenis = jenis;
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

    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    return (
        <AuthenticatedLayout header="Dana Perawatan">
            <Head title="Dana Perawatan" />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Dana Perawatan</CardTitle>
                            <Button asChild>
                                <Link href={route('dana-perawatan.create')}>
                                    Tambah Dana
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
                                    placeholder="Keterangan"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Jenis</Label>
                                <Select value={jenis} onValueChange={setJenis}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="pemasukan">Pemasukan</SelectItem>
                                        <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
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
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-muted-foreground"
                                        >
                                            Belum ada data.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((dana) => (
                                        <TableRow key={dana.id}>
                                            <TableCell>
                                                {formatDate(dana.tanggal)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {dana.keterangan || '-'}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {dana.jenis}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(dana.jumlah)}
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
                                                                'dana-perawatan.edit',
                                                                dana.id,
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
                                                                dana.id,
                                                                dana.keterangan || 'dana',
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
                        {danas?.links?.length > 3 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        {prevLink?.url ? (
                                            <PaginationItem>
                                                <PaginationLink asChild size="default">
                                                    <Link
                                                        href={route('dana-perawatan.index')}
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
                                                            href={route('dana-perawatan.index')}
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
                                                        href={route('dana-perawatan.index')}
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
                        <AlertDialogTitle>Hapus data?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget
                                ? `Data "${deleteTarget.label}" akan dihapus permanen.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (!deleteTarget) return;
                                destroy(route('dana-perawatan.destroy', deleteTarget.id));
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
