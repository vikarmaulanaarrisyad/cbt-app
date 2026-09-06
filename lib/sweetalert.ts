import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Konfigurasi default agar desain SweetAlert lebih modern dan sesuai dengan UI premium
const defaultOptions: SweetAlertOptions = {
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-slate-100',
    title: 'text-lg font-bold text-slate-800 font-sans',
    htmlContainer: 'text-sm text-slate-500 font-sans',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md focus:ring-4 focus:ring-blue-500/20 font-sans outline-none',
    cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-lg transition-colors font-sans outline-none',
  },
  buttonsStyling: false, // Matikan styling default agar bisa pakai class Tailwind
};

export const Alert = {
  success: (title: string, text?: string) => {
    return MySwal.fire({
      ...defaultOptions,
      icon: 'success',
      title,
      text,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  },

  error: (title: string, text?: string) => {
    return MySwal.fire({
      ...defaultOptions,
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Tutup',
    });
  },

  warning: (title: string, text?: string) => {
    return MySwal.fire({
      ...defaultOptions,
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Mengerti',
    });
  },
  
  info: (title: string, text?: string) => {
    return MySwal.fire({
      ...defaultOptions,
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Tutup',
    });
  },

  confirm: (title: string, text: string, confirmText = 'Ya, Lanjutkan') => {
    return MySwal.fire({
      ...defaultOptions,
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Batal',
    });
  },

  loading: (title: string = 'Memproses...', text: string = 'Mohon tunggu sebentar.') => {
    MySwal.fire({
      ...defaultOptions,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        MySwal.showLoading();
      },
    });
  },

  close: () => {
    MySwal.close();
  }
};
