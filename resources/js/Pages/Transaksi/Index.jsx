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

export default function Index({ transaksis, filters }) {
    const { delete: destroy, processing } = useForm();
    const items = transaksis?.data ?? [];
    const [search, setSearch] = useState(filters?.q ?? '');
    const [status, setStatus] = useState(filters?.status ?? 'all');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const { flash } = usePage().props;

    useEffect(() => {
        setSearch(filters?.q ?? '');
        setStatus(filters?.status ?? 'all');
    }, [filters?.q, filters?.status]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const params = {};
            if (search) params.q = search;
            if (status && status !== 'all') params.status = status;
            router.get(route('transaksi.index'), params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 400);

        return () => clearTimeout(handler);
    }, [search, status]);

    const handleDelete = (id, label) => {
        if (processing) return;
        setDeleteTarget({ id, label });
    };

    const handleStatusChange = (id, nextStatus) => {
        if (!nextStatus) return;
        setUpdatingId(id);
        router.patch(
            route('transaksi.status', id),
            { status: nextStatus },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setUpdatingId(null),
            },
        );
    };

    const paginationLinks = useMemo(() => {
        const links = transaksis?.links ?? [];
        return links.filter(
            (link) =>
                link.label !== '&laquo; Previous' &&
                link.label !== 'Next &raquo;',
        );
    }, [transaksis]);

    const prevLink = transaksis?.links?.[0];
    const nextLink = transaksis?.links?.[transaksis?.links?.length - 1];

    const buildPageData = (url) => {
        if (!url) return null;
        const parsed = new URL(url, window.location.origin);
        const page = parsed.searchParams.get('page');
        const data = {};
        if (page && Number(page) > 1) data.page = Number(page);
        if (search) data.q = search;
        if (status && status !== 'all') data.status = status;
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

    const isOverdue = (tanggal, status) => {
        if (status === 'diambil') return false;
        const date = new Date(tanggal);
        if (Number.isNaN(date.getTime())) return false;
        const diffDays = Math.floor(
            (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
        );
        return diffDays > 3;
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
        <AuthenticatedLayout header="Transaksi">
            <Head title="Transaksi" />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Transaksi</CardTitle>
                            <Button asChild>
                                <Link href={route('transaksi.create')}>
                                    Tambah Transaksi
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
                                    placeholder="Nama atau No. HP"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua status</SelectItem>
                                        <SelectItem value="proses">Proses</SelectItem>
                                        <SelectItem value="selesai">Selesai</SelectItem>
                                        <SelectItem value="diambil">Diambil</SelectItem>
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
                                    <TableHead>Pelanggan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Estimasi</TableHead>
                                    <TableHead>Total</TableHead>
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
                                            Belum ada transaksi.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((transaksi) => (
                                        <TableRow key={transaksi.id}>
                                            <TableCell>
                                                {formatDate(transaksi.tanggal)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {transaksi.pelanggan?.nama}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {transaksi.pelanggan?.no_hp}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={transaksi.status}
                                                    onValueChange={(value) =>
                                                        handleStatusChange(
                                                            transaksi.id,
                                                            value,
                                                        )
                                                    }
                                                    disabled={updatingId === transaksi.id}
                                                >
                                                    <SelectTrigger className="h-9 w-[140px]">
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="proses">
                                                            Proses
                                                        </SelectItem>
                                                        <SelectItem value="selesai">
                                                            Selesai
                                                        </SelectItem>
                                                        <SelectItem value="diambil">
                                                            Diambil
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {isOverdue(
                                                    transaksi.tanggal,
                                                    transaksi.status,
                                                ) && (
                                                    <div className="mt-2 text-xs text-amber-700">
                                                        Belum diambil &gt; 3 hari
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    transaksi.estimasi_selesai,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    transaksi.total_harga,
                                                )}
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
                                                                'transaksi.edit',
                                                                transaksi.id,
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
                                                                transaksi.id,
                                                                transaksi.pelanggan?.nama ||
                                                                    'transaksi',
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
                        {transaksis?.links?.length > 3 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        {prevLink?.url ? (
                                            <PaginationItem>
                                                <PaginationLink asChild size="default">
                                                    <Link
                                                        href={route('transaksi.index')}
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
                                                            href={route('transaksi.index')}
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
                                                        href={route('transaksi.index')}
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
                        <AlertDialogTitle>Hapus transaksi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget
                                ? `Transaksi untuk "${deleteTarget.label}" akan dihapus permanen.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (!deleteTarget) return;
                                destroy(route('transaksi.destroy', deleteTarget.id));
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
