import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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
      // Save to database
      const { error: dbError } = await supabase
        .from("contact_messages")
        .insert({ name: data.name, email: data.email, message: data.message });

      if (dbError) throw dbError;

      // Try to send email notification (non-blocking)
      try {
        await supabase.functions.invoke("send-contact-email", {
          body: { name: data.name, email: data.email, message: data.message },
        });
      } catch {
        // Email send is best-effort; DB save is the source of truth
      }

      setSubmitted(true);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center mb-12">
            <div className="inline-flex rounded-lg bg-primary/10 p-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Get in <span className="text-gradient-gold">Touch</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Want private chess lessons, a live game, or just to chat about chess?
              Drop me a message and I'll get back to you.
            </p>
          </div>

          {submitted ? (
            <Card className="border-primary/20">
              <CardContent className="flex flex-col items-center py-12 gap-4">
                <CheckCircle className="h-12 w-12 text-primary" />
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
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-display text-xl">Contact Me</CardTitle>
                <CardDescription>Fill out the form below and I'll respond via email.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
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
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="I'd love to book a chess lesson…"
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loading} className="w-full gap-2">
                      <Send className="h-4 w-4" />
                      {loading ? "Sending…" : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
