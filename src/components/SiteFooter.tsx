import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const CONTACT_WA = "77776856591";

const UI = {
  ru: { title: "Ведёте кружок или детский центр?", text: "Пусть родители вашего города найдут вас на BalaHub и напишут вам в WhatsApp.", add: "Добавить центр", events: "Добавить событие", desc: "Кружки, центры и детская афиша Казахстана", parents: "Родителям", centers: "Центрам", contact: "Связь", catalog: "Найти центр", afisha: "Афиша", collections: "Подборки", office: "Мой кабинет", board: "Доска объявлений", legal: "Правовая информация", support: "Поддержка" },
  kz: { title: "Үйірме немесе балалар орталығын басқарасыз ба?", text: "Қалаңыздағы ата-аналар сізді BalaHub арқылы тауып, WhatsApp-қа жазсын.", add: "Орталық қосу", events: "Оқиға қосу", desc: "Қазақстанның үйірмелері, орталықтары және балалар афишасы", parents: "Ата-аналарға", centers: "Орталықтарға", contact: "Байланыс", catalog: "Орталық табу", afisha: "Афиша", collections: "Топтамалар", office: "Жеке кабинет", board: "Хабарландыру тақтасы", legal: "Құқықтық ақпарат", support: "Қолдау" },
  en: { title: "Run a kids’ club or learning center?", text: "Help families in your city discover you on BalaHub and message you on WhatsApp.", add: "Add center", events: "Add event", desc: "Kids’ clubs, centers and events in Kazakhstan", parents: "For parents", centers: "For centers", contact: "Contact", catalog: "Find a center", afisha: "Events", collections: "Collections", office: "My dashboard", board: "Notice board", legal: "Legal information", support: "Support" },
};
export default function SiteFooter() {
  const { lang } = useLanguage(); const ui = UI[lang];
  return <footer className="site-footer">
    <section className="partner-band"><div><h2>{ui.title}</h2><p>{ui.text}</p></div><div className="flex flex-wrap gap-3"><Button asChild variant="secondary"><Link to="/dashboard"><Plus />{ui.add}</Link></Button><Button asChild variant="outline"><Link to="/">{ui.events}<ArrowUpRight /></Link></Button></div></section>
    <div className="footer-links"><div><Link to="/" className="text-lg font-extrabold">Bala<span className="text-primary">Hub</span></Link><p className="mt-3 text-sm text-muted-foreground max-w-xs">{ui.desc}</p></div><div><h3>{ui.parents}</h3><Link to="/map">{ui.catalog}</Link><Link to="/">{ui.afisha}</Link><Link to="/collections">{ui.collections}</Link></div><div><h3>{ui.centers}</h3><Link to="/dashboard">{ui.office}</Link><Link to="/board">{ui.board}</Link><Link to="/legal">{ui.legal}</Link></div><div><h3>{ui.contact}</h3><a href={`https://wa.me/${CONTACT_WA}`} target="_blank" rel="noopener noreferrer">WhatsApp</a><Link to="/profile">{ui.support}</Link></div></div>
    <div className="mt-8 pt-5 border-t border-border text-xs text-muted-foreground">© {new Date().getFullYear()} BalaHub</div>
  </footer>;
}
