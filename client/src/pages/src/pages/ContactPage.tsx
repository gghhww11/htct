import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Navigation,
  MessageCircle,
  Instagram,
  Facebook,
  UserCog,
  UserRound,
} from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { publicApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function toWaMeNumber(input: string) {
  return input.replace(/[^\d]/g, "");
}

// يقبل: +963... أو 09... أو 9... مع مسافات/شرطات
function isValidPhone(phoneRaw: string) {
  const v = phoneRaw.trim();
  if (!v) return true; // اختياري
  const normalized = v.replace(/[^\d+]/g, "");
  // E.164 عام
  const e164 = /^\+?[1-9]\d{7,14}$/;
  // سوريا (تقريب عملي): +9639xxxxxxxx أو 09xxxxxxxx أو 9xxxxxxxx
  const sy = /^(?:\+9639\d{8}|09\d{8}|9\d{8})$/;
  return e164.test(normalized) || sy.test(normalized);
}

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Bot protection (front-end)
  const [honeypot, setHoneypot] = useState("");
  const startedAtRef = useRef<number>(Date.now());
  const [robotError, setRobotError] = useState<string | null>(null);

  // Maps
  const MAPS_EMBED_SRC =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1174.7449178756576!2d36.31146440318158!3d33.61359627412162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1518e90014cb86a5%3A0x42ad35bacb28977f!2z2YXYsdmD2LIg2KfZhNmH2YrYq9mFINmE2YTYqtij2YfZitmEINmIINin2YTYqtiv2LHZitioINin2YTYs9mK2KfYrdmKINmIINin2YTZgdmG2K_ZgtmK!5e0!3m2!1sen!2s!4v1769537591830!5m2!1sen!2s";
  const MAPS_OPEN_LINK = "https://maps.app.goo.gl/NdnAor2R975fpAGKA";

  //WhatsApp & Social
  const ADMIN_WHATSAPP = "+963 965 787 804";
  const SECRETARY_WHATSAPP = "+963 965 787 803";
  const INSTAGRAM_URL = "https://www.instagram.com/alhaytham.education";
  const FACEBOOK_URL = "https://www.facebook.com/AlHaythamTrainingCenter";

  const ADMIN_WA_LINK = `https://wa.me/${toWaMeNumber(ADMIN_WHATSAPP)}`;
  const SECRETARY_WA_LINK = `https://wa.me/${toWaMeNumber(SECRETARY_WHATSAPP)}`;

  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("contact.validation.nameRequired")).max(100),
        email: z
          .string()
          .min(1, t("contact.validation.emailRequired"))
          .email(t("contact.validation.emailInvalid"))
          .max(255),
        phone: z
          .string()
          .max(30)
          .optional()
          .refine((v) => (v ? isValidPhone(v) : true), {
            message: t("contact.validation.phoneInvalid"),
          }),
        subject: z
          .string()
          .min(1, t("contact.validation.subjectRequired"))
          .max(200),
        message: z
          .string()
          .min(10, t("contact.validation.messageMin"))
          .min(1, t("contact.validation.messageRequired"))
          .max(2000),
      }),
    [t],
  );

  type ContactFormData = z.infer<typeof contactSchema>;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: publicApi.sendContact,
    onSuccess: () => {
      setSubmitSuccess(true);
      form.reset();
      setRobotError(null);
      setHoneypot("");
      startedAtRef.current = Date.now();
      setTimeout(() => setSubmitSuccess(false), 5000);
    },
  });

  const onSubmit = (values: ContactFormData) => {
    setRobotError(null);

    // ✅ Bot checks
    const elapsedMs = Date.now() - startedAtRef.current;
    if (honeypot.trim().length > 0 || elapsedMs < 2500) {
      setRobotError(t("contact.validation.robotDetected"));
      return;
    }

    // ✅ Normalize phone slightly before send (optional)
    const phoneNormalized = values.phone?.trim() || "";

    mutation.mutate({
      name: values.name,
      email: values.email,
      phone: phoneNormalized,
      subject: values.subject,
      message: values.message,
    });
  };

  return (
    <PublicLayout>
      {/* Header */}
      <section
        className="text-primary-foreground py-16"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t("contact.title")}
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* LEFT: Form + Quick Contact UNDER IT */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Contact Form */}
              <Card className="rounded-2xl p-6 md:p-8">
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 text-sm">
                      {t("contact.success")}
                    </p>
                  </motion.div>
                )}

                {(mutation.isError || robotError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800 text-sm">
                      {robotError ?? t("contact.error")}
                    </p>
                  </motion.div>
                )}

                {/* Honeypot (hidden) */}
                <input
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                  name="company"
                />

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                    onFocus={() => {
                      // لو المستخدم بدأ التفاعل من أول مرة
                      if (!startedAtRef.current)
                        startedAtRef.current = Date.now();
                    }}
                  >
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.name")}</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.email")}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                {...field}
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.phone")}</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                dir="ltr"
                                inputMode="tel"
                                placeholder={
                                  isRTL
                                    ? "+9639xxxxxxxx أو 09xxxxxxxx"
                                    : "+9639xxxxxxxx or 09xxxxxxxx"
                                }
                                {...field}
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.subject")}</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.message")}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={6}
                              className="rounded-xl resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      variant="accent"
                      className="w-full sm:w-auto rounded-xl px-8"
                      style={{ boxShadow: "var(--shadow-accent)" }}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        t("contact.form.sending")
                      ) : (
                        <>
                          {t("contact.form.send")}
                          <Send className="w-4 h-4 ms-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>

              {/* ✅ Quick Contact UNDER the form */}
              <Card className="rounded-2xl p-6 md:p-7">
                <div className="font-semibold text-foreground mb-2">
                  {isRTL ? "تواصل سريع" : "Quick Contact"}
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {isRTL
                    ? "اختر الجهة المناسبة للتواصل عبر واتساب، أو تابعنا على منصات التواصل."
                    : "Choose the right WhatsApp channel, or follow us on social media."}
                </p>

                <div className="space-y-3">
                  <Button
                    asChild
                    size="lg"
                    className="w-full rounded-xl justify-between"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <a href={ADMIN_WA_LINK} target="_blank" rel="noreferrer">
                      <span className="flex items-center gap-2">
                        <UserCog className="w-5 h-5" />
                        {isRTL
                          ? "تواصل مع الإدارة عبر واتساب"
                          : "WhatsApp — Administration"}
                      </span>
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full rounded-xl justify-between"
                  >
                    <a
                      href={SECRETARY_WA_LINK}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="flex items-center gap-2">
                        <UserRound className="w-5 h-5" />
                        {isRTL
                          ? "تواصل مع السكرتاريا عبر واتساب"
                          : "WhatsApp — Secretariat"}
                      </span>
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </Button>
                </div>

                <div className="mt-6 pt-5 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-3">
                    {isRTL ? "أو يمكنك متابعتنا على" : "Or follow us on"}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-xl flex-1 justify-center"
                    >
                      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                        <Instagram className="w-5 h-5 me-2" />
                        Instagram
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-xl flex-1 justify-center"
                    >
                      <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">
                        <Facebook className="w-5 h-5 me-2" />
                        Facebook
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* RIGHT: Contact Info + Map */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-6"
            >
              {/* Contact Info */}
              <div
                className="rounded-2xl p-6 md:p-8 text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                <h3 className="text-xl font-semibold mb-6">
                  {isRTL ? "معلومات التواصل" : "Contact Information"}
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">
                        {isRTL ? "العنوان" : "Address"}
                      </p>
                      <p className="text-primary-foreground/80 text-sm">
                        {isRTL
                          ? "ريف دمشق - التل - حي الروس"
                          : "Al-Tall - Rif Demashq"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">
                        {isRTL ? "الهاتف" : "Phone"}
                      </p>
                      <p
                        className="text-primary-foreground/80 text-sm"
                        dir="ltr"
                      >
                        {ADMIN_WHATSAPP}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium mb-1">
                        {isRTL ? "البريد الإلكتروني" : "Email"}
                      </p>
                      <p className="text-primary-foreground/80 text-sm">
                        alhaythamtourism@gmail.com
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-primary-foreground/20 flex items-center justify-between gap-3">
                  <p className="text-sm text-primary-foreground/80">
                    {isRTL
                      ? "ساعات العمل: الأحد - الخميس، 8 صباحاً - 5 مساءً"
                      : "Working Hours: Sun - Thu, 8 AM - 5 PM"}
                  </p>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <a
                      href="https://maps.app.goo.gl/NdnAor2R975fpAGKA"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {isRTL ? "الاتجاهات" : "Directions"}
                      <Navigation className="w-4 h-4 ms-2" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Google Map */}
              <Card className="rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between gap-4">
                  <div className="font-semibold text-foreground">
                    {isRTL ? "موقعنا على الخريطة" : "Find us on the map"}
                  </div>
                </div>

                <div className="relative aspect-[16/11] bg-secondary">
                  <iframe
                    title="Google Map"
                    src={MAPS_EMBED_SRC}
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-black/10" />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
