import { Head } from '@inertiajs/react';

export default function LaundryStatus({ found, pelanggan, recent }) {
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
        <div className="min-h-screen bg-muted/40 px-4 py-8">
            <Head title="Cek Status Laundry" />
            <div className="mx-auto max-w-xl space-y-6">
                <div className="rounded-xl border bg-background p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Cek Status Laundry
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Informasi ini hanya menampilkan data ringkas untuk
                        pelanggan.
                    </p>
                </div>

                {!found && (
                    <div className="rounded-xl border bg-background p-6 text-sm text-muted-foreground shadow-sm">
                        Kode tidak ditemukan.
                    </div>
                )}

                {found && (
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-6 shadow-sm">
                            <div className="text-xs text-muted-foreground">
                                Nama
                            </div>
                            <div className="text-lg font-semibold text-foreground">
                                {pelanggan?.nama}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                No. HP
                            </div>
                            <div className="text-sm text-foreground">
                                {pelanggan?.no_hp}
                            </div>
                        </div>

                        <div className="rounded-xl border bg-background p-6 shadow-sm">
                            <div className="text-sm font-semibold text-foreground">
                                Transaksi Terakhir
                            </div>
                            <div className="mt-3 space-y-2 text-sm">
                                {recent?.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">
                                        Belum ada transaksi.
                                    </div>
                                ) : (
                                    recent?.map((trx) => (
                                        <div
                                            key={trx.id}
                                            className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {formatDate(trx.tanggal)}
                                                </div>
                                                <div className="text-xs text-muted-foreground capitalize">
                                                    {trx.status}
                                                </div>
                                            </div>
                                            <div className="font-semibold">
                                                {formatCurrency(
                                                    trx.total_harga,
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
