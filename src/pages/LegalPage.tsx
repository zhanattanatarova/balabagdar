import { ArrowLeft, AlertTriangle, Info, ShieldAlert, CheckCircle2, FileWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import SEO from "@/components/SEO";

const legalStrings = {
  kz: {
    back: "Артқа",
    title: "Құқықтық ақпарат",
    intro: "Платформаны пайдалану алдында мұқият оқып шығыңыз.",
    notice_t: "⚠️ Маңызды ескерту",
    notice: "BalaHub — балалар үйірмелері мен орталықтарын іздеуге арналған ақпараттық платформа. Біз орналастырылған орталықтардың қызмет сапасы, қауіпсіздігі мен қызметі үшін жауап бермейміз. Барлық ақпарат тек танысу мақсатында ұсынылады.",
    what_t: "BalaHub дегеніміз не?",
    what: "BalaHub — ата-аналарға Қазақстандағы балалар үйірмелері, даму орталықтары мен спорт секциялары туралы ақпарат табуға көмектесетін танысу платформасы. Платформа сабақтарды ұйымдастырушы емес, қызмет сатпайды және клиент пен орталық арасындағы делдал емес.",
    safety_t: "Балалардың қауіпсіздігі",
    safety: "Ата-аналарға баланы жазу алдында әр орталық туралы ақпаратты өз бетімен тексеруді ұсынамыз. BalaHub платформада көрсетілген орталықтардың қауіпсіздігіне, педагогтардың біліктілігіне және СанПиН нормаларына сәйкестігіне кепілдік бермейді.",
    check_t: "Өз бетіңізше тексеру керек",
    check: [
      "Орталықтың лицензиясы мен құжаттары",
      "Педагогтардың біліктілігі мен тәжірибесі",
      "Үй-жайдың жағдайы мен қауіпсіздігі",
      "Басқа ата-аналардың пікірлерін тікелей",
    ],
    limit_t: "Жауапкершілікті шектеу",
    limit: "BalaHub платформадан алынған ақпаратты пайдалану нәтижесінде келтірілген кез келген зиян үшін жауап бермейді. Барлық пікірлер мен рейтингтер пайдаланушылармен жарияланады және олардың жеке пікірін көрсетеді. Платформа жалған ақпаратты жою құқығын өзіне қалдырады.",
    footer: "BalaHub © 2026 · Қазақстан",
  },
  ru: {
    back: "Назад",
    title: "Правовая информация",
    intro: "Пожалуйста, внимательно прочитайте перед использованием платформы.",
    notice_t: "⚠️ Важное уведомление",
    notice: "BalaHub — информационная платформа для поиска детских кружков и центров. Мы не несём ответственности за качество услуг, безопасность и деятельность размещённых центров. Вся информация предоставляется в ознакомительных целях.",
    what_t: "Что такое BalaHub?",
    what: "BalaHub — это ознакомительная платформа, которая помогает родителям найти информацию о детских кружках, центрах развития и спортивных секциях в Казахстане. Платформа не является организатором занятий, не продаёт услуги и не является посредником между клиентом и центром.",
    safety_t: "Безопасность детей",
    safety: "Мы настоятельно рекомендуем родителям самостоятельно проверять информацию о каждом центре перед записью ребёнка. BalaHub не гарантирует безопасность, квалификацию педагогов и соответствие нормам СанПиН центров, указанных на платформе.",
    check_t: "Что нужно проверить самостоятельно",
    check: [
      "Лицензия и документы центра",
      "Квалификация и опыт педагогов",
      "Условия и безопасность помещения",
      "Отзывы других родителей напрямую",
    ],
    limit_t: "Ограничение ответственности",
    limit: "BalaHub не несёт ответственности за любой ущерб, возникший в результате использования информации с платформы. Все отзывы и рейтинги публикуются пользователями и отражают их личное мнение. Платформа оставляет за собой право удалять недостоверную информацию.",
    footer: "BalaHub © 2026 · Казахстан",
  },
  en: {
    back: "Back",
    title: "Legal information",
    intro: "Please read carefully before using the platform.",
    notice_t: "⚠️ Important notice",
    notice: "BalaHub is an informational platform for finding children's clubs and centers. We are not responsible for the quality, safety or activities of listed centers. All information is provided for reference only.",
    what_t: "What is BalaHub?",
    what: "BalaHub is a reference platform that helps parents find information about children's clubs, development centers and sport sections in Kazakhstan. The platform does not organize classes, sell services, or act as an intermediary between clients and centers.",
    safety_t: "Children's safety",
    safety: "We strongly recommend that parents independently verify information about each center before enrolling their child. BalaHub does not guarantee the safety, qualifications of educators, or SanPiN compliance of centers listed.",
    check_t: "What to verify yourself",
    check: [
      "Center's license and documents",
      "Teachers' qualifications and experience",
      "Conditions and safety of the premises",
      "Reviews of other parents directly",
    ],
    limit_t: "Limitation of liability",
    limit: "BalaHub is not liable for any damage caused by use of information from the platform. All reviews and ratings are posted by users and reflect their personal opinion. The platform reserves the right to remove inaccurate information.",
    footer: "BalaHub © 2026 · Kazakhstan",
  },
};

const LegalPage = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const s = legalStrings[lang] || legalStrings.kz;
  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO title="Правовая информация и правила | BalaHub" description="Условия использования BalaHub: платформа носит информационный характер, ответственность центров, безопасность детей и правила размещения." path="/legal" />
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> {s.back}
        </button>

        <h1 className="text-3xl sm:text-4xl font-black mb-2">{s.title}</h1>
        <p className="text-muted-foreground mb-6">{s.intro}</p>

        <section className="bg-card border-[3px] border-amber-400 rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-amber-600" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black mb-2">{s.notice_t}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.notice}</p>
            </div>
          </div>
        </section>

        <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Info className="text-primary" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black mb-2">{s.what_t}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.what}</p>
            </div>
          </div>
        </section>

        <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
              <ShieldAlert className="text-destructive" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black mb-2">{s.safety_t}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.safety}</p>
            </div>
          </div>
        </section>

        <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-primary" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black mb-3">{s.check_t}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {s.check.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-primary font-black">✓</span> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-6 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
              <FileWarning className="text-muted-foreground" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black mb-2">{s.limit_t}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.limit}</p>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">{s.footer}</p>
      </div>
    </div>
  );
};

export default LegalPage;
