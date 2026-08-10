import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const SecurityPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO title="Безопасность и приватность | BalaBagdar" description="Как BalaBagdar защищает данные родителей и центров: доступ к контактам, хранение данных, модерация отзывов и объявлений." path="/security" />
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Назад
        </button>

        <h1 className="text-3xl sm:text-4xl font-black mb-2">Безопасность и приватность</h1>
        <p className="text-muted-foreground mb-6">Как мы защищаем ваши данные на BalaBagdar.</p>

        <Section icon={<ShieldCheck className="text-primary" size={22} />} title="Что мы защищаем">
          Учётные записи, ваши заявки, отзывы и контактные данные. Доступ к личной информации
          (например, номеру телефона на объявлениях) есть только у авторизованных пользователей.
        </Section>

        <Section icon={<Lock className="text-primary" size={22} />} title="Шифрование">
          Все соединения с приложением и базой данных защищены HTTPS/TLS. Пароли и токены
          никогда не хранятся в открытом виде.
        </Section>

        <Section icon={<Database className="text-primary" size={22} />} title="Доступ к данным">
          На уровне базы данных используется построчная защита (Row-Level Security):
          пользователь может видеть и изменять только свои записи. Владельцы кружков
          видят бронирования только своих центров.
        </Section>

        <Section icon={<Eye className="text-primary" size={22} />} title="Что видят гости">
          Незарегистрированные посетители видят объявления и события без личных контактов
          авторов. Чтобы связаться с автором, нужно войти в приложение.
        </Section>

        <Section icon={<Mail className="text-primary" size={22} />} title="Связь по вопросам безопасности">
          Если вы заметили уязвимость или подозрительную активность — напишите нам:
          <a href="mailto:support@balabagdar.kz" className="text-primary font-bold ml-1">support@balabagdar.kz</a>.
        </Section>

        <p className="text-xs text-muted-foreground mt-6">
          Эта страница описывает текущие меры защиты приложения и не является заявлением
          о сертификации или независимом аудите.
        </p>
      </div>
    </div>
  );
};

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="bg-card border-[3px] border-foreground rounded-3xl p-5 sm:p-6 mb-4 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <h2 className="text-lg font-black mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  </section>
);

export default SecurityPage;
