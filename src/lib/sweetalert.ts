import Swal, { SweetAlertOptions } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Konfigurasi standar antarmuka Modal & Dialog Alert Institusional (Kemendikbudristek & CAT BKN)
const defaultOptions: SweetAlertOptions = {
  customClass: {
    popup: "rounded-3xl shadow-2xl border border-slate-200 bg-white p-6 max-w-lg font-sans",
    title: "text-xl font-black text-slate-900 font-sans tracking-tight mb-1",
    htmlContainer: "text-xs sm:text-sm text-slate-600 font-sans leading-relaxed text-left font-normal mt-2",
    confirmButton:
      "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-blue-500/20 text-xs uppercase tracking-wider font-sans outline-none cursor-pointer border-0",
    cancelButton:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-all text-xs uppercase tracking-wider font-sans outline-none border border-slate-200 cursor-pointer",
    actions: "gap-3 mt-5",
    input:
      "!w-full !px-3.5 !py-2.5 !rounded-xl !border !border-slate-200 !text-xs !sm:text-sm !font-medium !focus:ring-2 !focus:ring-blue-500/20 !focus:border-blue-500 !shadow-xs",
  },
  buttonsStyling: false,
};

export const Alert = {
  success: (title: string, text?: string) => {
    return MySwal.fire({
      ...defaultOptions,
      icon: "success",
      iconColor: "#10B981",
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
      icon: "error",
      iconColor: "#EF4444",
      title,
      text,
      confirmButtonText: "TUTUP",
    });
  },

  warning: (title: string, text?: string) => {
    return MySwal.fire({
      ...defaultOptions,
      icon: "warning",
      iconColor: "#F59E0B",
      title,
      text,
      confirmButtonText: "MENGERTI",
    });
  },

  info: (title: string, text?: string) => {
    return MySwal.fire({
      ...defaultOptions,
      icon: "info",
      iconColor: "#3B82F6",
      title,
      text,
      confirmButtonText: "TUTUP",
    });
  },

  confirm: (title: string, text: string, confirmText = "Ya, Lanjutkan") => {
    return MySwal.fire({
      ...defaultOptions,
      icon: "question",
      iconColor: "#2563EB",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText.toUpperCase(),
      cancelButtonText: "BATAL",
    });
  },

  loading: (title: string = "Memproses Data...", text: string = "Mohon tunggu sebentar.") => {
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

  toast: (title: string, icon: "success" | "error" | "warning" | "info" = "success") => {
    return MySwal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon,
      title,
    });
  },

  close: () => {
    MySwal.close();
  },
};
