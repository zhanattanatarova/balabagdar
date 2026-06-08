import { ArrowLeft, AlertTriangle, Info, ShieldAlert, CheckCircle2, FileWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LegalPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Назад
        </button>

        <h1 className="text-3xl sm:text-4xl font-black mb-2">Правовая информация</h1>
        <p className="text-muted-foreground mb-6">Пожалуйста, внимательно прочитайте перед использованием платформы.</p>

        {/* Важное уведомление */}
        <section className="bg-card border-[3px] border-amber-400 rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-amber-600" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black mb-2">⚠️ Важное уведомление</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BalaBagdar — информационная платформа для поиска детских кружков и центров. Мы не несём
                ответственности за качество услуг, безопасность и деятельность размещённых центров.
                Вся информация предоставляется в ознакомительных целях.
              </p>
            </div>
          </div>
        </section>

        {/* Что такое BalaBagdar */}
        <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Info className="text-primary" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black mb-2">Что такое BalaBagdar?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BalaBagdar — это ознакомительная платформа, которая помогает родителям найти информацию
                о детских кружках, центрах развития и спортивных секциях в Казахстане. Платформа
                не является организатором занятий, не продаёт услуги и не является посредником между
                клиентом и центром.
              </p>
            </div>
          </div>
        </section>

        {/* Безопасность детей */}
        <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
              <ShieldAlert className="text-destructive" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black mb-2">Безопасность детей</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Мы настоятельно рекомендуем родителям самостоятельно проверять информацию о каждом
                центре перед записью ребёнка. BalaBagdar не гарантирует безопасность, квалификацию
                педагогов и соответствие нормам СанПиН центров, указанных на платформе.
              </p>
            </div>
          </div>
        </section>

        {/* Что нужно проверить самостоятельно */}
        <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-primary" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black mb-3">Что нужно проверить самостоятельно</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-black">✓</span> Лицензия и документы центра</li>
                <li className="flex gap-2"><span className="text-primary font-black">✓</span> Квалификация и опыт педагогов</li>
                <li className="flex gap-2"><span className="text-primary font-black">✓</span> Условия и безопасность помещения</li>
                <li className="flex gap-2"><span className="text-primary font-black">✓</span> Отзывы других родителей напрямую</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Ограничение ответственности */}
        <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-6 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
              <FileWarning className="text-muted-foreground" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black mb-2">Ограничение ответственности</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BalaBagdar не несёт ответственности за любой ущерб, возникший в результате использования
                информации с платформы. Все отзывы и рейтинги публикуются пользователями и отражают их
                личное мнение. Платформа оставляет за собой право удалять недостоверную информацию.
              </p>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">BalaBagdar © 2026 · Казахстан</p>
      </div>
    </div>
  );
};

export default LegalPage;
