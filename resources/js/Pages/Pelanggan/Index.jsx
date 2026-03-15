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
import QRCode from 'qrcode';
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from '@/Components/ui/pagination';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function Index({ pelanggans, filters }) {
    const { delete: destroy, processing } = useForm();
    const importForm = useForm({ file: null });
    const items = pelanggans?.data ?? [];
    const [search, setSearch] = useState(filters?.q ?? '');
    const [filter, setFilter] = useState(filters?.filter ?? 'all');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { flash } = usePage().props;
    const [previewRows, setPreviewRows] = useState([]);
    const [previewError, setPreviewError] = useState('');
    const [qrMap, setQrMap] = useState({});

    useEffect(() => {
        setSearch(filters?.q ?? '');
        setFilter(filters?.filter ?? 'all');
    }, [filters?.q, filters?.filter]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const params = {};
            if (search) params.q = search;
            if (filter && filter !== 'all') params.filter = filter;
            router.get(route('pelanggan.index'), params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 400);

        return () => clearTimeout(handler);
    }, [search, filter]);

    const handleDelete = (id, nama) => {
        if (processing) return;
        setDeleteTarget({ id, nama });
    };

    const paginationLinks = useMemo(() => {
        const links = pelanggans?.links ?? [];
        return links.filter(
            (link) =>
                link.label !== '&laquo; Previous' &&
                link.label !== 'Next &raquo;',
        );
    }, [pelanggans]);

    const prevLink = pelanggans?.links?.[0];
    const nextLink = pelanggans?.links?.[pelanggans?.links?.length - 1];

    const buildPageData = (url) => {
        if (!url) return null;
        const parsed = new URL(url, window.location.origin);
        const page = parsed.searchParams.get('page');
        const data = {};
        if (page && Number(page) > 1) data.page = Number(page);
        if (search) data.q = search;
        if (filter && filter !== 'all') data.filter = filter;
        return data;
    };
    const detectDelimiter = (line) => {
        const commaCount = (line.match(/,/g) || []).length;
        const semicolonCount = (line.match(/;/g) || []).length;
        return semicolonCount > commaCount ? ';' : ',';
    };

    const parseCsvLine = (line, delimiter) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const next = line[i + 1];
            if (char === '"') {
                if (inQuotes && next === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result.map((value) => value.trim());
    };

    const parseCsv = (text) => {
        const lines = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        if (lines.length === 0) return { header: [], rows: [] };
        const delimiter = detectDelimiter(lines[0]);
        const header = parseCsvLine(lines[0], delimiter).map((h, index) => {
            const value = h.toLowerCase();
            return index === 0 ? value.replace(/^\uFEFF/, '') : value;
        });
        const rows = lines.slice(1).map((line) => parseCsvLine(line, delimiter));
        return { header, rows };
    };

    const buildCsv = (rows) => {
        const header = ['nama', 'no_hp', 'alamat'];
        const escape = (value) => {
            const str = String(value ?? '');
            const escaped = str.replace(/"/g, '""');
            return `"${escaped}"`;
        };
        const lines = [header.join(',')];
        rows.forEach((row) => {
            lines.push(
                [row.nama, row.no_hp, row.alamat].map(escape).join(','),
            );
        });
        return lines.join('\n');
    };

    const normalizeNoHp = (value) => {
        const digits = value.replace(/\D/g, '');
        if (digits.startsWith('62')) {
            return `0${digits.slice(2)}`;
        }
        return digits;
    };

    const validateRow = (row) => {
        const nama = row.nama.trim();
        const noHp = normalizeNoHp(row.no_hp);
        const alamat = row.alamat.trim();
        const errors = {};

        if (!nama) errors.nama = 'Nama wajib diisi.';
        if (!noHp) {
            errors.no_hp = 'No. HP wajib diisi.';
        } else if (noHp.length < 11 || noHp.length > 14) {
            errors.no_hp = 'No. HP harus 11-14 digit.';
        }
        if (!alamat) errors.alamat = 'Alamat wajib diisi.';

        return { normalized: { nama, no_hp: noHp, alamat }, errors };
    };

    const handleFileChange = (file) => {
        setPreviewError('');
        setPreviewRows([]);
        importForm.setData('file', file ?? null);

        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result ?? '';
            const { header, rows } = parseCsv(text);
            const required = ['nama', 'no_hp', 'alamat'];
            const missing = required.filter((col) => !header.includes(col));
            if (missing.length > 0) {
                setPreviewError(
                    'Kolom wajib belum lengkap: nama, no_hp, alamat.',
                );
                return;
            }

            const indexMap = Object.fromEntries(
                header.map((col, index) => [col, index]),
            );
            const prepared = rows.map((cols, index) => {
                const raw = {
                    nama: cols[indexMap.nama] ?? '',
                    no_hp: cols[indexMap.no_hp] ?? '',
                    alamat: cols[indexMap.alamat] ?? '',
                };
                const validation = validateRow(raw);
                return {
                    id: `${index}-${Date.now()}`,
                    ...validation.normalized,
                    _errors: validation.errors,
                };
            });
            setPreviewRows(prepared);
        };
        reader.readAsText(file);
    };

    const updatePreviewRow = (rowId, field, value) => {
        setPreviewRows((prev) =>
            prev.map((row) => {
                if (row.id !== rowId) return row;
                const next = { ...row, [field]: value };
                const validation = validateRow(next);
                return {
                    ...next,
                    ...validation.normalized,
                    _errors: validation.errors,
                };
            }),
        );
    };

    const removePreviewRow = (rowId) => {
        setPreviewRows((prev) => prev.filter((row) => row.id !== rowId));
    };

    const previewHasErrors = previewRows.some(
        (row) => Object.keys(row._errors).length > 0,
    );

    useEffect(() => {
        const generate = async () => {
            const entries = await Promise.all(
                items
                    .filter((item) => item.kode)
                    .map(async (item) => {
                        try {
                            const dataUrl = await QRCode.toDataURL(item.kode, {
                                width: 160,
                            });
                            return [item.id, dataUrl];
                        } catch {
                            return [item.id, null];
                        }
                    }),
            );

            setQrMap(Object.fromEntries(entries.filter(([, value]) => value)));
        };

        if (items.length > 0) {
            generate();
        }
    }, [items]);

    return (
        <AuthenticatedLayout header="Pelanggan">
            <Head title="Pelanggan" />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Pelanggan</CardTitle>
                            <Button asChild>
                                <Link href={route('pelanggan.create')}>
                                    Tambah Pelanggan
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
                                <Label>Filter</Label>
                                <Select value={filter} onValueChange={setFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua pelanggan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua pelanggan</SelectItem>
                                        <SelectItem value="alamat">Dengan alamat</SelectItem>
                                        <SelectItem value="tanpa_alamat">Tanpa alamat</SelectItem>
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
                        <div className="mb-6 rounded-lg border bg-background p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Import Pelanggan (CSV)
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Kolom wajib: nama, no_hp, alamat.
                                    </p>
                                </div>
                                <Button variant="outline" asChild>
                                    <a href={route('pelanggan.template')}>
                                        Download Template
                                    </a>
                                </Button>
                            </div>
                            <form
                                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    importForm.transform((data) => {
                                        if (previewRows.length === 0) {
                                            return data;
                                        }
                                        const csvContent = buildCsv(previewRows);
                                        const file = new File(
                                            [csvContent],
                                            'import-pelanggan.csv',
                                            { type: 'text/csv' },
                                        );
                                        return { ...data, file };
                                    });
                                    importForm.post(route('pelanggan.import'), {
                                        forceFormData: true,
                                        onFinish: () => importForm.transform((data) => data),
                                    });
                                }}
                            >
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="import-file">
                                        Upload CSV
                                    </Label>
                                    <Input
                                        id="import-file"
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={(e) =>
                                            handleFileChange(
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    {previewError && (
                                        <p className="text-sm text-destructive">
                                            {previewError}
                                        </p>
                                    )}
                                    {importForm.errors.file && (
                                        <p className="text-sm text-destructive">
                                            {importForm.errors.file}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={
                                        importForm.processing ||
                                        !importForm.data.file ||
                                        previewError !== '' ||
                                        previewHasErrors
                                    }
                                >
                                    Import
                                </Button>
                            </form>
                        </div>
                        {previewRows.length > 0 && (
                            <div className="mb-6 rounded-lg border bg-background">
                                <div className="border-b px-4 py-3">
                                    <p className="text-sm font-medium text-foreground">
                                        Preview & Edit Data
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Perbaiki data sebelum import. Baris yang
                                        error tidak bisa diimport.
                                    </p>
                                </div>
                                <div className="p-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>No. HP</TableHead>
                                                <TableHead>Alamat</TableHead>
                                                <TableHead className="text-right">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewRows.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="align-top">
                                                        <Input
                                                            value={row.nama}
                                                            onChange={(e) =>
                                                                updatePreviewRow(
                                                                    row.id,
                                                                    'nama',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />
                                                        {row._errors.nama && (
                                                            <p className="mt-1 text-xs text-destructive">
                                                                {row._errors.nama}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input
                                                            value={row.no_hp}
                                                            onChange={(e) =>
                                                                updatePreviewRow(
                                                                    row.id,
                                                                    'no_hp',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                        />
                                                        {row._errors.no_hp && (
                                                            <p className="mt-1 text-xs text-destructive">
                                                                {row._errors.no_hp}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Input
                                                            value={row.alamat}
                                                            onChange={(e) =>
                                                                updatePreviewRow(
                                                                    row.id,
                                                                    'alamat',
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />
                                                        {row._errors.alamat && (
                                                            <p className="mt-1 text-xs text-destructive">
                                                                {row._errors.alamat}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right align-top">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                removePreviewRow(
                                                                    row.id,
                                                                )
                                                            }
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>No. HP</TableHead>
                                    <TableHead>Alamat</TableHead>
                                    <TableHead>QR</TableHead>
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
                                            Belum ada pelanggan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((pelanggan) => (
                                        <TableRow key={pelanggan.id}>
                                            <TableCell className="font-medium">
                                                {pelanggan.nama}
                                            </TableCell>
                                            <TableCell>{pelanggan.no_hp}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {pelanggan.alamat || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {pelanggan.kode && qrMap[pelanggan.id] ? (
                                                    <div className="flex flex-col items-start gap-2">
                                                        <img
                                                            src={qrMap[pelanggan.id]}
                                                            alt="QR"
                                                            className="h-16 w-16"
                                                        />
                                                        <a
                                                            href={qrMap[pelanggan.id]}
                                                            download={`qr-${pelanggan.kode}.png`}
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            Download
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Belum ada
                                                    </span>
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
                                                                'pelanggan.edit',
                                                                pelanggan.id,
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    {!pelanggan.kode && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'pelanggan.generate-kode',
                                                                    pelanggan.id,
                                                                )}
                                                                method="patch"
                                                                as="button"
                                                            >
                                                                Generate QR
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                pelanggan.id,
                                                                pelanggan.nama,
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
                        {pelanggans?.links?.length > 3 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        {prevLink?.url ? (
                                            <PaginationItem>
                                                <PaginationLink asChild size="default">
                                                    <Link
                                                        href={route('pelanggan.index')}
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
                                                            href={route('pelanggan.index')}
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
                                                        href={route('pelanggan.index')}
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

            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus pelanggan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget
                                ? `Pelanggan "${deleteTarget.nama}" akan dihapus permanen.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (!deleteTarget) return;
                                destroy(route('pelanggan.destroy', deleteTarget.id));
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
