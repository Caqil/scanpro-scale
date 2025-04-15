"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Mail, MapPin, PhoneCall, Send, InfoIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useLanguageStore } from "@/src/store/store"

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export function ContactContent() {
  const { t } = useLanguageStore()
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setFormStatus("submitting")

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setFormStatus("success")
        toast.success(t('contact.success'), {
          description: t('contact.successDesc'),
        });
       
        form.reset()

        // Reset form status after 3 seconds
        setTimeout(() => {
          setFormStatus("idle")
        }, 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || t('contact.error'))
      }
    } catch (error) {
      console.error("Contact form submission error:", error)
      setFormStatus("error")
      toast.error(t('contact.error'), {
        description: error instanceof Error ? error.message : t('contact.errorDesc'),
      });
      
      // Reset form status after 3 seconds
      setTimeout(() => {
        setFormStatus("idle")
      }, 3000)
    }
  }

  return (
    <div className="container max-w-6xl py-12 mx-auto px-4">
      <div className="mx-auto flex flex-col items-center text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30"
        >
          <Send className="h-8 w-8 text-blue-500" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl font-bold tracking-tight sm:text-5xl"
        >
          {t('contact.title')}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 text-xl text-muted-foreground max-w-[700px]"
        >
          {t('contact.description')}
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Contact Information */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="md:col-span-1 space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.title')}</CardTitle>
              <CardDescription>{t('contact.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('contact.form.email')}</p>
                  <a
                    href="mailto:support@scanpro.cc"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    support@scanpro.cc
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <PhoneCall className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('ui.phone')}</p>
                  <a
                    href="tel:+18005551234"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    +1 (800) 555-1234
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t('ui.address')}</p>
                  <p className="text-sm text-muted-foreground">
                    123 PDF Street, Suite 456
                    <br />
                    Tech City, ST 12345
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.supportHours.title')}</CardTitle>
              <CardDescription>{t('contact.supportHours.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('contact.supportHours.weekdays')}</span>
                  <span>{t('contact.supportHours.weekdayHours')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('contact.supportHours.saturday')}</span>
                  <span>{t('contact.supportHours.saturdayHours')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('contact.supportHours.sunday')}</span>
                  <span className="text-red-500">{t('contact.supportHours.closed')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.form.title')}</CardTitle>
              <CardDescription>{t('contact.form.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.form.name')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('contact.form.name')} {...field} disabled={formStatus === "submitting"} />
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
                          <FormLabel>{t('contact.form.email')}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                              disabled={formStatus === "submitting"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.subject')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="What can we help you with?"
                            {...field}
                            disabled={formStatus === "submitting"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.message')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide detailed information about your inquiry"
                            className="min-h-[150px]"
                            {...field}
                            disabled={formStatus === "submitting"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full relative" disabled={formStatus === "submitting"}>
                    <AnimatePresence mode="wait">
                      {formStatus === "idle" && (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center"
                        >
                          <Send className="h-4 w-4 mr-2" /> {t('contact.form.submit')}
                        </motion.div>
                      )}

                      {formStatus === "submitting" && (
                        <motion.div
                          key="submitting"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center"
                        >
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('ui.processing')}
                        </motion.div>
                      )}

                      {formStatus === "success" && (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center text-green-500"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> {t('ui.success')}
                        </motion.div>
                      )}

                      {formStatus === "error" && (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center text-red-500"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" /> {t('ui.error')}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-16"
      >
        <h2 className="text-2xl font-bold mb-8 text-center">{t('contact.faq.title')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t('contact.faq.responseTime.question')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('contact.faq.responseTime.answer')}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t('contact.faq.technicalSupport.question')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('contact.faq.technicalSupport.answer')}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t('contact.faq.phoneSupport.question')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('contact.faq.phoneSupport.answer')}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2 flex items-center">
              <InfoIcon className="h-4 w-4 mr-2 text-primary" />
              {t('contact.faq.security.question')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('contact.faq.security.answer')}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}