import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, Download, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const T = {
  ru: { title: "⭐ Попросите родителей оставить отзыв", hint: "Отправьте ссылку в WhatsApp или распечатайте QR-код на ресепшене.", copy: "Скопировать", copied: "Скопировано", wa: "Отправить в WhatsApp", dl: "Скачать QR", msg: "Здравствуйте! Будем благодарны за ваш отзыв о нашем центре на BalaHub:" },
  kz: { title: "⭐ Ата-аналардан пікір сұраңыз", hint: "Сілтемені WhatsApp-қа жіберіңіз немесе QR-кодты ресепшнге басып шығарыңыз.", copy: "Көшіру", copied: "Көшірілді", wa: "WhatsApp-қа жіберу", dl: "QR жүктеу", msg: "Сәлеметсіз бе! BalaHub-та біздің орталық туралы пікір қалдырсаңыз, алғыс айтамыз:" },
  en: { title: "⭐ Ask parents for a review", hint: "Send the link via WhatsApp or print the QR code for your reception.", copy: "Copy", copied: "Copied", wa: "Send via WhatsApp", dl: "Download QR", msg: "Hello! We'd be grateful for your review of our center on BalaHub:" },
};

const ReviewInvite = ({ clubId }: { clubId: string }) => {
  const { lang } = useLanguage();
  const s = T[lang] || T.ru;
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const url = `https://bala-hub.kz/club/${clubId}?review=1`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const download = () => {
    const c = wrap.current?.querySelector("canvas");
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "balahub-review-qr.png";
    a.click();
  };

  return (
    <div className="px-4 mt-4">
      <div className="cartoon-card p-4">
        <p className="font-black text-sm">{s.title}</p>
        <p className="text-xs text-muted-foreground font-bold mt-1">{s.hint}</p>
        <div className="flex gap-3 mt-3 items-center">
          <div ref={wrap} className="bg-card p-1.5 rounded-xl border-2 border-border shrink-0">
            <QRCodeCanvas value={url} size={96} level="M" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <button onClick={copy} className="w-full flex items-center justify-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl bg-muted">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? s.copied : s.copy}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${s.msg} ${url}`)}`} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl bg-primary text-primary-foreground">
              <MessageCircle size={14} /> {s.wa}
            </a>
            <button onClick={download} className="w-full flex items-center justify-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl bg-muted">
              <Download size={14} /> {s.dl}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewInvite;
