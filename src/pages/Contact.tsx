import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send, CheckCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ScrollReveal from "@/components/ScrollReveal";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be under 2000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from("contact_messages")
        .insert({ name: data.name, email: data.email, message: data.message });
      if (dbError) throw dbError;

      try {
        await supabase.functions.invoke("send-contact-email", {
          body: { name: data.name, email: data.email, message: data.message },
        });
      } catch {}

      setSubmitted(true);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or email us directly.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-5"
              whileHover={{ rotate: 8, scale: 1.1 }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mail className="h-7 w-7 text-primary" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Get in <span className="text-gradient-gold">Touch</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Want private chess lessons, a live game, or just to chat about chess? Drop me a message.
            </p>
          </motion.div>

          <ScrollReveal delay={0.2}>
            {submitted ? (
              <Card className="border-primary/20">
                <CardContent className="flex flex-col items-center py-12 gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Message Sent!</h2>
                  <p className="text-muted-foreground text-center max-w-sm">
                    Thanks for reaching out. I'll reply to your email as soon as I can.
                  </p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); form.reset(); }} className="mt-2">
                    Send another message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 glass-4d">
                <CardHeader>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Contact Me
                  </CardTitle>
                  <CardDescription>Fill out the form below and I'll respond via email.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl><Textarea placeholder="I'd love to book a chess lesson…" rows={5} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" disabled={loading} className="w-full gap-2 ripple-btn">
                          <Send className="h-4 w-4" />
                          {loading ? "Sending…" : "Send Message"}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </ScrollReveal>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
