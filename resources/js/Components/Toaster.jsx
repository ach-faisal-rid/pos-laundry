import { ToastProvider, ToastViewport } from '@/Components/ui/toast';

export default function Toaster() {
    return (
        <ToastProvider>
            <ToastViewport />
        </ToastProvider>
    );
}
